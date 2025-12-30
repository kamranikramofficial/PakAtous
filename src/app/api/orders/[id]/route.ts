import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Order } from "@/models/Order";
import { Generator } from "@/models/Generator";
import { Part } from "@/models/Part";

// GET /api/orders/[id] - Get single order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const order = await Order.findOne({
      _id: id,
      userId: session.user.id,
    })
      .populate("items.generatorId", "name slug")
      .populate("items.partId", "name slug")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Format items with proper structure
    const formattedItems = (order as any).items.map((item: any) => ({
      ...item,
      id: item._id?.toString() || item.id,
      generator: item.generatorId ? {
        id: item.generatorId._id?.toString() || item.generatorId.toString(),
        name: item.generatorId.name || item.name,
        slug: item.generatorId.slug,
        images: [],
      } : null,
      part: item.partId ? {
        id: item.partId._id?.toString() || item.partId.toString(),
        name: item.partId.name || item.name,
        slug: item.partId.slug,
        images: [],
      } : null,
    }));

    return NextResponse.json({
      ...(order as any),
      id: (order as any)._id.toString(),
      items: formattedItems,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Cancel order (user can only cancel pending orders)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (action !== "cancel") {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const order = await Order.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only pending orders can be cancelled by user
    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending orders can be cancelled" },
        { status: 400 }
      );
    }

    // Restore stock for items
    for (const item of order.items || []) {
      if (item.generatorId) {
        await Generator.findByIdAndUpdate(
          item.generatorId,
          { $inc: { stock: item.quantity } }
        );
      } else if (item.partId) {
        await Part.findByIdAndUpdate(
          item.partId,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        status: "CANCELLED",
        paymentStatus: order.paymentStatus === "PAID" ? "REFUNDED" : "PENDING",
      },
      { new: true }
    ).lean();

    return NextResponse.json({
      ...(updatedOrder as any),
      id: (updatedOrder as any)._id.toString(),
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
