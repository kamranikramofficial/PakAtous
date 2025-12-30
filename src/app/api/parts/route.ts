import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/prisma";
import { Part, PartImage, PartCategory } from "@/models/Part";
import { Review } from "@/models/Review";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search");
    const brand = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const categoryId = searchParams.get("categoryId");
    const featured = searchParams.get("featured") === "true";
    const inStock = searchParams.get("inStock") === "true";

    // Sorting
    const sort = searchParams.get("sort") || "newest";
    
    let sortOptions: any = { createdAt: -1 };
    switch (sort) {
      case "price-low":
        sortOptions = { price: 1 };
        break;
      case "price-high":
        sortOptions = { price: -1 };
        break;
      case "name":
        sortOptions = { name: 1 };
        break;
      case "popular":
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Build query
    const query: any = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { partNumber: { $regex: search, $options: "i" } },
        { compatibility: { $regex: search, $options: "i" } },
      ];
    }
    
    if (brand) query.brand = { $regex: `^${brand}$`, $options: "i" };
    if (minPrice) query.price = { ...query.price, $gte: parseFloat(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };
    if (categoryId) query.categoryId = categoryId;
    if (featured) query.isFeatured = true;
    if (inStock) query.stock = { $gt: 0 };

    // Execute queries
    const [parts, total] = await Promise.all([
      Part.find(query)
        .populate("categoryId")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Part.countDocuments(query),
    ]);

    // Get images for each part
    const partIds = parts.map((p: any) => p._id);
    const images = await PartImage.find({ partId: { $in: partIds } })
      .sort({ isPrimary: -1, sortOrder: 1 })
      .lean();

    // Get review counts for each part
    const reviewCounts = await Review.aggregate([
      { $match: { partId: { $in: partIds }, isApproved: true } },
      { $group: { _id: "$partId", count: { $sum: 1 } } }
    ]);

    const reviewCountMap = reviewCounts.reduce((acc: any, curr: any) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    const partsWithData = parts.map((p: any) => ({
      ...p,
      id: p._id.toString(),
      images: images.filter((img: any) => img.partId.toString() === p._id.toString()),
      category: p.categoryId,
      _count: { reviews: reviewCountMap[p._id.toString()] || 0 },
    }));

    // Get filter options
    const [brandsAgg, priceRangeAgg, categories] = await Promise.all([
      Part.aggregate([
        { $match: { isActive: true, brand: { $ne: null } } },
        { $group: { _id: "$brand", count: { $sum: 1 } } }
      ]),
      Part.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } }
      ]),
      PartCategory.find({ isActive: true })
        .select("name slug")
        .lean(),
    ]);

    return NextResponse.json({
      parts: partsWithData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        brands: brandsAgg
          .filter((b: any) => b._id)
          .map((b: any) => ({ name: b._id, count: b.count })),
        priceRange: {
          min: priceRangeAgg[0]?.min || 0,
          max: priceRangeAgg[0]?.max || 0,
        },
        categories: categories.map((c: any) => ({ id: c._id.toString(), name: c.name, slug: c.slug })),
      },
    });
  } catch (error) {
    console.error("Error fetching parts:", error);
    return NextResponse.json(
      { error: "Failed to fetch parts" },
      { status: 500 }
    );
  }
}
