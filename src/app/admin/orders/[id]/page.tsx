"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, formatDate } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  invoiceNumber?: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  couponCode?: string;
  couponDiscount: number;
  total: number;
  customerNotes?: string;
  adminNotes?: string;
  internalNotes?: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  shippingName: string;
  shippingPhone: string;
  shippingEmail: string;
  shippingAddressLine: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
    imageUrl?: string;
    generator?: { id: string; name: string; slug: string };
    part?: { id: string; name: string; slug: string };
  }[];
}

const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const paymentStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch order");
        const data = await res.json();
        setOrder(data.order);
        setStatus(data.order.status);
        setPaymentStatus(data.order.paymentStatus);
        setTrackingNumber(data.order.trackingNumber || "");
        setCarrier(data.order.carrier || "");
        setAdminNotes(data.order.adminNotes || "");
        setInternalNotes(data.order.internalNotes || "");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch order details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrder();
    }
  }, [params.id, toast]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          trackingNumber: trackingNumber || undefined,
          carrier: carrier || undefined,
          adminNotes: adminNotes || undefined,
          internalNotes: internalNotes,
        }),
      });

      if (!res.ok) throw new Error("Failed to update order");

      toast({
        title: "Success",
        description: "Order updated successfully",
      });

      // Refresh order data
      const data = await res.json();
      setOrder(data.order);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      PENDING: { label: "Pending", variant: "outline" },
      CONFIRMED: { label: "Confirmed", variant: "secondary" },
      PROCESSING: { label: "Processing", variant: "secondary" },
      SHIPPED: { label: "Shipped", variant: "default" },
      OUT_FOR_DELIVERY: { label: "Out for Delivery", variant: "default" },
      DELIVERED: { label: "Delivered", variant: "default" },
      CANCELLED: { label: "Cancelled", variant: "destructive" },
      REFUNDED: { label: "Refunded", variant: "destructive" },
    };
    const config = statusConfig[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      PENDING: { label: "Unpaid", variant: "outline" },
      PAID: { label: "Paid", variant: "default" },
      FAILED: { label: "Failed", variant: "destructive" },
      REFUNDED: { label: "Refunded", variant: "secondary" },
    };
    const config = statusConfig[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Order not found</h2>
        <Link href="/admin/orders">
          <Button className="mt-4">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Orders
          </Link>
          <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
          <p className="text-muted-foreground">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(order.status)}
          {getPaymentBadge(order.paymentStatus)}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => {
                  const product = item.generator || item.part;
                  const productType = item.generator ? "generators" : "parts";
                  return (
                    <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div>
                        <Link
                          href={`/${productType}/${product?.slug}`}
                          className="font-medium hover:text-primary"
                        >
                          {product?.name || "Product"}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="font-semibold">{formatPrice(item.total)}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{order.shippingCost > 0 ? formatPrice(order.shippingCost) : "Free"}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                )}
                {order.couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon ({order.couponCode})</span>
                    <span>-{formatPrice(order.couponDiscount)}</span>
                  </div>
                )}
                {order.discount > 0 && order.discount !== order.couponDiscount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Contact</h4>
                {order.user && (
                  <p className="text-sm">
                    <Link href={`/admin/users?search=${order.user.email}`} className="text-primary hover:underline">
                      {order.user.name}
                    </Link>
                  </p>
                )}
                <p className="text-sm text-muted-foreground">{order.shippingEmail}</p>
                <p className="text-sm text-muted-foreground">{order.shippingPhone}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Shipping Address</h4>
                <p className="text-sm">{order.shippingName}</p>
                <p className="text-sm text-muted-foreground">{order.shippingAddressLine}</p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
                </p>
                <p className="text-sm text-muted-foreground">{order.shippingCountry}</p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Notes */}
          {order.customerNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{order.customerNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Update Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Update Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Order Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tracking Number</Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                />
              </div>

              <div className="space-y-2">
                <Label>Carrier</Label>
                <Input
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g., TCS, Leopard"
                />
              </div>

              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Internal Notes (Staff Communication)</Label>
                <Textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add notes for staff communication. Staff will be notified via email."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Staff members will receive email notifications when you add notes here.
                </p>
              </div>

              <Button
                onClick={handleUpdate}
                disabled={updating}
                className="w-full"
              >
                {updating ? "Updating..." : "Update Order"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span>{order.paymentMethod.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span>{getPaymentBadge(order.paymentStatus)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
