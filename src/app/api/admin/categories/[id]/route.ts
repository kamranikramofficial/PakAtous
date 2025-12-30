import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { GeneratorCategory, Generator } from "@/models/Generator";
import { PartCategory, Part } from "@/models/Part";
import { AuditLog } from "@/models/AuditLog";
import { z } from "zod";

const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  type: z.enum(["generator", "part"]).optional(),
});

// Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "generator";

    const Model = type === "generator" ? GeneratorCategory : PartCategory;
    const category = await Model.findById(id).lean();

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({
      category: {
        ...category,
        id: (category as any)._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const body = await request.json();
    const validationResult = updateCategorySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { type = "generator", ...data } = validationResult.data;
    const Model = type === "generator" ? GeneratorCategory : PartCategory;

    const existingCategory = await Model.findById(id);
    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check if new slug already exists
    if (data.slug && data.slug !== existingCategory.slug) {
      const slugExists = await Model.findOne({ slug: data.slug });
      if (slugExists) {
        return NextResponse.json(
          { error: "A category with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // Prevent setting parent to self or child
    if (data.parentId === id) {
      return NextResponse.json(
        { error: "Category cannot be its own parent" },
        { status: 400 }
      );
    }

    const updateData: any = { ...data };
    if (data.parentId === null || data.parentId === "") {
      updateData.parentId = null;
    }

    const category = await Model.findByIdAndUpdate(id, updateData, { new: true }).lean();

    // Log action
    await AuditLog.create({
      userId: session.user.id,
      action: "UPDATE",
      entity: type === "generator" ? "GENERATOR_CATEGORY" : "PART_CATEGORY",
      entityId: id,
      oldValues: JSON.stringify({
        name: existingCategory.name,
        slug: existingCategory.slug,
        isActive: existingCategory.isActive,
      }),
      newValues: JSON.stringify(data),
    });

    return NextResponse.json({
      category: {
        ...category,
        id: (category as any)._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "generator";

    const CategoryModel = type === "generator" ? GeneratorCategory : PartCategory;
    const ProductModel = type === "generator" ? Generator : Part;

    const category = await CategoryModel.findById(id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check if category has products
    const productCount = await ProductModel.countDocuments({ categoryId: id });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${productCount} associated products` },
        { status: 400 }
      );
    }

    // Check if category has children
    const childCount = await CategoryModel.countDocuments({ parentId: id });
    if (childCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with subcategories" },
        { status: 400 }
      );
    }

    await CategoryModel.findByIdAndDelete(id);

    // Log action
    await AuditLog.create({
      userId: session.user.id,
      action: "DELETE",
      entity: type === "generator" ? "GENERATOR_CATEGORY" : "PART_CATEGORY",
      entityId: id,
      oldValues: JSON.stringify({
        name: category.name,
        slug: category.slug,
      }),
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
