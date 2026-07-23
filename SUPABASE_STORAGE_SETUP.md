# Supabase Storage Setup Guide

## Photo Upload Storage Configuration

To enable photo uploads for bookings, you need to create a storage bucket in Supabase.

---

## 📦 Step 1: Create Storage Bucket

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `ycngtmmoomwgmkabqasy`

2. **Navigate to Storage**
   - Click "Storage" in the left sidebar
   - Click "Create a new bucket"

3. **Configure Bucket**
   - **Name:** `service-photos`
   - **Public bucket:** ✅ Check this (photos will be publicly accessible)
   - **File size limit:** 5MB (or adjust as needed)
   - **Allowed MIME types:** `image/*` (all image types)
   - Click "Create bucket"

---

## 🔒 Step 2: Set Storage Policies (Optional but Recommended)

For better security, set up Row Level Security (RLS) policies:

### Policy 1: Allow Public Read Access

```sql
-- Allow anyone to read photos
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'service-photos' );
```

### Policy 2: Allow Authenticated Uploads

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'service-photos' );
```

### Policy 3: Allow Users to Delete Their Own Photos

```sql
-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'service-photos' );
```

---

## 📁 Folder Structure

Photos will be organized as:
```
service-photos/
└── bookings/
    ├── {booking-id-1}/
    │   ├── {timestamp}-{random}.jpg
    │   └── {timestamp}-{random}.png
    ├── {booking-id-2}/
    │   └── {timestamp}-{random}.jpg
    └── ...
```

---

## ✅ Step 3: Test Upload

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Go to booking page:**
   ```
   http://localhost:3000/customer/booking
   ```

3. **Create a booking with photos:**
   - Fill in customer details
   - Select a service
   - Upload 1-3 photos
   - Submit booking

4. **Check Supabase Storage:**
   - Go to Storage → service-photos
   - You should see a new folder with your booking ID
   - Photos should be inside

---

## 🔧 Alternative: Manual Bucket Creation via SQL

If you prefer SQL, run this in Supabase SQL Editor:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-photos', 'service-photos', true);

-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'service-photos' );

-- Allow authenticated uploads
CREATE POLICY "Authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'service-photos' );

-- Allow authenticated deletes
CREATE POLICY "Authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'service-photos' );
```

---

## 📊 File Size Limits

Default limits in Supabase:
- **Free Plan:** 1GB total storage
- **Pro Plan:** 100GB total storage
- **Max file size:** 50MB (can be adjusted)

Recommended for your app:
- **Max file size:** 5MB per photo
- **Max photos per booking:** 10

---

## 🔍 Troubleshooting

### Error: "Bucket not found"
**Solution:** Create the `service-photos` bucket in Supabase Dashboard

### Error: "Policy violation"
**Solution:** Add the storage policies mentioned above

### Error: "File too large"
**Solution:** 
- Reduce image size on client-side before upload
- Increase bucket file size limit in Supabase settings

### Photos not displaying
**Solution:**
- Ensure bucket is set to "public"
- Check that public URL is being generated correctly
- Verify CORS settings in Supabase

---

## 🎨 Image Optimization (Optional)

For better performance, consider:

1. **Client-side compression** (before upload):
   ```bash
   npm install browser-image-compression
   ```

2. **Automatic thumbnail generation** (Supabase Edge Function):
   - Create thumbnails for faster loading
   - Store original + thumbnail versions

3. **CDN Integration**:
   - Supabase Storage uses CDN by default
   - Images are cached globally

---

## 📝 Next Steps

After setting up storage:

1. ✅ Create `service-photos` bucket
2. ✅ Set bucket to public
3. ✅ Add storage policies (optional)
4. ✅ Test photo upload
5. ✅ Monitor storage usage in dashboard

---

## 🔗 Useful Links

- Supabase Storage Docs: https://supabase.com/docs/guides/storage
- Storage Policies: https://supabase.com/docs/guides/storage/security/access-control
- File Upload Best Practices: https://supabase.com/docs/guides/storage/uploads

---

**Status:** Ready to upload photos! 📸

**Your Supabase Project:** `ycngtmmoomwgmkabqasy`
**Required Bucket:** `service-photos`
