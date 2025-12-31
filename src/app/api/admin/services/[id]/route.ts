import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { ServiceRequest } from "@/models/ServiceRequest";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { AuditLog } from "@/models/AuditLog";
import { z } from "zod";
import { sendServiceStatusEmail, sendInternalNotesEmail, sendPriorityChangeEmail } from "@/lib/email";

export const dynamic = 'force-dynamic';

const updateServiceSchema = z.object({
  status: z.enum([
    "PENDING",
    "REVIEWING",
    "QUOTED",
    "QUOTE_SENT",
    "APPROVED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  estimatedCost: z.number().positive().optional(),
  actualCost: z.number().positive().optional(),
  quotedPrice: z.number().positive().optional(),
  internalNotes: z.string().optional(),
  diagnosis: z.string().optional(),
  assignedTo: z.string().optional(),
  scheduledDate: z.string().optional(),
  completedAt: z.string().optional(),
  adminNotes: z.string().optional(),
});

// Get single service request (admin/staff)
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

    const service = await ServiceRequest.findById(id).lean();

    if (!service) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    // Get user info
    const user = await User.findById((service as any).userId)
      .select('name email phone address')
      .lean();

    // Get audit logs for this service request
    const auditLogs = await AuditLog.find({
      entity: "SERVICE_REQUEST",
      entityId: id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      service: {
        ...service,
        id: (service as any)._id.toString(),
        user: user ? { ...user, id: (user as any)._id.toString() } : null,
      },
      auditLogs: auditLogs.map((log: any) => ({ ...log, id: log._id.toString() })),
    });
  } catch (error) {
    console.error("Error fetching service request:", error);
    return NextResponse.json(
      { error: "Failed to fetch service request" },
      { status: 500 }
    );
  }
}

// Update service request (admin/staff)
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
    const validationResult = updateServiceSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const service = await ServiceRequest.findById(id);

    if (!service) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    // Get user info
    const user = await User.findById(service.userId).select('email name');

    const oldStatus = service.status;
    const oldPriority = service.priority;
    const oldInternalNotes = service.internalNotes || '';

    // Build update data
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.priority) updateData.priority = data.priority;
    if (data.estimatedCost !== undefined) updateData.estimatedCost = data.estimatedCost;
    if (data.actualCost !== undefined) updateData.finalCost = data.actualCost;
    if (data.quotedPrice !== undefined) {
      updateData.quotedPrice = data.quotedPrice;
      updateData.quotedAt = new Date();
    }
    if (data.internalNotes !== undefined) updateData.internalNotes = data.internalNotes;
    if (data.diagnosis !== undefined) updateData.diagnosis = data.diagnosis;
    if (data.assignedTo) updateData.assignedTo = data.assignedTo;
    if (data.scheduledDate) updateData.scheduledDate = new Date(data.scheduledDate);
    if (data.completedAt) updateData.completedAt = new Date(data.completedAt);
    if (data.adminNotes !== undefined) updateData.adminNotes = data.adminNotes;
    if (data.status === "COMPLETED" && !data.completedAt) updateData.completedAt = new Date();

    // Update service request
    const updatedService = await ServiceRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean();

    // Create audit log
    await AuditLog.create({
      userId: session.user.id,
      action: "UPDATE",
      entity: "SERVICE_REQUEST",
      entityId: id,
      oldValues: JSON.stringify({
        status: oldStatus,
        estimatedCost: service.estimatedCost,
      }),
      newValues: JSON.stringify(data),
    });

    // Send email notification if status changed
    if (data.status && data.status !== oldStatus && user) {
      // Create notification for user
      await Notification.create({
        userId: service.userId,
        type: "SERVICE_UPDATE",
        title: "Service Request Updated",
        message: `Your service request #${service.requestNumber} status has been updated to ${data.status}`,
        link: `/account/services/${service._id}`,
      });

      // Send email
      const statusMessages: Record<string, string> = {
        REVIEWING: "We are currently reviewing your service request.",
        QUOTED: `We have prepared a quote for your service.${data.estimatedCost ? ` Estimated cost: PKR ${data.estimatedCost.toLocaleString()}` : ""}`,
        APPROVED: "Your service request has been approved and scheduled.",
        IN_PROGRESS: "Our technician is currently working on your generator.",
        COMPLETED: "Your service has been completed. Thank you for choosing PakAutoSe Generators!",
        CANCELLED: "Your service request has been cancelled. If you have any questions, please contact us.",
      };

      if (statusMessages[data.status]) {
        await sendServiceStatusEmail(
          {
            ...service.toObject(),
            ...(updatedService as any),
            estimatedCost: data.estimatedCost ?? service.estimatedCost,
            user: { email: user.email, name: user.name },
          },
          data.status
        );
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
        isActive: { $ne: false } // Include users where isActive is true or undefined
      }).select('email name');
      
      const recipientEmails = recipients.map(r => r.email);
      console.log(`Internal notes changed by ${currentUserRole}. Sending email to ${targetRole}:`, recipientEmails);
      
      if (recipientEmails.length > 0) {
        await sendInternalNotesEmail(
          { ...service.toObject(), id: service._id.toString(), requestNumber: service.requestNumber },
          senderName,
          data.internalNotes,
          recipientEmails,
          targetRole
        );
        console.log('Internal notes email sent successfully');
      } else {
        console.log('No recipients found for internal notes email');
      }
    }

    // Send email notification if priority changed
    if (data.priority && data.priority !== oldPriority) {
      const changerName = session.user.name || session.user.role;
      
      // Notify all admins and staff about priority change
      const allStaff = await User.find({ 
        role: { $in: ['ADMIN', 'STAFF'] },
        isActive: { $ne: false }, // Include users where isActive is true or undefined
        _id: { $ne: session.user.id } // Don't notify the person who made the change
      }).select('email name');
      
      const staffEmails = allStaff.map(s => s.email);
      if (staffEmails.length > 0) {
        await sendPriorityChangeEmail(
          { ...service.toObject(), id: service._id.toString(), requestNumber: service.requestNumber },
          oldPriority || 'NORMAL',
          data.priority,
          changerName,
          staffEmails
        );
      }
    }

    return NextResponse.json({
      success: true,
      service: {
        ...updatedService,
        id: (updatedService as any)._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error updating service request:", error);
    return NextResponse.json(
      { error: "Failed to update service request" },
      { status: 500 }
    );
  }
}

// Delete service request (admin)
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

    const service = await ServiceRequest.findById(id);

    if (!service) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    // Only allow deletion of cancelled or completed requests older than 30 days
    if (!["CANCELLED", "COMPLETED"].includes(service.status)) {
      return NextResponse.json(
        { error: "Only cancelled or completed service requests can be deleted" },
        { status: 400 }
      );
    }

    await ServiceRequest.deleteOne({ _id: id });

    // Log action
    await AuditLog.create({
      userId: session.user.id,
      action: "DELETE",
      entity: "SERVICE_REQUEST",
      entityId: id,
      oldValues: JSON.stringify(service),
    });

    return NextResponse.json({
      success: true,
      message: "Service request deleted",
    });
  } catch (error) {
    console.error("Error deleting service request:", error);
    return NextResponse.json(
      { error: "Failed to delete service request" },
      { status: 500 }
    );
  }
}
