import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/prisma';
import { WishlistItem } from '@/models/Wishlist';
// Ensure models are registered
import '@/models/Generator';
import '@/models/Part';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const wishlistItems = await WishlistItem.find({ userId: session.user.id })
      .populate('generatorId')
      .populate('partId')
      .sort({ createdAt: -1 });

    return NextResponse.json(wishlistItems);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { generatorId, partId } = await request.json();

    if (!generatorId && !partId) {
      return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });
    }

    await dbConnect();

    const query = generatorId 
      ? { userId: session.user.id, generatorId }
      : { userId: session.user.id, partId };

    // Check if already exists
    const existing = await WishlistItem.findOne(query);
    
    if (existing) {
        // Toggle: remove if exists
        await WishlistItem.findByIdAndDelete(existing._id);
        return NextResponse.json({ message: 'Removed from wishlist', action: 'removed' });
    } else {
        // Add to wishlist
        const itemType = generatorId ? 'GENERATOR' : 'PART';
        const newItem = await WishlistItem.create({
          userId: session.user.id,
          itemType,
          generatorId,
          partId
        });
        return NextResponse.json({ message: 'Added to wishlist', action: 'added', item: newItem });
    }

  } catch (error) {
    console.error('Error updating wishlist:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
             return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        await dbConnect();

        // Verify ownership
        const item = await WishlistItem.findOne({ _id: id, userId: session.user.id });
        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        await WishlistItem.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Item removed' });

    } catch (error) {
        console.error('Error removing wishlist item:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
