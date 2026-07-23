# Service Images, Price Range, and Quote Request Update

## Overview
This update adds three major features to the service management system:
1. **Service Images**: Admins can upload images for each service
2. **Price Range**: Services can display either a fixed price or a price range (e.g., 10,000 - 32,000 RWF)
3. **Request Quote**: Customers can request a quote instead of booking directly

## Changes Made

### 1. Database Schema Updates

**New SQL File**: `lib/supabase/update-services-schema.sql`

Added the following columns to the `services` table:
- `image_url` (TEXT): URL to the service image stored in Supabase Storage
- `min_price` (DECIMAL): Minimum price in a range
- `max_price` (DECIMAL): Maximum price in a range
- `display_price_type` (VARCHAR): Either 'single' (fixed price) or 'range' (price range)

### 2. Storage Setup

**Updated**: `lib/supabase/setup-storage.sql`
- Storage bucket `service-photos` is already configured for service images
- Public read access enabled
- 5MB file size limit
- Allowed formats: JPEG, PNG, GIF, WebP

### 3. API Updates

**New API Route**: `app/api/services/upload-image/route.ts`
- Handles image upload to Supabase Storage
- Validates file type and size (max 5MB)
- Returns public URL for the uploaded image

**Existing API Routes** (no changes needed):
- `app/api/services/route.ts` - Works with new fields automatically
- `app/api/services/[id]/route.ts` - Works with new fields automatically

### 4. Admin Service Management Page

**Updated**: `app/admin/services/page.tsx`

#### New Features:
1. **Image Upload**:
   - File input in the service form
   - Image preview before saving
   - Displays service images in the service card grid

2. **Price Type Selection**:
   - Radio buttons to choose between "Fixed Price" or "Price Range"
   - Conditional form fields based on selection:
     - Fixed Price: Shows `base_price` field
     - Price Range: Shows `min_price` and `max_price` fields

3. **Enhanced Service Cards**:
   - Service images displayed at the top of each card
   - Price display adapts based on `display_price_type`
   - Hover effects on images

#### Updated Interface:
```typescript
interface Service {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  min_price: number | null;
  max_price: number | null;
  display_price_type: 'single' | 'range';
  unit: string | null;
  category: string | null;
  image_url: string | null;
  is_active: boolean;
}
```

### 5. Landing Page (Customer View)

**Updated**: `app/page.tsx`

#### New Features:
1. **Service Images**:
   - Images displayed at the top of service cards
   - Smooth hover scale animation
   - Fallback for services without images

2. **Price Display**:
   - Shows fixed price for `display_price_type: 'single'`
   - Shows price range (e.g., "10,000 - 32,000 RWF") for `display_price_type: 'range'`
   - Helper text: "Price range based on requirements" for range pricing

3. **Request Quote Button**:
   - New "Request Quote" button next to "Book Now"
   - Links to booking page with `requestQuote=true` parameter
   - Styled with teal outline to match brand colors

#### Service Card Layout:
```
┌─────────────────────────────┐
│     Service Image           │
├─────────────────────────────┤
│ Category Badge              │
│ Service Name                │
│ Description                 │
│                             │
│ RWF 10,000 - 32,000 / unit  │
│ Price range based on...     │
│                             │
│ [Book Now] [Request Quote]  │
└─────────────────────────────┘
```

## Installation Steps

### 1. Run Database Migrations

Execute the SQL file in your Supabase SQL Editor:

```bash
# Open Supabase Dashboard → SQL Editor
# Run: lib/supabase/update-services-schema.sql
```

This will:
- Add new columns to the services table
- Set default values for existing services
- Add proper constraints and comments

### 2. Verify Storage Setup

Ensure the storage bucket is properly configured:

```bash
# If not already set up, run:
# lib/supabase/setup-storage.sql
```

### 3. Update Environment Variables

Ensure these variables are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. No Code Changes Needed!

All TypeScript and React components are already updated.

## Usage Guide

### For Admins

#### Adding a Service with Image and Price Range:

1. Navigate to **Admin → Services**
2. Click **"Add Service"**
3. Fill in the form:
   - **Service Name**: e.g., "Home Fumigation"
   - **Description**: Brief description
   - **Category**: e.g., "Fumigation"
   - **Unit**: e.g., "per sqm"
   - **Upload Image**: Select an image file (max 5MB)
   - **Price Display Type**: 
     - Select "Price Range"
     - Enter Min Price: 10000
     - Enter Max Price: 32000
   - Check **"Active"** to make it visible

4. Click **"Add Service"**

#### Editing an Existing Service:

1. Click **"Edit"** on any service card
2. Update fields as needed
3. Upload a new image to replace the old one
4. Change price type between Fixed/Range
5. Click **"Save Changes"**

### For Customers

#### Booking a Service:

1. Visit the landing page
2. Browse services with images and prices
3. Choose an option:
   - **"Book Now"**: Direct booking
   - **"Request Quote"**: Request a custom quote

#### Request Quote Flow:

When clicking "Request Quote":
- Redirects to: `/customer/booking?service={id}&requestQuote=true`
- The booking form can detect `requestQuote` parameter
- You can customize the booking form to show different messaging

## Price Display Logic

### Single Price:
```typescript
display_price_type: 'single'
base_price: 25000
// Displays: "RWF 25,000 / unit"
```

### Price Range:
```typescript
display_price_type: 'range'
min_price: 10000
max_price: 32000
// Displays: "RWF 10,000 - 32,000 / unit"
//           "Price range based on requirements"
```

## Technical Implementation Details

### Image Upload Flow:

1. **Admin selects image** → Preview shown in form
2. **Form submission** → Image uploaded to `/api/services/upload-image`
3. **API uploads to Supabase Storage** → Returns public URL
4. **Service created/updated** → Includes `image_url` field

### Image Storage Structure:
```
service-photos/
  └── services/
      ├── 1703001234567-abc123.jpg
      ├── 1703001234568-def456.png
      └── ...
```

### Security:
- File type validation (images only)
- File size limit (5MB max)
- Public read access for display
- Service role required for uploads

## Backward Compatibility

✅ **Existing services will continue to work**:
- `display_price_type` defaults to 'single'
- `base_price` is still used for fixed pricing
- `image_url` can be null (no image required)
- `min_price` and `max_price` can be null

## Future Enhancements

Potential improvements:
1. **Image cropping/resizing** before upload
2. **Multiple images per service** (image gallery)
3. **Different quote request form** (separate from booking)
4. **Price calculation logic** based on customer inputs
5. **Image optimization** for faster loading

## Testing Checklist

- [ ] Run database migration
- [ ] Verify storage bucket exists
- [ ] Add a service with fixed price
- [ ] Add a service with price range
- [ ] Upload service images
- [ ] View services on landing page
- [ ] Test "Book Now" button
- [ ] Test "Request Quote" button
- [ ] Edit an existing service
- [ ] Change price type from fixed to range
- [ ] Delete a service with an image

## Troubleshooting

### Image Upload Fails:
1. Check `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
2. Verify storage bucket `service-photos` exists
3. Check storage policies allow uploads
4. Ensure file is under 5MB and is an image

### Prices Not Displaying:
1. Run the schema migration
2. Check that services have `display_price_type` set
3. For range pricing, ensure both `min_price` and `max_price` are set

### Request Quote Not Working:
1. Check if `requestQuote` parameter is in URL
2. Update booking form to handle the parameter
3. Implement custom logic for quote requests

## Support

For issues or questions:
1. Check Supabase logs for API errors
2. Check browser console for frontend errors
3. Verify database schema matches expected structure
4. Ensure all environment variables are set correctly
