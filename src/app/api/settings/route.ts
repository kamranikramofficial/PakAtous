import { NextResponse } from "next/server";
import dbConnect from "@/lib/prisma";
import { Setting } from "@/models/Setting";

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Never cache - always fetch fresh

// Default settings (fallback when database is empty)
const defaultSettings = {
  general: {
    siteName: "PakAutoSe",
    siteDescription: "Your trusted source for generators and parts in Pakistan",
    siteEmail: "info@pakautose.com",
    sitePhone: "+92 300 1234567",
    siteAddress: "Lahore, Pakistan",
    businessHours: "Mon - Fri: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed",
    currency: "PKR",
    timezone: "Asia/Karachi",
    maintenanceMode: "false",
    siteLogo: "",
  },
  shipping: {
    freeShippingThreshold: "50000",
    defaultShippingCost: "500",
    expressShippingCost: "1500",
    estimatedDeliveryDays: "3-5",
    enableCOD: "true",
    codFee: "100",
  },
  payment: {
    enableBankTransfer: "true",
    bankName: "",
    bankAccountTitle: "",
    bankAccountNumber: "",
    bankIBAN: "",
    enableEasypaisa: "true",
    easypaisaNumber: "",
    enableJazzCash: "true",
    jazzcashNumber: "",
  },
  email: {
    enableEmailNotifications: "true",
    orderConfirmationEmail: "true",
    orderStatusUpdateEmail: "true",
    welcomeEmail: "true",
    newsletterEmail: "true",
    adminOrderNotificationEmail: "",
  },
  inventory: {
    lowStockThreshold: "5",
    outOfStockBehavior: "hide",
    enableBackorders: "false",
  },
  orders: {
    orderPrefix: "PAK",
    minOrderAmount: "1000",
    maxOrderAmount: "10000000",
    autoConfirmOrders: "false",
    orderCancellationTime: "24",
  },
  seo: {
    metaTitle: "PakAutoSe - Generators & Parts Pakistan",
    metaDescription: "Buy quality generators and spare parts online in Pakistan. Best prices, fast delivery, genuine products.",
    googleAnalyticsId: "",
    facebookPixelId: "",
  },
  social: {
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    whatsappNumber: "",
  },
};

// Public GET endpoint - no auth required
export async function GET() {
  try {
    await dbConnect();

    // Fetch all settings from database
    const dbSettings = await Setting.find({}).lean();

    // Merge database settings with defaults
    const settings = JSON.parse(JSON.stringify(defaultSettings));

    // Override defaults with database values
    for (const setting of dbSettings) {
      const settingData = setting as any;
      const group = settingData.group;
      const key = settingData.key;
      
      // Check if this group exists in our settings structure
      if (group && key && settings[group]) {
        settings[group][key] = settingData.value;
      }
    }

    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    // Return defaults on error
    return NextResponse.json(defaultSettings);
  }
}
