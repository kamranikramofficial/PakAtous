import mongoose, { Schema, Document, Model } from 'mongoose';
import { OrderItemType } from './Order';

// Cart Item Interface
export interface ICartItem extends Document {
  _id: mongoose.Types.ObjectId;
  cartId: mongoose.Types.ObjectId;
  itemType: OrderItemType;
  generatorId?: mongoose.Types.ObjectId;
  partId?: mongoose.Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

// Cart Interface
export interface ICart extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Cart Item Schema
const cartItemSchema = new Schema<ICartItem>(
  {
    cartId: { type: Schema.Types.ObjectId, ref: 'Cart', required: true },
    itemType: { type: String, enum: ['GENERATOR', 'PART'], required: true },
    generatorId: { type: Schema.Types.ObjectId, ref: 'Generator' },
    partId: { type: Schema.Types.ObjectId, ref: 'Part' },
    quantity: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

cartItemSchema.index({ cartId: 1 });
cartItemSchema.index({ cartId: 1, generatorId: 1 }, { unique: true, sparse: true });
cartItemSchema.index({ cartId: 1, partId: 1 }, { unique: true, sparse: true });

export const CartItem: Model<ICartItem> =
  mongoose.models.CartItem || mongoose.model<ICartItem>('CartItem', cartItemSchema);

// Cart Schema
const cartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

export const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>('Cart', cartSchema);
