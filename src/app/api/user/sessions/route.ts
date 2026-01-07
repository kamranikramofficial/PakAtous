import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Session } from "@/models/Session";

export const dynamic = 'force-dynamic';

// GET /api/user/sessions - Get all active sessions
export async function GET() {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await Session.find({ 
      userId: session.user.id,
      expires: { $gt: new Date() }
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      sessions: sessions.map((s: any) => ({
        id: s._id.toString(),
        expires: s.expires,
        createdAt: s.createdAt,
        isCurrent: s.sessionToken === session.user.id, // Approximate - will be enhanced
      })),
      count: sessions.length,
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// DELETE /api/user/sessions - Revoke all sessions except current
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const revokeAll = searchParams.get("all") === "true";

    if (revokeAll) {
      // Delete all sessions for the user (logout from all devices)
      const result = await Session.deleteMany({ userId: session.user.id });
      return NextResponse.json({
        success: true,
        message: `Logged out from all ${result.deletedCount} device(s)`,
        count: result.deletedCount,
      });
    }

    if (sessionId) {
      // Delete specific session
      const result = await Session.deleteOne({ 
        _id: sessionId, 
        userId: session.user.id 
      });
      
      if (result.deletedCount === 0) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Session revoked successfully",
      });
    }

    return NextResponse.json(
      { error: "Session ID or 'all' parameter required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error revoking sessions:", error);
    return NextResponse.json(
      { error: "Failed to revoke sessions" },
      { status: 500 }
    );
  }
}
