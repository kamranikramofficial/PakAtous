import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Generator, GeneratorImage } from "@/models/Generator";
import { OrderItem } from "@/models/Order";
import { Review } from "@/models/Review";
import { AuditLog } from "@/models/AuditLog";
import { generatorSchema } from "@/lib/validations";

// Get all generators (admin/staff)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }
    
    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;
    if (status === "low-stock") {
      query.$expr = { $lte: ["$stock", "$lowStockThreshold"] };
    }

    const [generators, total] = await Promise.all([
      Generator.find(query)
        .populate("categoryId")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Generator.countDocuments(query),
    ]);

    // Get images for each generator
    const generatorIds = generators.map((g: any) => g._id);
    const images = await GeneratorImage.find({ generatorId: { $in: generatorIds } })
      .sort({ sortOrder: 1 })
      .lean();

    // Get order items count and reviews count for each generator
    const [orderItemsCounts, reviewsCounts] = await Promise.all([
      OrderItem.aggregate([
        { $match: { generatorId: { $in: generatorIds } } },
        { $group: { _id: "$generatorId", count: { $sum: "$quantity" } } }
      ]),
      Review.aggregate([
        { $match: { generatorId: { $in: generatorIds } } },
        { $group: { _id: "$generatorId", count: { $sum: 1 } } }
      ]),
    ]);

    const orderItemsMap = orderItemsCounts.reduce((acc: any, curr: any) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    const reviewsMap = reviewsCounts.reduce((acc: any, curr: any) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    const generatorsWithImages = generators.map((g: any) => ({
      ...g,
      id: g._id.toString(),
      images: images.filter((img: any) => img.generatorId.toString() === g._id.toString()),
      category: g.categoryId,
      _count: {
        orderItems: orderItemsMap[g._id.toString()] || 0,
        reviews: reviewsMap[g._id.toString()] || 0,
      },
    }));

    return NextResponse.json({
      generators: generatorsWithImages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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

// Create new generator (admin)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const validationResult = generatorSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if slug already exists
    const existingGenerator = await Generator.findOne({ slug: data.slug });

    if (existingGenerator) {
      return NextResponse.json(
        { error: "A generator with this slug already exists" },
        { status: 409 }
      );
    }

    // Check if SKU already exists
    if (data.sku) {
      const existingSku = await Generator.findOne({ sku: data.sku });
      if (existingSku) {
        return NextResponse.json(
          { error: "A generator with this SKU already exists" },
          { status: 409 }
        );
      }
    }

    const { images, ...generatorData } = data;

    const generator = await Generator.create(generatorData);

    // Create images if provided
    if (images?.length) {
      const imageDocuments = images.map((img: any, index: number) => ({
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary || index === 0,
        sortOrder: index,
        generatorId: generator._id,
      }));
      await GeneratorImage.insertMany(imageDocuments);
    }

    const populatedGenerator = await Generator.findById(generator._id)
      .populate("categoryId")
      .lean();

    const generatorImages = await GeneratorImage.find({ generatorId: generator._id })
      .sort({ sortOrder: 1 })
      .lean();

    // Log action
    await AuditLog.create({
      userId: session.user.id,
      action: "CREATE",
      entity: "GENERATOR",
      entityId: generator._id.toString(),
      newValues: JSON.stringify(generator),
    });

    return NextResponse.json({ 
      success: true, 
      generator: {
        ...populatedGenerator,
        id: generator._id.toString(),
        images: generatorImages,
        category: (populatedGenerator as any)?.categoryId,
      }
    });
  } catch (error) {
    console.error("Error creating generator:", error);
    return NextResponse.json(
      { error: "Failed to create generator" },
      { status: 500 }
    );
  }
}
