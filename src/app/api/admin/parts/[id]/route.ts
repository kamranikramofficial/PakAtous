import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Part, PartImage, PartCategory } from "@/models/Part";
import { Review } from "@/models/Review";
import { OrderItem } from "@/models/Order";
import { User } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";
import { partSchema } from "@/lib/validations";

export const dynamic = 'force-dynamic';

// Get single part (admin)
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

    const part = await Part.findById(id).lean();

    if (!part) {
      return NextResponse.json({ error: "Part not found" }, { status: 404 });
    }

    // Get images
    const images = await PartImage.find({ partId: id })
      .sort({ sortOrder: 1 })
      .lean();

    // Get category
    let category = null;
    if ((part as any).categoryId) {
      category = await PartCategory.findById((part as any).categoryId).lean();
    }

    // Get reviews with user info
    const reviews = await Review.find({ partId: id })
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
      OrderItem.countDocuments({ partId: id }),
      Review.countDocuments({ partId: id }),
    ]);

    return NextResponse.json({
      part: {
        ...part,
        id: (part as any)._id.toString(),
        images: images.map((img: any) => ({ ...img, id: img._id.toString() })),
        category,
        reviews: reviewsWithUsers,
        _count: { orderItems: orderItemsCount, reviews: reviewsCount },
      },
    });
  } catch (error) {
    console.error("Error fetching part:", error);
    return NextResponse.json(
      { error: "Failed to fetch part" },
      { status: 500 }
    );
  }
}

// Update part (admin)
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
    const validationResult = partSchema.partial().safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if part exists
    const existingPart = await Part.findById(id);

    if (!existingPart) {
      return NextResponse.json({ error: "Part not found" }, { status: 404 });
    }

    // Check if slug is being changed and if new slug already exists
    if (data.slug && data.slug !== existingPart.slug) {
      const slugExists = await Part.findOne({ slug: data.slug });
      if (slugExists) {
        return NextResponse.json(
          { error: "A part with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // Check if SKU is being changed and if new SKU already exists
    if (data.sku && data.sku !== existingPart.sku) {
      const skuExists = await Part.findOne({ sku: data.sku });
      if (skuExists) {
        return NextResponse.json(
          { error: "A part with this SKU already exists" },
          { status: 409 }
        );
      }
    }

    const { images, ...partData } = data;

    // Update part images if provided
    if (images) {
      // Delete existing images
      await PartImage.deleteMany({ partId: id });

      // Create new images
      await PartImage.insertMany(
        images.map((img: any, index: number) => ({
          partId: id,
          url: img.url,
          alt: img.alt,
          isPrimary: img.isPrimary || index === 0,
          sortOrder: index,
        }))
      );
    }

    // Update part
    const part = await Part.findByIdAndUpdate(id, partData, { new: true }).lean();

    // Get updated images and category
    const updatedImages = await PartImage.find({ partId: id }).sort({ sortOrder: 1 }).lean();
    let category = null;
    if ((part as any).categoryId) {
      category = await PartCategory.findById((part as any).categoryId).lean();
    }

    // Log action
    await AuditLog.create({
      userId: session.user.id,
      action: "UPDATE",
      entity: "PART",
      entityId: id,
      oldValues: JSON.stringify(existingPart),
      newValues: JSON.stringify(part),
    });

    return NextResponse.json({
      success: true,
      part: {
        ...part,
        id: (part as any)._id.toString(),
        images: updatedImages.map((img: any) => ({ ...img, id: img._id.toString() })),
        category,
      },
    });
  } catch (error) {
    console.error("Error updating part:", error);
    return NextResponse.json(
      { error: "Failed to update part" },
      { status: 500 }
    );
  }
}

// Delete part (admin)
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

    const part = await Part.findById(id);

    if (!part) {
      return NextResponse.json({ error: "Part not found" }, { status: 404 });
    }

    // Check if part has been ordered
    const orderItemsCount = await OrderItem.countDocuments({ partId: id });

    if (orderItemsCount > 0) {
      // Soft delete by setting isActive to false
      await Part.findByIdAndUpdate(id, { isActive: false });

      // Log action
      await AuditLog.create({
        userId: session.user.id,
        action: "SOFT_DELETE",
        entity: "PART",
        entityId: id,
        oldValues: JSON.stringify(part),
      });

      return NextResponse.json({
        success: true,
        message: "Part has been deactivated (has order history)",
      });
    }

    // Hard delete if no orders
    await PartImage.deleteMany({ partId: id });
    await Review.deleteMany({ partId: id });
    await Part.deleteOne({ _id: id });

    // Log action
    await AuditLog.create({
      userId: session.user.id,
      action: "DELETE",
      entity: "PART",
      entityId: id,
      oldValues: JSON.stringify(part),
    });

    return NextResponse.json({ success: true, message: "Part deleted" });
  } catch (error) {
    console.error("Error deleting part:", error);
    return NextResponse.json(
      { error: "Failed to delete part" },
      { status: 500 }
    );
  }
}
