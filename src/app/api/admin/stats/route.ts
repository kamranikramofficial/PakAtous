import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { Generator } from "@/models/Generator";
import { Part } from "@/models/Part";
import { ServiceRequest } from "@/models/ServiceRequest";
import { subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const currentMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Get statistics
    const [
      totalOrders,
      totalRevenueAgg,
      pendingOrders,
      totalUsers,
      newUsersThisMonth,
      totalGenerators,
      lowStockGenerators,
      totalParts,
      lowStockParts,
      pendingServiceRequests,
      recentOrders,
      recentServiceRequests,
      monthlyRevenueAgg,
      lastMonthRevenueAgg,
      ordersByStatusAgg,
      servicesByStatusAgg,
    ] = await Promise.all([
      // Total orders
      Order.countDocuments(),
      
      // Total revenue
      Order.aggregate([
        { $match: { paymentStatus: "PAID" } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      
      // Pending orders
      Order.countDocuments({ status: "PENDING" }),
      
      // Total users
      User.countDocuments({ role: "USER" }),
      
      // New users this month
      User.countDocuments({
        role: "USER",
        createdAt: { $gte: currentMonthStart },
      }),
      
      // Total generators
      Generator.countDocuments(),
      
      // Low stock generators
      Generator.countDocuments({
        $expr: { $lte: ["$stock", "$lowStockThreshold"] }
      }),
      
      // Total parts
      Part.countDocuments(),
      
      // Low stock parts
      Part.countDocuments({
        $expr: { $lte: ["$stock", "$lowStockThreshold"] }
      }),
      
      // Pending service requests
      ServiceRequest.countDocuments({
        status: { $in: ["PENDING", "REVIEWING"] },
      }),
      
      // Recent orders
      Order.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      
      // Recent service requests
      ServiceRequest.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      
      // Monthly revenue
      Order.aggregate([
        { 
          $match: { 
            paymentStatus: "PAID",
            createdAt: { $gte: currentMonthStart },
          } 
        },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      
      // Last month revenue
      Order.aggregate([
        { 
          $match: { 
            paymentStatus: "PAID",
            createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
          } 
        },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      
      // Orders by status
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      
      // Services by status
      ServiceRequest.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const currentMonthRev = monthlyRevenueAgg[0]?.total || 0;
    const lastMonthRev = lastMonthRevenueAgg[0]?.total || 0;
    
    // Calculate revenue growth
    const revenueGrowth = lastMonthRev > 0
      ? ((currentMonthRev - lastMonthRev) / lastMonthRev) * 100
      : 0;

    // Get daily orders for the last 30 days
    const dailyOrdersAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          total: { $sum: "$total" },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format orders by status
    const ordersByStatus = ordersByStatusAgg.map((item: any) => ({
      status: item._id,
      _count: item.count,
    }));

    // Format services by status
    const servicesByStatus = servicesByStatusAgg.map((item: any) => ({
      status: item._id,
      _count: item.count,
    }));

    // Format recent orders
    const formattedRecentOrders = recentOrders.map((order: any) => ({
      ...order,
      id: order._id.toString(),
      user: order.userId,
    }));

    // Format recent service requests
    const formattedRecentServices = recentServiceRequests.map((service: any) => ({
      ...service,
      id: service._id.toString(),
      user: service.userId,
    }));

    return NextResponse.json({
      stats: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        totalUsers,
        newUsersThisMonth,
        totalGenerators,
        lowStockGenerators,
        totalParts,
        lowStockParts,
        pendingServiceRequests,
        monthlyRevenue: currentMonthRev,
        revenueGrowth,
      },
      recentOrders: formattedRecentOrders,
      recentServiceRequests: formattedRecentServices,
      ordersByStatus,
      servicesByStatus,
      dailyOrders: dailyOrdersAgg,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
