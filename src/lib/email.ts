import { Resend } from "resend";

// Only initialize Resend if API key is provided
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  if (!resend) {
    console.warn("Email service not configured. RESEND_API_KEY is missing.");
    return { success: false, error: "Email service not configured" };
  }
  
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || "PakAutoSe <noreply@pakautose.com>",
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

// ==================== EMAIL TEMPLATES ====================

export function getVerificationEmailTemplate(name: string, verificationLink: string) {
  return {
    subject: "Verify Your Email - PakAutoSe",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Verify Your Email</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e40af;">Hi ${name},</h2>
          <p>Thank you for registering with PakAutoSe! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #3b82f6;">${verificationLink}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account with us, please ignore this email.</p>
          <p>Best regards,<br>The PakAutoSe Team</p>
        </div>
      </body>
      </html>
    `,
  };
}

export function getWelcomeEmailTemplate(name: string) {
  return {
    subject: "Welcome to PakAutoSe Generators!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to PakAutoSe</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to PakAutoSe!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e40af;">Hi ${name},</h2>
          <p>Thank you for joining PakAutoSe Generators. We're excited to have you!</p>
          <p>At PakAutoSe, you can:</p>
          <ul>
            <li>Browse our wide range of generators</li>
            <li>Purchase genuine generator parts</li>
            <li>Request professional generator services</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/generators" style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Browse Generators</a>
          </div>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>The PakAutoSe Team</p>
        </div>
      </body>
      </html>
    `,
  };
}

export function getPasswordResetEmailTemplate(name: string, resetLink: string) {
  return {
    subject: "Reset Your Password - PakAutoSe",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Password Reset</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Hi ${name},</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
          <p>Best regards,<br>The PakAutoSe Team</p>
        </div>
      </body>
      </html>
    `,
  };
}

export function getOrderConfirmationEmailTemplate(order: any) {
  const itemsList = order.items
    .map(
      (item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">Rs. ${item.total.toLocaleString()}</td>
      </tr>
    `
    )
    .join("");

  return {
    subject: `Order Confirmed - ${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Order Confirmed! ✓</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Thank you for your order!</h2>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString("en-PK")}</p>
          
          <h3 style="margin-top: 30px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #e5e7eb;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; text-align: right;">
            <p><strong>Subtotal:</strong> Rs. ${order.subtotal.toLocaleString()}</p>
            <p><strong>Shipping:</strong> Rs. ${order.shippingCost.toLocaleString()}</p>
            ${order.discount > 0 ? `<p><strong>Discount:</strong> -Rs. ${order.discount.toLocaleString()}</p>` : ""}
            <p style="font-size: 1.2em;"><strong>Total:</strong> Rs. ${order.total.toLocaleString()}</p>
          </div>
          
          <h3 style="margin-top: 30px;">Shipping Address</h3>
          <p>
            ${order.shippingName}<br>
            ${order.shippingAddressLine}<br>
            ${order.shippingCity}, ${order.shippingState} ${order.shippingPostalCode}<br>
            ${order.shippingCountry}<br>
            Phone: ${order.shippingPhone}
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${order.id}" style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Order</a>
          </div>
          
          <p>Best regards,<br>The PakAutoSe Team</p>
        </div>
      </body>
      </html>
    `,
  };
}

export function getServiceRequestEmailTemplate(request: any) {
  return {
    subject: `Service Request Received - ${request.requestNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Service Request Received</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Hi ${request.contactName},</h2>
          <p>We have received your service request. Our team will review it and get back to you shortly.</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Request Number:</strong> ${request.requestNumber}</p>
            <p><strong>Service Type:</strong> ${request.serviceType}</p>
            <p><strong>Problem:</strong> ${request.problemTitle}</p>
          </div>
          
          <p>We typically respond within 24-48 hours. For urgent matters, please call us directly.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/services/${request.id}" style="background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Request</a>
          </div>
          
          <p>Best regards,<br>The PakAutoSe Service Team</p>
        </div>
      </body>
      </html>
    `,
  };
}

export function getAdminNewOrderNotificationTemplate(order: any) {
  return {
    subject: `🛒 New Order Received - ${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1e40af; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">New Order Received!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Order Details</h2>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Customer:</strong> ${order.shippingName}</p>
          <p><strong>Email:</strong> ${order.shippingEmail}</p>
          <p><strong>Total:</strong> Rs. ${order.total.toLocaleString()}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Items:</strong> ${order.items.length}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${order.id}" style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order</a>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function getAdminNewServiceRequestNotificationTemplate(request: any) {
  return {
    subject: `🔧 New Service Request - ${request.requestNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #7c3aed; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">New Service Request!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Request Details</h2>
          <p><strong>Request Number:</strong> ${request.requestNumber}</p>
          <p><strong>Customer:</strong> ${request.contactName}</p>
          <p><strong>Email:</strong> ${request.contactEmail}</p>
          <p><strong>Phone:</strong> ${request.contactPhone}</p>
          <p><strong>Service Type:</strong> ${request.serviceType}</p>
          <p><strong>Problem:</strong> ${request.problemTitle}</p>
          <p><strong>Location:</strong> ${request.serviceCity}, ${request.serviceState}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/services/${request.id}" style="background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Request</a>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function getOrderStatusEmailTemplate(order: any, newStatus: string) {
  const statusMessages: Record<string, string> = {
    CONFIRMED: "Your order has been confirmed and is being processed.",
    PROCESSING: "Your order is being prepared for shipment.",
    SHIPPED: `Your order has been shipped. ${order.trackingNumber ? `Tracking Number: ${order.trackingNumber}` : ''}`,
    OUT_FOR_DELIVERY: "Your order is out for delivery.",
    DELIVERED: "Your order has been delivered.",
    CANCELLED: "Your order has been cancelled.",
    REFUNDED: "Your order has been refunded.",
  };

  return {
    subject: `Order Update - ${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Order Update</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Hi ${order.shippingName},</h2>
          <p>Your order <strong>#${order.orderNumber}</strong> status has been updated to: <strong>${newStatus}</strong></p>
          <p>${statusMessages[newStatus] || ''}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${order.id}" style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order</a>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export async function sendOrderStatusEmail(order: any, newStatus: string) {
  const template = getOrderStatusEmailTemplate(order, newStatus);
  return sendEmail({
    to: order.shippingEmail || order.user?.email,
    subject: template.subject,
    html: template.html,
  });
}

export function getServiceStatusEmailTemplate(service: any, newStatus: string) {
  const statusMessages: Record<string, string> = {
    REVIEWING: "Our team is reviewing your service request.",
    QUOTED: `We have sent you a quote. Estimated cost: Rs. ${service.estimatedCost?.toLocaleString() || 'To be determined'}`,
    QUOTE_SENT: `We have sent you a quote. Estimated cost: Rs. ${service.estimatedCost?.toLocaleString() || 'To be determined'}`,
    APPROVED: "Your service request has been approved.",
    IN_PROGRESS: `A technician has been assigned and work is in progress. ${service.scheduledDate ? `Scheduled for: ${new Date(service.scheduledDate).toLocaleDateString()}` : ''}`,
    COMPLETED: `Your service has been completed. ${service.finalCost ? `Final cost: Rs. ${service.finalCost.toLocaleString()}` : ''}`,
    CANCELLED: "Your service request has been cancelled.",
  };

  return {
    subject: `Service Request Update - ${service.requestNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Service Request Update</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Hi ${service.contactName},</h2>
          <p>Your service request <strong>#${service.requestNumber}</strong> status has been updated to: <strong>${newStatus}</strong></p>
          <p>${statusMessages[newStatus] || ''}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/services/${service.id}" style="background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Request</a>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export async function sendServiceStatusEmail(service: any, newStatus: string) {
  const template = getServiceStatusEmailTemplate(service, newStatus);
  return sendEmail({
    to: service.contactEmail || service.user?.email,
    subject: template.subject,
    html: template.html,
  });
}
