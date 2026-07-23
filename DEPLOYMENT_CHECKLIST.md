# 🚀 Deployment Checklist - Service Images & Price Range Features

## Pre-Deployment Verification

### ✅ Step 1: Database Setup (Critical!)

Run these SQL files in your Supabase SQL Editor **in this order**:

1. **Verify storage bucket exists**:
```sql
-- Check if service-photos bucket exists
SELECT * FROM storage.buckets WHERE id = 'service-photos';
```

If it doesn't exist, run:
```bash
File: lib/supabase/setup-storage.sql
```

2. **Add new columns to services table**:
```bash
File: lib/supabase/update-services-schema.sql
```

3. **Verify new columns**:
```sql
-- Check services table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'services' 
ORDER BY ordinal_position;

-- Should see:
-- image_url (text)
-- min_price (numeric)
-- max_price (numeric)
-- display_price_type (character varying)
```

### ✅ Step 2: Environment Variables

Verify `.env.local` has all required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # ⚠️ REQUIRED for image upload!
```

**Test command**:
```bash
# Check if variables are loaded
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ URL set' : '❌ URL missing')"
```

### ✅ Step 3: Code Verification

All code files are already updated! Here's what was changed:

#### Modified Files:
- ✅ `app/admin/services/page.tsx` - Added image upload & price range form
- ✅ `app/page.tsx` - Updated landing page with images & Request Quote
- ✅ `app/api/services/upload-image/route.ts` - NEW: Image upload API

#### No Changes Needed:
- ✅ `app/api/services/route.ts` - Generic, works with new fields
- ✅ `app/api/services/[id]/route.ts` - Generic, works with new fields

### ✅ Step 4: Build Test

Test that the application builds successfully:

```bash
npm run build
```

**Expected output**:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
```

If you see errors, check:
- TypeScript types match database schema
- All imports are correct
- Environment variables are set

## Development Testing

### 🧪 Test 1: Admin - Add Service with Fixed Price

1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/admin/services`
3. Click **"Add Service"**
4. Fill form:
   - Name: `Test Service 1`
   - Category: `Testing`
   - Unit: `per service`
   - **Price Type**: Select `Fixed Price`
   - Base Price: `15000`
   - Upload an image (any JPG/PNG)
   - Check `Active`
5. Click **"Add Service"**

**Expected Result**:
- ✅ Service appears in grid
- ✅ Image shows in card
- ✅ Price shows: "RWF 15,000"
- ✅ No errors in console

### 🧪 Test 2: Admin - Add Service with Price Range

1. Click **"Add Service"** again
2. Fill form:
   - Name: `Test Service 2`
   - Category: `Testing`
   - Unit: `per sqm`
   - **Price Type**: Select `Price Range`
   - Min Price: `10000`
   - Max Price: `30000`
   - Upload a different image
   - Check `Active`
3. Click **"Add Service"**

**Expected Result**:
- ✅ Service appears in grid
- ✅ Price shows: "RWF 10,000 - 30,000"
- ✅ Both services visible

### 🧪 Test 3: Edit Service - Change Price Type

1. Click **"Edit"** on Test Service 1
2. Change Price Type from `Fixed` to `Range`
3. Enter Min: `5000`, Max: `20000`
4. Click **"Save Changes"**

**Expected Result**:
- ✅ Price updates to range format
- ✅ Image still shows correctly

### 🧪 Test 4: Landing Page Display

1. Navigate to: `http://localhost:3000`
2. Scroll to "Our Services" section

**Expected Result**:
- ✅ Both test services show with images
- ✅ Test Service 1: Shows price range (5,000 - 20,000)
- ✅ Test Service 2: Shows price range (10,000 - 30,000)
- ✅ Each has two buttons: "Book Now" and "Request Quote"

### 🧪 Test 5: Button Functionality

1. Click **"Book Now"** on Test Service 1

**Expected Result**:
- ✅ Redirects to: `/customer/booking?service={id}`
- ✅ Booking form loads

2. Go back, click **"Request Quote"** on Test Service 2

**Expected Result**:
- ✅ Redirects to: `/customer/booking?service={id}&requestQuote=true`
- ✅ URL contains `requestQuote=true` parameter

### 🧪 Test 6: Image Upload Edge Cases

Test various scenarios:

**Test 6.1: Large file (should fail)**
- Upload 6MB+ image
- Expected: Error message about 5MB limit

**Test 6.2: Non-image file (should fail)**
- Try uploading a PDF or TXT file
- Expected: Error about invalid file type

**Test 6.3: No image (should work)**
- Create service without uploading image
- Expected: Service created, no image shown

**Test 6.4: Replace image**
- Edit service with existing image
- Upload new image
- Expected: New image replaces old one

### 🧪 Test 7: Mobile Responsiveness

1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro"
4. Test:
   - ✅ Service cards stack properly
   - ✅ Images scale correctly
   - ✅ Both buttons visible and clickable
   - ✅ Admin form is usable

### 🧪 Test 8: Database Verification

Check data in Supabase:

```sql
-- View all services with new fields
SELECT 
  name,
  display_price_type,
  base_price,
  min_price,
  max_price,
  image_url,
  is_active
FROM services
ORDER BY created_at DESC;

-- Should see test services with correct data
```

## Production Deployment

### 📋 Pre-Production Checklist

- [ ] All tests pass in development
- [ ] Database migrations run successfully
- [ ] Storage bucket configured properly
- [ ] Environment variables set in production
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No console errors in browser

### 🚀 Deployment Steps

#### Option A: Vercel (Recommended)

1. **Push to Git**:
```bash
git add .
git commit -m "feat: Add service images, price ranges, and request quote button"
git push origin main
```

2. **Verify Environment Variables in Vercel**:
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Ensure these are set:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Critical!**

3. **Deploy**:
   - Vercel auto-deploys on push
   - Or manually: `vercel --prod`

4. **Run Migrations in Production**:
   - Open Supabase Dashboard (production project)
   - Go to SQL Editor
   - Run `update-services-schema.sql`

5. **Verify Deployment**:
   - Visit production URL
   - Test adding a service
   - Verify image upload works

#### Option B: Self-Hosted

1. **Build application**:
```bash
npm run build
```

2. **Run migrations** on production database

3. **Set environment variables**:
```bash
export NEXT_PUBLIC_SUPABASE_URL=...
export NEXT_PUBLIC_SUPABASE_ANON_KEY=...
export SUPABASE_SERVICE_ROLE_KEY=...
```

4. **Start application**:
```bash
npm start
```

### 🔍 Post-Deployment Verification

Test these on production:

1. **Admin Features**:
   - [ ] Can add service with image
   - [ ] Can add service with price range
   - [ ] Images display correctly
   - [ ] Can edit services
   - [ ] Can delete services

2. **Customer Features**:
   - [ ] Landing page shows services with images
   - [ ] Prices display correctly (fixed and range)
   - [ ] "Book Now" button works
   - [ ] "Request Quote" button works
   - [ ] Mobile view works

3. **Performance**:
   - [ ] Images load quickly
   - [ ] No CORS errors
   - [ ] API responses are fast
   - [ ] No memory leaks

## Troubleshooting Guide

### ❌ Problem: Images not uploading

**Symptoms**: Error when uploading image

**Solutions**:
1. Check `SUPABASE_SERVICE_ROLE_KEY` is set
2. Verify storage bucket exists:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'service-photos';
   ```
3. Check storage policies:
   ```sql
   SELECT * FROM storage.policies WHERE bucket_id = 'service-photos';
   ```
4. Check browser console for specific error

### ❌ Problem: Images not displaying

**Symptoms**: Broken image icon on landing page

**Solutions**:
1. Check image URL in database:
   ```sql
   SELECT name, image_url FROM services WHERE image_url IS NOT NULL;
   ```
2. Test URL directly in browser
3. Verify storage bucket is public:
   ```sql
   SELECT name, public FROM storage.buckets WHERE id = 'service-photos';
   ```
4. Check CORS settings in Supabase

### ❌ Problem: Price range not showing

**Symptoms**: Shows "NaN" or blank price

**Solutions**:
1. Check data in database:
   ```sql
   SELECT name, display_price_type, min_price, max_price 
   FROM services 
   WHERE display_price_type = 'range';
   ```
2. Ensure both min_price and max_price are set
3. Check for null values
4. Verify display_price_type is 'range' not 'single'

### ❌ Problem: TypeScript errors

**Symptoms**: Build fails with type errors

**Solutions**:
1. Ensure Service interface matches database schema
2. Check all fields are properly typed
3. Run: `npm run type-check` (if available)
4. Clear Next.js cache: `rm -rf .next`

### ❌ Problem: Storage quota exceeded

**Symptoms**: Upload fails with quota error

**Solutions**:
1. Check storage usage in Supabase Dashboard
2. Delete unused images:
   ```typescript
   // In Supabase Dashboard → Storage → service-photos
   // Delete old/unused images
   ```
3. Consider implementing image compression
4. Upgrade Supabase plan if needed

## Rollback Plan

If something goes wrong in production:

### Quick Rollback:

1. **Revert code deployment**:
```bash
# In Vercel
vercel rollback
```

2. **Database remains compatible** - old code still works because:
   - New columns are nullable
   - Old fields (base_price) still exist
   - display_price_type defaults to 'single'

### Full Rollback:

If you need to completely undo database changes:

```sql
-- Remove new columns (NOT RECOMMENDED - will lose data!)
ALTER TABLE services DROP COLUMN IF EXISTS image_url;
ALTER TABLE services DROP COLUMN IF EXISTS min_price;
ALTER TABLE services DROP COLUMN IF EXISTS max_price;
ALTER TABLE services DROP COLUMN IF EXISTS display_price_type;

-- Warning: This will delete all uploaded images' references!
-- Only do this if absolutely necessary
```

## Success Metrics

After deployment, monitor:

1. **Usage**:
   - Number of services with images
   - Number of services using price ranges
   - Click-through rate on "Request Quote" vs "Book Now"

2. **Performance**:
   - Image load times
   - API response times
   - Storage usage

3. **User Feedback**:
   - Admin satisfaction with new features
   - Customer engagement with quote requests
   - Image quality and presentation

## Next Steps After Deployment

Consider these enhancements:

1. **Quote Request Flow**:
   - Implement full quote request handling
   - See: `QUOTE_REQUEST_IMPLEMENTATION.md`

2. **Image Optimization**:
   - Add image compression before upload
   - Generate thumbnails for faster loading
   - Implement lazy loading

3. **Analytics**:
   - Track which services get most quote requests
   - Compare conversion rates: Book Now vs Request Quote
   - Monitor image upload success rates

4. **Admin Improvements**:
   - Bulk image upload
   - Image cropping tool
   - Price range calculator

5. **Customer Experience**:
   - Image gallery for services
   - Before/after photos
   - Video support

## Support

If you encounter issues:

1. **Check logs**:
   - Vercel: Deployment logs
   - Supabase: Database logs
   - Browser: Console errors

2. **Review documentation**:
   - `SERVICE_IMAGES_AND_PRICING_UPDATE.md`
   - `QUOTE_REQUEST_IMPLEMENTATION.md`
   - `FEATURE_FLOWS.md`

3. **Test locally**:
   - Reproduce issue in development
   - Check network tab for API errors
   - Verify database state

---

## ✅ Final Checklist

Before marking deployment complete:

- [ ] Database migrations run successfully
- [ ] Test service created with image
- [ ] Test service created with price range
- [ ] Landing page displays correctly
- [ ] Both buttons work (Book Now & Request Quote)
- [ ] Admin can edit services
- [ ] Images upload and display properly
- [ ] Mobile responsive
- [ ] Production environment variables set
- [ ] Deployment successful
- [ ] Post-deployment tests pass
- [ ] No errors in logs
- [ ] Stakeholders notified
- [ ] Documentation updated

🎉 **Ready to deploy!**
