import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Notification } from "@/models/Notification";

export const dynamic = 'force-dynamic';

// PUT /api/user/notifications/mark-all-read - Mark all notifications as read
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    await Notification.updateMany(
      { userId: session.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark all notifications as read" },
      { status: 500 }
    );
  }
}
