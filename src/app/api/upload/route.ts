import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  uploadFile, 
  deleteFile, 
  isValidImageType, 
  isValidFileSize,
  ImageFolders,
  type ImageFolder 
} from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as ImageFolder) || ImageFolders.GENERATORS;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidImageType(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP, SVG) are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!isValidFileSize(buffer.length, 10)) {
      return NextResponse.json(
        { error: 'File size exceeds the maximum limit of 10MB.' },
        { status: 400 }
      );
    }

    // Validate folder
    const validFolders = Object.values(ImageFolders);
    if (!validFolders.includes(folder)) {
      return NextResponse.json(
        { error: 'Invalid folder specified.' },
        { status: 400 }
      );
    }

    // Upload to DigitalOcean Spaces
    const result = await uploadFile(buffer, file.name, file.type, folder);

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        key: result.key,
        size: result.size,
        contentType: result.contentType,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'No file key provided' },
        { status: 400 }
      );
    }

    await deleteFile(key);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
