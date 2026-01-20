import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/prisma";
import { Generator, GeneratorImage, GeneratorCategory } from "@/models/Generator";
import { Part, PartImage } from "@/models/Part";
import { Review } from "@/models/Review";
import { User } from "@/models/User";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();

    const { slug } = params;
    
    const generator = await Generator.findOne({ 
      slug: slug, 
      isActive: true 
    }).lean();

    if (!generator) {
      return NextResponse.json(
        { error: "Generator not found" },
        { status: 404 }
      );
    }

    // Get images
    const images = await GeneratorImage.find({ generatorId: (generator as any)._id })
      .sort({ isPrimary: -1, sortOrder: 1 })
      .lean();

    // Get category
    let category = null;
    if ((generator as any).categoryId) {
      category = await GeneratorCategory.findById((generator as any).categoryId).lean();
    }

    // Get approved reviews with user info
    const reviews = await Review.find({ 
      generatorId: (generator as any)._id,
      isApproved: true 
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get user info for reviews
    const userIds = reviews.map((r: any) => r.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select('name image')
      .lean();
    const userMap = new Map(users.map((u: any) => [u._id.toString(), { name: u.name, image: u.image }]));

    const reviewsWithUsers = reviews.map((review: any) => ({
      ...review,
      id: review._id.toString(),
      user: userMap.get(review.userId.toString()) || { name: 'Anonymous' },
    }));

    // Get compatible parts
    const compatibleParts = await Part.find({ 
      isActive: true,
      compatibleGenerators: (generator as any)._id,
    })
      .limit(6)
      .lean();

    // Get images for compatible parts
    const partImages = await PartImage.find({
      partId: { $in: compatibleParts.map((p: any) => p._id) },
      isPrimary: true,
    }).lean();
    const partImageMap = new Map(partImages.map((img: any) => [img.partId.toString(), img]));

    const partsWithImages = compatibleParts.map((part: any) => ({
      ...part,
      id: part._id.toString(),
      images: partImageMap.has(part._id.toString()) ? [partImageMap.get(part._id.toString())] : [],
    }));

    // Get review statistics
    const reviewStats = await Review.aggregate([
      { $match: { generatorId: (generator as any)._id, isApproved: true } },
      { 
        $group: { 
          _id: null, 
          avgRating: { $avg: "$rating" }, 
          count: { $sum: 1 } 
        } 
      },
    ]);

    // Get related generators
    const relatedGenerators = await Generator.find({
      isActive: true,
      _id: { $ne: (generator as any)._id },
      $or: [
        { brand: (generator as any).brand },
        { fuelType: (generator as any).fuelType },
        { categoryId: (generator as any).categoryId },
      ],
    })
      .limit(4)
      .lean();

    // Get images for related generators
    const relatedImages = await GeneratorImage.find({
      generatorId: { $in: relatedGenerators.map((g: any) => g._id) },
      isPrimary: true,
    }).lean();
    const relatedImageMap = new Map(relatedImages.map((img: any) => [img.generatorId.toString(), img]));

    const relatedWithImages = relatedGenerators.map((g: any) => ({
      ...g,
      id: g._id.toString(),
      images: relatedImageMap.has(g._id.toString()) ? [relatedImageMap.get(g._id.toString())] : [],
    }));

    return NextResponse.json({
      generator: {
        ...generator,
        id: (generator as any)._id.toString(),
        images: images.map((img: any) => ({ ...img, id: img._id.toString() })),
        category,
        reviews: reviewsWithUsers,
        compatibleParts: partsWithImages,
      },
      reviewStats: {
        averageRating: reviewStats[0]?.avgRating || 0,
        totalReviews: reviewStats[0]?.count || 0,
      },
      relatedGenerators: relatedWithImages,
    });
  } catch (error) {
    console.error("Error fetching generator:", error);
    return NextResponse.json(
      { error: "Failed to fetch generator" },
      { status: 500 }
    );
  }
}
