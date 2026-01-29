import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Review } from "@/models/Review";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    const itemType = searchParams.get("itemType"); // GENERATOR or PART

    if (!itemId || !itemType) {
      return NextResponse.json({ error: "Missing itemId or itemType" }, { status: 400 });
    }

    const query: any = { isApproved: true };
    if (itemType === "GENERATOR") {
        query.generatorId = itemId;
    } else if (itemType === "PART") {
        query.partId = itemId;
    } else {
         return NextResponse.json({ error: "Invalid itemType" }, { status: 400 });
    }

    const reviews = await Review.find(query)
      .populate("userId", "name image")
      .sort({ createdAt: -1 });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { itemId, itemType, rating, comment, title } = body;

    if (!itemId || !itemType || !rating || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reviewData: any = {
      userId: session.user.id,
      itemType,
      rating,
      comment,
      title,
      isApproved: true, // Auto-approve for user satisfaction
      isVerifiedPurchase: false, // Default to false unless checked
    };

    if (itemType === "GENERATOR") {
        reviewData.generatorId = itemId;
    } else if (itemType === "PART") {
         reviewData.partId = itemId;
    } else {
        return NextResponse.json({ error: "Invalid itemType" }, { status: 400 });
    }

    const review = await Review.create(reviewData);

    return NextResponse.json(review);
  } catch (error) {
     console.error("Error creating review:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
