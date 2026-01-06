import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/prisma";
import { User, EmailVerificationToken, UserStatus } from "@/models/User";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find the verification token
    const verificationToken = await EmailVerificationToken.findOne({ token });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (verificationToken.expiresAt < new Date()) {
      // Delete expired token
      await EmailVerificationToken.deleteOne({ _id: verificationToken._id });
      return NextResponse.json(
        { error: "Verification token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Update user status to ACTIVE
    await User.findByIdAndUpdate(verificationToken.userId, {
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    });

    // Delete the used token
    await EmailVerificationToken.deleteOne({ _id: verificationToken._id });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}

// Resend verification email
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a verification link will be sent.",
      });
    }

    if (user.status !== UserStatus.PENDING_VERIFICATION) {
      return NextResponse.json(
        { error: "This account is already verified" },
        { status: 400 }
      );
    }

    // Delete existing tokens
    await EmailVerificationToken.deleteMany({ userId: user._id });

    // Create new verification token
    const { v4: uuidv4 } = await import("uuid");
    const verificationToken = uuidv4();
    
    await EmailVerificationToken.create({
      token: verificationToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Send verification email
    const { sendEmail, getVerificationEmailTemplate } = await import("@/lib/email");
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${verificationToken}`;
    const emailTemplate = getVerificationEmailTemplate(user.name || "User", verificationLink);
    
    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    return NextResponse.json({
      success: true,
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
