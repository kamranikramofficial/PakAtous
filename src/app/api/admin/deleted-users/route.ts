import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { DeletedUser } from "@/models/DeletedUser";

export const dynamic = 'force-dynamic';

// GET /api/admin/deleted-users - Get all deleted/archived users (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");

    const query: any = { permanentlyDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const [deletedUsers, total] = await Promise.all([
      DeletedUser.find(query)
        .sort({ deletedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      DeletedUser.countDocuments(query),
    ]);

    return NextResponse.json({
      deletedUsers: deletedUsers.map((user: any) => ({
        id: user._id.toString(),
        originalUserId: user.originalUserId.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        originalCreatedAt: user.originalCreatedAt,
        deletedAt: user.deletedAt,
        deletionReason: user.deletionReason,
        deletedByAdmin: user.deletedByAdmin,
        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent,
        dataRetentionUntil: user.dataRetentionUntil,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching deleted users:", error);
    return NextResponse.json(
      { error: "Failed to fetch deleted users" },
      { status: 500 }
    );
  }
}
