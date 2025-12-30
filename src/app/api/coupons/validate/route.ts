import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Coupon, CouponType } from "@/models/Coupon";
import { Order } from "@/models/Order";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Please login to apply coupon" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.trim().toUpperCase();
    const subtotal = parseFloat(searchParams.get("subtotal") || "0");

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    // Find the coupon (case-insensitive search)
    const coupon = await Coupon.findOne({ 
      code: { $regex: new RegExp(`^${code}$`, 'i') } 
    }).lean();

    console.log("Coupon search for code:", code, "Found:", coupon ? coupon.code : "Not found");

    if (!coupon) {
      // Also try exact match
      const exactCoupon = await Coupon.findOne({ code }).lean();
      console.log("Exact match search:", exactCoupon ? exactCoupon.code : "Not found");
      
      // List all coupons for debugging
      const allCoupons = await Coupon.find({}).select('code isActive').lean();
      console.log("All coupons in DB:", allCoupons.map(c => c.code));
      
      return NextResponse.json({ error: `Coupon code "${code}" does not exist` }, { status: 400 });
    }

    console.log("Coupon details:", {
      code: coupon.code,
      isActive: coupon.isActive,
      minOrderAmount: coupon.minOrderAmount,
      startsAt: coupon.startsAt,
      expiresAt: coupon.expiresAt,
      usageLimit: coupon.usageLimit,
      usageCount: coupon.usageCount,
    });

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });
    }

    // Check if coupon has started
    const now = new Date();
    if (coupon.startsAt && new Date(coupon.startsAt) > now) {
      return NextResponse.json({ error: "This coupon is not yet active" }, { status: 400 });
    }

    // Check if coupon has expired
    if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
    }

    // Check per-user limit
    if (coupon.perUserLimit && coupon.perUserLimit > 0) {
      const userUsageCount = await Order.countDocuments({
        userId: session.user.id,
        couponCode: { $regex: new RegExp(`^${code}$`, 'i') },
        status: { $nin: ["CANCELLED", "REFUNDED"] },
      });

      if (userUsageCount >= coupon.perUserLimit) {
        return NextResponse.json({ 
          error: `You have already used this coupon ${coupon.perUserLimit} time(s)` 
        }, { status: 400 });
      }
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && coupon.minOrderAmount > 0 && subtotal < coupon.minOrderAmount) {
      return NextResponse.json({ 
        error: `Minimum order amount is PKR ${coupon.minOrderAmount.toLocaleString()}` 
      }, { status: 400 });
    }

    // Calculate discount
    let discountValue = coupon.value;
    let discountAmount = 0;

    if (coupon.type === CouponType.PERCENTAGE) {
      discountAmount = (subtotal * coupon.value) / 100;
      // Apply max discount cap if set
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.type === CouponType.FIXED_AMOUNT) {
      discountAmount = coupon.value;
      // Don't let discount exceed subtotal
      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }
    } else if (coupon.type === CouponType.FREE_SHIPPING) {
      discountAmount = 0; // Handled separately in checkout
    }

    return NextResponse.json({
      coupon: {
        id: coupon._id.toString(),
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.type,
        discountValue: discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
        appliesToGenerators: coupon.appliesToGenerators,
        appliesToParts: coupon.appliesToParts,
      },
      discount: discountAmount,
      message: coupon.type === CouponType.FREE_SHIPPING 
        ? "Free shipping applied!" 
        : `Coupon applied! You save PKR ${discountAmount.toLocaleString()}`,
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
