# Cloudinary Setup Guide for PakAtous

## Overview
Images are now uploaded directly from the browser to **Cloudinary** with automatic compression. This improves performance, reduces bandwidth, and provides better image optimization.

---

## 1. Get Cloudinary Credentials

1. Go to **https://console.cloudinary.com**
2. Sign up or log in
3. From your dashboard, copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

## 2. Configure Environment Variables

Update your `.env.local` file:

```env
# Cloudinary Configuration (REQUIRED)
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# MongoDB Atlas (REQUIRED)
MONGODB_ATLAS_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pakautose
```

---

## 3. How It Works

### Automatic Image Compression
- **Client-side compression** before upload (reduces upload time)
- **Cloudinary optimization** with auto-quality and format
- **Maximum dimensions**: 1920x1920 for products, 800x800 for profiles
- **File size limit**: 5MB per image
- **Supported formats**: JPEG, PNG, WebP, GIF, SVG

### Upload Folders
Images are organized in Cloudinary folders:
- `pakautose/generators` - Generator images
- `pakautose/parts` - Part images
- `pakautose/services` - Service request photos
- `pakautose/profiles` - User/admin/staff profile pictures

---

## 4. Using Image Upload Components

### For Multiple Images (Admin Forms)
```tsx
import { ImageUpload } from "@/components/ui/image-upload";

const [images, setImages] = useState<string[]>([]);

<ImageUpload
  value={images}
  onChange={setImages}
  maxImages={10}
  folder="generators"
/>
```

### For Profile Pictures
```tsx
import { ProfileImageUpload } from "@/components/ui/profile-image-upload";

const [profileImage, setProfileImage] = useState("");

<ProfileImageUpload
  value={profileImage}
  onChange={setProfileImage}
  name={user.name}
/>
```

### For Service Requests (Already integrated)
The service request form now has file upload with compression.

---

## 5. Image Validation Script

Run the validation script to check for invalid images:

```bash
node scripts/find-invalid-images.js
```

This will check:
- Generator images
- Part images
- Service request images
- User/admin/staff profile images
- Banner images

It will flag any suspicious URLs or missing images.

---

## 6. Migration Notes

### Old System → New System
- **Before**: Images stored in DigitalOcean Spaces via URL input
- **After**: Images uploaded to Cloudinary via file browser

### Existing Images
- Old image URLs will continue to work
- New uploads automatically use Cloudinary
- Gradually replace old images through admin panel

---

## 7. Benefits

✅ **Automatic Compression** - Reduces file sizes by ~40-60%
✅ **CDN Delivery** - Fast global image loading
✅ **Format Optimization** - Auto-converts to WebP when supported
✅ **Quality Control** - Auto-quality based on content
✅ **No Manual URLs** - Browse and upload files directly
✅ **Validation** - File type and size checks before upload
✅ **Progress Indicators** - Visual feedback during uploads

---

## 8. Troubleshooting

### Upload fails with "Unauthorized"
- Check that you're logged in
- Verify API route has correct auth

### Images not showing
- Check Cloudinary dashboard for uploaded images
- Verify `.env.local` has correct credentials
- Check browser console for errors

### "Failed to compress image"
- File might be corrupted
- Try a different image format
- Check file size (max 5MB)

---

## 9. Next Steps

1. ✅ Copy `.env.example` to `.env.local`
2. ✅ Add Cloudinary credentials
3. ✅ Add MongoDB Atlas URL
4. ✅ Restart dev server: `npm run dev`
5. ✅ Test image upload on service request form
6. ✅ Test admin forms (generators, parts)
7. ✅ Test profile image upload

---

## Support

For issues, check:
- Cloudinary Console: https://console.cloudinary.com
- MongoDB Atlas: https://cloud.mongodb.com
- Project documentation: README.md
