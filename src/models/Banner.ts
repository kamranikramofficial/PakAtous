import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBanner extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  buttonText?: string;
  position: string;
  sortOrder: number;
  isActive: boolean;
  startsAt: Date;
  endsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    link: { type: String },
    buttonText: { type: String },
    position: { type: String, default: 'home' },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startsAt: { type: Date, default: Date.now },
    endsAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

bannerSchema.index({ position: 1 });
bannerSchema.index({ isActive: 1 });

export const Banner: Model<IBanner> = mongoose.models.Banner || mongoose.model<IBanner>('Banner', bannerSchema);
