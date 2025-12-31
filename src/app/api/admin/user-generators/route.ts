import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { UserGenerator } from "@/models/UserGenerator";
import { User } from "@/models/User";
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

// GET - Get all user listings (admin)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: any = {};
    
    if (status && status !== "all") {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { generatorModel: { $regex: search, $options: "i" } },
        { contactName: { $regex: search, $options: "i" } },
        { contactPhone: { $regex: search, $options: "i" } },
      ];
    }

    const [listings, total] = await Promise.all([
      UserGenerator.find(query)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      UserGenerator.countDocuments(query),
    ]);

    return NextResponse.json({
      listings: listings.map((l: any) => ({
        ...l,
        id: l._id.toString(),
        user: l.userId ? { name: l.userId.name, email: l.userId.email } : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
