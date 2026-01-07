"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useSettings } from "@/contexts/settings-context";
import { 
  Save, 
  RefreshCw, 
  Settings, 
  Truck, 
  CreditCard, 
  Mail, 
  Package, 
  ShoppingCart,
  Search as SearchIcon,
  Share2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

interface SettingsData {
  [group: string]: {
    [key: string]: string;
  };
}

// Settings configuration with labels and descriptions
const settingsConfig: Record<string, {
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: {
    key: string;
    label: string;
    description?: string;
    type: "text" | "email" | "tel" | "number" | "select" | "toggle" | "textarea";
    options?: { value: string; label: string }[];
    placeholder?: string;
  }[];
}> = {
  general: {
    title: "General Settings",
    description: "Basic website configuration and business information",
    icon: <Settings className="h-5 w-5" />,
    fields: [
      { key: "siteName", label: "Site Name", type: "text", placeholder: "Your Store Name" },
      { key: "siteLogo", label: "Site Logo URL", type: "text", placeholder: "https://example.com/logo.png", description: "URL of your site logo image (upload via media section)" },
      { key: "siteDescription", label: "Site Description", type: "textarea", placeholder: "Brief description of your business" },
      { key: "siteEmail", label: "Contact Email", type: "email", placeholder: "info@example.com" },
      { key: "sitePhone", label: "Contact Phone", type: "tel", placeholder: "+92 300 1234567" },
      { key: "siteAddress", label: "Business Address", type: "textarea", placeholder: "Full business address" },
      { key: "currency", label: "Currency", type: "select", options: [
        { value: "PKR", label: "Pakistani Rupee (PKR)" },
        { value: "USD", label: "US Dollar (USD)" },
        { value: "EUR", label: "Euro (EUR)" },
      ]},
      { key: "timezone", label: "Timezone", type: "select", options: [
        { value: "Asia/Karachi", label: "Asia/Karachi (PKT)" },
        { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
        { value: "UTC", label: "UTC" },
      ]},
      { key: "maintenanceMode", label: "Maintenance Mode", type: "toggle", description: "Enable to show maintenance page to visitors" },
    ],
  },
  shipping: {
    title: "Shipping Settings",
    description: "Configure shipping options, costs, and delivery settings",
    icon: <Truck className="h-5 w-5" />,
    fields: [
      { key: "freeShippingThreshold", label: "Free Shipping Threshold", type: "number", description: "Minimum order amount for free shipping (0 to disable)", placeholder: "50000" },
      { key: "defaultShippingCost", label: "Default Shipping Cost", type: "number", placeholder: "500" },
      { key: "expressShippingCost", label: "Express Shipping Cost", type: "number", placeholder: "1500" },
      { key: "estimatedDeliveryDays", label: "Estimated Delivery Days", type: "text", placeholder: "3-5" },
      { key: "enableCOD", label: "Enable Cash on Delivery", type: "toggle" },
      { key: "codFee", label: "COD Fee", type: "number", description: "Additional fee for cash on delivery orders", placeholder: "100" },
    ],
  },
  payment: {
    title: "Payment Settings",
    description: "Manage payment methods and banking information",
    icon: <CreditCard className="h-5 w-5" />,
    fields: [
      { key: "enableBankTransfer", label: "Enable Bank Transfer", type: "toggle" },
      { key: "bankName", label: "Bank Name", type: "text", placeholder: "Bank Name" },
      { key: "bankAccountTitle", label: "Account Title", type: "text", placeholder: "Account holder name" },
      { key: "bankAccountNumber", label: "Account Number", type: "text", placeholder: "Bank account number" },
      { key: "bankIBAN", label: "IBAN", type: "text", placeholder: "PK00XXXX0000000000000000" },
      { key: "enableEasypaisa", label: "Enable Easypaisa", type: "toggle" },
      { key: "easypaisaNumber", label: "Easypaisa Number", type: "tel", placeholder: "03XX XXXXXXX" },
      { key: "enableJazzCash", label: "Enable JazzCash", type: "toggle" },
      { key: "jazzcashNumber", label: "JazzCash Number", type: "tel", placeholder: "03XX XXXXXXX" },
    ],
  },
  email: {
    title: "Email Settings",
    description: "Configure email notifications and templates",
    icon: <Mail className="h-5 w-5" />,
    fields: [
      { key: "enableEmailNotifications", label: "Enable Email Notifications", type: "toggle" },
      { key: "orderConfirmationEmail", label: "Order Confirmation Emails", type: "toggle", description: "Send email when order is placed" },
      { key: "orderStatusUpdateEmail", label: "Order Status Update Emails", type: "toggle", description: "Send email when order status changes" },
      { key: "welcomeEmail", label: "Welcome Emails", type: "toggle", description: "Send welcome email to new users" },
      { key: "newsletterEmail", label: "Newsletter Emails", type: "toggle", description: "Enable newsletter subscription emails" },
      { key: "adminOrderNotificationEmail", label: "Admin Order Notification Email", type: "email", description: "Email to receive new order notifications", placeholder: "admin@example.com" },
    ],
  },
  inventory: {
    title: "Inventory Settings",
    description: "Manage stock levels and inventory behavior",
    icon: <Package className="h-5 w-5" />,
    fields: [
      { key: "lowStockThreshold", label: "Low Stock Threshold", type: "number", description: "Alert when stock falls below this level", placeholder: "5" },
      { key: "outOfStockBehavior", label: "Out of Stock Behavior", type: "select", options: [
        { value: "hide", label: "Hide out of stock products" },
        { value: "show", label: "Show but disable purchase" },
        { value: "notify", label: "Show with notify me option" },
      ]},
      { key: "enableBackorders", label: "Enable Backorders", type: "toggle", description: "Allow orders for out of stock items" },
    ],
  },
  orders: {
    title: "Order Settings",
    description: "Configure order processing and policies",
    icon: <ShoppingCart className="h-5 w-5" />,
    fields: [
      { key: "orderPrefix", label: "Order ID Prefix", type: "text", placeholder: "PAK" },
      { key: "minOrderAmount", label: "Minimum Order Amount", type: "number", placeholder: "1000" },
      { key: "maxOrderAmount", label: "Maximum Order Amount", type: "number", placeholder: "10000000" },
      { key: "autoConfirmOrders", label: "Auto Confirm Orders", type: "toggle", description: "Automatically confirm orders after payment" },
      { key: "orderCancellationTime", label: "Order Cancellation Window (hours)", type: "number", description: "Hours within which user can cancel order", placeholder: "24" },
    ],
  },
  seo: {
    title: "SEO Settings",
    description: "Search engine optimization and analytics",
    icon: <SearchIcon className="h-5 w-5" />,
    fields: [
      { key: "metaTitle", label: "Default Meta Title", type: "text", placeholder: "Your Site - Tagline" },
      { key: "metaDescription", label: "Default Meta Description", type: "textarea", placeholder: "Site description for search engines" },
      { key: "googleAnalyticsId", label: "Google Analytics ID", type: "text", placeholder: "G-XXXXXXXXXX" },
      { key: "facebookPixelId", label: "Facebook Pixel ID", type: "text", placeholder: "XXXXXXXXXXXXXXXX" },
    ],
  },
  social: {
    title: "Social Media",
    description: "Social media links and contact information",
    icon: <Share2 className="h-5 w-5" />,
    fields: [
      { key: "facebookUrl", label: "Facebook URL", type: "text", placeholder: "https://facebook.com/yourpage" },
      { key: "instagramUrl", label: "Instagram URL", type: "text", placeholder: "https://instagram.com/yourpage" },
      { key: "twitterUrl", label: "Twitter/X URL", type: "text", placeholder: "https://twitter.com/yourpage" },
      { key: "youtubeUrl", label: "YouTube URL", type: "text", placeholder: "https://youtube.com/yourchannel" },
      { key: "whatsappNumber", label: "WhatsApp Number", type: "tel", placeholder: "+92 300 1234567" },
    ],
  },
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<SettingsData>({});

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      setSettings(data.settings || {});
      setOriginalSettings(data.settings || {});
      setHasChanges(false);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (group: string, key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleToggle = (group: string, key: string) => {
    const currentValue = settings[group]?.[key];
    const newValue = currentValue === "true" ? "false" : "true";
    handleChange(group, key, newValue);
  };

  const handleSave = async (group?: string) => {
    setSaving(true);
    try {
      // Prepare settings to save
      const settingsToSave: { key: string; value: string; group: string }[] = [];
      
      const groupsToSave = group ? [group] : Object.keys(settings);
      
      for (const g of groupsToSave) {
        if (settings[g]) {
          for (const [key, value] of Object.entries(settings[g])) {
            settingsToSave.push({ key, value, group: g });
          }
        }
      }

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      // Trigger global settings refresh so changes reflect across the site
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('settings-updated'));
      }

      toast({
        title: "Success",
        description: group ? `${settingsConfig[group]?.title || group} saved successfully` : "All settings saved successfully",
      });
      
      setOriginalSettings(settings);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
    setHasChanges(false);
    toast({
      title: "Reset",
      description: "Changes have been discarded",
    });
  };

  const renderField = (
    group: string,
    field: typeof settingsConfig.general.fields[0]
  ) => {
    const value = settings[group]?.[field.key] || "";

    switch (field.type) {
      case "toggle":
        return (
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">{field.label}</Label>
              {field.description && (
                <p className="text-sm text-muted-foreground">{field.description}</p>
              )}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={value === "true"}
              onClick={() => handleToggle(group, field.key)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                value === "true" ? "bg-primary" : "bg-input"
              }`}
            >
              <span
                className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                  value === "true" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        );

      case "select":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            <Select
              value={value}
              onValueChange={(val) => handleChange(group, field.key, val)}
            >
              <SelectTrigger id={field.key}>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "textarea":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            <textarea
              id={field.key}
              value={value}
              onChange={(e) => handleChange(group, field.key, e.target.value)}
              placeholder={field.placeholder}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            <Input
              id={field.key}
              type={field.type}
              value={value}
              onChange={(e) => handleChange(group, field.key, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your store configuration and preferences
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset} disabled={saving}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Discard Changes
            </Button>
          )}
          <Button onClick={() => handleSave()} disabled={saving || !hasChanges}>
            {saving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status indicator */}
      {hasChanges && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-yellow-800">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">You have unsaved changes</span>
        </div>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
          {Object.entries(settingsConfig).map(([key, config]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="flex items-center gap-2 rounded-lg border bg-background px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {config.icon}
              <span className="hidden sm:inline">{config.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(settingsConfig).map(([key, config]) => (
          <TabsContent key={key} value={key} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {config.icon}
                  <div>
                    <CardTitle>{config.title}</CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {config.fields.map((field) => (
                    <div
                      key={field.key}
                      className={field.type === "textarea" || field.type === "toggle" ? "sm:col-span-2" : ""}
                    >
                      {renderField(key, field)}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end border-t pt-4">
                  <Button
                    onClick={() => handleSave(key)}
                    disabled={saving}
                    size="sm"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Save {config.title}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Environment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {process.env.NODE_ENV === "production" ? "Production" : "Development"}
            </p>
            <p className="text-xs text-muted-foreground">Current running mode</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{settings.general?.currency || "PKR"}</p>
            <p className="text-xs text-muted-foreground">Store currency</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${settings.general?.maintenanceMode === "true" ? "text-red-600" : "text-green-600"}`}>
              {settings.general?.maintenanceMode === "true" ? "Enabled" : "Disabled"}
            </p>
            <p className="text-xs text-muted-foreground">Maintenance mode status</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
