"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function StaffOrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user && (session.user.role === "ADMIN" || session.user.role === "STAFF") && params.id) {
      fetchOrder();
    }
  }, [session, status, params.id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
        setInternalNotes(data.order.internalNotes || "");
      } else {
        toast({
          title: "Error",
          description: "Order not found",
          variant: "destructive",
        });
        router.push("/staff/orders");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast({
          title: "Order Updated",
          description: `Order status changed to ${newStatus}`,
        });
        fetchOrder();
      } else {
        throw new Error("Failed to update order");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const updateInternalNotes = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalNotes }),
      });

      if (res.ok) {
        toast({
          title: "Notes Saved",
          description: "Internal notes updated. Admin will be notified.",
        });
        fetchOrder();
      } else {
        throw new Error("Failed to update notes");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update internal notes",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "secondary",
      CONFIRMED: "default",
      PROCESSING: "default",
      SHIPPED: "default",
      DELIVERED: "default",
      CANCELLED: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link
          href="/staff/orders"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Order #{order.orderNumber || order.id?.slice(-8)}</h1>
            <p className="text-muted-foreground">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {getStatusBadge(order.status)}
            <Select
              value={order.status}
              onValueChange={updateOrderStatus}
              disabled={updating}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4 p-4 border rounded-lg">
                    <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                      {item.generator?.images?.[0]?.url || item.part?.images?.[0]?.url ? (
                        <img
                          src={item.generator?.images?.[0]?.url || item.part?.images?.[0]?.url}
                          alt={item.generator?.name || item.part?.name}
                          className="h-full w-full object-cover rounded-lg"
                        />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                          <rect width="16" height="16" x="4" y="4" rx="2"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.generator?.name || item.part?.name || "Item"}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × PKR {item.price?.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">PKR {(item.quantity * item.price)?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>PKR {order.subtotal?.toLocaleString()}</span>
                </div>
                {order.shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>PKR {order.shippingCost?.toLocaleString()}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-PKR {order.discount?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>PKR {order.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{order.user?.name || order.shippingAddress?.fullName || order.shippingName || "Guest"}</p>
                <p className="text-sm text-muted-foreground">{order.user?.email || order.shippingAddress?.email || order.shippingEmail}</p>
                <p className="text-sm text-muted-foreground">{order.user?.phone || order.shippingAddress?.phone || order.shippingPhone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              {order.shippingAddress || order.shippingName || order.shippingAddressLine ? (
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{order.shippingAddress?.fullName || order.shippingName}</p>
                  <p className="text-muted-foreground">{order.shippingAddress?.address || order.shippingAddressLine}</p>
                  <p className="text-muted-foreground">
                    {order.shippingAddress?.city || order.shippingCity}, {order.shippingAddress?.state || order.shippingState}
                  </p>
                  <p className="text-muted-foreground">{order.shippingAddress?.postalCode || order.shippingPostalCode}</p>
                  <p className="text-muted-foreground">{order.shippingAddress?.phone || order.shippingPhone}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No shipping address</p>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span>{order.paymentMethod || "COD"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={order.paymentStatus === "PAID" ? "default" : "secondary"}>
                    {order.paymentStatus || "PENDING"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Staff Communication</Label>
                <Textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add notes for admin communication..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Admin will receive email notification when you save notes.
                </p>
              </div>
              <Button
                onClick={updateInternalNotes}
                disabled={updating}
                className="w-full"
              >
                {updating ? "Saving..." : "Save Notes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
