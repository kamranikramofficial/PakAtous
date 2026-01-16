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

// PUT /api/user/addresses/[id] - Update address
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = addressSchema.parse(body);

    await dbConnect();

    // Check ownership
    const address = await Address.findOne({ _id: id, userId: session.user.id });
    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // If setting as default, unset other defaults
    if (validated.isDefault) {
      await Address.updateMany(
        { userId: session.user.id, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    await Address.findByIdAndUpdate(id, validated);

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
        { error: "Validation error" },
        { status: 400 }
      );
    }
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
}

// DELETE /api/user/addresses/[id] - Delete address
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    // Check ownership
    const address = await Address.findOne({ _id: id, userId: session.user.id });
    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await Address.findByIdAndDelete(id);

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
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}
