import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPage extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pageSchema = new Schema<IPage>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Page: Model<IPage> = mongoose.models.Page || mongoose.model<IPage>('Page', pageSchema);
