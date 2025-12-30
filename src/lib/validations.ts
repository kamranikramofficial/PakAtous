import { z } from "zod";

// ==================== AUTH SCHEMAS ====================

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ==================== ADDRESS SCHEMAS ====================

export const addressSchema = z.object({
  label: z.string().default("Home"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  country: z.string().default("Pakistan"),
  isDefault: z.boolean().default(false),
});

// ==================== GENERATOR SCHEMAS ====================

export const generatorSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  shortDescription: z.string().optional(),
  powerKva: z.coerce.number().positive("Power (kVA) must be positive"),
  powerKw: z.coerce.number().positive("Power (kW) must be positive"),
  fuelType: z.enum(["DIESEL", "PETROL", "GAS", "DUAL_FUEL", "NATURAL_GAS"]),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().optional(),
  modelName: z.string().optional(),
  condition: z.enum(["NEW", "REFURBISHED", "USED"]).default("NEW"),
  price: z.coerce.number().positive("Price must be positive"),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  costPrice: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().optional(),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  warranty: z.string().optional(),
  weight: z.coerce.number().positive().optional().nullable(),
  dimensions: z.string().optional(),
  engineBrand: z.string().optional(),
  alternatorBrand: z.string().optional(),
  startingSystem: z.string().optional(),
  voltage: z.string().optional(),
  frequency: z.string().default("50Hz"),
  phase: z.string().default("Single Phase"),
  noiseLevel: z.string().optional(),
  fuelConsumption: z.string().optional(),
  tankCapacity: z.coerce.number().positive().optional().nullable(),
  runtime: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    isPrimary: z.boolean().default(false),
  })).optional(),
});

// ==================== PART SCHEMAS ====================

export const partSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens").optional(),
  description: z.string().optional().default(""),
  shortDescription: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  costPrice: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().optional(),
  lowStockThreshold: z.coerce.number().int().min(0).default(10),
  partNumber: z.string().optional(),
  brand: z.string().optional(),
  weight: z.coerce.number().positive().optional().nullable(),
  dimensions: z.string().optional(),
  compatibility: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().optional().nullable().transform(val => val === '' ? undefined : val),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    isPrimary: z.boolean().default(false),
  })).optional(),
});

// ==================== CATEGORY SCHEMAS ====================

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  parentId: z.string().optional().nullable().transform(val => val === '' ? undefined : val),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

// ==================== SERVICE REQUEST SCHEMAS ====================

export const serviceRequestSchema = z.object({
  contactName: z.string().min(2, "Name is required"),
  contactPhone: z.string().min(10, "Valid phone number is required"),
  contactEmail: z.string().email("Valid email is required"),
  serviceAddress: z.string().min(5, "Service address is required"),
  serviceCity: z.string().min(2, "City is required"),
  serviceState: z.string().min(2, "State is required"),
  serviceType: z.enum(["REPAIR", "MAINTENANCE", "INSTALLATION", "INSPECTION", "EMERGENCY", "OTHER"]),
  generatorBrand: z.string().optional(),
  generatorModel: z.string().optional(),
  generatorSerial: z.string().optional(),
  problemTitle: z.string().min(5, "Problem title is required"),
  problemDescription: z.string().min(20, "Please describe the problem in detail"),
  preferredDate: z.coerce.date().optional().nullable(),
  images: z.array(z.string().url()).optional(),
});

export const updateServiceRequestSchema = z.object({
  status: z.enum(["PENDING", "REVIEWING", "QUOTED", "QUOTE_SENT", "APPROVED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  adminNotes: z.string().optional(),
  diagnosis: z.string().optional(),
  estimatedCost: z.coerce.number().positive().optional().nullable(),
  finalCost: z.coerce.number().positive().optional().nullable(),
  scheduledDate: z.coerce.date().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
});

// ==================== ORDER SCHEMAS ====================

const checkoutItemSchema = z.object({
  itemType: z.enum(["GENERATOR", "PART"]),
  productId: z.string(),
  quantity: z.number().int().positive(),
});

export const checkoutSchema = z.object({
  shippingAddressId: z.string().optional(),
  shippingName: z.string().min(2, "Name is required"),
  shippingPhone: z.string().min(10, "Valid phone number is required"),
  shippingEmail: z.string().email("Valid email is required"),
  shippingAddressLine: z.string().min(5, "Address is required"),
  shippingCity: z.string().min(2, "City is required"),
  shippingState: z.string().min(2, "State is required"),
  shippingPostalCode: z.string().min(4, "Postal code is required"),
  shippingCountry: z.string().default("Pakistan"),
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "STRIPE", "BANK_TRANSFER"]),
  customerNotes: z.string().optional(),
  couponCode: z.string().optional(),
  items: z.array(checkoutItemSchema).min(1, "Cart is empty").optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUNDED"]),
  adminNotes: z.string().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  estimatedDelivery: z.coerce.date().optional().nullable(),
});

// ==================== CART SCHEMAS ====================

export const addToCartSchema = z.object({
  itemType: z.enum(["GENERATOR", "PART"]),
  generatorId: z.string().optional(),
  partId: z.string().optional(),
  quantity: z.coerce.number().int().positive().default(1),
}).refine(
  (data) => (data.itemType === "GENERATOR" && data.generatorId) || (data.itemType === "PART" && data.partId),
  { message: "Product ID is required" }
);

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
});

// ==================== REVIEW SCHEMAS ====================

export const reviewSchema = z.object({
  itemType: z.enum(["GENERATOR", "PART"]),
  generatorId: z.string().optional(),
  partId: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(10, "Review must be at least 10 characters"),
}).refine(
  (data) => (data.itemType === "GENERATOR" && data.generatorId) || (data.itemType === "PART" && data.partId),
  { message: "Product ID is required" }
);

// ==================== COUPON SCHEMAS ====================

export const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  value: z.coerce.number().positive("Value must be positive"),
  minOrderAmount: z.coerce.number().min(0).optional().nullable(),
  maxDiscount: z.coerce.number().positive().optional().nullable(),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
  perUserLimit: z.coerce.number().int().positive().default(1),
  startsAt: z.coerce.date(),
  expiresAt: z.coerce.date().optional().nullable(),
  isActive: z.boolean().default(true),
  appliesToGenerators: z.boolean().default(true),
  appliesToParts: z.boolean().default(true),
});

// ==================== CONTACT SCHEMAS ====================

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// ==================== BANNER SCHEMAS ====================

export const bannerSchema = z.object({
  title: z.string().min(2, "Title is required"),
  subtitle: z.string().optional(),
  image: z.string().url("Valid image URL is required"),
  link: z.string().optional(),
  buttonText: z.string().optional(),
  position: z.string().default("home"),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional().nullable(),
});

// ==================== TYPE EXPORTS ====================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type GeneratorInput = z.infer<typeof generatorSchema>;
export type PartInput = z.infer<typeof partSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>;
export type UpdateServiceRequestInput = z.infer<typeof updateServiceRequestSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type BannerInput = z.infer<typeof bannerSchema>;
