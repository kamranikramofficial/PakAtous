import mongoose, { Schema, Document, Model } from 'mongoose';

// Enums
export enum FuelType {
  DIESEL = 'DIESEL',
  PETROL = 'PETROL',
  GAS = 'GAS',
  DUAL_FUEL = 'DUAL_FUEL',
  NATURAL_GAS = 'NATURAL_GAS',
}

export enum GeneratorCondition {
  NEW = 'NEW',
  REFURBISHED = 'REFURBISHED',
  USED = 'USED',
}

// Generator Image Interface
export interface IGeneratorImage extends Document {
  _id: mongoose.Types.ObjectId;
  url: string;
  alt?: string;
  isPrimary: boolean;
  sortOrder: number;
  generatorId: mongoose.Types.ObjectId;
  createdAt: Date;
}

// Generator Interface
export interface IGenerator extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  powerKva: number;
  powerKw: number;
  fuelType: FuelType;
  brand: string;
  modelName?: string;
  condition: GeneratorCondition;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  sku?: string;
  lowStockThreshold: number;
  warranty?: string;
  weight?: number;
  dimensions?: string;
  engineBrand?: string;
  alternatorBrand?: string;
  startingSystem?: string;
  voltage?: string;
  frequency: string;
  phase: string;
  noiseLevel?: string;
  fuelConsumption?: string;
  tankCapacity?: number;
  runtime?: string;
  images: IGeneratorImage[];
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  categoryId?: mongoose.Types.ObjectId;
  compatiblePartIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Generator Image Schema
const generatorImageSchema = new Schema<IGeneratorImage>(
  {
    url: { type: String, required: true },
    alt: { type: String },
    isPrimary: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    generatorId: { type: Schema.Types.ObjectId, ref: 'Generator', required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

generatorImageSchema.index({ generatorId: 1 });

export const GeneratorImage: Model<IGeneratorImage> =
  mongoose.models.GeneratorImage || mongoose.model<IGeneratorImage>('GeneratorImage', generatorImageSchema);

// Generator Schema
const generatorSchema = new Schema<IGenerator>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    powerKva: { type: Number, required: true },
    powerKw: { type: Number, required: true },
    fuelType: { type: String, enum: Object.values(FuelType), required: true },
    brand: { type: String, required: true },
    modelName: { type: String },
    condition: { type: String, enum: Object.values(GeneratorCondition), default: GeneratorCondition.NEW },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    costPrice: { type: Number },
    stock: { type: Number, default: 0 },
    sku: { type: String, unique: true, sparse: true },
    lowStockThreshold: { type: Number, default: 5 },
    warranty: { type: String },
    weight: { type: Number },
    dimensions: { type: String },
    engineBrand: { type: String },
    alternatorBrand: { type: String },
    startingSystem: { type: String },
    voltage: { type: String },
    frequency: { type: String, default: '50Hz' },
    phase: { type: String, default: 'Single Phase' },
    noiseLevel: { type: String },
    fuelConsumption: { type: String },
    tankCapacity: { type: Number },
    runtime: { type: String },
    images: [{ type: Schema.Types.ObjectId, ref: 'GeneratorImage' }],
    metaTitle: { type: String },
    metaDescription: { type: String },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    categoryId: { type: Schema.Types.ObjectId, ref: 'GeneratorCategory' },
    compatiblePartIds: [{ type: Schema.Types.ObjectId, ref: 'Part' }],
  },
  {
    timestamps: true,
  }
);

// Indexes
generatorSchema.index({ brand: 1 });
generatorSchema.index({ fuelType: 1 });
generatorSchema.index({ powerKva: 1 });
generatorSchema.index({ price: 1 });
generatorSchema.index({ isActive: 1 });
generatorSchema.index({ categoryId: 1 });

export const Generator: Model<IGenerator> =
  mongoose.models.Generator || mongoose.model<IGenerator>('Generator', generatorSchema);

// Generator Category Interface
export interface IGeneratorCategory extends Document {
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

const generatorCategorySchema = new Schema<IGeneratorCategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String },
    parentId: { type: Schema.Types.ObjectId, ref: 'GeneratorCategory' },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

generatorCategorySchema.index({ parentId: 1 });

export const GeneratorCategory: Model<IGeneratorCategory> =
  mongoose.models.GeneratorCategory || mongoose.model<IGeneratorCategory>('GeneratorCategory', generatorCategorySchema);
