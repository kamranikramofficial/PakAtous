import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Address } from "@/models/User";

export const dynamic = 'force-dynamic';

// PUT /api/user/addresses/[id]/default - Set address as default
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

    await dbConnect();

    // Check ownership
    const address = await Address.findOne({ _id: id, userId: session.user.id });
    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Unset all other defaults
    await Address.updateMany(
      { userId: session.user.id, _id: { $ne: id } },
      { isDefault: false }
    );

    // Set this as default
    await Address.findByIdAndUpdate(id, { isDefault: true });

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
    console.error("Error setting default address:", error);
    return NextResponse.json(
      { error: "Failed to set default address" },
      { status: 500 }
    );
  }
}
