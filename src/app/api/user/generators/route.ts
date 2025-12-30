import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { UserGenerator } from "@/models/UserGenerator";
import { z } from "zod";

const createListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  brand: z.string().min(2, "Brand is required"),
  generatorModel: z.string().min(1, "Model is required"),
  year: z.union([z.number().int().min(1990).max(new Date().getFullYear()), z.null()]).optional(),
  condition: z.string().min(1, "Condition is required"),
  power: z.string().optional().default(""),
  fuelType: z.string().optional().default(""),
  engineType: z.string().optional().default(""),
  runningHours: z.union([z.number().int().min(0), z.null()]).optional(),
  serialNumber: z.string().optional().default(""),
  askingPrice: z.number({ invalid_type_error: "Asking price is required" }).positive("Asking price must be positive"),
  negotiable: z.boolean().default(true),
  description: z.string().min(10, "Description must be at least 10 characters"),
  reasonForSelling: z.string().optional().default(""),
  images: z.array(z.object({
    url: z.string().url(),
    isPrimary: z.boolean().default(false),
  })).optional().default([]),
  contactName: z.string().min(2, "Contact name is required"),
  contactPhone: z.string().min(10, "Valid phone number is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactCity: z.string().min(2, "City is required"),
  contactAddress: z.string().optional().default(""),
});

// GET - Get user's own listings
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const listings = await UserGenerator.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      listings: listings.map((l: any) => ({
        ...l,
        id: l._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching user listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

// POST - Create new listing
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    console.log("Received body:", JSON.stringify(body, null, 2));
    
    const validationResult = createListingSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.log("Validation errors:", validationResult.error.errors);
      return NextResponse.json(
        { error: validationResult.error.errors[0].message, details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if user has too many pending listings
    const pendingCount = await UserGenerator.countDocuments({
      userId: session.user.id,
      status: "PENDING",
    });

    if (pendingCount >= 5) {
      return NextResponse.json(
        { error: "You have too many pending listings. Please wait for review." },
        { status: 400 }
      );
    }

    const listing = await UserGenerator.create({
      ...data,
      userId: session.user.id,
      status: "PENDING",
    });

    return NextResponse.json({
      success: true,
      listing: {
        ...listing.toObject(),
        id: listing._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
