import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { User } from "@/models/User";
import { Order, OrderItem } from "@/models/Order";
import { ServiceRequest } from "@/models/ServiceRequest";
import { Review } from "@/models/Review";
import { Notification } from "@/models/Notification";
import { Cart, CartItem, WishlistItem } from "@/models/Cart";
import { Account } from "@/models/Account";
import { Session } from "@/models/Session";
import { AuditLog } from "@/models/AuditLog";
import { Generator } from "@/models/Generator";
import { Part } from "@/models/Part";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(["USER", "STAFF", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED", "BANNED", "SUSPENDED", "PENDING_VERIFICATION"]).optional(),
  password: z.string().min(8).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

// Get single user (admin/staff)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await User.findById(id)
      .select('name email phone address role status emailVerified createdAt lastLoginAt')
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's orders
    const orders = await Order.find({ userId: id })
      .select('orderNumber total status paymentStatus createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get user's service requests
    const serviceRequests = await ServiceRequest.find({ userId: id })
      .select('requestNumber serviceType status createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get user's reviews
    const reviews = await Review.find({ userId: id })
      .select('rating comment createdAt generatorId partId')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get generator/part names for reviews
    const generatorIds = reviews.filter((r: any) => r.generatorId).map((r: any) => r.generatorId);
    const partIds = reviews.filter((r: any) => r.partId).map((r: any) => r.partId);
    
    const [generators, parts] = await Promise.all([
      Generator.find({ _id: { $in: generatorIds } }).select('name').lean(),
      Part.find({ _id: { $in: partIds } }).select('name').lean(),
    ]);

    const genMap = new Map(generators.map((g: any) => [g._id.toString(), g.name]));
    const partMap = new Map(parts.map((p: any) => [p._id.toString(), p.name]));

    const reviewsWithProducts = reviews.map((review: any) => ({
      ...review,
      id: review._id.toString(),
      generator: review.generatorId ? { name: genMap.get(review.generatorId.toString()) } : null,
      part: review.partId ? { name: partMap.get(review.partId.toString()) } : null,
    }));

    // Get counts
    const [ordersCount, serviceRequestsCount, reviewsCount] = await Promise.all([
      Order.countDocuments({ userId: id }),
      ServiceRequest.countDocuments({ userId: id }),
      Review.countDocuments({ userId: id }),
    ]);

    // Calculate total spent
    const totalSpentResult = await Order.aggregate([
      { $match: { userId: id, paymentStatus: "PAID" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    return NextResponse.json({
      user: {
        ...user,
        id: (user as any)._id.toString(),
        orders: orders.map((o: any) => ({ ...o, id: o._id.toString() })),
        serviceRequests: serviceRequests.map((s: any) => ({ ...s, id: s._id.toString() })),
        reviews: reviewsWithProducts,
        _count: {
          orders: ordersCount,
          serviceRequests: serviceRequestsCount,
          reviews: reviewsCount,
        },
        totalSpent: totalSpentResult[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// Update user (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validationResult = updateUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const existingUser = await User.findById(id);

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent admin from changing their own role
    if (session.user.id === id && data.role && data.role !== existingUser.role) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    // Check if email is being changed and if new email already exists
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await User.findOne({ email: data.email });
      if (emailExists) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 409 }
        );
      }
    }

    // Hash password if provided
    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true })
      .select('name email phone role status createdAt')
      .lean();

    // Log action
    await AuditLog.create({
      userId: session.user.id,
      action: "UPDATE",
      entity: "USER",
      entityId: id,
      oldValues: JSON.stringify({
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        status: existingUser.status,
      }),
      newValues: JSON.stringify({
        name: (user as any).name,
        email: (user as any).email,
        role: (user as any).role,
        status: (user as any).status,
      }),
    });

    // Create notification if status changed to blocked
    if (data.status === "BLOCKED" && existingUser.status !== "BLOCKED") {
      await Notification.create({
        userId: id,
        type: "SYSTEM",
        title: "Account Suspended",
        message: "Your account has been suspended. Please contact support for more information.",
      });
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        ...user,
        id: (user as any)._id.toString(),
      }
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// Delete user (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Prevent admin from deleting themselves
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has orders or service requests
    const [ordersCount, serviceRequestsCount] = await Promise.all([
      Order.countDocuments({ userId: id }),
      ServiceRequest.countDocuments({ userId: id }),
    ]);

    // If user has orders or service requests, soft delete by setting status to BLOCKED
    if (ordersCount > 0 || serviceRequestsCount > 0) {
      await User.findByIdAndUpdate(id, { status: "BLOCKED" });

      await AuditLog.create({
        userId: session.user.id,
        action: "SOFT_DELETE",
        entity: "USER",
        entityId: id,
        oldValues: JSON.stringify({ email: user.email, status: user.status }),
      });

      return NextResponse.json({
        success: true,
        message: "User has been deactivated (has order/service history)",
      });
    }

    // Hard delete if no orders or service requests
    // Delete related records
    await Notification.deleteMany({ userId: id });
    await Review.deleteMany({ userId: id });
    
    const cart = await Cart.findOne({ userId: id });
    if (cart) {
      await CartItem.deleteMany({ cartId: cart._id });
      await Cart.deleteOne({ _id: cart._id });
    }
    
    await WishlistItem.deleteMany({ userId: id });
    await Account.deleteMany({ userId: id });
    await Session.deleteMany({ userId: id });
    await User.deleteOne({ _id: id });

    await AuditLog.create({
      userId: session.user.id,
      action: "DELETE",
      entity: "USER",
      entityId: id,
      oldValues: JSON.stringify({ email: user.email }),
    });

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
