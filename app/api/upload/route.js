import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    // 1. Verify Environment Variables exist
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error("❌ Missing Cloudinary Environment Variables");
      return NextResponse.json(
        { error: 'Server misconfiguration: Missing Cloudinary credentials' },
        { status: 500 }
      );
    }

    // 2. Parse the file from the request
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file received' },
        { status: 400 }
      );
    }

    // 3. Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Upload to Cloudinary using a Promise wrapper
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'pakatous-uploads', // explicit folder
          resource_type: 'auto',      // detects image/video/raw
        },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary Upload Error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    console.log("✅ Upload Successful:", result.secure_url);

    return NextResponse.json({ 
      url: result.secure_url,
      public_id: result.public_id 
    });

  } catch (error) {
    console.error("❌ API Route Error:", error);
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    );
  }
}