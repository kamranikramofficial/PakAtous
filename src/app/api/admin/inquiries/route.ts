import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { ContactInquiry } from "@/models/ContactInquiry";

export const dynamic = 'force-dynamic';

// Get all contact inquiries (admin/staff)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const isRead = searchParams.get("isRead");
    const priority = searchParams.get("priority");

    const query: any = {};
    if (status) query.status = status;
    if (isRead !== null && isRead !== undefined) query.isRead = isRead === "true";
    if (priority) query.priority = priority;

    const [inquiries, total] = await Promise.all([
      ContactInquiry.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ContactInquiry.countDocuments(query),
    ]);

    // Get counts for different statuses
    const [unreadCount, newCount, inProgressCount, resolvedCount] = await Promise.all([
      ContactInquiry.countDocuments({ isRead: false }),
      ContactInquiry.countDocuments({ status: "NEW" }),
      ContactInquiry.countDocuments({ status: "IN_PROGRESS" }),
      ContactInquiry.countDocuments({ status: "RESOLVED" }),
    ]);

    return NextResponse.json({
      inquiries: inquiries.map((inquiry: any) => ({
        ...inquiry,
        id: inquiry._id.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      counts: {
        unread: unreadCount,
        new: newCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
      },
    });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}
