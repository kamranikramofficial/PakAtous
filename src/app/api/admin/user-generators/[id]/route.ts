import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { UserGenerator } from "@/models/UserGenerator";
import { AuditLog } from "@/models/AuditLog";
import { Notification } from "@/models/Notification";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const updateListingSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SOLD", "EXPIRED"]).optional(),
  adminNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
  purchasedPrice: z.number().positive().optional(),
});

// GET - Get single listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const listing = await UserGenerator.findById(id)
      .populate("userId", "name email phone")
      .lean();

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      listing: {
        ...listing,
        id: (listing as any)._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

// PUT - Update listing status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    
    const validationResult = updateListingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const listing = await UserGenerator.findById(id);
    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    const oldStatus = listing.status;
    const updateData: any = {};

    if (data.status) updateData.status = data.status;
    if (data.adminNotes !== undefined) updateData.adminNotes = data.adminNotes;
    if (data.rejectionReason) updateData.rejectionReason = data.rejectionReason;
    if (data.purchasedPrice) {
      updateData.purchasedPrice = data.purchasedPrice;
      updateData.purchasedAt = new Date();
    }
    
    if (data.status && data.status !== oldStatus) {
      updateData.reviewedBy = session.user.id;
      updateData.reviewedAt = new Date();
    }

    const updatedListing = await UserGenerator.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean();

    // Create notification for user
    if (data.status && data.status !== oldStatus) {
      const notificationMessages: Record<string, string> = {
        APPROVED: "Your generator listing has been approved!",
        REJECTED: `Your generator listing has been rejected. Reason: ${data.rejectionReason || "Not specified"}`,
        SOLD: `Congratulations! Your generator has been purchased for PKR ${data.purchasedPrice?.toLocaleString()}`,
      };

      if (notificationMessages[data.status]) {
        await Notification.create({
          userId: listing.userId,
          type: "LISTING_UPDATE",
          title: "Generator Listing Update",
          message: notificationMessages[data.status],
          link: "/sell-generator",
        });
      }
    }

    // Create audit log
    await AuditLog.create({
      userId: session.user.id,
      action: "UPDATE",
      entity: "USER_GENERATOR",
      entityId: id,
      oldValues: JSON.stringify({ status: oldStatus }),
      newValues: JSON.stringify(data),
    });

    return NextResponse.json({
      success: true,
      listing: {
        ...updatedListing,
        id: (updatedListing as any)._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}

// DELETE - Delete listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const listing = await UserGenerator.findById(id);
    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    await UserGenerator.deleteOne({ _id: id });

    // Create audit log
    await AuditLog.create({
      userId: session.user.id,
      action: "DELETE",
      entity: "USER_GENERATOR",
      entityId: id,
      oldValues: JSON.stringify(listing),
    });

    return NextResponse.json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}
