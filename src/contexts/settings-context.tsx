"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

// Settings types
export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  siteEmail: string;
  sitePhone: string;
  siteAddress: string;
  businessHours: string;
  currency: string;
  timezone: string;
  maintenanceMode: string;
  siteLogo: string;
}

export interface ShippingSettings {
  freeShippingThreshold: string;
  defaultShippingCost: string;
  expressShippingCost: string;
  estimatedDeliveryDays: string;
  enableCOD: string;
  codFee: string;
}

export interface PaymentSettings {
  enableBankTransfer: string;
  bankName: string;
  bankAccountTitle: string;
  bankAccountNumber: string;
  bankIBAN: string;
  enableEasypaisa: string;
  easypaisaNumber: string;
  enableJazzCash: string;
  jazzcashNumber: string;
}

export interface EmailSettings {
  enableEmailNotifications: string;
  orderConfirmationEmail: string;
  orderStatusUpdateEmail: string;
  welcomeEmail: string;
  newsletterEmail: string;
  adminOrderNotificationEmail: string;
}

export interface InventorySettings {
  lowStockThreshold: string;
  outOfStockBehavior: string;
  enableBackorders: string;
}

export interface OrderSettings {
  orderPrefix: string;
  minOrderAmount: string;
  maxOrderAmount: string;
  autoConfirmOrders: string;
  orderCancellationTime: string;
}

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
}

export interface SocialSettings {
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  whatsappNumber: string;
}

export interface SiteSettings {
  general: GeneralSettings;
  shipping: ShippingSettings;
  payment: PaymentSettings;
  email: EmailSettings;
  inventory: InventorySettings;
  orders: OrderSettings;
  seo: SEOSettings;
  social: SocialSettings;
}

// Default settings
const defaultSettings: SiteSettings = {
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

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  // Helper functions
  formatPrice: (amount: number) => string;
  getShippingCost: (subtotal: number) => number;
  isCODEnabled: () => boolean;
  isMaintenanceMode: () => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/settings?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setError(null);
      } else {
        throw new Error("Failed to fetch settings");
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    
    // Listen for settings updates from admin panel
    const handleSettingsUpdate = () => {
      fetchSettings();
    };
    
    window.addEventListener('settings-updated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate);
    };
  }, [fetchSettings]);

  // Helper function to format price
  const formatPrice = useCallback((amount: number): string => {
    const currency = settings.general.currency || "PKR";
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, [settings.general.currency]);

  // Helper function to calculate shipping cost
  const getShippingCost = useCallback((subtotal: number): number => {
    const freeThreshold = parseFloat(settings.shipping.freeShippingThreshold) || 50000;
    const defaultCost = parseFloat(settings.shipping.defaultShippingCost) || 500;
    
    if (subtotal >= freeThreshold) {
      return 0;
    }
    return defaultCost;
  }, [settings.shipping.freeShippingThreshold, settings.shipping.defaultShippingCost]);

  // Check if COD is enabled
  const isCODEnabled = useCallback((): boolean => {
    return settings.shipping.enableCOD === "true";
  }, [settings.shipping.enableCOD]);

  // Check if maintenance mode
  const isMaintenanceMode = useCallback((): boolean => {
    return settings.general.maintenanceMode === "true";
  }, [settings.general.maintenanceMode]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    settings,
    loading,
    error,
    refetch: fetchSettings,
    formatPrice,
    getShippingCost,
    isCODEnabled,
    isMaintenanceMode,
  }), [settings, loading, error, fetchSettings, formatPrice, getShippingCost, isCODEnabled, isMaintenanceMode]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

// Hook for just getting settings without context (for server components)
export async function getServerSettings(): Promise<SiteSettings> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/settings`, {
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching server settings:", error);
  }
  return defaultSettings;
}
