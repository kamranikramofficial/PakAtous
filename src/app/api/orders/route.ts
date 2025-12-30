import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Order, OrderItem } from "@/models/Order";
import { Cart, CartItem } from "@/models/Cart";
import { Generator, GeneratorImage } from "@/models/Generator";
import { Part, PartImage } from "@/models/Part";
import { Setting } from "@/models/Setting";
import { Coupon } from "@/models/Coupon";
import { Notification } from "@/models/Notification";
import { User } from "@/models/User";
import { checkoutSchema } from "@/lib/validations";
import { generateOrderNumber, generateInvoiceNumber } from "@/lib/utils";
import { sendEmail, getOrderConfirmationEmailTemplate, getAdminNewOrderNotificationTemplate } from "@/lib/email";

// Get user's orders
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const query: any = { userId: session.user.id };
    if (status) {
      query.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    // Get order items for all orders
    const orderIds = orders.map((o: any) => o._id);
    const items = await OrderItem.find({ orderId: { $in: orderIds } }).lean();

    // Get products
    const generatorIds = items.filter((i: any) => i.generatorId).map((i: any) => i.generatorId);
    const partIds = items.filter((i: any) => i.partId).map((i: any) => i.partId);

    const [generators, parts, genImages, partImages] = await Promise.all([
      Generator.find({ _id: { $in: generatorIds } }).lean(),
      Part.find({ _id: { $in: partIds } }).lean(),
      GeneratorImage.find({ generatorId: { $in: generatorIds }, isPrimary: true }).lean(),
      PartImage.find({ partId: { $in: partIds }, isPrimary: true }).lean(),
    ]);

    const genMap = new Map(generators.map((g: any) => [g._id.toString(), g]));
    const partMap = new Map(parts.map((p: any) => [p._id.toString(), p]));
    const genImgMap = new Map(genImages.map((i: any) => [i.generatorId.toString(), i]));
    const partImgMap = new Map(partImages.map((i: any) => [i.partId.toString(), i]));

    // Group items by order
    const itemsByOrder = new Map<string, any[]>();
    items.forEach((item: any) => {
      const orderId = item.orderId.toString();
      if (!itemsByOrder.has(orderId)) itemsByOrder.set(orderId, []);
      
      const generator = item.generatorId ? genMap.get(item.generatorId.toString()) : null;
      const part = item.partId ? partMap.get(item.partId.toString()) : null;
      
      itemsByOrder.get(orderId)!.push({
        ...item,
        id: item._id.toString(),
        generator: generator ? {
          ...generator,
          id: (generator as any)._id.toString(),
          images: genImgMap.has((generator as any)._id.toString()) 
            ? [genImgMap.get((generator as any)._id.toString())]
            : [],
        } : null,
        part: part ? {
          ...part,
          id: (part as any)._id.toString(),
          images: partImgMap.has((part as any)._id.toString())
            ? [partImgMap.get((part as any)._id.toString())]
            : [],
        } : null,
      });
    });

    const ordersWithItems = orders.map((order: any) => ({
      ...order,
      id: order._id.toString(),
      items: itemsByOrder.get(order._id.toString()) || [],
    }));

    return NextResponse.json({
      orders: ordersWithItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// Create new order (checkout)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = checkoutSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const checkoutData = validationResult.data;

    // Get cart items - from request body or database
    let cartItemsToProcess: { itemType: string; productId: string; quantity: number }[] = [];

    if (checkoutData.items && checkoutData.items.length > 0) {
      // Use items from request body (from client-side cart)
      cartItemsToProcess = checkoutData.items;
    } else {
      // Fallback to database cart
      const cart = await Cart.findOne({ userId: session.user.id });
      if (!cart) {
        return NextResponse.json(
          { error: "Your cart is empty" },
          { status: 400 }
        );
      }

      const dbCartItems = await CartItem.find({ cartId: cart._id }).lean();
      if (dbCartItems.length === 0) {
        return NextResponse.json(
          { error: "Your cart is empty" },
          { status: 400 }
        );
      }

      cartItemsToProcess = dbCartItems.map((item: any) => ({
        itemType: item.itemType,
        productId: item.itemType === "GENERATOR" ? item.generatorId?.toString() : item.partId?.toString(),
        quantity: item.quantity,
      }));
    }

    if (cartItemsToProcess.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty" },
        { status: 400 }
      );
    }

    // Get products for cart items
    const generatorIds = cartItemsToProcess.filter((i) => i.itemType === "GENERATOR").map((i) => i.productId);
    const partIds = cartItemsToProcess.filter((i) => i.itemType === "PART").map((i) => i.productId);

    const [generators, parts, genImages, partImages] = await Promise.all([
      Generator.find({ _id: { $in: generatorIds } }).lean(),
      Part.find({ _id: { $in: partIds } }).lean(),
      GeneratorImage.find({ generatorId: { $in: generatorIds }, isPrimary: true }).lean(),
      PartImage.find({ partId: { $in: partIds }, isPrimary: true }).lean(),
    ]);

    const genMap = new Map(generators.map((g: any) => [g._id.toString(), g]));
    const partMap = new Map(parts.map((p: any) => [p._id.toString(), p]));
    const genImgMap = new Map(genImages.map((i: any) => [i.generatorId.toString(), i]));
    const partImgMap = new Map(partImages.map((i: any) => [i.partId.toString(), i]));

    // Validate stock and calculate totals
    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of cartItemsToProcess) {
      const product = item.itemType === "GENERATOR" 
        ? genMap.get(item.productId) 
        : partMap.get(item.productId);
      
      if (!product) {
        return NextResponse.json(
          { error: `Product not found` },
          { status: 400 }
        );
      }

      if ((product as any).stock < item.quantity) {
        return NextResponse.json(
          { error: `${(product as any).name} only has ${(product as any).stock} items in stock` },
          { status: 400 }
        );
      }

      const itemTotal = (product as any).price * item.quantity;
      subtotal += itemTotal;

      const primaryImage = item.itemType === "GENERATOR" 
        ? genImgMap.get(item.productId)?.url
        : partImgMap.get(item.productId)?.url;

      orderItems.push({
        itemType: item.itemType,
        generatorId: item.itemType === "GENERATOR" ? item.productId : undefined,
        partId: item.itemType === "PART" ? item.productId : undefined,
        name: (product as any).name,
        sku: (product as any).sku,
        price: (product as any).price,
        quantity: item.quantity,
        total: itemTotal,
        imageUrl: primaryImage,
      });
    }

    // Get shipping settings
    const shippingSettings = await Setting.find({
      key: { $in: ["shipping_cost_default", "free_shipping_threshold", "tax_rate"] },
    }).lean();

    const settingsMap = new Map((shippingSettings as any[]).map((s: any) => [s.key, s.value]));
    const defaultShipping = parseFloat(settingsMap.get("shipping_cost_default") || "500");
    const freeShippingThreshold = parseFloat(settingsMap.get("free_shipping_threshold") || "50000");
    const taxRate = parseFloat(settingsMap.get("tax_rate") || "0");

    const shippingCost = subtotal >= freeShippingThreshold ? 0 : defaultShipping;
    const tax = (subtotal * taxRate) / 100;

    // Apply coupon if provided
    let discount = 0;
    let couponDiscount = 0;
    let appliedCoupon: any = null;

    if (checkoutData.couponCode) {
      const coupon = await Coupon.findOne({
        code: checkoutData.couponCode.toUpperCase(),
        isActive: true,
        startsAt: { $lte: new Date() },
        $or: [
          { expiresAt: null },
          { expiresAt: { $gte: new Date() } },
        ],
      });

      if (coupon) {
        // Check usage limit - just skip coupon if limit reached
        const usageLimitOk = !coupon.usageLimit || coupon.usageCount < coupon.usageLimit;
        
        // Check minimum order amount - just skip coupon if not met
        const minAmountOk = !coupon.minOrderAmount || subtotal >= coupon.minOrderAmount;

        if (usageLimitOk && minAmountOk) {
          if (coupon.type === "PERCENTAGE") {
            couponDiscount = (subtotal * coupon.value) / 100;
            if (coupon.maxDiscount) {
              couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
            }
          } else if (coupon.type === "FIXED_AMOUNT") {
            couponDiscount = coupon.value;
          } else if (coupon.type === "FREE_SHIPPING") {
            couponDiscount = shippingCost;
          }

          discount = couponDiscount;
          appliedCoupon = coupon;
        }
      }
    }

    const total = subtotal + shippingCost + tax - discount;

    // Create order
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId: session.user.id,
      shippingAddressId: checkoutData.shippingAddressId,
      shippingName: checkoutData.shippingName,
      shippingPhone: checkoutData.shippingPhone,
      shippingEmail: checkoutData.shippingEmail,
      shippingAddressLine: checkoutData.shippingAddressLine,
      shippingCity: checkoutData.shippingCity,
      shippingState: checkoutData.shippingState,
      shippingPostalCode: checkoutData.shippingPostalCode,
      shippingCountry: checkoutData.shippingCountry,
      subtotal,
      shippingCost,
      tax,
      discount,
      total,
      couponCode: appliedCoupon?.code,
      couponDiscount,
      paymentMethod: checkoutData.paymentMethod,
      customerNotes: checkoutData.customerNotes,
      invoiceNumber: generateInvoiceNumber(),
    });

    // Create order items
    await OrderItem.insertMany(
      orderItems.map((item) => ({
        ...item,
        orderId: order._id,
      }))
    );

    // Update stock using cartItemsToProcess
    for (const item of cartItemsToProcess) {
      if (item.itemType === "GENERATOR") {
        await Generator.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
      } else if (item.itemType === "PART") {
        await Part.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
      }
    }

    // Update coupon usage
    if (appliedCoupon) {
      await Coupon.findByIdAndUpdate(
        appliedCoupon._id,
        { $inc: { usageCount: 1 } }
      );
    }

    // Clear cart from database (if exists)
    const cart = await Cart.findOne({ userId: session.user.id });
    if (cart) {
      await CartItem.deleteMany({ cartId: cart._id });
    }

    // Create notification for user
    await Notification.create({
      userId: session.user.id,
      type: "ORDER_PLACED",
      title: "Order Placed Successfully!",
      message: `Your order ${order.orderNumber} has been placed. Total: Rs. ${total.toLocaleString()}`,
      link: `/account/orders/${order._id}`,
      orderId: order._id,
    });

    // Send order confirmation email
    const emailTemplate = getOrderConfirmationEmailTemplate({
      ...order.toObject(),
      id: order._id.toString(),
      items: orderItems,
    });
    await sendEmail({
      to: checkoutData.shippingEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    // Notify admin
    const admins = await User.find({ role: "ADMIN" }).select('email').lean();

    const adminEmailTemplate = getAdminNewOrderNotificationTemplate({
      ...order.toObject(),
      id: order._id.toString(),
    });
    
    for (const admin of admins) {
      await sendEmail({
        to: (admin as any).email,
        subject: adminEmailTemplate.subject,
        html: adminEmailTemplate.html,
      });

      // Create admin notification
      await Notification.create({
        userId: (admin as any)._id,
        type: "ORDER_PLACED",
        title: "New Order Received!",
        message: `New order ${order.orderNumber} for Rs. ${total.toLocaleString()}`,
        link: `/admin/orders/${order._id}`,
        orderId: order._id,
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        total: order.total,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
