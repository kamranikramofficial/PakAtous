import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Setting } from "@/models/Setting";
import { AuditLog } from "@/models/AuditLog";
import { z } from "zod";

export const dynamic = 'force-dynamic';

// Default settings structure
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
    outOfStockBehavior: "hide", // hide, show, notify
    enableBackorders: "false",
  },
  orders: {
    orderPrefix: "PAK",
    minOrderAmount: "1000",
    maxOrderAmount: "10000000",
    autoConfirmOrders: "false",
    orderCancellationTime: "24", // hours
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

const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  type: z.string().optional().default("string"),
  group: z.string().optional().default("general"),
});

const bulkSettingsSchema = z.object({
  settings: z.array(settingSchema),
});

// Get all settings (admin)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const group = searchParams.get("group");

    const query: any = {};
    if (group) {
      query.group = group;
    }

    const settings = await Setting.find(query).sort({ group: 1, key: 1 }).lean();

    // Convert settings array to grouped object
    const settingsMap: Record<string, Record<string, string>> = {};
    settings.forEach((setting: any) => {
      if (!settingsMap[setting.group]) {
        settingsMap[setting.group] = {};
      }
      settingsMap[setting.group][setting.key] = setting.value;
    });

    // Merge with defaults (defaults provide structure, DB values override)
    const mergedSettings: Record<string, Record<string, string>> = {};
    for (const [groupName, groupDefaults] of Object.entries(defaultSettings)) {
      mergedSettings[groupName] = { ...groupDefaults };
      if (settingsMap[groupName]) {
        mergedSettings[groupName] = { ...mergedSettings[groupName], ...settingsMap[groupName] };
      }
    }

    // Include any custom settings from DB not in defaults
    for (const [groupName, groupSettings] of Object.entries(settingsMap)) {
      if (!mergedSettings[groupName]) {
        mergedSettings[groupName] = groupSettings;
      }
    }

    return NextResponse.json({
      settings: mergedSettings,
      groups: Object.keys(mergedSettings),
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// Update settings (admin)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const validated = bulkSettingsSchema.parse(body);

    const results = [];
    const oldValues: Record<string, string> = {};
    const newValues: Record<string, string> = {};

    for (const setting of validated.settings) {
      // Get old value for audit log
      const existingSetting = await Setting.findOne({ key: setting.key });
      if (existingSetting) {
        oldValues[setting.key] = existingSetting.value;
      }
      newValues[setting.key] = setting.value;

      // Upsert the setting
      const result = await Setting.findOneAndUpdate(
        { key: setting.key },
        {
          key: setting.key,
          value: setting.value,
          type: setting.type || "string",
          group: setting.group || "general",
        },
        { upsert: true, new: true }
      );
      results.push(result);
    }

    // Create audit log
    await AuditLog.create({
      userId: session.user.id,
      action: "UPDATE_SETTINGS",
      entity: "Setting",
      oldValues: JSON.stringify(oldValues),
      newValues: JSON.stringify(newValues),
    });

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      count: results.length,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

// Delete a setting (admin)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const existingSetting = await Setting.findOne({ key });
    if (!existingSetting) {
      return NextResponse.json({ error: "Setting not found" }, { status: 404 });
    }

    await Setting.deleteOne({ key });

    // Create audit log
    await AuditLog.create({
      userId: session.user.id,
      action: "DELETE_SETTING",
      entity: "Setting",
      entityId: key,
      oldValues: JSON.stringify({ key, value: existingSetting.value }),
    });

    return NextResponse.json({
      success: true,
      message: "Setting deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting setting:", error);
    return NextResponse.json(
      { error: "Failed to delete setting" },
      { status: 500 }
    );
  }
}
