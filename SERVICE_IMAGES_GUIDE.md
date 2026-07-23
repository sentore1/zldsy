# Service Images Setup Guide

## ✅ What's Already Configured

Your system is now **fully configured** to add services with images that will appear on the landing page!

### 1. Database Schema ✓
- `image_url` column added to services table
- Supports both single price and price range display

### 2. Storage Bucket ✓
- Supabase storage bucket `service-photos` configured
- 5MB file size limit
- Accepts: JPEG, PNG, GIF, WebP formats
- Public read access enabled

### 3. API Routes ✓
- **Upload API**: `/api/services/upload-image` - handles image uploads
- **Services API**: `/api/services` - creates/reads services
- **Service Update API**: `/api/services/[id]` - updates/deletes services

### 4. Admin Interface ✓
- Image upload in Add/Edit service forms
- Image preview before saving
- Automatic upload to Supabase Storage

### 5. Landing Page ✓
- Displays service images automatically
- Falls back gracefully if no image
- Responsive image sizing
- Hover effects on images

---

## 🚀 How to Add Services with Images

### Step 1: Run Database Migrations

Execute these SQL files in your Supabase SQL Editor:

```sql
-- 1. First, update the services schema
-- Run: lib/supabase/update-services-schema.sql

-- 2. Then, set up storage bucket
-- Run: lib/supabase/setup-storage.sql
```

### Step 2: Add a Service via Admin Panel

1. **Navigate to Admin Panel**
   - Go to `http://localhost:3000/admin`
   - Login with your credentials
   - Click on **Services** in the sidebar

2. **Click "Add Service"**
   - Fill in service details:
     - Name (required)
     - Description
     - Category
     - Unit (e.g., "per sqm", "per hour")
   
3. **Choose Price Type**
   - **Fixed Price**: Single price (e.g., RWF 15,000)
   - **Price Range**: Min-Max range (e.g., RWF 10,000 - 32,000)

4. **Upload Image**
   - Click "Choose File"
   - Select an image (JPEG, PNG, GIF, or WebP)
   - Maximum size: 5MB
   - Preview will appear immediately

5. **Save Service**
   - Check "Active" to make it visible
   - Click "Add Service"

### Step 3: View on Landing Page

1. Navigate to `http://localhost:3000`
2. Your service will appear with:
   - Service image (if uploaded)
   - Category badge
   - Description
   - Price (single or range)
   - "Book Now" and "Request Quote" buttons

---

## 📸 Image Best Practices

### Recommended Image Specs
- **Dimensions**: 800x600px or similar 4:3 ratio
- **File Size**: Under 2MB for faster loading
- **Format**: JPEG (best for photos) or PNG (if transparency needed)
- **Style**: Professional, clear, well-lit images

### Image Guidelines
✓ Use high-quality service photos  
✓ Show the service being performed  
✓ Keep images consistent in style  
✓ Use proper lighting and composition  
✓ Compress images before upload  

✗ Avoid blurry or pixelated images  
✗ Don't use images with text overlays  
✗ Avoid stock photos if possible  
✗ Don't exceed 5MB file size  

---

## 🔄 Example Workflow

### Adding "Home Fumigation" Service

```
1. Service Details:
   Name: Home Fumigation
   Description: Professional pest control and fumigation for residential properties
   Category: Fumigation
   Unit: per sqm
   
2. Pricing:
   Type: Price Range
   Min Price: 10000
   Max Price: 32000
   
3. Image:
   Upload: fumigation-service.jpg
   (Shows technician performing fumigation)
   
4. Status: Active ✓

5. Result on Landing Page:
   - Card with fumigation image
   - "Fumigation" category badge
   - Description text
   - "RWF 10,000 - 32,000 / per sqm"
   - Book Now & Request Quote buttons
```

---

## 🎨 Landing Page Display

### How Services Appear

1. **Services Grid**
   - 3 columns on desktop
   - 2 columns on tablet
   - 1 column on mobile

2. **Service Card Structure**
   ```
   +---------------------------+
   |   [Service Image 48px]    |
   +---------------------------+
   | [Category Badge] [Active] |
   | Service Name              |
   | Description text...       |
   | RWF Price / unit          |
   | [Book Now] [Get Quote]    |
   +---------------------------+
   ```

3. **Category Filter**
   - Automatically generates from services
   - "All" + unique categories
   - Filters services on click

4. **Image Display**
   - 16:9 aspect ratio (h-48)
   - Object-cover for proper scaling
   - Hover scale animation
   - Fallback: no image, just content

---

## 🛠️ Technical Details

### Image Storage Structure

```
Supabase Storage
└── service-photos/
    └── services/
        ├── 1234567890-abc123.jpg
        ├── 1234567891-def456.png
        └── 1234567892-ghi789.webp
```

### Image URL Format

```
https://ycngtmmoomwgmkabqasy.supabase.co/storage/v1/object/public/service-photos/services/filename.jpg
```

### Database Schema

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  base_price DECIMAL(10, 2),
  min_price DECIMAL(10, 2),
  max_price DECIMAL(10, 2),
  display_price_type VARCHAR(20) DEFAULT 'single',
  unit VARCHAR(50),
  image_url TEXT,  -- ← Stores image URL
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## ❓ Troubleshooting

### Image Not Showing on Landing Page

**Check:**
1. Is the service marked as "Active"? ✓
2. Did the image upload successfully? Check URL
3. Is the storage bucket public? (Should be by default)
4. Browser console errors? Check network tab

### Upload Fails

**Common Issues:**
- File too large (>5MB) → Compress image
- Wrong file type → Use JPEG/PNG/GIF/WebP
- Storage bucket not created → Run `setup-storage.sql`
- Permission issues → Check storage policies

### Service Appears Without Image

**This is normal!** Images are optional. The landing page handles this gracefully:
- Service card shows without image section
- All other content displays normally
- Add image later by editing the service

---

## 🎯 Next Steps

After adding services with images:

1. **Test the Landing Page**
   - Visit `http://localhost:3000`
   - Check image loading
   - Test category filters
   - Try booking buttons

2. **Optimize Images**
   - Compress images with tools like TinyPNG
   - Use consistent dimensions
   - Consider lazy loading for many services

3. **Add More Services**
   - Create a diverse service catalog
   - Use different categories
   - Mix single and range pricing

4. **Customer Experience**
   - Test booking flow
   - Verify quotation requests
   - Check email notifications

---

## 📝 Summary

**Your system now supports:**
✅ Adding services via admin panel  
✅ Uploading images during service creation  
✅ Displaying images on landing page  
✅ Category filtering with images  
✅ Both single and range pricing  
✅ Active/inactive service toggle  
✅ Edit/delete with image preservation  

**Everything is ready to use!** Just add your services with images through the admin panel at `/admin/services`.
