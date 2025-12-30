import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/prisma";
import { Generator, GeneratorImage, FuelType, GeneratorCondition } from "@/models/Generator";
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
    const fuelType = searchParams.get("fuelType");
    const condition = searchParams.get("condition");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minPower = searchParams.get("minPower");
    const maxPower = searchParams.get("maxPower");
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
      case "power-low":
        sortOptions = { powerKva: 1 };
        break;
      case "power-high":
        sortOptions = { powerKva: -1 };
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
        { modelName: { $regex: search, $options: "i" } },
      ];
    }
    
    if (brand) query.brand = { $regex: `^${brand}$`, $options: "i" };
    if (fuelType) query.fuelType = fuelType;
    if (condition) query.condition = condition;
    if (minPrice) query.price = { ...query.price, $gte: parseFloat(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };
    if (minPower) query.powerKva = { ...query.powerKva, $gte: parseFloat(minPower) };
    if (maxPower) query.powerKva = { ...query.powerKva, $lte: parseFloat(maxPower) };
    if (categoryId) query.categoryId = categoryId;
    if (featured) query.isFeatured = true;
    if (inStock) query.stock = { $gt: 0 };

    // Execute queries
    const [generators, total] = await Promise.all([
      Generator.find(query)
        .populate("categoryId")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Generator.countDocuments(query),
    ]);

    // Get images for each generator
    const generatorIds = generators.map((g: any) => g._id);
    const images = await GeneratorImage.find({ generatorId: { $in: generatorIds } })
      .sort({ isPrimary: -1, sortOrder: 1 })
      .lean();

    // Get review counts for each generator
    const reviewCounts = await Review.aggregate([
      { $match: { generatorId: { $in: generatorIds }, isApproved: true } },
      { $group: { _id: "$generatorId", count: { $sum: 1 } } }
    ]);

    const reviewCountMap = reviewCounts.reduce((acc: any, curr: any) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    const generatorsWithData = generators.map((g: any) => ({
      ...g,
      id: g._id.toString(),
      images: images.filter((img: any) => img.generatorId.toString() === g._id.toString()),
      category: g.categoryId,
      _count: { reviews: reviewCountMap[g._id.toString()] || 0 },
    }));

    // Get filter options
    const [brandsAgg, priceRangeAgg, powerRangeAgg] = await Promise.all([
      Generator.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$brand", count: { $sum: 1 } } }
      ]),
      Generator.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } }
      ]),
      Generator.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, min: { $min: "$powerKva" }, max: { $max: "$powerKva" } } }
      ]),
    ]);

    return NextResponse.json({
      generators: generatorsWithData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        brands: brandsAgg.map((b: any) => ({ name: b._id, count: b.count })),
        priceRange: {
          min: priceRangeAgg[0]?.min || 0,
          max: priceRangeAgg[0]?.max || 0,
        },
        powerRange: {
          min: powerRangeAgg[0]?.min || 0,
          max: powerRangeAgg[0]?.max || 0,
        },
        fuelTypes: Object.values(FuelType),
        conditions: Object.values(GeneratorCondition),
      },
    });
  } catch (error) {
    console.error("Error fetching generators:", error);
    return NextResponse.json(
      { error: "Failed to fetch generators" },
      { status: 500 }
    );
  }
}
