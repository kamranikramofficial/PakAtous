import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Address } from "@/models/User";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const addressSchema = z.object({
  label: z.string().min(1).default("Home"),
  fullName: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("Pakistan"),
  isDefault: z.boolean().default(false),
});

// GET /api/user/addresses - Get all addresses for user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const addresses = await Address.find({ userId: session.user.id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      addresses: addresses.map((a: any) => ({
        _id: a._id.toString(),
        ...a,
      })),
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

// POST /api/user/addresses - Create new address
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const validated = addressSchema.parse(body);

    // If setting as default, unset other defaults
    if (validated.isDefault) {
      await Address.updateMany(
        { userId: session.user.id },
        { isDefault: false }
      );
    }

    const address = await Address.create({
      userId: session.user.id,
      ...validated,
    });

    // Return all addresses
    const addresses = await Address.find({ userId: session.user.id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      addresses: addresses.map((a: any) => ({
        _id: a._id.toString(),
        ...a,
      })),
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating address:", error);
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    );
  }
}

// DELETE /api/user/addresses - Delete all addresses
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    await Address.deleteMany({ userId: session.user.id });

    return NextResponse.json({ success: true, addresses: [] });
  } catch (error) {
    console.error("Error deleting addresses:", error);
    return NextResponse.json(
      { error: "Failed to delete addresses" },
      { status: 500 }
    );
  }
}
