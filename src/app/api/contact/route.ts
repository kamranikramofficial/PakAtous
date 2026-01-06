import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/prisma";
import { User } from "@/models/User";
import { ContactInquiry } from "@/models/ContactInquiry";
import { Notification } from "@/models/Notification";
import { sendContactFormEmails } from "@/lib/email";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  newsletter: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const validationResult = contactSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const fullName = `${data.firstName} ${data.lastName}`;

    // Save contact inquiry
    const inquiry = await ContactInquiry.create({
      name: fullName,
      email: data.email,
      phone: data.phone || "",
      subject: data.subject,
      message: data.message,
      newsletter: data.newsletter || false,
    });

    // Get admin emails
    const admins = await User.find({ role: "ADMIN" }).select("_id email").lean();
    const adminEmails = admins.map((admin: any) => admin.email);

    // Create notifications for admins first (before emails to avoid rate limit issues)
    for (const admin of admins) {
      try {
        await Notification.create({
          userId: (admin as any)._id,
          type: "CONTACT_INQUIRY",
          title: "New Contact Form Submission",
          message: `New message from ${fullName}: ${data.subject}`,
          link: `/admin/inquiries/${inquiry._id}`,
        });
      } catch (notifError) {
        console.error("Failed to create notification:", notifError);
      }
    }

    // Send emails (confirmation to user + notification to admins)
    // Note: Rate limit is 2 requests per second, so we handle errors gracefully
    try {
      await sendContactFormEmails(
        {
          name: fullName,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message,
        },
        adminEmails
      );
    } catch (emailError) {
      console.error("Email sending failed (rate limit or other issue):", emailError);
      // Don't fail the request - inquiry is saved and notifications created
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
