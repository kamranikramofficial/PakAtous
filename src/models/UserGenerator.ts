import mongoose, { Schema, Document, Model } from 'mongoose';

export enum ListingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SOLD = 'SOLD',
  EXPIRED = 'EXPIRED',
}

export enum GeneratorCondition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  NEEDS_REPAIR = 'NEEDS_REPAIR',
}

export interface IUserGeneratorImage {
  url: string;
  isPrimary: boolean;
}

export interface IUserGenerator extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  
  // Generator Details
  title: string;
  brand: string;
  generatorModel: string;
  year?: number;
  condition: GeneratorCondition;
  
  // Specifications
  power?: string;
  fuelType?: string;
  engineType?: string;
  runningHours?: number;
  serialNumber?: string;
  
  // Pricing
  askingPrice: number;
  negotiable: boolean;
  
  // Description
  description: string;
  reasonForSelling?: string;
  
  // Images
  images: IUserGeneratorImage[];
  
  // Contact
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactCity: string;
  contactAddress?: string;
  
  // Status
  status: ListingStatus;
  adminNotes?: string;
  rejectionReason?: string;
  
  // Admin Actions
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  purchasedPrice?: number;
  purchasedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const userGeneratorImageSchema = new Schema({
  url: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
});

const userGeneratorSchema = new Schema<IUserGenerator>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Generator Details
    title: { type: String, required: true },
    brand: { type: String, required: true },
    generatorModel: { type: String, required: true },
    year: { type: Number },
    condition: { 
      type: String, 
      enum: Object.values(GeneratorCondition), 
      required: true 
    },
    
    // Specifications
    power: { type: String },
    fuelType: { type: String },
    engineType: { type: String },
    runningHours: { type: Number },
    serialNumber: { type: String },
    
    // Pricing
    askingPrice: { type: Number, required: true },
    negotiable: { type: Boolean, default: true },
    
    // Description
    description: { type: String, required: true },
    reasonForSelling: { type: String },
    
    // Images
    images: [userGeneratorImageSchema],
    
    // Contact
    contactName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactCity: { type: String, required: true },
    contactAddress: { type: String },
    
    // Status
    status: { 
      type: String, 
      enum: Object.values(ListingStatus), 
      default: ListingStatus.PENDING 
    },
    adminNotes: { type: String },
    rejectionReason: { type: String },
    
    // Admin Actions
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    purchasedPrice: { type: Number },
    purchasedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Indexes
userGeneratorSchema.index({ userId: 1 });
userGeneratorSchema.index({ status: 1 });
userGeneratorSchema.index({ createdAt: -1 });
userGeneratorSchema.index({ brand: 1, generatorModel: 1 });

export const UserGenerator: Model<IUserGenerator> =
  mongoose.models.UserGenerator || mongoose.model<IUserGenerator>('UserGenerator', userGeneratorSchema);
