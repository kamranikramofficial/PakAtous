import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// DigitalOcean Spaces Configuration
const s3Client = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION || 'nyc3',
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY || '',
    secretAccessKey: process.env.DO_SPACES_SECRET || '',
  },
  forcePathStyle: false,
});

const BUCKET_NAME = process.env.DO_SPACES_BUCKET || 'pakautose-images';
const CDN_URL = process.env.DO_SPACES_CDN_URL;

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  contentType: string;
}

/**
 * Upload a file to DigitalOcean Spaces
 */
export async function uploadFile(
  file: Buffer,
  filename: string,
  contentType: string,
  folder: string = 'uploads'
): Promise<UploadResult> {
  const extension = filename.split('.').pop();
  const key = `${folder}/${uuidv4()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read',
  });

  await s3Client.send(command);

  // Use CDN URL if available, otherwise construct the direct URL
  const url = CDN_URL 
    ? `${CDN_URL}/${key}`
    : `${process.env.DO_SPACES_ENDPOINT}/${BUCKET_NAME}/${key}`;

  return {
    url,
    key,
    size: file.length,
    contentType,
  };
}

/**
 * Upload multiple files to DigitalOcean Spaces
 */
export async function uploadMultipleFiles(
  files: { buffer: Buffer; filename: string; contentType: string }[],
  folder: string = 'uploads'
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file) =>
    uploadFile(file.buffer, file.filename, file.contentType, folder)
  );
  return Promise.all(uploadPromises);
}

/**
 * Delete a file from DigitalOcean Spaces
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Delete multiple files from DigitalOcean Spaces
 */
export async function deleteMultipleFiles(keys: string[]): Promise<void> {
  const deletePromises = keys.map((key) => deleteFile(key));
  await Promise.all(deletePromises);
}

/**
 * Get a signed URL for private file access
 */
export async function getSignedFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Extract the key from a full URL
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const cdnUrl = CDN_URL;
    const endpoint = process.env.DO_SPACES_ENDPOINT;
    
    if (cdnUrl && url.startsWith(cdnUrl)) {
      return url.replace(`${cdnUrl}/`, '');
    }
    
    if (endpoint && url.includes(BUCKET_NAME)) {
      const regex = new RegExp(`${BUCKET_NAME}/(.+)$`);
      const match = url.match(regex);
      return match ? match[1] : null;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Generate folder paths for different content types
 */
export const ImageFolders = {
  GENERATORS: 'generators',
  PARTS: 'parts',
  SERVICES: 'services',
  BANNERS: 'banners',
  BRANDS: 'brands',
  USERS: 'users',
  CATEGORIES: 'categories',
} as const;

export type ImageFolder = typeof ImageFolders[keyof typeof ImageFolders];

/**
 * Validate file type for images
 */
export function isValidImageType(contentType: string): boolean {
  const validTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];
  return validTypes.includes(contentType);
}

/**
 * Validate file size (default max: 10MB)
 */
export function isValidFileSize(size: number, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
}

/**
 * Process and upload an image from a form
 */
export async function processImageUpload(
  file: File,
  folder: ImageFolder
): Promise<UploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  if (!isValidImageType(file.type)) {
    throw new Error('Invalid file type. Only images are allowed.');
  }
  
  if (!isValidFileSize(buffer.length)) {
    throw new Error('File size exceeds the maximum limit of 10MB.');
  }
  
  return uploadFile(buffer, file.name, file.type, folder);
}

export default s3Client;
