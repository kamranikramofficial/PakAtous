import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISetting extends Document {
  _id: mongoose.Types.ObjectId;
  key: string;
  value: string;
  type: string;
  group: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    type: { type: String, default: 'string' },
    group: { type: String, default: 'general' },
  },
  {
    timestamps: true,
  }
);

settingSchema.index({ group: 1 });

export const Setting: Model<ISetting> = mongoose.models.Setting || mongoose.model<ISetting>('Setting', settingSchema);
