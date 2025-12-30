import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Coupon } from "@/models/Coupon";
import { AuditLog } from "@/models/AuditLog";
import { z } from "zod";

const updateCouponSchema = z.object({
  code: z.string().min(3).transform(val => val.toUpperCase()).optional(),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]).optional(),
  value: z.number().positive().optional(),
  minOrderAmount: z.number().positive().optional().nullable(),
  maxDiscount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().positive().optional(),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
  appliesToGenerators: z.boolean().optional(),
  appliesToParts: z.boolean().optional(),
});

// Get single coupon (admin)
export async function GET(
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
    const coupon = await Coupon.findById(id).lean();

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({
      coupon: {
        ...coupon,
        id: (coupon as any)._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}

// Update coupon (admin)
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
    const validationResult = updateCouponSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const existingCoupon = await Coupon.findById(id);
    if (!existingCoupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // Check if new code already exists (if changing code)
    if (data.code && data.code !== existingCoupon.code) {
      const codeExists = await Coupon.findOne({ code: data.code });
      if (codeExists) {
        return NextResponse.json(
          { error: "A coupon with this code already exists" },
          { status: 409 }
        );
      }
    }

    const updateData: any = { ...data };
    if (data.startsAt) updateData.startsAt = new Date(data.startsAt);
    if (data.expiresAt) updateData.expiresAt = new Date(data.expiresAt);
    if (data.expiresAt === null) updateData.expiresAt = null;

    const coupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true }).lean();

    // Log action
    await AuditLog.create({
      userId: session.user.id,
      action: "UPDATE",
      entity: "COUPON",
      entityId: id,
      oldValues: JSON.stringify({
        code: existingCoupon.code,
        type: existingCoupon.type,
        value: existingCoupon.value,
        isActive: existingCoupon.isActive,
      }),
      newValues: JSON.stringify(data),
    });

    return NextResponse.json({
      coupon: {
        ...coupon,
        id: (coupon as any)._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

// Delete coupon (admin)
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
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    await Coupon.findByIdAndDelete(id);

    // Log action
    await AuditLog.create({
      userId: session.user.id,
      action: "DELETE",
      entity: "COUPON",
      entityId: id,
      oldValues: JSON.stringify({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      }),
    });

    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
