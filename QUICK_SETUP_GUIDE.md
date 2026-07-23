# Quick Setup Guide - Service Images & Pricing Features

## ✨ New Features Added

1. ✅ **Service Images** - Upload and display images for each service
2. ✅ **Price Range** - Show price ranges like "RWF 10,000 - 32,000" instead of fixed prices
3. ✅ **Request Quote Button** - Customers can request quotes instead of direct booking

## 🚀 Setup Steps (5 minutes)

### Step 1: Run Database Migration

Open your Supabase SQL Editor and run this file:

**File**: `lib/supabase/update-services-schema.sql`

```sql
-- This adds:
-- - image_url column
-- - min_price, max_price columns
-- - display_price_type column
```

### Step 2: Verify Storage Bucket

Your storage is already configured! The bucket `service-photos` is ready to use.

### Step 3: Restart Development Server

```bash
npm run dev
```

## ✅ That's It! 

All code changes are already in place. You can now:

### As Admin:

1. Go to **Admin → Services**
2. Click **"Add Service"** or **"Edit"** on existing service
3. **Upload an image** using the file input
4. Choose **Price Type**:
   - **Fixed Price**: Single price (e.g., 25,000 RWF)
   - **Price Range**: Min-Max range (e.g., 10,000 - 32,000 RWF)
5. Save!

### Customers Will See:

- 📸 **Service images** on landing page
- 💰 **Price ranges** (if set)
- 🎯 **Two action buttons**:
  - **Book Now** - Direct booking
  - **Request Quote** - Get custom quote

## 📝 Example: Adding a Service with Price Range

1. Service Name: `Home Fumigation`
2. Category: `Fumigation`
3. Description: `Professional fumigation for residential properties`
4. Upload Image: `fumigation.jpg`
5. Select: **Price Range**
6. Min Price: `10000`
7. Max Price: `32000`
8. Unit: `per sqm`
9. Active: ✓

**Result on Landing Page:**
```
┌─────────────────────────────┐
│   [Fumigation Image]        │
├─────────────────────────────┤
│ Fumigation                  │
│ Home Fumigation             │
│ Professional fumigation...  │
│                             │
│ RWF 10,000 - 32,000 / sqm   │
│ Price range based on...     │
│                             │
│ [Book Now] [Request Quote]  │
└─────────────────────────────┘
```

## 🎯 What Happens When Customer Clicks "Request Quote"?

Currently, it redirects to the booking form with `?requestQuote=true` parameter.

**Next Steps** (optional):
- Update booking form to detect `requestQuote` parameter
- Show different messaging for quote requests
- Create booking with `quote_requested` status
- See `QUOTE_REQUEST_IMPLEMENTATION.md` for full guide

## 🔧 Technical Details

### Service Interface (TypeScript):
```typescript
interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;          // Used for fixed pricing
  min_price: number | null;    // Used for range pricing
  max_price: number | null;    // Used for range pricing
  display_price_type: 'single' | 'range';
  unit: string;
  category: string;
  image_url: string | null;
  is_active: boolean;
}
```

### Price Display Logic:
```typescript
// Fixed Price
display_price_type: 'single' → Shows: "RWF 25,000 / unit"

// Price Range
display_price_type: 'range' → Shows: "RWF 10,000 - 32,000 / unit"
```

### Image Upload:
- **API**: `/api/services/upload-image`
- **Storage**: `service-photos/services/`
- **Max Size**: 5MB
- **Formats**: JPEG, PNG, GIF, WebP

## 📱 Mobile Responsive

All features work perfectly on mobile:
- Images scale appropriately
- Buttons stack on small screens
- Forms are touch-friendly

## 🔍 File Changes Summary

| File | Status | Changes |
|------|--------|---------|
| `lib/supabase/update-services-schema.sql` | ✅ New | Database migration |
| `app/admin/services/page.tsx` | ✅ Updated | Image upload, price range form |
| `app/page.tsx` | ✅ Updated | Display images, Request Quote button |
| `app/api/services/upload-image/route.ts` | ✅ New | Image upload API |
| `SERVICE_IMAGES_AND_PRICING_UPDATE.md` | ✅ New | Full documentation |
| `QUOTE_REQUEST_IMPLEMENTATION.md` | ✅ New | Quote feature guide |

## 🐛 Troubleshooting

### Images not uploading?
- Check `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- Verify storage bucket exists in Supabase Dashboard

### Prices not showing?
- Run the database migration
- Check service has `display_price_type` set
- For ranges, both `min_price` and `max_price` must be set

### Request Quote not working?
- Currently redirects to booking form
- Implement quote detection logic (see `QUOTE_REQUEST_IMPLEMENTATION.md`)

## 📚 Documentation

- **Full Guide**: `SERVICE_IMAGES_AND_PRICING_UPDATE.md`
- **Quote Implementation**: `QUOTE_REQUEST_IMPLEMENTATION.md`
- **API Documentation**: `API_ROUTES_GUIDE.md`

## 🎉 Features Comparison

### Before:
```
Service Card:
- No image
- Fixed price only
- One button: "Book Now"
```

### After:
```
Service Card:
- ✨ Service image with hover effect
- ✨ Fixed price OR price range
- ✨ Two buttons: "Book Now" + "Request Quote"
```

## 🚀 Ready to Use!

Your service management system now supports:
- Professional service images
- Flexible pricing (fixed or range)
- Multiple customer actions

Go to Admin → Services and start adding images and price ranges!

---

**Need Help?** Check the detailed documentation files or the troubleshooting section above.
