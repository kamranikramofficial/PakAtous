import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Coupon } from "@/models/Coupon";
import { AuditLog } from "@/models/AuditLog";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").transform(val => val.toUpperCase()),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  value: z.number().positive("Value must be positive"),
  minOrderAmount: z.number().positive().optional().nullable(),
  maxDiscount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().positive().default(1),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
  appliesToGenerators: z.boolean().default(true),
  appliesToParts: z.boolean().default(true),
});

// Get all coupons (admin)
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
    const status = searchParams.get("status");

    const query: any = {};

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "active") {
      query.isActive = true;
      query.$or = [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null },
      ];
    } else if (status === "inactive") {
      query.isActive = false;
    } else if (status === "expired") {
      query.expiresAt = { $lt: new Date() };
    }

    const [coupons, total] = await Promise.all([
      Coupon.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Coupon.countDocuments(query),
    ]);

    return NextResponse.json({
      coupons: coupons.map((coupon: any) => ({
        ...coupon,
        id: coupon._id.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// Create coupon (admin)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const validationResult = couponSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if code already exists
    const existingCoupon = await Coupon.findOne({ code: data.code });
    if (existingCoupon) {
      return NextResponse.json(
        { error: "A coupon with this code already exists" },
        { status: 409 }
      );
    }

    const coupon = await Coupon.create({
      ...data,
      startsAt: data.startsAt ? new Date(data.startsAt) : new Date(),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    });

    // Log action
    await AuditLog.create({
      userId: session.user.id,
      action: "CREATE",
      entity: "COUPON",
      entityId: coupon._id.toString(),
      newValues: JSON.stringify(data),
    });

    return NextResponse.json({
      coupon: {
        ...coupon.toObject(),
        id: coupon._id.toString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
