import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

// Test email endpoint - REMOVE IN PRODUCTION
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    console.log("Testing email send to:", email);

    const result = await sendEmail({
      to: email,
      subject: "PakAutoSe - Test Email",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Test Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 30px; border-radius: 10px;">
            <h1 style="color: #1e40af;">Email Test Successful! ✓</h1>
            <p>If you're seeing this email, your email configuration is working correctly.</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p>Best regards,<br>PakAutoSe Team</p>
          </div>
        </body>
        </html>
      `,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully! Check your inbox.",
        data: result.data,
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          message: "Failed to send email. Check console for details."
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send test email" },
      { status: 500 }
    );
  }
}

// GET endpoint to check email config status
export async function GET() {
  const hasApiKey = !!process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;

  return NextResponse.json({
    configured: hasApiKey,
    emailFrom: emailFrom || "Not set",
    hint: hasApiKey 
      ? "Email service is configured. Use POST with {email: 'your@email.com'} to test."
      : "Set RESEND_API_KEY in .env.local to enable email service.",
  });
}
