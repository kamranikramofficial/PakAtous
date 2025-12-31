import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { User } from "@/models/User";
import { Order } from "@/models/Order";
import { Cart } from "@/models/Cart";
import { AuditLog } from "@/models/AuditLog";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(["USER", "STAFF", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED", "BANNED", "SUSPENDED", "PENDING_VERIFICATION"]).optional(),
  password: z.string().min(8).optional(),
});

// Get all users (admin/staff)
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
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    
    if (role) query.role = role;
    if (status) query.status = status;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("name email phone role status emailVerified createdAt lastLoginAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    // Get user statistics using aggregation
    const userIds = users.map((u: any) => u._id);
    const [roleStats, statusStats, totalSpentAgg, orderCountsAgg] = await Promise.all([
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: "PAID" } },
        { $group: { _id: "$userId", total: { $sum: "$total" } } }
      ]),
      Order.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: "$userId", count: { $sum: 1 } } }
      ]),
    ]);

    // Calculate total spent per user
    const spentByUser = totalSpentAgg.reduce((acc: any, curr: any) => {
      acc[curr._id.toString()] = curr.total || 0;
      return acc;
    }, {} as Record<string, number>);

    // Calculate order count per user
    const ordersByUser = orderCountsAgg.reduce((acc: any, curr: any) => {
      acc[curr._id.toString()] = curr.count || 0;
      return acc;
    }, {} as Record<string, number>);

    const usersWithSpent = users.map((user: any) => ({
      ...user,
      id: user._id.toString(),
      totalSpent: spentByUser[user._id.toString()] || 0,
      _count: {
        orders: ordersByUser[user._id.toString()] || 0,
      },
    }));

    return NextResponse.json({
      users: usersWithSpent,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        byRole: roleStats.reduce((acc: any, curr: any) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {} as Record<string, number>),
        byStatus: statusStats.reduce((acc: any, curr: any) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// Create new user (admin)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
      phone: z.string().optional(),
      role: z.enum(["USER", "ADMIN"]).default("USER"),
    });

    const validationResult = schema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if email already exists
    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      role: data.role,
      emailVerified: new Date(), // Admin-created users are auto-verified
      status: "ACTIVE",
    });

    // Create cart for user
    await Cart.create({ userId: user._id });

    // Log action
    await AuditLog.create({
      userId: session.user.id,
      action: "CREATE",
      entity: "USER",
      entityId: user._id.toString(),
      newValues: JSON.stringify({ name: user.name, email: user.email, role: user.role }),
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
