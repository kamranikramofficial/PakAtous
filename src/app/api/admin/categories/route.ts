import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { GeneratorCategory } from "@/models/Generator";
import { PartCategory } from "@/models/Part";
import { AuditLog } from "@/models/AuditLog";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  description: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  type: z.enum(["generator", "part"]),
});

// Get all categories (admin)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "generator";

    const Model = type === "generator" ? GeneratorCategory : PartCategory;
    
    const categories = await Model.find({})
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Get parent names
    const categoriesWithParent = await Promise.all(
      categories.map(async (cat: any) => {
        let parent = null;
        if (cat.parentId) {
          parent = await Model.findById(cat.parentId).select('name').lean();
        }
        return {
          ...cat,
          id: cat._id.toString(),
          parent: parent ? { name: (parent as any).name } : null,
        };
      })
    );

    return NextResponse.json({ categories: categoriesWithParent });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// Create category (admin)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const validationResult = categorySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { type, ...data } = validationResult.data;
    const Model = type === "generator" ? GeneratorCategory : PartCategory;

    // Check if slug already exists
    const existingCategory = await Model.findOne({ slug: data.slug });
    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 }
      );
    }

    const category = await Model.create({
      ...data,
      parentId: data.parentId || null,
    });

    // Log action
    await AuditLog.create({
      userId: session.user.id,
      action: "CREATE",
      entity: type === "generator" ? "GENERATOR_CATEGORY" : "PART_CATEGORY",
      entityId: category._id.toString(),
      newValues: JSON.stringify(data),
    });

    return NextResponse.json({
      category: {
        ...category.toObject(),
        id: category._id.toString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
