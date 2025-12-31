import mongoose, { Schema, Document, Model } from 'mongoose';

export enum NotificationType {
  ORDER_PLACED = 'ORDER_PLACED',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_UPDATE = 'ORDER_UPDATE',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SERVICE_REQUEST_SUBMITTED = 'SERVICE_REQUEST_SUBMITTED',
  SERVICE_REQUEST_UPDATED = 'SERVICE_REQUEST_UPDATED',
  SERVICE_UPDATE = 'SERVICE_UPDATE',
  SERVICE_QUOTE_RECEIVED = 'SERVICE_QUOTE_RECEIVED',
  SERVICE_COMPLETED = 'SERVICE_COMPLETED',
  CONTACT_INQUIRY = 'CONTACT_INQUIRY',
  PRICE_DROP = 'PRICE_DROP',
  BACK_IN_STOCK = 'BACK_IN_STOCK',
  WELCOME = 'WELCOME',
  PASSWORD_RESET = 'PASSWORD_RESET',
  ACCOUNT_BLOCKED = 'ACCOUNT_BLOCKED',
  SYSTEM = 'SYSTEM',
  PROMOTIONAL = 'PROMOTIONAL',
}

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  readAt?: Date;
  orderId?: string;
  serviceRequestId?: string;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    orderId: { type: String },
    serviceRequestId: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
notificationSchema.index({ userId: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);
