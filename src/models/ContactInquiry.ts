import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContactInquiry extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  newsletter: boolean;
  isRead: boolean;
  isReplied: boolean;
  repliedAt?: Date;
  adminNotes?: string;
  internalNotes?: string;
  assignedTo?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status?: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
}

const contactInquirySchema = new Schema<IContactInquiry>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    newsletter: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    isReplied: { type: Boolean, default: false },
    repliedAt: { type: Date },
    adminNotes: { type: String },
    internalNotes: { type: String },
    assignedTo: { type: String },
    priority: { type: String, enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'], default: 'NORMAL' },
    status: { type: String, enum: ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'NEW' },
  },
  {
    timestamps: true,
  }
);

contactInquirySchema.index({ isRead: 1 });
contactInquirySchema.index({ createdAt: -1 });

export const ContactInquiry: Model<IContactInquiry> =
  mongoose.models.ContactInquiry || mongoose.model<IContactInquiry>('ContactInquiry', contactInquirySchema);
