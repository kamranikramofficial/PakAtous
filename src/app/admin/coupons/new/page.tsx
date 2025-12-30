"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  value: z.number().positive("Value must be positive"),
  minOrderAmount: z.number().positive().optional().nullable(),
  maxDiscount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().positive().default(1),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  appliesToGenerators: z.boolean().default(true),
  appliesToParts: z.boolean().default(true),
});

type CouponFormData = z.infer<typeof couponSchema>;

export default function NewCouponPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      type: "PERCENTAGE",
      value: 10,
      perUserLimit: 1,
      isActive: true,
      appliesToGenerators: true,
      appliesToParts: true,
    },
  });

  const couponType = watch("type");

  const onSubmit = async (data: CouponFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create coupon");
      }

      toast({
        title: "Success",
        description: "Coupon created successfully",
      });
      router.push("/admin/coupons");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create coupon",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue("code", code);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/coupons">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Coupon</h1>
          <p className="text-muted-foreground">Add a new discount coupon</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Coupon Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code *</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    {...register("code")}
                    placeholder="SAVE20"
                    className="uppercase"
                  />
                  <Button type="button" variant="outline" onClick={generateCode}>
                    Generate
                  </Button>
                </div>
                {errors.code && (
                  <p className="text-sm text-destructive">{errors.code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Discount Type *</Label>
                <Select
                  value={couponType}
                  onValueChange={(value: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING") =>
                    setValue("type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage Off</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Fixed Amount Off</SelectItem>
                    <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Get 20% off on all generators"
                rows={2}
              />
            </div>

            {couponType !== "FREE_SHIPPING" && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">
                    {couponType === "PERCENTAGE" ? "Percentage Off *" : "Amount Off (PKR) *"}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    {...register("value", { valueAsNumber: true })}
                    placeholder={couponType === "PERCENTAGE" ? "20" : "500"}
                  />
                  {errors.value && (
                    <p className="text-sm text-destructive">{errors.value.message}</p>
                  )}
                </div>

                {couponType === "PERCENTAGE" && (
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscount">Max Discount (PKR)</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      {...register("maxDiscount", { valueAsNumber: true })}
                      placeholder="5000"
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minOrderAmount">Minimum Order (PKR)</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  {...register("minOrderAmount", { valueAsNumber: true })}
                  placeholder="1000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageLimit">Total Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  {...register("usageLimit", { valueAsNumber: true })}
                  placeholder="Unlimited"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="perUserLimit">Per User Limit</Label>
                <Input
                  id="perUserLimit"
                  type="number"
                  {...register("perUserLimit", { valueAsNumber: true })}
                  defaultValue={1}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiration Date</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                {...register("expiresAt")}
              />
              <p className="text-sm text-muted-foreground">
                Leave empty for no expiration
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applies To</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("appliesToGenerators")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span>Generators</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("appliesToParts")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span>Parts</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register("isActive")}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isActive">Coupon is Active</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Coupon
          </Button>
          <Link href="/admin/coupons">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
