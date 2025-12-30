import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Order, OrderItem } from "@/models/Order";
import { User } from "@/models/User";

// Get all orders (admin/staff)
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
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const query: any = {};
    
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Handle search - need to search in related user collection
    let userIds: string[] = [];
    if (search) {
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
        ]
      }).select("_id");
      userIds = users.map(u => u._id.toString());
      
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { shippingPhone: { $regex: search, $options: "i" } },
        ...(userIds.length > 0 ? [{ userId: { $in: userIds } }] : []),
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("userId", "id name email phone")
        .populate("couponId")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    // Get order statistics using aggregation
    const orderIds = orders.map((o: any) => o._id);
    const [statusStats, paymentStats, revenueStats, itemCountsAgg] = await Promise.all([
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $group: { _id: "$paymentStatus", count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: "PAID" } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      OrderItem.aggregate([
        { $match: { orderId: { $in: orderIds } } },
        { $group: { _id: "$orderId", count: { $sum: 1 } } }
      ]),
    ]);

    // Map item counts by order ID
    const itemCountsMap = itemCountsAgg.reduce((acc: any, curr: any) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {} as Record<string, number>);

    const formattedOrders = orders.map((order: any) => ({
      ...order,
      id: order._id.toString(),
      user: order.userId,
      coupon: order.couponId,
      _count: {
        items: itemCountsMap[order._id.toString()] || 0,
      },
    }));

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        byStatus: statusStats.reduce((acc: any, curr: any) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {} as Record<string, number>),
        byPaymentStatus: paymentStats.reduce((acc: any, curr: any) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {} as Record<string, number>),
        totalRevenue: revenueStats[0]?.total || 0,
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
