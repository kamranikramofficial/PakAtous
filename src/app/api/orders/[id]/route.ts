import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Order, OrderItem } from "@/models/Order";
import { Generator, GeneratorImage } from "@/models/Generator";
import { Part, PartImage } from "@/models/Part";

export const dynamic = 'force-dynamic';

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
    }).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Fetch items from OrderItem collection (items might be stored separately)
    let orderItems = (order as any).items || [];
    
    // If embedded items are empty, try fetching from OrderItem collection
    if (!orderItems || orderItems.length === 0) {
      const separateItems = await OrderItem.find({ orderId: id })
        .populate("generatorId", "name slug")
        .populate("partId", "name slug")
        .lean();
      orderItems = separateItems;
    }

    // Fetch product images for items
    const generatorIds = orderItems.filter((i: any) => i.generatorId).map((i: any) => 
      typeof i.generatorId === 'object' ? i.generatorId._id : i.generatorId
    );
    const partIds = orderItems.filter((i: any) => i.partId).map((i: any) => 
      typeof i.partId === 'object' ? i.partId._id : i.partId
    );

    const [genImages, partImages] = await Promise.all([
      generatorIds.length > 0 ? GeneratorImage.find({ generatorId: { $in: generatorIds }, isPrimary: true }).lean() : [],
      partIds.length > 0 ? PartImage.find({ partId: { $in: partIds }, isPrimary: true }).lean() : [],
    ]);

    const genImgMap = new Map((genImages as any[]).map((i: any) => [i.generatorId.toString(), i]));
    const partImgMap = new Map((partImages as any[]).map((i: any) => [i.partId.toString(), i]));

    // Format items with proper structure
    const formattedItems = (orderItems || []).map((item: any) => {
      const genId = typeof item.generatorId === 'object' ? item.generatorId?._id?.toString() : item.generatorId?.toString();
      const pId = typeof item.partId === 'object' ? item.partId?._id?.toString() : item.partId?.toString();
      const genImg = genId ? genImgMap.get(genId) : null;
      const partImg = pId ? partImgMap.get(pId) : null;
      
      return {
        id: item._id?.toString() || item.id,
        name: item.name || (typeof item.generatorId === 'object' ? item.generatorId?.name : null) || (typeof item.partId === 'object' ? item.partId?.name : null) || "Product",
        sku: item.sku,
        price: item.price || 0,
        quantity: item.quantity || 1,
        total: item.total || (item.price * item.quantity) || 0,
        imageUrl: item.imageUrl || (genImg as any)?.url || (partImg as any)?.url,
        itemType: item.itemType,
        generator: item.generatorId && typeof item.generatorId === 'object' ? {
          id: item.generatorId._id?.toString(),
          name: item.generatorId.name,
          slug: item.generatorId.slug,
          images: genImg ? [genImg] : [],
        } : null,
        part: item.partId && typeof item.partId === 'object' ? {
          id: item.partId._id?.toString(),
          name: item.partId.name,
          slug: item.partId.slug,
          images: partImg ? [partImg] : [],
        } : null,
      };
    });

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
