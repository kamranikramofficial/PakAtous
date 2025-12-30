import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContactInquiry extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  isReplied: boolean;
  repliedAt?: Date;
  createdAt: Date;
}

const contactInquirySchema = new Schema<IContactInquiry>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    isReplied: { type: Boolean, default: false },
    repliedAt: { type: Date },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

contactInquirySchema.index({ isRead: 1 });
contactInquirySchema.index({ createdAt: -1 });

export const ContactInquiry: Model<IContactInquiry> =
  mongoose.models.ContactInquiry || mongoose.model<IContactInquiry>('ContactInquiry', contactInquirySchema);
