import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { ServiceRequest } from "@/models/ServiceRequest";

export const dynamic = 'force-dynamic';

// GET /api/services/[id] - Get single service request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const serviceRequest = await ServiceRequest.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!serviceRequest) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    // Normalize images to ensure url is present and safe for the client
    const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'drmqggyb9';
    const images = (serviceRequest as any).images?.map((img: any) => {
      let url = img?.url || img?.secure_url || img?.path || "";
      
      // If only public_id is stored, construct full Cloudinary URL
      if (!url && img?.public_id) {
        url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${img.public_id}`;
      }
      
      // Debug logging
      if (!url) {
        console.warn('Image has no URL field. Image data:', JSON.stringify(img));
      }
      
      return {
        url,
        description: img?.description || "",
      };
    }) || [];

    return NextResponse.json({
      ...serviceRequest,
      images,
      id: (serviceRequest as any)._id.toString(),
    });
  } catch (error) {
    console.error("Error fetching service request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/services/[id] - Cancel service request
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (action !== "cancel") {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const serviceRequest = await ServiceRequest.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!serviceRequest) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    // Only pending requests can be cancelled
    if (serviceRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending requests can be cancelled" },
        { status: 400 }
      );
    }

    const updated = await ServiceRequest.findByIdAndUpdate(
      id,
      { status: "CANCELLED" },
      { new: true }
    ).lean();

    return NextResponse.json({
      ...updated,
      id: (updated as any)._id.toString(),
    });
  } catch (error) {
    console.error("Error cancelling service request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
