import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for archived/deleted user data
export interface IDeletedUser extends Document {
  _id: mongoose.Types.ObjectId;
  // Original user ID for reference
  originalUserId: mongoose.Types.ObjectId;
  
  // User data at time of deletion
  name?: string;
  email: string;
  emailHashed: string; // Hashed email for lookup without exposing original
  phone?: string;
  role: string;
  
  // Address Information
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string;
  
  // Account metadata
  originalCreatedAt: Date;
  lastLoginAt?: Date;
  
  // Deletion info
  deletedAt: Date;
  deletionReason?: string;
  deletedByAdmin: boolean;
  adminId?: mongoose.Types.ObjectId;
  
  // Order summary (keep summary, not full orders)
  totalOrders: number;
  totalSpent: number;
  
  // Additional archived data (JSON stringified)
  archivedData?: string;
  
  // For GDPR/legal compliance
  dataRetentionUntil: Date; // When this record can be permanently deleted
  permanentlyDeleted: boolean;
}

const deletedUserSchema = new Schema<IDeletedUser>(
  {
    originalUserId: { type: Schema.Types.ObjectId, required: true, index: true },
    
    // User data
    name: { type: String },
    email: { type: String, required: true },
    emailHashed: { type: String, required: true, index: true },
    phone: { type: String },
    role: { type: String, default: 'USER' },
    
    // Address
    address: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, default: 'Pakistan' },
    
    // Account metadata
    originalCreatedAt: { type: Date, required: true },
    lastLoginAt: { type: Date },
    
    // Deletion info
    deletedAt: { type: Date, default: Date.now, required: true },
    deletionReason: { type: String },
    deletedByAdmin: { type: Boolean, default: false },
    adminId: { type: Schema.Types.ObjectId, ref: 'User' },
    
    // Order summary
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    
    // Archived data
    archivedData: { type: String },
    
    // Data retention
    dataRetentionUntil: { type: Date, required: true },
    permanentlyDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes
deletedUserSchema.index({ deletedAt: 1 });
deletedUserSchema.index({ dataRetentionUntil: 1 });
deletedUserSchema.index({ permanentlyDeleted: 1 });

// Model
export const DeletedUser: Model<IDeletedUser> = 
  mongoose.models.DeletedUser || mongoose.model<IDeletedUser>('DeletedUser', deletedUserSchema);
