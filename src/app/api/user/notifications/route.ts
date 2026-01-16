import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Notification } from "@/models/Notification";

export const dynamic = 'force-dynamic';

// GET /api/user/notifications - Get all notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const notifications = await Notification.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments({ userId: session.user.id });

    return NextResponse.json({
      notifications: notifications.map((n: any) => ({
        _id: n._id.toString(),
        ...n,
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// DELETE /api/user/notifications - Delete all notifications
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    await Notification.deleteMany({ userId: session.user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return NextResponse.json(
      { error: "Failed to delete notifications" },
      { status: 500 }
    );
  }
}

// PUT /api/user/notifications/mark-all-read - Mark all as read
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    await Notification.updateMany(
      { userId: session.user.id },
      { isRead: true, readAt: new Date() }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
