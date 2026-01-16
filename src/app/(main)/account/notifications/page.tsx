"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Bell, 
  Trash2, 
  Check, 
  Package, 
  Wrench, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  orderId?: string;
  serviceRequestId?: string;
}

const getViewLink = (notification: Notification) => {
  // Prefer explicit link when it points to user-side routes
  if (notification.link && !notification.link.startsWith("/admin")) {
    return notification.link;
  }

  // Fallbacks based on known IDs
  if (notification.orderId) {
    return `/account/orders/${notification.orderId}`;
  }

  if (notification.serviceRequestId) {
    return `/account/services/${notification.serviceRequestId}`;
  }

  // Type-based fallbacks to keep users on their section (never admin)
  if (notification.type?.startsWith("ORDER")) {
    return "/account/orders";
  }

  if (notification.type?.startsWith("SERVICE")) {
    return "/account/services";
  }

  return "/account";
};

const notificationTypeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  ORDER_PLACED: { icon: <Package className="h-4 w-4" />, color: "bg-blue-100 text-blue-700", label: "Order" },
  ORDER_CONFIRMED: { icon: <CheckCircle className="h-4 w-4" />, color: "bg-green-100 text-green-700", label: "Order" },
  ORDER_SHIPPED: { icon: <Package className="h-4 w-4" />, color: "bg-purple-100 text-purple-700", label: "Order" },
  ORDER_DELIVERED: { icon: <CheckCircle className="h-4 w-4" />, color: "bg-green-100 text-green-700", label: "Order" },
  ORDER_CANCELLED: { icon: <AlertCircle className="h-4 w-4" />, color: "bg-red-100 text-red-700", label: "Order" },
  PAYMENT_RECEIVED: { icon: <DollarSign className="h-4 w-4" />, color: "bg-green-100 text-green-700", label: "Payment" },
  PAYMENT_FAILED: { icon: <AlertCircle className="h-4 w-4" />, color: "bg-red-100 text-red-700", label: "Payment" },
  SERVICE_REQUEST_SUBMITTED: { icon: <Wrench className="h-4 w-4" />, color: "bg-blue-100 text-blue-700", label: "Service" },
  SERVICE_REQUEST_UPDATED: { icon: <Clock className="h-4 w-4" />, color: "bg-orange-100 text-orange-700", label: "Service" },
  SERVICE_COMPLETED: { icon: <CheckCircle className="h-4 w-4" />, color: "bg-green-100 text-green-700", label: "Service" },
  WELCOME: { icon: <Bell className="h-4 w-4" />, color: "bg-blue-100 text-blue-700", label: "System" },
  PROMOTIONAL: { icon: <Bell className="h-4 w-4" />, color: "bg-pink-100 text-pink-700", label: "Promo" },
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/user/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/user/notifications/${notificationId}/read`, {
        method: "PUT",
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    setDeleting(notificationId);
    try {
      const res = await fetch(`/api/user/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
        toast({
          title: "Success",
          description: "Notification deleted",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch("/api/user/notifications/mark-all-read", {
        method: "PUT",
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            isRead: true,
            readAt: new Date().toISOString(),
          }))
        );
        toast({
          title: "Success",
          description: "All notifications marked as read",
        });
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to delete all notifications?")) return;

    try {
      const res = await fetch("/api/user/notifications", {
        method: "DELETE",
      });

      if (res.ok) {
        setNotifications([]);
        toast({
          title: "Success",
          description: "All notifications deleted",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notifications",
        variant: "destructive",
      });
    }
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <Check className="mr-2 h-4 w-4" />
                Mark all as read
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      {notifications.length > 0 && (
        <div className="flex gap-2 border-b">
          <Button
            variant={filter === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("unread")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Unread ({unreadCount})
          </Button>
        </div>
      )}

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </h3>
            <p className="text-muted-foreground">
              {filter === "unread"
                ? "All caught up! You have no unread notifications"
                : "You'll see order updates, service requests, and other important notifications here"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const typeConfig =
              notificationTypeConfig[notification.type] ||
              notificationTypeConfig.WELCOME;
            const viewLink = getViewLink(notification);
            
            return (
              <Card
                key={notification._id}
                className={`cursor-pointer transition-colors ${
                  !notification.isRead
                    ? "bg-primary/5 border-primary/20"
                    : "hover:bg-muted/50"
                }`}
              >
                <CardContent className="py-4">
                  <div className="flex gap-4 items-start">
                    {/* Icon */}
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${typeConfig.color}`}
                    >
                      {typeConfig.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{notification.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {typeConfig.label}
                            </Badge>
                            {!notification.isRead && (
                              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.createdAt).toLocaleDateString(
                              "en-PK",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {viewLink && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              onClick={() => {
                                if (!notification.isRead) {
                                  handleMarkAsRead(notification._id);
                                }
                              }}
                            >
                              <Link href={viewLink}>View</Link>
                            </Button>
                          )}
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleMarkAsRead(notification._id)
                              }
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteNotification(notification._id)
                            }
                            disabled={deleting === notification._id}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
