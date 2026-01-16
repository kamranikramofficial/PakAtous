import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Order } from "@/models/Order";
import { Setting } from "@/models/Setting";

export const dynamic = 'force-dynamic';

// GET /api/orders/[id]/invoice - Generate invoice HTML for download
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user is admin/staff or owns the order
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "STAFF";
    
    const query: any = { _id: id };
    if (!isAdmin) {
      query.userId = session.user.id;
    }

    const order = await Order.findOne(query)
      .populate("items.generatorId", "name")
      .populate("items.partId", "name")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Fetch payment settings for bank details
    const paymentSettings = await Setting.find({ group: 'payment' }).lean();
    const generalSettings = await Setting.find({ group: 'general' }).lean();
    
    const bankDetails: any = {};
    paymentSettings.forEach((setting: any) => {
      bankDetails[setting.key] = setting.value;
    });
    
    let siteEmail = 'info@pakautose.com';
    generalSettings.forEach((setting: any) => {
      if (setting.key === 'siteEmail') {
        siteEmail = setting.value;
      }
    });

    // Generate invoice HTML
    const invoiceHtml = generateInvoiceHTML(order as any, bankDetails, siteEmail);

    return new NextResponse(invoiceHtml, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="Invoice-${(order as any).invoiceNumber || (order as any).orderNumber}.html"`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}

function generateInvoiceHTML(order: any, bankDetails: any = {}, siteEmail: string = 'info@pakautose.com'): string {
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const itemsHtml = order.items.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">PKR ${item.price.toLocaleString()}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">PKR ${item.total.toLocaleString()}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${order.invoiceNumber || order.orderNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f9fafb; }
    .invoice { max-width: 800px; margin: 20px auto; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; }
    .header h1 { font-size: 28px; margin-bottom: 5px; }
    .header p { opacity: 0.9; }
    .content { padding: 30px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .info-box h3 { color: #1e40af; font-size: 14px; text-transform: uppercase; margin-bottom: 10px; border-bottom: 2px solid #1e40af; padding-bottom: 5px; }
    .info-box p { margin: 5px 0; color: #4b5563; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
    th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: center; }
    th:last-child { text-align: right; }
    .totals { margin-top: 20px; border-top: 2px solid #e5e7eb; padding-top: 20px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .totals-row.total { font-size: 18px; font-weight: bold; color: #1e40af; border-top: 2px solid #1e40af; padding-top: 15px; margin-top: 10px; }
    .footer { background: #f3f4f6; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 14px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-paid { background: #d1fae5; color: #065f46; }
    .status-shipped { background: #dbeafe; color: #1e40af; }
    .status-delivered { background: #d1fae5; color: #065f46; }
    @media print {
      body { background: white; }
      .invoice { box-shadow: none; margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <h1>INVOICE</h1>
      <p>PakAutoSe Generators</p>
    </div>
    
    <div class="content">
      <div class="info-grid">
        <div class="info-box">
          <h3>Invoice Details</h3>
          <p><strong>Invoice #:</strong> ${order.invoiceNumber || order.orderNumber}</p>
          <p><strong>Order #:</strong> ${order.orderNumber}</p>
          <p><strong>Date:</strong> ${orderDate}</p>
          <p><strong>Status:</strong> <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></p>
          <p><strong>Payment:</strong> <span class="status-badge status-${order.paymentStatus.toLowerCase()}">${order.paymentStatus}</span></p>
        </div>
        <div class="info-box">
          <h3>Bill To</h3>
          <p><strong>${order.shippingName}</strong></p>
          <p>${order.shippingAddressLine}</p>
          <p>${order.shippingCity}, ${order.shippingState} ${order.shippingPostalCode}</p>
          <p>${order.shippingCountry}</p>
          <p>Phone: ${order.shippingPhone}</p>
          <p>Email: ${order.shippingEmail}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>PKR ${order.subtotal.toLocaleString()}</span>
        </div>
        <div class="totals-row">
          <span>Shipping</span>
          <span>${order.shippingCost > 0 ? `PKR ${order.shippingCost.toLocaleString()}` : 'Free'}</span>
        </div>
        ${order.tax > 0 ? `
        <div class="totals-row">
          <span>Tax</span>
          <span>PKR ${order.tax.toLocaleString()}</span>
        </div>
        ` : ''}
        ${order.couponDiscount > 0 ? `
        <div class="totals-row" style="color: #059669;">
          <span>Discount ${order.couponCode ? `(${order.couponCode})` : ''}</span>
          <span>- PKR ${order.couponDiscount.toLocaleString()}</span>
        </div>
        ` : ''}
        <div class="totals-row total">
          <span>Total Amount</span>
          <span>PKR ${order.total.toLocaleString()}</span>
        </div>
      </div>

      <div style="margin-top: 30px; padding: 20px; background: #f3f4f6; border-radius: 8px;">
        <h4 style="margin-bottom: 10px; color: #1e40af;">Payment Method</h4>
        <p>${order.paymentMethod.replace(/_/g, ' ')}</p>
        ${order.paymentMethod === 'BANK_TRANSFER' && (bankDetails.bankName || bankDetails.bankAccountNumber || bankDetails.bankIBAN) ? `
        <div style="margin-top: 20px; padding: 15px; background: #dbeafe; border-left: 4px solid #1e40af; border-radius: 4px;">
          <h4 style="margin-bottom: 10px; color: #1e40af;">Bank Transfer Details</h4>
          ${bankDetails.bankName ? `<p style="margin: 5px 0;"><strong>Bank:</strong> ${bankDetails.bankName}</p>` : ''}
          ${bankDetails.bankAccountTitle ? `<p style="margin: 5px 0;"><strong>Account Title:</strong> ${bankDetails.bankAccountTitle}</p>` : ''}
          ${bankDetails.bankAccountNumber ? `<p style="margin: 5px 0;"><strong>Account Number:</strong> ${bankDetails.bankAccountNumber}</p>` : ''}
          ${bankDetails.bankIBAN ? `<p style="margin: 5px 0;"><strong>IBAN:</strong> ${bankDetails.bankIBAN}</p>` : ''}
          <p style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #93c5fd; font-size: 14px; color: #1e40af;">
            <strong>Important:</strong> Please send payment proof to <a href="mailto:${siteEmail}" style="color: #1e40af; text-decoration: underline;">${siteEmail}</a>
          </p>
        </div>
        ` : ''}
        ${order.customerNotes ? `
        <h4 style="margin-top: 15px; margin-bottom: 10px; color: #1e40af;">Customer Notes</h4>
        <p style="color: #4b5563;">${order.customerNotes}</p>
        ` : ''}
      </div>
    </div>

    <div class="footer">
      <p><strong>PakAutoSe Generators</strong></p>
      <p>Thank you for your business!</p>
      <p style="margin-top: 10px;">For any queries, contact us at support@pakautose.com</p>
    </div>
  </div>

  <div class="no-print" style="text-align: center; padding: 20px;">
    <button onclick="window.print()" style="background: #1e40af; color: white; padding: 12px 30px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
      Print / Download PDF
    </button>
  </div>
</body>
</html>
  `;
}
