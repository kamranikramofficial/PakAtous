import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { Cart, CartItem } from "@/models/Cart";
import { Generator, GeneratorImage } from "@/models/Generator";
import { Part, PartImage } from "@/models/Part";
import { addToCartSchema, updateCartItemSchema } from "@/lib/validations";

// Get user's cart
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    let cart = await Cart.findOne({ userId: session.user.id }).lean();

    if (!cart) {
      // Create cart if it doesn't exist
      const newCart = await Cart.create({ userId: session.user.id, items: [] });
      return NextResponse.json({ cart: { ...newCart.toObject(), id: newCart._id.toString(), items: [], subtotal: 0 } });
    }

    // Get items with product details
    const items = await CartItem.find({ cartId: cart._id }).lean();
    
    // Get all generators and parts
    const generatorIds = items.filter((i: any) => i.itemType === "GENERATOR").map((i: any) => i.generatorId);
    const partIds = items.filter((i: any) => i.itemType === "PART").map((i: any) => i.partId);

    const [generators, parts, generatorImages, partImages] = await Promise.all([
      Generator.find({ _id: { $in: generatorIds } }).lean(),
      Part.find({ _id: { $in: partIds } }).lean(),
      GeneratorImage.find({ generatorId: { $in: generatorIds }, isPrimary: true }).lean(),
      PartImage.find({ partId: { $in: partIds }, isPrimary: true }).lean(),
    ]);

    // Map products to items
    const itemsWithProducts = items.map((item: any) => {
      let product: any = null;
      if (item.itemType === "GENERATOR") {
        product = generators.find((g: any) => g._id.toString() === item.generatorId?.toString());
        if (product) {
          product.images = generatorImages.filter((img: any) => img.generatorId.toString() === product._id.toString());
        }
      } else {
        product = parts.find((p: any) => p._id.toString() === item.partId?.toString());
        if (product) {
          product.images = partImages.filter((img: any) => img.partId.toString() === product._id.toString());
        }
      }
      return {
        ...item,
        id: item._id.toString(),
        product: product ? { ...product, id: product._id.toString() } : null,
        total: (product?.price || 0) * item.quantity,
      };
    });

    const subtotal = itemsWithProducts.reduce((sum: number, item: any) => sum + item.total, 0);

    return NextResponse.json({
      cart: {
        ...cart,
        id: cart._id.toString(),
        items: itemsWithProducts,
        subtotal,
      },
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const validationResult = addToCartSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { itemType, generatorId, partId, quantity } = validationResult.data;

    // Get or create cart
    let cart = await Cart.findOne({ userId: session.user.id });

    if (!cart) {
      cart = await Cart.create({ userId: session.user.id, items: [] });
    }

    // Check if product exists and is in stock
    let product: any;
    if (itemType === "GENERATOR" && generatorId) {
      product = await Generator.findOne({ _id: generatorId, isActive: true });
    } else if (itemType === "PART" && partId) {
      product = await Part.findOne({ _id: partId, isActive: true });
    }

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: `Only ${product.stock} items available` },
        { status: 400 }
      );
    }

    // Check if item already in cart
    const existingItem = await CartItem.findOne({
      cartId: cart._id,
      itemType,
      ...(itemType === "GENERATOR" ? { generatorId } : { partId }),
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { error: `Only ${product.stock} items available` },
          { status: 400 }
        );
      }

      await CartItem.findByIdAndUpdate(existingItem._id, { quantity: newQuantity });
    } else {
      await CartItem.create({
        cartId: cart._id,
        itemType,
        generatorId: itemType === "GENERATOR" ? generatorId : null,
        partId: itemType === "PART" ? partId : null,
        quantity,
      });
    }

    return NextResponse.json({ success: true, message: "Added to cart" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

// Update cart item
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { itemId, quantity } = body;

    const validationResult = updateCartItemSchema.safeParse({ quantity });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    // Get cart item
    const cartItem = await CartItem.findById(itemId);

    if (!cartItem) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    const cart = await Cart.findById(cartItem.cartId);
    if (!cart || cart.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Check stock
    let product: any;
    if (cartItem.itemType === "GENERATOR") {
      product = await Generator.findById(cartItem.generatorId);
    } else {
      product = await Part.findById(cartItem.partId);
    }

    if (product && quantity > product.stock) {
      return NextResponse.json(
        { error: `Only ${product.stock} items available` },
        { status: 400 }
      );
    }

    await CartItem.findByIdAndUpdate(itemId, { quantity });

    return NextResponse.json({ success: true, message: "Cart updated" });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// Delete cart item
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Get cart item
    const cartItem = await CartItem.findById(itemId);

    if (!cartItem) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    const cart = await Cart.findById(cartItem.cartId);
    if (!cart || cart.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    await CartItem.findByIdAndDelete(itemId);

    return NextResponse.json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}
