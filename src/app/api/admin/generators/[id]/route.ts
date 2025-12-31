import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Generator, GeneratorImage, GeneratorCategory } from "@/models/Generator";
import { Review } from "@/models/Review";
import { OrderItem } from "@/models/Order";
import { User } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";
import { generatorSchema } from "@/lib/validations";

export const dynamic = 'force-dynamic';

// Get single generator (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const generator = await Generator.findById(id).lean();

    if (!generator) {
      return NextResponse.json(
        { error: "Generator not found" },
        { status: 404 }
      );
    }

    // Get images
    const images = await GeneratorImage.find({ generatorId: id })
      .sort({ sortOrder: 1 })
      .lean();

    // Get category
    let category = null;
    if ((generator as any).categoryId) {
      category = await GeneratorCategory.findById((generator as any).categoryId).lean();
    }

    // Get reviews with user info
    const reviews = await Review.find({ generatorId: id })
      .sort({ createdAt: -1 })
      .lean();

    const userIds = reviews.map((r: any) => r.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select('name email')
      .lean();
    const userMap = new Map(users.map((u: any) => [u._id.toString(), { name: u.name, email: u.email }]));

    const reviewsWithUsers = reviews.map((review: any) => ({
      ...review,
      id: review._id.toString(),
      user: userMap.get(review.userId.toString()) || { name: 'Unknown' },
    }));

    // Get counts
    const [orderItemsCount, reviewsCount] = await Promise.all([
      OrderItem.countDocuments({ generatorId: id }),
      Review.countDocuments({ generatorId: id }),
    ]);

    return NextResponse.json({
      generator: {
        ...generator,
        id: (generator as any)._id.toString(),
        images: images.map((img: any) => ({ ...img, id: img._id.toString() })),
        category,
        reviews: reviewsWithUsers,
        _count: { orderItems: orderItemsCount, reviews: reviewsCount },
      },
    });
  } catch (error) {
    console.error("Error fetching generator:", error);
    return NextResponse.json(
      { error: "Failed to fetch generator" },
      { status: 500 }
    );
  }
}

// Update generator (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validationResult = generatorSchema.partial().safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if generator exists
    const existingGenerator = await Generator.findById(id);

    if (!existingGenerator) {
      return NextResponse.json(
        { error: "Generator not found" },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if new slug already exists
    if (data.slug && data.slug !== existingGenerator.slug) {
      const slugExists = await Generator.findOne({ slug: data.slug });
      if (slugExists) {
        return NextResponse.json(
          { error: "A generator with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // Check if SKU is being changed and if new SKU already exists
    if (data.sku && data.sku !== existingGenerator.sku) {
      const skuExists = await Generator.findOne({ sku: data.sku });
      if (skuExists) {
        return NextResponse.json(
          { error: "A generator with this SKU already exists" },
          { status: 409 }
        );
      }
    }

    const { images, ...generatorData } = data;

    // Update generator images if provided
    if (images) {
      // Delete existing images
      await GeneratorImage.deleteMany({ generatorId: id });

      // Create new images
      await GeneratorImage.insertMany(
        images.map((img: any, index: number) => ({
          generatorId: id,
          url: img.url,
          alt: img.alt,
          isPrimary: img.isPrimary || index === 0,
          sortOrder: index,
        }))
      );
    }

    // Update generator
    const generator = await Generator.findByIdAndUpdate(id, generatorData, { new: true }).lean();

    // Get updated images and category
    const updatedImages = await GeneratorImage.find({ generatorId: id }).sort({ sortOrder: 1 }).lean();
    let category = null;
    if ((generator as any).categoryId) {
      category = await GeneratorCategory.findById((generator as any).categoryId).lean();
    }

    // Log action
    await AuditLog.create({
      userId: session.user.id,
      action: "UPDATE",
      entity: "GENERATOR",
      entityId: id,
      oldValues: JSON.stringify(existingGenerator),
      newValues: JSON.stringify(generator),
    });

    return NextResponse.json({
      success: true,
      generator: {
        ...generator,
        id: (generator as any)._id.toString(),
        images: updatedImages.map((img: any) => ({ ...img, id: img._id.toString() })),
        category,
      },
    });
  } catch (error) {
    console.error("Error updating generator:", error);
    return NextResponse.json(
      { error: "Failed to update generator" },
      { status: 500 }
    );
  }
}

// Delete generator (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const generator = await Generator.findById(id);

    if (!generator) {
      return NextResponse.json(
        { error: "Generator not found" },
        { status: 404 }
      );
    }

    // Check if generator has been ordered
    const orderItemsCount = await OrderItem.countDocuments({ generatorId: id });

    if (orderItemsCount > 0) {
      // Soft delete by setting isActive to false
      await Generator.findByIdAndUpdate(id, { isActive: false });

      // Log action
      await AuditLog.create({
        userId: session.user.id,
        action: "SOFT_DELETE",
        entity: "GENERATOR",
        entityId: id,
        oldValues: JSON.stringify(generator),
      });

      return NextResponse.json({
        success: true,
        message: "Generator has been deactivated (has order history)",
      });
    }

    // Hard delete if no orders
    await GeneratorImage.deleteMany({ generatorId: id });
    await Review.deleteMany({ generatorId: id });
    await Generator.deleteOne({ _id: id });

    // Log action
    await AuditLog.create({
      userId: session.user.id,
      action: "DELETE",
      entity: "GENERATOR",
      entityId: id,
      oldValues: JSON.stringify(generator),
    });

    return NextResponse.json({ success: true, message: "Generator deleted" });
  } catch (error) {
    console.error("Error deleting generator:", error);
    return NextResponse.json(
      { error: "Failed to delete generator" },
      { status: 500 }
    );
  }
}
