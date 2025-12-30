import mongoose, { Schema, Document, Model } from 'mongoose';
import { OrderItemType } from './Order';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  itemType: OrderItemType;
  generatorId?: mongoose.Types.ObjectId;
  partId?: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    itemType: { type: String, enum: ['GENERATOR', 'PART'], required: true },
    generatorId: { type: Schema.Types.ObjectId, ref: 'Generator' },
    partId: { type: Schema.Types.ObjectId, ref: 'Part' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String },
    comment: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ userId: 1 });
reviewSchema.index({ generatorId: 1 });
reviewSchema.index({ partId: 1 });
reviewSchema.index({ isApproved: 1 });

export const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);
