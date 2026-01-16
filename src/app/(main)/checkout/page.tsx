"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/settings-context";

const checkoutSchema = z.object({
  shippingName: z.string().min(2, "Full name is required"),
  shippingPhone: z.string().min(10, "Valid phone number is required"),
  shippingEmail: z.string().email("Valid email is required"),
  shippingAddressLine: z.string().min(5, "Address is required"),
  shippingCity: z.string().min(2, "City is required"),
  shippingState: z.string().min(2, "State/Province is required"),
  shippingPostalCode: z.string().min(4, "Postal code is required"),
  shippingCountry: z.string().default("Pakistan"),
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "BANK_TRANSFER"]),
  customerNotes: z.string().optional(),
  couponCode: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { settings, getShippingCost, isCODEnabled } = useSettings();
  
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponApplied, setCouponApplied] = useState<{
    code: string;
    discount: number;
    type: string;
  } | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  
  // Determine default payment method based on settings
  const defaultPaymentMethod = isCODEnabled() ? "CASH_ON_DELIVERY" : "BANK_TRANSFER";
  const [paymentMethod, setPaymentMethod] = useState<"CASH_ON_DELIVERY" | "BANK_TRANSFER">(defaultPaymentMethod);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "CASH_ON_DELIVERY",
      shippingCountry: "Pakistan",
    },
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login?callbackUrl=/checkout");
    }
    if (items.length === 0) {
      router.push("/cart");
    }

    // Fetch default address if logged in
    if (session?.user?.id) {
      fetchDefaultAddress();
    }
  }, [session, status, router, items.length]);

  const fetchDefaultAddress = async () => {
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) {
        const data = await res.json();
        setSavedAddresses(data.addresses || []);
        
        const defaultAddress = data.addresses?.find((addr: any) => addr.isDefault);
        
        if (defaultAddress) {
          // Pre-fill form with default address
          setValue("shippingName", defaultAddress.fullName);
          setValue("shippingPhone", defaultAddress.phone);
          setValue("shippingEmail", session?.user?.email || "");
          setValue("shippingAddressLine", defaultAddress.address);
          setValue("shippingCity", defaultAddress.city);
          setValue("shippingState", defaultAddress.state);
          setValue("shippingPostalCode", defaultAddress.postalCode);
          setValue("shippingCountry", defaultAddress.country);
        }
      }
    } catch (error) {
      console.error("Failed to fetch default address:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const selectAddress = (address: any) => {
    setValue("shippingName", address.fullName);
    setValue("shippingPhone", address.phone);
    setValue("shippingEmail", session?.user?.email || "");
    setValue("shippingAddressLine", address.address);
    setValue("shippingCity", address.city);
    setValue("shippingState", address.state);
    setValue("shippingPostalCode", address.postalCode);
    setValue("shippingCountry", address.country);
    setShowAddressSelector(false);
  };

  const subtotal = getSubtotal();
  const shipping = getShippingCost(subtotal);
  const codFee = paymentMethod === "CASH_ON_DELIVERY" && isCODEnabled() 
    ? parseFloat(settings.shipping.codFee) || 0 
    : 0;
  const discount = couponApplied
    ? couponApplied.type === "PERCENTAGE"
      ? (subtotal * couponApplied.discount) / 100
      : couponApplied.discount
    : 0;
  const total = subtotal + shipping + codFee - discount;

  const applyCoupon = async () => {
    const code = watch("couponCode");
    if (!code) return;

    setCouponLoading(true);
    setCouponError(null);
    try {
      const response = await fetch(`/api/coupons/validate?code=${code}&subtotal=${subtotal}`);
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "This coupon code is not valid.";
        setCouponError(errorMsg);
        toast({
          title: "Invalid Coupon",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }

      setCouponError(null);
      setCouponApplied({
        code: data.coupon.code,
        discount: data.coupon.discountValue,
        type: data.coupon.discountType,
      });

      toast({
        title: "Coupon Applied",
        description: `You saved ${formatPrice(data.discount)}!`,
      });
    } catch (error) {
      const errorMsg = "Failed to apply coupon. Please try again.";
      setCouponError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setLoading(true);
    try {
      // Map cart items to the format expected by the API
      const orderItems = items.map(item => ({
        itemType: item.itemType,
        productId: item.productId,
        quantity: item.quantity,
      }));

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          couponCode: couponApplied?.code,
          items: orderItems,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to place order");
      }

      clearCart();

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${result.order.orderNumber} has been placed.`,
      });

      router.push(`/orders/${result.order.id}/confirmation`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="container flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Select from Saved Addresses */}
                {!loadingAddresses && savedAddresses.length > 0 && (
                  <div className="mb-4 pb-4 border-b space-y-2">
                    <Label className="text-sm">Or use saved addresses:</Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {savedAddresses.map((address) => (
                        <Button
                          key={address._id}
                          type="button"
                          variant={address.isDefault ? "default" : "outline"}
                          size="sm"
                          onClick={() => selectAddress(address)}
                          className="justify-start h-auto py-2 px-3"
                        >
                          <div className="text-left text-xs">
                            <p className="font-medium">{address.label}</p>
                            <p className="text-muted-foreground">{address.city}</p>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="shippingName">Full Name *</Label>
                    <Input
                      id="shippingName"
                      {...register("shippingName")}
                      placeholder="Your full name"
                    />
                    {errors.shippingName && (
                      <p className="text-sm text-destructive">
                        {errors.shippingName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingPhone">Phone Number *</Label>
                    <Input
                      id="shippingPhone"
                      type="tel"
                      {...register("shippingPhone")}
                      placeholder="03XX-XXXXXXX"
                    />
                    {errors.shippingPhone && (
                      <p className="text-sm text-destructive">
                        {errors.shippingPhone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingEmail">Email *</Label>
                  <Input
                    id="shippingEmail"
                    type="email"
                    {...register("shippingEmail")}
                    placeholder="your@email.com"
                  />
                  {errors.shippingEmail && (
                    <p className="text-sm text-destructive">
                      {errors.shippingEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingAddressLine">Address *</Label>
                  <Textarea
                    id="shippingAddressLine"
                    {...register("shippingAddressLine")}
                    placeholder="Street address, building, floor, etc."
                  />
                  {errors.shippingAddressLine && (
                    <p className="text-sm text-destructive">
                      {errors.shippingAddressLine.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="shippingCity">City *</Label>
                    <Input
                      id="shippingCity"
                      {...register("shippingCity")}
                      placeholder="Karachi"
                    />
                    {errors.shippingCity && (
                      <p className="text-sm text-destructive">
                        {errors.shippingCity.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingState">State/Province *</Label>
                    <Input
                      id="shippingState"
                      {...register("shippingState")}
                      placeholder="Sindh"
                    />
                    {errors.shippingState && (
                      <p className="text-sm text-destructive">
                        {errors.shippingState.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingPostalCode">Postal Code *</Label>
                    <Input
                      id="shippingPostalCode"
                      {...register("shippingPostalCode")}
                      placeholder="75000"
                    />
                    {errors.shippingPostalCode && (
                      <p className="text-sm text-destructive">
                        {errors.shippingPostalCode.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {isCODEnabled() && (
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                        paymentMethod === "CASH_ON_DELIVERY"
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground"
                      }`}
                    >
                      <input
                        type="radio"
                        value="CASH_ON_DELIVERY"
                        checked={paymentMethod === "CASH_ON_DELIVERY"}
                        onChange={() => {
                          setPaymentMethod("CASH_ON_DELIVERY");
                          setValue("paymentMethod", "CASH_ON_DELIVERY");
                        }}
                        className="h-4 w-4"
                      />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">
                          Pay when you receive your order
                          {parseFloat(settings.shipping.codFee) > 0 && (
                            <span className="block text-xs">+{formatPrice(parseFloat(settings.shipping.codFee))} COD fee</span>
                          )}
                        </p>
                      </div>
                    </label>
                  )}

                  {settings.payment.enableBankTransfer === "true" && (
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                        paymentMethod === "BANK_TRANSFER"
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground"
                      }`}
                    >
                      <input
                        type="radio"
                        value="BANK_TRANSFER"
                        checked={paymentMethod === "BANK_TRANSFER"}
                        onChange={() => {
                          setPaymentMethod("BANK_TRANSFER");
                          setValue("paymentMethod", "BANK_TRANSFER");
                        }}
                        className="h-4 w-4"
                      />
                      <div>
                        <p className="font-medium">Bank Transfer</p>
                        <p className="text-sm text-muted-foreground">
                          Pay via bank transfer
                        </p>
                      </div>
                    </label>
                  )}
                </div>

                {paymentMethod === "BANK_TRANSFER" && (settings.payment.bankName || settings.payment.bankAccountNumber || settings.payment.bankIBAN) && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-2">
                    <p className="text-sm font-medium text-blue-800">Bank Transfer Details:</p>
                    <div className="text-sm text-blue-700 space-y-1">
                      {settings.payment.bankName && <p><strong>Bank:</strong> {settings.payment.bankName}</p>}
                      {settings.payment.bankAccountTitle && <p><strong>Account Title:</strong> {settings.payment.bankAccountTitle}</p>}
                      {settings.payment.bankAccountNumber && <p><strong>Account No:</strong> {settings.payment.bankAccountNumber}</p>}
                      {settings.payment.bankIBAN && <p><strong>IBAN:</strong> {settings.payment.bankIBAN}</p>}
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Please send payment proof to {settings.general.siteEmail}
                    </p>
                  </div>
                )}

                {paymentMethod === "BANK_TRANSFER" && !settings.payment.bankName && !settings.payment.bankAccountNumber && !settings.payment.bankIBAN && (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <p className="text-sm text-yellow-700">
                      <strong>Note:</strong> Bank details will be sent to your email after placing the order.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...register("customerNotes")}
                  placeholder="Special instructions for delivery..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-muted-foreground"
                            >
                              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="line-clamp-1 text-sm font-medium">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  {/* Coupon */}
                  <div className="flex gap-2">
                    <Input
                      {...register("couponCode")}
                      placeholder="Coupon code"
                      disabled={!!couponApplied}
                      onChange={() => setCouponError(null)}
                    />
                    {couponApplied ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setCouponApplied(null);
                          setCouponError(null);
                        }}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={applyCoupon}
                        disabled={couponLoading}
                      >
                        {couponLoading ? "..." : "Apply"}
                      </Button>
                    )}
                  </div>
                  {couponError && (
                    <p className="text-sm text-red-600 font-medium">
                      ❌ {couponError}
                    </p>
                  )}
                  {couponApplied && (
                    <p className="text-sm text-green-600 font-medium">
                      ✓ Coupon "{couponApplied.code}" applied!
                    </p>
                  )}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Shipping
                      {shipping === 0 && (
                        <span className="block text-xs text-green-600">
                          Free on orders over {formatPrice(parseFloat(settings.shipping.freeShippingThreshold))}
                        </span>
                      )}
                    </span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {codFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">COD Fee</span>
                      <span>{formatPrice(codFee)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  {settings.shipping.estimatedDeliveryDays && (
                    <p className="text-xs text-muted-foreground text-center">
                      Estimated delivery: {settings.shipping.estimatedDeliveryDays} business days
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Processing...
                    </>
                  ) : paymentMethod === "CASH_ON_DELIVERY" ? (
                    "Place Order"
                  ) : (
                    "Place Order (Bank Transfer)"
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  By placing this order, you agree to our{" "}
                  <a href="/terms" className="underline hover:text-foreground">
                    Terms & Conditions
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
