import mongoose, { Schema, Document, Model } from 'mongoose';

// Enums
export enum UserRole {
  USER = 'USER',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  BANNED = 'BANNED',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

// Interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  password?: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// Schema
const userSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    emailVerified: { type: Date },
    image: { type: String },
    password: { type: String },
    phone: { type: String },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.PENDING_VERIFICATION },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, default: 'Pakistan' },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

// Model
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

// Address Schema
export interface IAddress extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, default: 'Home' },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'Pakistan' },
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

addressSchema.index({ userId: 1 });

export const Address: Model<IAddress> = mongoose.models.Address || mongoose.model<IAddress>('Address', addressSchema);

// Password Reset Token
export interface IPasswordResetToken extends Document {
  _id: mongoose.Types.ObjectId;
  token: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  used: boolean;
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    token: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

passwordResetTokenSchema.index({ userId: 1 });

export const PasswordResetToken: Model<IPasswordResetToken> =
  mongoose.models.PasswordResetToken || mongoose.model<IPasswordResetToken>('PasswordResetToken', passwordResetTokenSchema);

// Email Verification Token
export interface IEmailVerificationToken extends Document {
  _id: mongoose.Types.ObjectId;
  token: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

const emailVerificationTokenSchema = new Schema<IEmailVerificationToken>(
  {
    token: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

emailVerificationTokenSchema.index({ userId: 1 });

export const EmailVerificationToken: Model<IEmailVerificationToken> =
  mongoose.models.EmailVerificationToken || mongoose.model<IEmailVerificationToken>('EmailVerificationToken', emailVerificationTokenSchema);
