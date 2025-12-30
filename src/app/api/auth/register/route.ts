import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import dbConnect from "@/lib/prisma";
import { User, EmailVerificationToken } from "@/models/User";
import { Cart } from "@/models/Cart";
import { Notification } from "@/models/Notification";
import { sendEmail, getVerificationEmailTemplate } from "@/lib/email";

// API-specific schema (no confirmPassword needed as it's validated on frontend)
const apiRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();

    // Validate input
    const validationResult = apiRegisterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = validationResult.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if email service is configured
    const emailConfigured = !!process.env.RESEND_API_KEY;

    // Create user - set as ACTIVE if email not configured
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      status: emailConfigured ? "PENDING_VERIFICATION" : "ACTIVE",
      emailVerified: emailConfigured ? null : new Date(),
    });

    // Create cart for user
    await Cart.create({ userId: user._id });

    let responseMessage = "Account created successfully.";

    if (emailConfigured) {
      // Create verification token
      const verificationToken = uuidv4();
      await EmailVerificationToken.create({
        token: verificationToken,
        userId: user._id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      // Send verification email
      const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${verificationToken}`;
      const emailTemplate = getVerificationEmailTemplate(name, verificationLink);
      const emailResult = await sendEmail({
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });

      if (emailResult.success) {
        responseMessage = "Account created successfully. Please check your email to verify your account.";
      } else {
        // Email failed to send, but account created - activate user
        await User.findByIdAndUpdate(user._id, { 
          status: "ACTIVE",
          emailVerified: new Date()
        });
        responseMessage = "Account created successfully. You can now log in.";
      }
    } else {
      responseMessage = "Account created successfully. You can now log in.";
    }

    // Create welcome notification
    await Notification.create({
      userId: user._id,
      type: "WELCOME",
      title: "Welcome to PakAutoSe!",
      message: "Thank you for joining us. Start exploring our generators and services.",
      link: "/generators",
    });

    return NextResponse.json(
      {
        success: true,
        message: responseMessage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
