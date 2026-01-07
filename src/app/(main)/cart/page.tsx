"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useToast } from "@/components/ui/use-toast";
import { useSettings } from "@/contexts/settings-context";

export default function CartPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCartStore();
  const { settings, getShippingCost } = useSettings();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Sync cart with server if logged in
    const syncCart = async () => {
      if (session?.user) {
        try {
          const response = await fetch("/api/cart");
          if (response.ok) {
            const data = await response.json();
            // Server cart data could be merged with local cart here
          }
        } catch (error) {
          console.error("Failed to sync cart:", error);
        }
      }
      setLoading(false);
    };

    syncCart();
  }, [session]);

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    updateQuantity(id, quantity);

    if (session?.user) {
      setSyncing(true);
      try {
        await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId: id, quantity }),
        });
      } catch (error) {
        console.error("Failed to update cart:", error);
      } finally {
        setSyncing(false);
      }
    }
  };

  const handleRemoveItem = async (id: string) => {
    removeItem(id);

    if (session?.user) {
      setSyncing(true);
      try {
        await fetch(`/api/cart?itemId=${id}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Failed to remove item:", error);
      } finally {
        setSyncing(false);
      }
    }

    toast({
      title: "Item removed",
      description: "The item has been removed from your cart.",
    });
  };

  const subtotal = getSubtotal();
  const freeShippingThreshold = parseFloat(settings.shipping.freeShippingThreshold) || 50000;
  const shipping = getShippingCost(subtotal);
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="container flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-md text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-4 text-muted-foreground"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          <h1 className="mb-2 text-2xl font-bold">Your cart is empty</h1>
          <p className="mb-6 text-muted-foreground">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/generators">
              <Button>Browse Generators</Button>
            </Link>
            <Link href="/parts">
              <Button variant="outline">Browse Parts</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Cart Items ({items.length})</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => {
                    clearCart();
                    toast({
                      title: "Cart cleared",
                      description: "All items have been removed from your cart.",
                    });
                  }}
                >
                  Clear Cart
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  {/* Product Image */}
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
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
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted-foreground"
                        >
                          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {item.itemType}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" x2="10" y1="11" y2="17" />
                          <line x1="14" x2="14" y1="11" y2="17" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      {/* Quantity */}
                      <div className="flex items-center border rounded">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-muted"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="min-w-[40px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-muted"
                          disabled={item.quantity >= item.maxStock}
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.price)} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              {subtotal < freeShippingThreshold && (
                <p className="text-sm text-muted-foreground">
                  Add {formatPrice(freeShippingThreshold - subtotal)} more for free shipping
                </p>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Including all taxes
                </p>
              </div>

              {session?.user ? (
                <Link href="/checkout" className="block">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>
              ) : (
                <div className="space-y-2">
                  <Link href="/auth/login?callbackUrl=/checkout" className="block">
                    <Button className="w-full" size="lg">
                      Login to Checkout
                    </Button>
                  </Link>
                  <p className="text-center text-sm text-muted-foreground">
                    or{" "}
                    <Link href="/auth/register" className="text-primary hover:underline">
                      create an account
                    </Link>
                  </p>
                </div>
              )}

              <Link href="/generators" className="block">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
