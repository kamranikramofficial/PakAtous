# Vercel Deployment Instructions

## Critical Environment Variables for Production

Make sure these are set in your Vercel project settings:

### 1. Database
```
MONGODB_URI=your_mongodb_atlas_connection_string
```

### 2. NextAuth (REQUIRED - Authentication will fail without these)
```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=generate_a_random_32_char_string
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Admin Account
```
ADMIN_EMAIL=your-admin@email.com
```

### 4. Cloudinary (Image uploads)
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 5. Email Service
```
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
```

### 6. Application
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_NAME=PakAutoSe Generators
NODE_ENV=production
```

## Steps to Fix Login Issue

1. **Set NEXTAUTH_URL to your Vercel domain:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `NEXTAUTH_URL` = `https://your-actual-domain.vercel.app`

2. **Set NEXTAUTH_SECRET (if not already set):**
   - Generate: Run `openssl rand -base64 32` in terminal
   - Add to Vercel: `NEXTAUTH_SECRET` = `<generated-secret>`

3. **Redeploy:**
   - After adding/updating environment variables
   - Go to Deployments tab → Click "..." on latest deployment → "Redeploy"

## Common Issues

### Issue: Redirects to login after accessing admin pages
**Solution:** Make sure `NEXTAUTH_URL` matches your exact Vercel domain (including https://)

### Issue: Session not persisting
**Solution:** Clear browser cookies and ensure `NEXTAUTH_SECRET` is set correctly

### Issue: "Configuration error"
**Solution:** Check that all required environment variables are set in Vercel
