import mongoose, { Schema, Document, Model } from 'mongoose';

// Part Image Interface
export interface IPartImage extends Document {
  _id: mongoose.Types.ObjectId;
  url: string;
  alt?: string;
  isPrimary: boolean;
  sortOrder: number;
  partId: mongoose.Types.ObjectId;
  createdAt: Date;
}

// Part Interface
export interface IPart extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  sku?: string;
  lowStockThreshold: number;
  partNumber?: string;
  brand?: string;
  weight?: number;
  dimensions?: string;
  compatibility?: string;
  images: IPartImage[];
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  categoryId?: mongoose.Types.ObjectId;
  compatibleGeneratorIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Part Image Schema
const partImageSchema = new Schema<IPartImage>(
  {
    url: { type: String, required: true },
    alt: { type: String },
    isPrimary: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    partId: { type: Schema.Types.ObjectId, ref: 'Part', required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

partImageSchema.index({ partId: 1 });

export const PartImage: Model<IPartImage> =
  mongoose.models.PartImage || mongoose.model<IPartImage>('PartImage', partImageSchema);

// Part Schema
const partSchema = new Schema<IPart>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    costPrice: { type: Number },
    stock: { type: Number, default: 0 },
    sku: { type: String, unique: true, sparse: true },
    lowStockThreshold: { type: Number, default: 10 },
    partNumber: { type: String },
    brand: { type: String },
    weight: { type: Number },
    dimensions: { type: String },
    compatibility: { type: String },
    images: [{ type: Schema.Types.ObjectId, ref: 'PartImage' }],
    metaTitle: { type: String },
    metaDescription: { type: String },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    categoryId: { type: Schema.Types.ObjectId, ref: 'PartCategory' },
    compatibleGeneratorIds: [{ type: Schema.Types.ObjectId, ref: 'Generator' }],
  },
  {
    timestamps: true,
  }
);

// Indexes
partSchema.index({ brand: 1 });
partSchema.index({ price: 1 });
partSchema.index({ isActive: 1 });
partSchema.index({ categoryId: 1 });

export const Part: Model<IPart> = mongoose.models.Part || mongoose.model<IPart>('Part', partSchema);

// Part Category Interface
export interface IPartCategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: mongoose.Types.ObjectId;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const partCategorySchema = new Schema<IPartCategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String },
    parentId: { type: Schema.Types.ObjectId, ref: 'PartCategory' },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

partCategorySchema.index({ parentId: 1 });

export const PartCategory: Model<IPartCategory> =
  mongoose.models.PartCategory || mongoose.model<IPartCategory>('PartCategory', partCategorySchema);
