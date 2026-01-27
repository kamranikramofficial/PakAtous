"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  Trash2, 
  Check, 
  Package, 
  Wrench, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight
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
    return `/account/orders/${notification.orderId.toString()}`;
  }

  if (notification.serviceRequestId) {
    return `/account/services/${notification.serviceRequestId.toString()}`;
  }

  // Type-based fallbacks to keep users on their section (never admin)
  if (notification.type?.startsWith("ORDER")) {
    return "/account/orders";
  }

  if (notification.type?.startsWith("SERVICE")) {
    return "/account/services";
  }

  return null;
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
  const router = useRouter();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === notificationId
          ? { ...n, isRead: true, readAt: new Date().toISOString() }
          : n
      )
    );

    try {
      await fetch(`/api/user/notifications/${notificationId}`, {
        method: "PUT",
      });
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

  const handleNotificationClick = async (notification: Notification) => {
      if (!notification.isRead) {
          handleMarkAsRead(notification._id);
      }
      
      // Toggle expansion logic instead of navigation
      setExpandedId(prev => prev === notification._id ? null : notification._id);
  }

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 container max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with your orders and activities
          </p>
        </div>
        
        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <Check className="mr-2 h-4 w-4" />
                Mark all read
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 border-b">
          <button
            onClick={() => setFilter("all")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                filter === "all" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            All Notifications
            <Badge variant="secondary" className="ml-2">{notifications.length}</Badge>
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                filter === "unread" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Unread
            {unreadCount > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground">{unreadCount}</Badge>
            )}
          </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {filter === "unread" ? "No unread notifications" : "All caught up!"}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {filter === "unread"
                ? "You have no unread notifications at the moment."
                : "You don't have any notifications yet. Important updates about your orders and account will appear here."}
            </p>
            {notifications.length === 0 && (
                 <div className="mt-8 flex justify-center gap-4">
                     <Button asChild>
                         <Link href="/generators">Browse Store</Link>
                     </Button>
                 </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredNotifications.map((notification) => {
            const typeConfig =
              notificationTypeConfig[notification.type] ||
              notificationTypeConfig.WELCOME;
            const viewLink = getViewLink(notification);
            const isExpanded = expandedId === notification._id;
            
            return (
              <Card
                key={notification._id}
                className={`group transition-all hover:shadow-md border-l-4 ${
                  !notification.isRead
                    ? "border-l-primary bg-primary/5"
                    : "border-l-transparent hover:bg-muted/30"
                } ${isExpanded ? "ring-2 ring-primary ring-offset-2" : "cursor-pointer"}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex gap-4 items-start">
                    {/* Icon */}
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm flex-shrink-0 ${typeConfig.color}`}
                    >
                      {typeConfig.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 w-full">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-semibold text-sm ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                                {notification.title}
                            </h4>
                            {!notification.isRead && (
                                <span className="flex h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className={`text-sm text-muted-foreground leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                            {notification.message}
                          </p>
                          
                          {isExpanded && viewLink && (
                              <div className="pt-4">
                                  <Button size="sm" onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(viewLink);
                                  }}>
                                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                              </div>
                          )}

                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                            <Clock className="h-3 w-3" />
                            {/* Uses dynamic display for better UX */}
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.isRead && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    title="Mark as read"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkAsRead(notification._id);
                                    }}
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                title="Delete notification"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteNotification(notification._id);
                                }}
                                disabled={deleting === notification._id}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                      </div>
                    </div>
                    
                    {!isExpanded && viewLink && (
                        <div className="self-center pl-2 text-muted-foreground/30 group-hover:text-primary/50 transition-colors">
                            <ArrowRight className="h-5 w-5" />
                        </div>
                    )}
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
