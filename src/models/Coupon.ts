import mongoose, { Schema, Document, Model } from 'mongoose';

export enum CouponType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_SHIPPING = 'FREE_SHIPPING',
}

export interface ICoupon extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  perUserLimit: number;
  startsAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  appliesToGenerators: boolean;
  appliesToParts: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String },
    type: { type: String, enum: Object.values(CouponType), required: true },
    value: { type: Number, required: true },
    minOrderAmount: { type: Number },
    maxDiscount: { type: Number },
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
    appliesToGenerators: { type: Boolean, default: true },
    appliesToParts: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ isActive: 1 });

export const Coupon: Model<ICoupon> = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', couponSchema);
