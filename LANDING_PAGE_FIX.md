# Landing Page Fix: "No services available"

## 🔍 Problem Analysis

Your landing page shows **"No services available"** for one of these reasons:

### 1. **Database Not Set Up** ❌
- Tables don't exist in Supabase

### 2. **No Data in Database** ❌  
- Tables exist but no services inserted

### 3. **Schema Mismatch** ❌
- Services table missing new columns: `image_url`, `display_price_type`, `min_price`, `max_price`
- Seed data was written for old schema

### 4. **Row Level Security (RLS) Blocking Access** ❌
- RLS enabled but no policy allowing public read access

---

## ✅ Complete Solution

### Step 1: Run SQL Files in Supabase (In Order!)

Open your Supabase project → **SQL Editor** → Run these files **in this exact order**:

#### A. Create Tables
**File:** `lib/supabase/schema.sql`
```
Creates: services, customers, bookings, jobs, invoices, etc.
```

#### B. Update Services Schema  
**File:** `lib/supabase/update-services-schema.sql`
```
Adds: image_url, min_price, max_price, display_price_type columns
```

#### C. Insert Sample Data
**File:** `lib/supabase/seed-data.sql` (✅ UPDATED!)
```
Inserts: 8 services, 8 customers, 8 staff, 10 inventory items, etc.
Note: This file has been updated to include the new columns!
```

#### D. Fix Row Level Security
**File:** `lib/supabase/fix-services-rls.sql` (✅ NEW!)
```
Allows: Public read access to active services
```

---

### Step 2: Verify in Supabase

Run this query in SQL Editor:

```sql
SELECT id, name, category, base_price, unit, display_price_type, is_active 
FROM services 
WHERE is_active = true;
```

**Expected Result:** 8 services should be listed

---

### Step 3: Test the API

Open in browser: `http://localhost:3000/api/services`

**Expected Response:**
```json
{
  "services": [
    {
      "id": "...",
      "name": "Residential Fumigation",
      "description": "Complete fumigation service...",
      "base_price": 150.00,
      "unit": "sqm",
      "category": "Fumigation",
      "is_active": true,
      "display_price_type": "single",
      "image_url": null,
      "min_price": null,
      "max_price": null
    },
    ...
  ]
}
```

---

### Step 4: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

---

### Step 5: Visit Landing Page

Go to: `http://localhost:3000`

**Expected Result:** 
- 8 services displayed in a grid
- Categories: All, Fumigation, Pest Control, Cleaning
- Each service card shows:
  - Category badge
  - Service name
  - Description
  - Price (RWF xxx / unit)
  - "Book Now" and "Request Quote" buttons

---

## 🐛 Troubleshooting

### Issue: Still showing "No services available"

**1. Check Browser Console (F12)**
```
Look for:
- Network errors (failed to fetch)
- API errors (500, 404)
- CORS errors
```

**2. Check API Response**
```bash
# Test API directly
curl http://localhost:3000/api/services
```

Should return JSON with services array, not error.

**3. Check Environment Variables**
```bash
# Verify these are set correctly in .env.local
NEXT_PUBLIC_SUPABASE_URL=https://ycngtmmoomwgmkabqasy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

**4. Check Supabase RLS Policies**

In Supabase → Authentication → Policies → services table

Should have:
- ✅ "Public can view active services" - SELECT - USING (is_active = true)

If missing, run: `lib/supabase/fix-services-rls.sql`

**5. Check Services Table Schema**

In Supabase → Table Editor → services

Required columns:
- id (uuid)
- name (text)
- description (text)
- base_price (numeric)
- unit (text)
- category (text)
- is_active (boolean)
- **display_price_type** (text) ← Must exist!
- **image_url** (text) ← Must exist!
- **min_price** (numeric) ← Must exist!
- **max_price** (numeric) ← Must exist!

If missing, run: `lib/supabase/update-services-schema.sql`

---

## 📋 Quick Checklist

Before asking "why is it not working?":

- [ ] Ran `schema.sql` in Supabase
- [ ] Ran `update-services-schema.sql` in Supabase  
- [ ] Ran `seed-data.sql` (the updated version!) in Supabase
- [ ] Ran `fix-services-rls.sql` in Supabase
- [ ] Verified services exist: `SELECT * FROM services;`
- [ ] Verified RLS policy exists for public read
- [ ] Restarted dev server: `npm run dev`
- [ ] Tested API endpoint: `/api/services` returns data
- [ ] Checked browser console for errors
- [ ] Environment variables are correct

---

## 🎯 What Changed

### Files Updated:

1. **`lib/supabase/seed-data.sql`** - ✅ UPDATED
   - Now includes `display_price_type`, `image_url`, `min_price`, `max_price`
   - Changed unit format: "per sqm" → "sqm" (matches frontend)

2. **`lib/supabase/fix-services-rls.sql`** - ✅ NEW
   - Fixes Row Level Security to allow public read access
   - Required for landing page to show services

3. **`DATABASE_SETUP.md`** - ✅ NEW
   - Complete guide for database setup
   - Step-by-step instructions

4. **`LANDING_PAGE_FIX.md`** - ✅ THIS FILE
   - Problem diagnosis
   - Complete solution
   - Troubleshooting guide

---

## 🚀 After Services Are Showing

Once services are displaying correctly, you can:

1. **Add Service Images**
   - Run: `lib/supabase/setup-storage.sql`
   - Upload images via Supabase Storage
   - Update services with image URLs

2. **Customize Services**
   - Edit descriptions
   - Adjust prices
   - Add more categories
   - Upload images

3. **Test Booking Flow**
   - Click "Book Now" on a service
   - Fill customer booking form
   - Verify booking is created

4. **Test Admin Dashboard**
   - Go to `/admin`
   - Login (once authentication is set up)
   - Manage services, bookings, customers

---

## 💡 Key Insights

**Why this happened:**
1. The frontend expects new schema fields (`display_price_type`, etc.)
2. But the seed data was written for the old schema
3. RLS might have been blocking public read access
4. The schema update SQL was separate from seed data

**The fix:**
1. ✅ Updated seed data to include new fields
2. ✅ Created RLS fix to allow public read
3. ✅ Documented the correct setup order
4. ✅ Added troubleshooting steps

---

## 📞 Need More Help?

If services still aren't showing after following this guide:

1. Export your services table as CSV from Supabase
2. Check the API response in browser DevTools
3. Share any error messages from console
4. Verify all 4 SQL files were run successfully

The landing page **will work** once the database is properly set up! 🎉
