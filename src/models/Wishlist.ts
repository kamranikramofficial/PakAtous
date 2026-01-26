import mongoose, { Schema, Document, Model } from 'mongoose';

export enum WishlistItemType {
  GENERATOR = 'GENERATOR',
  PART = 'PART',
}

export interface IWishlistItem extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  itemType: WishlistItemType;
  generatorId?: mongoose.Types.ObjectId;
  partId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const wishlistItemSchema = new Schema<IWishlistItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    itemType: { type: String, enum: Object.values(WishlistItemType), required: true },
    generatorId: { type: Schema.Types.ObjectId, ref: 'Generator' },
    partId: { type: Schema.Types.ObjectId, ref: 'Part' },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
wishlistItemSchema.index({ userId: 1 });
wishlistItemSchema.index({ userId: 1, generatorId: 1 }, { unique: true, partialFilterExpression: { generatorId: { $exists: true } } });
wishlistItemSchema.index({ userId: 1, partId: 1 }, { unique: true, partialFilterExpression: { partId: { $exists: true } } });

export const WishlistItem: Model<IWishlistItem> = mongoose.models.WishlistItem || mongoose.model<IWishlistItem>('WishlistItem', wishlistItemSchema);
