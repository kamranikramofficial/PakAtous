import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { ContactInquiry } from "@/models/ContactInquiry";
import { User } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";
import { sendContactInternalNotesEmail, sendEmail } from "@/lib/email";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const updateInquirySchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  adminNotes: z.string().optional(),
  internalNotes: z.string().optional(),
  assignedTo: z.string().optional(),
  isRead: z.boolean().optional(),
  isReplied: z.boolean().optional(),
  replyMessage: z.string().optional(),
});

// Get single inquiry (admin/staff)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const inquiry = await ContactInquiry.findById(id).lean();

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Mark as read if not already
    if (!(inquiry as any).isRead) {
      await ContactInquiry.findByIdAndUpdate(id, { isRead: true });
    }

    return NextResponse.json({
      inquiry: {
        ...(inquiry as any),
        id: (inquiry as any)._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiry" },
      { status: 500 }
    );
  }
}

// Update inquiry (admin/staff)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validationResult = updateInquirySchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const inquiry = await ContactInquiry.findById(id);

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    const oldInternalNotes = inquiry.internalNotes || '';
    const oldStatus = inquiry.status;

    // Build update data
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.adminNotes !== undefined) updateData.adminNotes = data.adminNotes;
    if (data.internalNotes !== undefined) updateData.internalNotes = data.internalNotes;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
    if (data.isRead !== undefined) updateData.isRead = data.isRead;
    if (data.isReplied !== undefined) {
      updateData.isReplied = data.isReplied;
      if (data.isReplied) updateData.repliedAt = new Date();
    }

    // Update inquiry
    const updatedInquiry = await ContactInquiry.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean();

    // Create audit log
    await AuditLog.create({
      userId: session.user.id,
      action: "UPDATE",
      entity: "CONTACT_INQUIRY",
      entityId: id,
      oldValues: JSON.stringify({ status: oldStatus }),
      newValues: JSON.stringify(data),
    });

    // Send reply email to customer if replyMessage provided
    if (data.replyMessage && inquiry.email) {
      try {
        await sendEmail({
          to: inquiry.email,
          subject: `Re: ${inquiry.subject} - PakAutoSe`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">PakAutoSe Support</h1>
              </div>
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                <p>Dear ${inquiry.name},</p>
                <p>Thank you for contacting us. Here is our response to your inquiry:</p>
                
                <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #059669;">
                  <p><strong>Your Original Message:</strong></p>
                  <p style="color: #666;">${inquiry.message}</p>
                </div>
                
                <div style="background: #d1fae5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Our Response:</strong></p>
                  <p style="white-space: pre-wrap;">${data.replyMessage}</p>
                </div>
                
                <p>If you have any further questions, please don't hesitate to reach out.</p>
                
                <p style="margin-top: 30px;">Best regards,<br>PakAutoSe Team</p>
              </div>
            </body>
            </html>
          `,
        });
        
        // Mark as replied
        await ContactInquiry.findByIdAndUpdate(id, { isReplied: true, repliedAt: new Date() });
      } catch (emailError) {
        console.error("Failed to send reply email:", emailError);
      }
    }

    // Send email notification if internal notes changed (admin/staff communication)
    if (data.internalNotes !== undefined && data.internalNotes !== oldInternalNotes) {
      const currentUserRole = session.user.role;
      const senderName = session.user.name || (currentUserRole === 'ADMIN' ? 'Admin' : 'Staff');
      
      // If STAFF changes notes → notify ALL ADMINs
      // If ADMIN changes notes → notify ALL STAFF
      const targetRole = currentUserRole === 'ADMIN' ? 'STAFF' : 'ADMIN';
      const recipients = await User.find({ 
        role: targetRole,
        isActive: { $ne: false }
      }).select('email name');
      
      const recipientEmails = recipients.map(r => r.email);
      console.log(`Contact inquiry internal notes changed by ${currentUserRole}. Sending email to ${targetRole}:`, recipientEmails);
      
      if (recipientEmails.length > 0) {
        await sendContactInternalNotesEmail(
          { ...inquiry.toObject(), id: inquiry._id.toString() },
          senderName,
          data.internalNotes,
          recipientEmails,
          targetRole
        );
        console.log('Contact inquiry internal notes email sent successfully');
      }
    }

    return NextResponse.json({
      success: true,
      inquiry: {
        ...updatedInquiry,
        id: (updatedInquiry as any)._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error updating inquiry:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 }
    );
  }
}

// Delete inquiry (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const inquiry = await ContactInquiry.findById(id);

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    await ContactInquiry.deleteOne({ _id: id });

    // Create audit log
    await AuditLog.create({
      userId: session.user.id,
      action: "DELETE",
      entity: "CONTACT_INQUIRY",
      entityId: id,
      oldValues: JSON.stringify(inquiry),
    });

    return NextResponse.json({
      success: true,
      message: "Inquiry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    return NextResponse.json(
      { error: "Failed to delete inquiry" },
      { status: 500 }
    );
  }
}
