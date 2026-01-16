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

// Get the from email - use verified domain
function getFromEmail(): string {
  const emailFrom = process.env.EMAIL_FROM;
  
  // If EMAIL_FROM is set, use it
  if (emailFrom) {
    return emailFrom;
  }
  
  // Default to verified domain
  return "PakAutoSe <noreply@kamranikramofficial.me>";
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  if (!resend) {
    console.warn("Email service not configured. RESEND_API_KEY is missing.");
    console.warn("To enable emails, add RESEND_API_KEY to your .env.local file");
    return { success: false, error: "Email service not configured" };
  }
  
  const fromEmail = getFromEmail();
  console.log(`Sending email to: ${Array.isArray(to) ? to.join(", ") : to}`);
  console.log(`From: ${fromEmail}`);
  console.log(`Subject: ${subject}`);
  
  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });
    
    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to send email:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    
    // Check for common Resend errors
    if (error?.message?.includes("domain") || error?.statusCode === 403) {
      console.error("HINT: You need to verify a domain in Resend or use onboarding@resend.dev for testing");
    }
    
    return { success: false, error: error?.message || "Failed to send email" };
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
          
          ${order.paymentMethod === 'BANK_TRANSFER' ? `
          <h3 style="margin-top: 30px; color: #1e40af;">Payment Details</h3>
          <div style="background: #dbeafe; padding: 20px; border-radius: 5px; border-left: 4px solid #1e40af;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Please transfer the amount to:</p>
            ${order.bankName ? `<p style="margin: 5px 0;"><strong>Bank:</strong> ${order.bankName}</p>` : ''}
            ${order.bankAccountTitle ? `<p style="margin: 5px 0;"><strong>Account Title:</strong> ${order.bankAccountTitle}</p>` : ''}
            ${order.bankAccountNumber ? `<p style="margin: 5px 0;"><strong>Account Number:</strong> ${order.bankAccountNumber}</p>` : ''}
            ${order.bankIBAN ? `<p style="margin: 5px 0;"><strong>IBAN:</strong> ${order.bankIBAN}</p>` : ''}
            <p style="margin: 15px 0 0 0; padding-top: 10px; border-top: 1px solid #93c5fd; font-size: 0.9em;">
              <strong>Important:</strong> After making the payment, please send the payment proof/receipt to <a href="mailto:${order.siteEmail}" style="color: #1e40af;">${order.siteEmail}</a>
            </p>
          </div>
          ` : ''}
          
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

// ==================== ADDITIONAL EMAIL TEMPLATES ====================

// Payment Confirmation Email
export function getPaymentConfirmationEmailTemplate(order: any) {
  return {
    subject: `Payment Received - Order #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Payment Confirmed! ✓</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Hi ${order.shippingName},</h2>
          <p>We have received your payment for order <strong>#${order.orderNumber}</strong>.</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Amount Paid:</strong> Rs. ${order.total?.toLocaleString() || '0'}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod || 'N/A'}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-PK")}</p>
          </div>
          
          <p>Your order is now being processed and will be shipped soon.</p>
          
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

// Shipping/Tracking Update Email
export function getShippingUpdateEmailTemplate(order: any) {
  return {
    subject: `Your Order Has Been Shipped - #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">📦 Your Order is On Its Way!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Hi ${order.shippingName},</h2>
          <p>Great news! Your order has been shipped and is on its way to you.</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <p style="margin: 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            ${order.carrier ? `<p style="margin: 10px 0 0 0;"><strong>Carrier:</strong> ${order.carrier}</p>` : ''}
            ${order.trackingNumber ? `<p style="margin: 10px 0 0 0;"><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
            ${order.estimatedDelivery ? `<p style="margin: 10px 0 0 0;"><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString("en-PK")}</p>` : ''}
          </div>
          
          <h3>Shipping Address</h3>
          <p>
            ${order.shippingName}<br>
            ${order.shippingAddressLine}<br>
            ${order.shippingCity}, ${order.shippingState} ${order.shippingPostalCode}<br>
            Phone: ${order.shippingPhone}
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${order.id}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Your Package</a>
          </div>
          
          <p>Best regards,<br>The PakAutoSe Team</p>
        </div>
      </body>
      </html>
    `,
  };
}

// Order Cancellation Email
export function getOrderCancellationEmailTemplate(order: any, reason?: string) {
  return {
    subject: `Order Cancelled - #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Order Cancelled</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Hi ${order.shippingName},</h2>
          <p>Your order <strong>#${order.orderNumber}</strong> has been cancelled.</p>
          
          ${reason ? `
          <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
          </div>
          ` : ''}
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Order Total:</strong> Rs. ${order.total?.toLocaleString() || '0'}</p>
          </div>
          
          <p>If you paid for this order, a refund will be processed within 5-7 business days.</p>
          
          <p>If you have any questions or didn't request this cancellation, please contact us immediately.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact" style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Contact Support</a>
          </div>
          
          <p>Best regards,<br>The PakAutoSe Team</p>
        </div>
      </body>
      </html>
    `,
  };
}

// Refund Confirmation Email
export function getRefundConfirmationEmailTemplate(order: any, refundAmount: number) {
  return {
    subject: `Refund Processed - Order #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Refund Processed ✓</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Hi ${order.shippingName},</h2>
          <p>Good news! Your refund has been processed successfully.</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #059669;">
            <p style="margin: 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 10px 0 0 0;"><strong>Refund Amount:</strong> Rs. ${refundAmount.toLocaleString()}</p>
            <p style="margin: 10px 0 0 0;"><strong>Date:</strong> ${new Date().toLocaleDateString("en-PK")}</p>
          </div>
          
          <p>The refund will be credited to your original payment method within 5-7 business days.</p>
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact" style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Contact Support</a>
          </div>
          
          <p>Best regards,<br>The PakAutoSe Team</p>
        </div>
      </body>
      </html>
    `,
  };
}

// Delivery Confirmation Email
export function getDeliveryConfirmationEmailTemplate(order: any) {
  return {
    subject: `Order Delivered - #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🎉 Order Delivered!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Hi ${order.shippingName},</h2>
          <p>Great news! Your order <strong>#${order.orderNumber}</strong> has been delivered.</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Delivered On:</strong> ${new Date().toLocaleDateString("en-PK")}</p>
            <p><strong>Delivered To:</strong> ${order.shippingAddressLine}, ${order.shippingCity}</p>
          </div>
          
          <p>We hope you love your purchase! If you have any questions or concerns, please don't hesitate to reach out.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/generators" style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">Shop More</a>
          </div>
          
          <p>Thank you for choosing PakAutoSe!</p>
          <p>Best regards,<br>The PakAutoSe Team</p>
        </div>
      </body>
      </html>
    `,
  };
}

// Contact Form Confirmation Email
export function getContactFormConfirmationEmailTemplate(contact: any) {
  return {
    subject: `We've Received Your Message - PakAutoSe`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Message Received!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Hi ${contact.name},</h2>
          <p>Thank you for contacting PakAutoSe! We have received your message and will get back to you as soon as possible.</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Your Message:</strong></p>
            <p style="color: #666;">${contact.message}</p>
          </div>
          
          <p>We typically respond within 24-48 hours. For urgent matters, please call us directly.</p>
          
          <p>Best regards,<br>The PakAutoSe Team</p>
        </div>
      </body>
      </html>
    `,
  };
}

// Admin Contact Form Notification
export function getAdminContactFormNotificationTemplate(contact: any) {
  return {
    subject: `📬 New Contact Form Submission - ${contact.subject || 'General Inquiry'}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1e40af; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">New Contact Form Message</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Contact Details</h2>
          <p><strong>Name:</strong> ${contact.name}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          <p><strong>Phone:</strong> ${contact.phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${contact.subject || 'General Inquiry'}</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <p style="color: #666;">${contact.message}</p>
          </div>
          
          <p><strong>Submitted:</strong> ${new Date().toLocaleString("en-PK")}</p>
        </div>
      </body>
      </html>
    `,
  };
}

// Out for Delivery Email
export function getOutForDeliveryEmailTemplate(order: any) {
  return {
    subject: `🚚 Out for Delivery - Order #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🚚 Out for Delivery!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Hi ${order.shippingName},</h2>
          <p>Your order <strong>#${order.orderNumber}</strong> is out for delivery today!</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;"><strong>Delivery Address:</strong></p>
            <p style="margin: 10px 0 0 0;">${order.shippingAddressLine}<br>${order.shippingCity}, ${order.shippingState}</p>
          </div>
          
          <p>Please ensure someone is available to receive the package. The delivery person may call you before arrival.</p>
          
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

// Helper functions to send specific emails
export async function sendPaymentConfirmationEmail(order: any) {
  const template = getPaymentConfirmationEmailTemplate(order);
  return sendEmail({
    to: order.shippingEmail || order.user?.email,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendShippingUpdateEmail(order: any) {
  const template = getShippingUpdateEmailTemplate(order);
  return sendEmail({
    to: order.shippingEmail || order.user?.email,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendOrderCancellationEmail(order: any, reason?: string) {
  const template = getOrderCancellationEmailTemplate(order, reason);
  return sendEmail({
    to: order.shippingEmail || order.user?.email,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendRefundConfirmationEmail(order: any, refundAmount: number) {
  const template = getRefundConfirmationEmailTemplate(order, refundAmount);
  return sendEmail({
    to: order.shippingEmail || order.user?.email,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendDeliveryConfirmationEmail(order: any) {
  const template = getDeliveryConfirmationEmailTemplate(order);
  return sendEmail({
    to: order.shippingEmail || order.user?.email,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendOutForDeliveryEmail(order: any) {
  const template = getOutForDeliveryEmailTemplate(order);
  return sendEmail({
    to: order.shippingEmail || order.user?.email,
    subject: template.subject,
    html: template.html,
  });
}

// Helper to delay for rate limiting (Resend allows max 2 requests/second)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function sendContactFormEmails(contact: any, adminEmails: string[]) {
  // Send confirmation to user
  const userTemplate = getContactFormConfirmationEmailTemplate(contact);
  await sendEmail({
    to: contact.email,
    subject: userTemplate.subject,
    html: userTemplate.html,
  });

  // Add delay to avoid rate limiting
  await delay(600);

  // Send notification to admins (batch to avoid rate limit)
  const adminTemplate = getAdminContactFormNotificationTemplate(contact);
  for (let i = 0; i < adminEmails.length; i++) {
    if (i > 0) await delay(600); // Delay between each email
    try {
      await sendEmail({
        to: adminEmails[i],
        subject: adminTemplate.subject,
        html: adminTemplate.html,
      });
    } catch (error) {
      console.error(`Failed to send email to ${adminEmails[i]}:`, error);
    }
  }
}

// ==================== SERVICE INTERNAL NOTES EMAIL TEMPLATES ====================

// Internal Notes Notification - Admin to Staff
export function getInternalNotesNotificationTemplate(service: any, addedBy: string, notes: string, recipientRole: string) {
  const isForAdmin = recipientRole === "ADMIN";
  const fromRole = isForAdmin ? "Staff" : "Admin";
  
  return {
    subject: `📝 New Internal Note - Service #${service.requestNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">New Internal Note</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>A new internal note has been added by <strong>${addedBy}</strong> (${fromRole})</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #7c3aed;">
            <p><strong>Service Request:</strong> #${service.requestNumber}</p>
            <p><strong>Customer:</strong> ${service.contactName}</p>
            <p><strong>Service Type:</strong> ${service.serviceType}</p>
            <p><strong>Status:</strong> ${service.status}</p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Internal Note:</strong></p>
            <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${notes}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/${isForAdmin ? 'admin' : 'staff'}/services/${service.id}" style="background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Service Request</a>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

// Priority Change Notification
export function getPriorityChangeNotificationTemplate(service: any, oldPriority: string, newPriority: string, changedBy: string) {
  const priorityColors: Record<string, string> = {
    LOW: "#22c55e",
    NORMAL: "#3b82f6",
    HIGH: "#f97316",
    URGENT: "#ef4444",
  };
  
  return {
    subject: `⚡ Priority Changed - Service #${service.requestNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Priority Changed</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>The priority for service request <strong>#${service.requestNumber}</strong> has been changed by <strong>${changedBy}</strong></p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <span style="background: ${priorityColors[oldPriority] || '#gray'}; color: white; padding: 5px 15px; border-radius: 20px; margin-right: 10px;">${oldPriority}</span>
            <span style="font-size: 20px;">→</span>
            <span style="background: ${priorityColors[newPriority] || '#gray'}; color: white; padding: 5px 15px; border-radius: 20px; margin-left: 10px;">${newPriority}</span>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Customer:</strong> ${service.contactName}</p>
            <p><strong>Service Type:</strong> ${service.serviceType}</p>
            <p><strong>Problem:</strong> ${service.problemTitle}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/services/${service.id}" style="background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Service Request</a>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

// New Service Request Notification for Staff
export function getStaffNewServiceRequestNotificationTemplate(request: any) {
  const priorityColors: Record<string, string> = {
    LOW: "#22c55e",
    NORMAL: "#3b82f6",
    HIGH: "#f97316",
    URGENT: "#ef4444",
  };
  
  return {
    subject: `🔧 New Service Request - ${request.requestNumber} (${request.priority || 'NORMAL'})`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">New Service Request</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="background: ${priorityColors[request.priority] || '#3b82f6'}; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold;">${request.priority || 'NORMAL'} PRIORITY</span>
          </div>
          
          <h2>Service Request Details</h2>
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Request Number:</strong> ${request.requestNumber}</p>
            <p><strong>Customer:</strong> ${request.contactName}</p>
            <p><strong>Phone:</strong> ${request.contactPhone}</p>
            <p><strong>Email:</strong> ${request.contactEmail}</p>
            <p><strong>Service Type:</strong> ${request.serviceType}</p>
            <p><strong>Problem:</strong> ${request.problemTitle}</p>
            <p><strong>Location:</strong> ${request.serviceCity}, ${request.serviceState}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/staff/services/${request.id}" style="background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Request</a>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

// Helper functions for service notifications
export async function sendInternalNotesEmail(service: any, addedBy: string, notes: string, recipientEmails: string[], recipientRole: string) {
  const template = getInternalNotesNotificationTemplate(service, addedBy, notes, recipientRole);
  for (let i = 0; i < recipientEmails.length; i++) {
    if (i > 0) await delay(600); // Rate limit: 2 requests/second
    await sendEmail({
      to: recipientEmails[i],
      subject: template.subject,
      html: template.html,
    });
  }
}

export async function sendPriorityChangeEmail(service: any, oldPriority: string, newPriority: string, changedBy: string, recipientEmails: string[]) {
  const template = getPriorityChangeNotificationTemplate(service, oldPriority, newPriority, changedBy);
  for (let i = 0; i < recipientEmails.length; i++) {
    if (i > 0) await delay(600); // Rate limit: 2 requests/second
    await sendEmail({
      to: recipientEmails[i],
      subject: template.subject,
      html: template.html,
    });
  }
}

export async function sendStaffNewServiceRequestEmail(request: any, staffEmails: string[]) {
  const template = getStaffNewServiceRequestNotificationTemplate(request);
  for (let i = 0; i < staffEmails.length; i++) {
    if (i > 0) await delay(600); // Rate limit: 2 requests/second
    await sendEmail({
      to: staffEmails[i],
      subject: template.subject,
      html: template.html,
    });
  }
}

// ==================== ORDER INTERNAL NOTES EMAIL ====================

export function getOrderInternalNotesTemplate(order: any, addedBy: string, notes: string, recipientRole: string) {
  const isForAdmin = recipientRole === "ADMIN";
  const fromRole = isForAdmin ? "Staff" : "Admin";
  
  return {
    subject: `📦 Order Internal Note - #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">New Order Note</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>A new internal note has been added by <strong>${addedBy}</strong> (${fromRole})</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <p><strong>Order Number:</strong> #${order.orderNumber}</p>
            <p><strong>Customer:</strong> ${order.shippingName}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Total:</strong> PKR ${order.total?.toLocaleString()}</p>
          </div>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Internal Note:</strong></p>
            <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${notes}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/${isForAdmin ? 'admin' : 'staff'}/orders/${order.id}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order</a>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export async function sendOrderInternalNotesEmail(order: any, addedBy: string, notes: string, recipientEmails: string[], recipientRole: string) {
  const template = getOrderInternalNotesTemplate(order, addedBy, notes, recipientRole);
  for (let i = 0; i < recipientEmails.length; i++) {
    if (i > 0) await delay(600); // Rate limit: 2 requests/second
    await sendEmail({
      to: recipientEmails[i],
      subject: template.subject,
      html: template.html,
    });
  }
}

// ==================== CONTACT INQUIRY INTERNAL NOTES EMAIL ====================

export function getContactInternalNotesTemplate(inquiry: any, addedBy: string, notes: string, recipientRole: string) {
  const isForAdmin = recipientRole === "ADMIN";
  const fromRole = isForAdmin ? "Staff" : "Admin";
  
  return {
    subject: `📩 Contact Inquiry Note - ${inquiry.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Contact Inquiry Note</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>A new internal note has been added by <strong>${addedBy}</strong> (${fromRole})</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #059669;">
            <p><strong>From:</strong> ${inquiry.name}</p>
            <p><strong>Email:</strong> ${inquiry.email}</p>
            <p><strong>Subject:</strong> ${inquiry.subject}</p>
            <p><strong>Status:</strong> ${inquiry.status || 'NEW'}</p>
          </div>
          
          <div style="background: #d1fae5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Internal Note:</strong></p>
            <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${notes}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/inquiries/${inquiry.id}" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Inquiry</a>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export async function sendContactInternalNotesEmail(inquiry: any, addedBy: string, notes: string, recipientEmails: string[], recipientRole: string) {
  const template = getContactInternalNotesTemplate(inquiry, addedBy, notes, recipientRole);
  for (let i = 0; i < recipientEmails.length; i++) {
    if (i > 0) await delay(600); // Rate limit: 2 requests/second
    await sendEmail({
      to: recipientEmails[i],
      subject: template.subject,
      html: template.html,
    });
  }
}
