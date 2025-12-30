import mongoose, { Schema, Document, Model } from 'mongoose';

// Enums
export enum ServiceRequestStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  QUOTED = 'QUOTED',
  QUOTE_SENT = 'QUOTE_SENT',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ServicePriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ServiceType {
  REPAIR = 'REPAIR',
  MAINTENANCE = 'MAINTENANCE',
  INSTALLATION = 'INSTALLATION',
  INSPECTION = 'INSPECTION',
  EMERGENCY = 'EMERGENCY',
  OTHER = 'OTHER',
}

// Service Image Interface
export interface IServiceImage extends Document {
  _id: mongoose.Types.ObjectId;
  url: string;
  description?: string;
  serviceRequestId: mongoose.Types.ObjectId;
  createdAt: Date;
}

// Service Request Interface
export interface IServiceRequest extends Document {
  _id: mongoose.Types.ObjectId;
  requestNumber: string;
  userId: mongoose.Types.ObjectId;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  serviceAddress: string;
  serviceCity: string;
  serviceState: string;
  serviceType: ServiceType;
  generatorBrand?: string;
  generatorModel?: string;
  generatorSerial?: string;
  problemTitle: string;
  problemDescription: string;
  images: IServiceImage[];
  status: ServiceRequestStatus;
  priority: ServicePriority;
  adminNotes?: string;
  internalNotes?: string;
  diagnosis?: string;
  estimatedCost?: number;
  quotedPrice?: number;
  quotedAt?: Date;
  finalCost?: number;
  isPaid: boolean;
  paidAt?: Date;
  preferredDate?: Date;
  scheduledDate?: Date;
  completedAt?: Date;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Service Image Schema
const serviceImageSchema = new Schema<IServiceImage>(
  {
    url: { type: String, required: true },
    description: { type: String },
    serviceRequestId: { type: Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

serviceImageSchema.index({ serviceRequestId: 1 });

export const ServiceImage: Model<IServiceImage> =
  mongoose.models.ServiceImage || mongoose.model<IServiceImage>('ServiceImage', serviceImageSchema);

// Service Request Schema
const serviceRequestSchema = new Schema<IServiceRequest>(
  {
    requestNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    contactName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true },
    serviceAddress: { type: String, required: true },
    serviceCity: { type: String, required: true },
    serviceState: { type: String, required: true },
    serviceType: { type: String, enum: Object.values(ServiceType), required: true },
    generatorBrand: { type: String },
    generatorModel: { type: String },
    generatorSerial: { type: String },
    problemTitle: { type: String, required: true },
    problemDescription: { type: String, required: true },
    images: [serviceImageSchema],
    status: { type: String, enum: Object.values(ServiceRequestStatus), default: ServiceRequestStatus.PENDING },
    priority: { type: String, enum: Object.values(ServicePriority), default: ServicePriority.NORMAL },
    adminNotes: { type: String },
    internalNotes: { type: String },
    diagnosis: { type: String },
    estimatedCost: { type: Number },
    quotedPrice: { type: Number },
    quotedAt: { type: Date },
    finalCost: { type: Number },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    preferredDate: { type: Date },
    scheduledDate: { type: Date },
    completedAt: { type: Date },
    assignedTo: { type: String },
  },
  {
    timestamps: true,
  }
);

// Indexes
serviceRequestSchema.index({ userId: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ createdAt: -1 });

export const ServiceRequest: Model<IServiceRequest> =
  mongoose.models.ServiceRequest || mongoose.model<IServiceRequest>('ServiceRequest', serviceRequestSchema);
