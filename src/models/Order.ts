import mongoose, { Schema, Document, Model } from 'mongoose';

// Enums
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentMethod {
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  STRIPE = 'STRIPE',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum OrderItemType {
  GENERATOR = 'GENERATOR',
  PART = 'PART',
}

// Order Item Interface
export interface IOrderItem extends Document {
  _id: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  itemType: OrderItemType;
  generatorId?: mongoose.Types.ObjectId;
  partId?: mongoose.Types.ObjectId;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  total: number;
  imageUrl?: string;
}

// Order Interface
export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  shippingAddressId?: mongoose.Types.ObjectId;
  shippingName: string;
  shippingPhone: string;
  shippingEmail: string;
  shippingAddressLine: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  couponId?: mongoose.Types.ObjectId;
  couponCode?: string;
  couponDiscount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  paidAt?: Date;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  customerNotes?: string;
  adminNotes?: string;
  internalNotes?: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order Item Schema
const orderItemSchema = new Schema<IOrderItem>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  itemType: { type: String, enum: Object.values(OrderItemType), required: true },
  generatorId: { type: Schema.Types.ObjectId, ref: 'Generator' },
  partId: { type: Schema.Types.ObjectId, ref: 'Part' },
  name: { type: String, required: true },
  sku: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true },
  imageUrl: { type: String },
});

orderItemSchema.index({ orderId: 1 });
orderItemSchema.index({ generatorId: 1 });
orderItemSchema.index({ partId: 1 });

export const OrderItem: Model<IOrderItem> =
  mongoose.models.OrderItem || mongoose.model<IOrderItem>('OrderItem', orderItemSchema);

// Order Schema
const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shippingAddressId: { type: Schema.Types.ObjectId, ref: 'Address' },
    shippingName: { type: String, required: true },
    shippingPhone: { type: String, required: true },
    shippingEmail: { type: String, required: true },
    shippingAddressLine: { type: String, required: true },
    shippingCity: { type: String, required: true },
    shippingState: { type: String, required: true },
    shippingPostalCode: { type: String, required: true },
    shippingCountry: { type: String, default: 'Pakistan' },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponId: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    couponCode: { type: String },
    couponDiscount: { type: Number, default: 0 },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
    paymentStatus: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
    paymentMethod: { type: String, enum: Object.values(PaymentMethod), required: true },
    stripePaymentIntentId: { type: String },
    stripeSessionId: { type: String },
    paidAt: { type: Date },
    trackingNumber: { type: String },
    carrier: { type: String },
    estimatedDelivery: { type: Date },
    deliveredAt: { type: Date },
    customerNotes: { type: String },
    adminNotes: { type: String },
    internalNotes: { type: String },
    invoiceNumber: { type: String, unique: true, sparse: true },
    invoiceUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
