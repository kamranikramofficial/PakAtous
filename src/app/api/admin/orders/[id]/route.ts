import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";
import { Notification } from "@/models/Notification";
import { updateOrderStatusSchema } from "@/lib/validations";
export const dynamic = 'force-dynamic';
import { 
  sendOrderStatusEmail, 
  sendShippingUpdateEmail, 
  sendOutForDeliveryEmail, 
  sendDeliveryConfirmationEmail,
  sendOrderCancellationEmail,
  sendRefundConfirmationEmail,
  sendOrderInternalNotesEmail,
  sendPaymentConfirmationEmail
} from "@/lib/email";

// Get single order (admin/staff)
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

    const order = await Order.findById(id)
      .populate("userId", "name email phone")
      .populate("items.generatorId", "name slug")
      .populate("items.partId", "name slug")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get audit logs
    const auditLogs = await AuditLog.find({
      entity: "ORDER",
      entityId: id,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Format items with id field and proper names
    const formattedItems = (order as any).items.map((item: any) => ({
      ...item,
      id: item._id?.toString() || item.id,
      generator: item.generatorId ? {
        id: item.generatorId._id?.toString() || item.generatorId.toString(),
        name: item.generatorId.name || item.name,
        slug: item.generatorId.slug,
      } : null,
      part: item.partId ? {
        id: item.partId._id?.toString() || item.partId.toString(),
        name: item.partId.name || item.name,
        slug: item.partId.slug,
      } : null,
    }));

    // Get user info
    const orderUser = (order as any).userId;

    // Build shippingAddress object for frontend compatibility
    const shippingAddress = (order as any).shippingName || (order as any).shippingAddressLine ? {
      fullName: (order as any).shippingName || '',
      address: (order as any).shippingAddressLine || '',
      city: (order as any).shippingCity || '',
      state: (order as any).shippingState || '',
      postalCode: (order as any).shippingPostalCode || '',
      country: (order as any).shippingCountry || 'Pakistan',
      phone: (order as any).shippingPhone || '',
      email: (order as any).shippingEmail || '',
    } : null;

    return NextResponse.json({
      order: {
        ...(order as any),
        id: (order as any)._id.toString(),
        user: orderUser ? {
          id: orderUser._id?.toString() || orderUser.toString(),
          name: orderUser.name,
          email: orderUser.email,
          phone: orderUser.phone,
        } : null,
        shippingAddress,
        totalAmount: (order as any).total, // Alias for staff page
        items: formattedItems,
      },
      auditLogs: auditLogs.map((log: any) => ({ ...log, id: log._id.toString() })),
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// Update order status (admin/staff)
export async function PUT(
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
    const body = await request.json();
    const validationResult = updateOrderStatusSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { status, paymentStatus, adminNotes, internalNotes, trackingNumber, carrier, estimatedDelivery } = validationResult.data;

    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get user for email notification
    const orderUser = order.userId ? await User.findById(order.userId).select('email name').lean() : null;

    const oldStatus = order.status;
    const oldPaymentStatus = order.paymentStatus;
    const oldInternalNotes = order.internalNotes || '';

    // Build update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (carrier) updateData.carrier = carrier;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;
    if (estimatedDelivery) updateData.estimatedDelivery = estimatedDelivery;
    if (status === "SHIPPED" && !order.trackingNumber && trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    if (status === "DELIVERED") updateData.deliveredAt = new Date();
    if (paymentStatus === "PAID" && oldPaymentStatus !== "PAID") updateData.paidAt = new Date();

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true }).lean();

    // Create audit log
    await AuditLog.create({
      user: session.user.id,
      action: "UPDATE",
      entity: "ORDER",
      entityId: id,
      oldValues: JSON.stringify({ status: oldStatus, paymentStatus: oldPaymentStatus }),
      newValues: JSON.stringify({
        status: status || oldStatus,
        paymentStatus: paymentStatus || oldPaymentStatus,
        trackingNumber,
        adminNotes,
      }),
    });

    // Send email notification if status changed
    if (status && status !== oldStatus) {
      // Create notification for user (only if registered user)
      if (order.userId) {
        await Notification.create({
          userId: order.userId,
          type: "ORDER_UPDATE",
          title: "Order Status Updated",
          message: `Your order #${order.orderNumber} status has been updated to ${status}`,
          link: `/account/orders/${order._id}`,
        });
      }

      // Prepare order data for emails
      const orderEmailData = {
        ...(updatedOrder as any),
        id: (updatedOrder as any)._id.toString(),
        user: { email: orderUser?.email, name: orderUser?.name },
        shippingEmail: order.shippingEmail || orderUser?.email,
      };

      // Send appropriate email based on status
      if (orderUser?.email || order.shippingEmail) {
        try {
          switch (status) {
            case "SHIPPED":
              await sendShippingUpdateEmail(orderEmailData);
              break;
            case "OUT_FOR_DELIVERY":
              await sendOutForDeliveryEmail(orderEmailData);
              break;
            case "DELIVERED":
              await sendDeliveryConfirmationEmail(orderEmailData);
              break;
            case "CANCELLED":
              await sendOrderCancellationEmail(orderEmailData, adminNotes);
              break;
            default:
              await sendOrderStatusEmail(orderEmailData, status);
          }
        } catch (emailError) {
          console.error("Failed to send status email:", emailError);
        }
      }
    }

    // Send payment confirmation email if payment status changed to PAID
    if (paymentStatus && paymentStatus !== oldPaymentStatus && paymentStatus === "PAID") {
      // Create notification for user (only if registered user)
      if (order.userId) {
        await Notification.create({
          userId: order.userId,
          type: "PAYMENT_RECEIVED",
          title: "Payment Received",
          message: `Payment received for your order #${order.orderNumber}. Thank you!`,
          link: `/account/orders/${order._id}`,
        });
      }

      // Send payment confirmation email
      if (orderUser?.email || order.shippingEmail) {
        try {
          const orderEmailData = {
            ...(updatedOrder as any),
            id: (updatedOrder as any)._id.toString(),
            user: { email: orderUser?.email, name: orderUser?.name },
            shippingEmail: order.shippingEmail || orderUser?.email,
          };
          await sendPaymentConfirmationEmail(orderEmailData);
          console.log("Payment confirmation email sent successfully");
        } catch (emailError) {
          console.error("Failed to send payment confirmation email:", emailError);
        }
      }
    }

    // Handle refund if order is cancelled and was paid
    if (status === "CANCELLED" && oldPaymentStatus === "PAID") {
      // Restore stock
      const { Generator } = await import("@/models/Generator");
      const { Part } = await import("@/models/Part");
      
      for (const item of order.items || []) {
        if (item.generatorId) {
          await Generator.findByIdAndUpdate(
            item.generatorId,
            { $inc: { stock: item.quantity } }
          );
        }
        if (item.partId) {
          await Part.findByIdAndUpdate(
            item.partId,
            { $inc: { stock: item.quantity } }
          );
        }
      }

      // Update payment status to refunded
      await Order.findByIdAndUpdate(id, { paymentStatus: "REFUNDED" });

      // Send refund email
      if (orderUser?.email || order.shippingEmail) {
        try {
          await sendRefundConfirmationEmail(
            {
              ...(updatedOrder as any),
              id: (updatedOrder as any)._id.toString(),
              shippingEmail: order.shippingEmail || orderUser?.email,
            },
            order.total
          );
        } catch (emailError) {
          console.error("Failed to send refund email:", emailError);
        }
      }
    }

    // Send email notification if internal notes changed (admin/staff communication)
    if (internalNotes !== undefined && internalNotes !== oldInternalNotes) {
      const currentUserRole = session.user.role;
      const senderName = session.user.name || (currentUserRole === 'ADMIN' ? 'Admin' : 'Staff');
      
      // If STAFF changes notes → notify ALL ADMINs
      // If ADMIN changes notes → notify ALL STAFF
      const targetRole = currentUserRole === 'ADMIN' ? 'STAFF' : 'ADMIN';
      const recipients = await User.find({ 
        role: targetRole,
        isActive: { $ne: false }
      }).select('email name');
      
      const recipientEmails = recipients.map(r => r.email);
      console.log(`Order internal notes changed by ${currentUserRole}. Sending email to ${targetRole}:`, recipientEmails);
      
      if (recipientEmails.length > 0) {
        await sendOrderInternalNotesEmail(
          { ...order.toObject(), id: order._id.toString(), orderNumber: order.orderNumber },
          senderName,
          internalNotes,
          recipientEmails,
          targetRole
        );
        console.log('Order internal notes email sent successfully');
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        ...updatedOrder,
        id: (updatedOrder as any)._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// Delete order (admin) - only for cancelled/failed orders
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

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow deletion of cancelled or failed orders
    if (!["CANCELLED"].includes(order.status)) {
      return NextResponse.json(
        { error: "Only cancelled orders can be deleted" },
        { status: 400 }
      );
    }

    await Order.deleteOne({ _id: id });

    // Log action
    await AuditLog.create({
      user: session.user.id,
      action: "DELETE",
      entity: "ORDER",
      entityId: id,
      oldValues: JSON.stringify(order),
    });

    return NextResponse.json({ success: true, message: "Order deleted" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
