import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Part, PartImage } from "@/models/Part";
import { AuditLog } from "@/models/AuditLog";
import { partSchema } from "@/lib/validations";

export const dynamic = 'force-dynamic';

// Get all parts (admin/staff)
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
    const categoryId = searchParams.get("categoryId");

    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { partNumber: { $regex: search, $options: "i" } },
      ];
    }
    
    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;
    if (status === "low-stock") query.stock = { $lte: 5 };
    if (categoryId) query.categoryId = categoryId;

    const [parts, total] = await Promise.all([
      Part.find(query)
        .populate("categoryId")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Part.countDocuments(query),
    ]);

    // Get images for each part
    const partIds = parts.map((p: any) => p._id);
    const images = await PartImage.find({ partId: { $in: partIds } })
      .sort({ sortOrder: 1 })
      .lean();

    const partsWithImages = parts.map((p: any) => ({
      ...p,
      id: p._id.toString(),
      images: images.filter((img: any) => img.partId.toString() === p._id.toString()),
      category: p.categoryId,
    }));

    return NextResponse.json({
      parts: partsWithImages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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

// Create new part (admin)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    
    // Auto-generate slug from name if not provided
    if (!body.slug && body.name) {
      let baseSlug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Check if slug exists and make it unique
      let slug = baseSlug;
      let counter = 1;
      while (await Part.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      body.slug = slug;
    }
    
    const validationResult = partSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if slug already exists
    const existingPart = await Part.findOne({ slug: data.slug });

    if (existingPart) {
      return NextResponse.json(
        { error: "A part with this slug already exists" },
        { status: 409 }
      );
    }

    // Check if SKU already exists
    if (data.sku) {
      const existingSku = await Part.findOne({ sku: data.sku });
      if (existingSku) {
        return NextResponse.json(
          { error: "A part with this SKU already exists" },
          { status: 409 }
        );
      }
    }

    // Check if part number already exists
    if (data.partNumber) {
      const existingPartNumber = await Part.findOne({ partNumber: data.partNumber });
      if (existingPartNumber) {
        return NextResponse.json(
          { error: "A part with this part number already exists" },
          { status: 409 }
        );
      }
    }

    const { images, ...partData } = data;

    // Clean up empty string fields that should be ObjectId or null
    if (partData.categoryId === '' || partData.categoryId === null) {
      delete partData.categoryId;
    }

    const part = await Part.create(partData);

    // Create images if provided
    if (images?.length) {
      const imageDocuments = images.map((img: any, index: number) => ({
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary || index === 0,
        sortOrder: index,
        partId: part._id,
      }));
      await PartImage.insertMany(imageDocuments);
    }

    const populatedPart = await Part.findById(part._id)
      .populate("categoryId")
      .lean();

    const partImages = await PartImage.find({ partId: part._id })
      .sort({ sortOrder: 1 })
      .lean();

    // Log action
    await AuditLog.create({
      userId: session.user.id,
      action: "CREATE",
      entity: "PART",
      entityId: part._id.toString(),
      newValues: JSON.stringify(part),
    });

    return NextResponse.json({ 
      success: true, 
      part: {
        ...populatedPart,
        id: part._id.toString(),
        images: partImages,
        category: (populatedPart as any)?.categoryId,
      }
    });
  } catch (error) {
    console.error("Error creating part:", error);
    return NextResponse.json(
      { error: "Failed to create part" },
      { status: 500 }
    );
  }
}
