import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/prisma";
import { Part, PartImage, PartCategory } from "@/models/Part";
import { Review } from "@/models/Review";
import { User } from "@/models/User";

// GET /api/parts/[slug] - Get single part by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    
    const { slug } = await params;

    const part = await Part.findOne({ slug }).lean();

    if (!part || !(part as any).isActive) {
      return NextResponse.json({ error: "Part not found" }, { status: 404 });
    }

    // Get part images
    const images = await PartImage.find({ partId: (part as any)._id })
      .sort({ sortOrder: 1 })
      .lean();

    // Get category
    let category = null;
    if ((part as any).categoryId) {
      category = await PartCategory.findById((part as any).categoryId)
        .select('name slug')
        .lean();
    }

    // Get approved reviews with user info
    const reviews = await Review.find({ 
      partId: (part as any)._id,
      isApproved: true 
    })
      .sort({ createdAt: -1 })
      .lean();

    // Get user names for reviews
    const userIds = reviews.map((r: any) => r.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select('name')
      .lean();
    const userMap = new Map(users.map((u: any) => [u._id.toString(), u.name]));

    const reviewsWithUsers = reviews.map((review: any) => ({
      ...review,
      id: review._id.toString(),
      user: {
        name: userMap.get(review.userId.toString()) || 'Anonymous',
      },
    }));

    // Count total reviews
    const reviewCount = await Review.countDocuments({ partId: (part as any)._id });

    return NextResponse.json({
      ...part,
      id: (part as any)._id.toString(),
      images: images.map((img: any) => ({
        ...img,
        id: img._id.toString(),
      })),
      category: category ? {
        name: (category as any).name,
        slug: (category as any).slug,
      } : null,
      reviews: reviewsWithUsers,
      _count: {
        reviews: reviewCount,
      },
    });
  } catch (error) {
    console.error("Error fetching part:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
