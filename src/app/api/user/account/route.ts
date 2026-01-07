import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { User } from "@/models/User";
import { Order } from "@/models/Order";
import { Cart } from "@/models/Cart";
import { Review } from "@/models/Review";
import { Notification } from "@/models/Notification";
import { Session } from "@/models/Session";
import { Account } from "@/models/Account";
import { AuditLog } from "@/models/AuditLog";
import { DeletedUser } from "@/models/DeletedUser";
import { Address } from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

// Hash email for lookup without exposing original
function hashEmail(email: string): string {
  return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
}

// DELETE /api/user/account - Soft delete user account (archive to DeletedUser table)
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { password, confirmation, reason } = body;

    // Verify confirmation text
    if (confirmation !== "DELETE MY ACCOUNT") {
      return NextResponse.json(
        { error: "Please type 'DELETE MY ACCOUNT' to confirm" },
        { status: 400 }
      );
    }

    // Get user and verify password
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user has a password (not OAuth only), verify it
    if (user.password) {
      if (!password) {
        return NextResponse.json(
          { error: "Password is required to delete account" },
          { status: 400 }
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Incorrect password" },
          { status: 400 }
        );
      }
    }

    // Check for pending orders
    const pendingOrders = await Order.countDocuments({
      userId: session.user.id,
      status: { $in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"] }
    });

    if (pendingOrders > 0) {
      return NextResponse.json(
        { error: `Cannot delete account with ${pendingOrders} pending order(s). Please wait for orders to complete or cancel them first.` },
        { status: 400 }
      );
    }

    // Get order statistics for archive
    const orderStats = await Order.aggregate([
      { $match: { userId: user._id } },
      { 
        $group: { 
          _id: null, 
          totalOrders: { $sum: 1 }, 
          totalSpent: { $sum: "$total" } 
        } 
      }
    ]);

    const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0 };

    // Get addresses for archive
    const addresses = await Address.find({ userId: session.user.id }).lean();

    // Set data retention period (e.g., 7 years for legal compliance)
    const retentionYears = 7;
    const dataRetentionUntil = new Date();
    dataRetentionUntil.setFullYear(dataRetentionUntil.getFullYear() + retentionYears);

    // Create archived user record
    await DeletedUser.create({
      originalUserId: user._id,
      name: user.name,
      email: user.email,
      emailHashed: hashEmail(user.email),
      phone: user.phone,
      role: user.role,
      address: user.address,
      city: user.city,
      state: user.state,
      postalCode: user.postalCode,
      country: user.country || 'Pakistan',
      originalCreatedAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      deletedAt: new Date(),
      deletionReason: reason || 'User requested account deletion',
      deletedByAdmin: false,
      totalOrders: stats.totalOrders,
      totalSpent: stats.totalSpent,
      archivedData: JSON.stringify({
        addresses: addresses,
        emailVerified: user.emailVerified,
      }),
      dataRetentionUntil: dataRetentionUntil,
      permanentlyDeleted: false,
    });

    // Create audit log
    await AuditLog.create({
      userId: session.user.id,
      action: "ACCOUNT_ARCHIVED",
      entity: "User",
      entityId: session.user.id,
      oldValues: JSON.stringify({
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      }),
      newValues: JSON.stringify({
        archivedTo: "DeletedUser",
        dataRetentionUntil: dataRetentionUntil,
      }),
    });

    // Delete sessions (logout from all devices)
    await Session.deleteMany({ userId: session.user.id });
    
    // Delete OAuth accounts
    await Account.deleteMany({ userId: session.user.id });
    
    // Delete cart
    await Cart.deleteOne({ userId: session.user.id });
    
    // Delete notifications
    await Notification.deleteMany({ userId: session.user.id });
    
    // Delete addresses
    await Address.deleteMany({ userId: session.user.id });
    
    // Anonymize reviews (keep reviews but remove user association)
    await Review.updateMany(
      { userId: session.user.id },
      { $set: { userId: null, userName: "Deleted User" } }
    );

    // Update orders to mark user as deleted (keep orders for records)
    await Order.updateMany(
      { userId: session.user.id },
      { $set: { userDeleted: true } }
    );

    // Finally delete the user from active users table
    await User.findByIdAndDelete(session.user.id);

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully. Your data has been archived for legal compliance.",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
