import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { ServiceRequest } from "@/models/ServiceRequest";
import { User } from "@/models/User";

// Get all service requests (admin/staff)
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
    const serviceType = searchParams.get("serviceType");
    const search = searchParams.get("search");
    const priority = searchParams.get("priority");

    const query: any = {};
    
    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;
    if (priority) query.priority = priority;
    
    // Handle search - need to search in related user collection
    if (search) {
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
        ]
      }).select("_id");
      const userIds = users.map(u => u._id);
      
      query.$or = [
        { requestNumber: { $regex: search, $options: "i" } },
        { generatorBrand: { $regex: search, $options: "i" } },
        { generatorModel: { $regex: search, $options: "i" } },
        ...(userIds.length > 0 ? [{ userId: { $in: userIds } }] : []),
      ];
    }

    const [services, total] = await Promise.all([
      ServiceRequest.find(query)
        .populate("userId", "id name email phone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ServiceRequest.countDocuments(query),
    ]);

    // Get service statistics using aggregation
    const [statusStats, typeStats] = await Promise.all([
      ServiceRequest.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      ServiceRequest.aggregate([
        { $group: { _id: "$serviceType", count: { $sum: 1 } } }
      ]),
    ]);

    const formattedServices = services.map((service: any) => ({
      ...service,
      id: service._id.toString(),
      user: service.userId,
    }));

    return NextResponse.json({
      services: formattedServices,
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
        byType: typeStats.reduce((acc: any, curr: any) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error("Error fetching service requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch service requests" },
      { status: 500 }
    );
  }
}
