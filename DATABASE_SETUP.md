# Database Setup Guide

## Problem: Landing Page Shows "No services available"

### Root Cause
The landing page is not showing services because the database either:
1. Doesn't have the required tables created, OR
2. The tables exist but have no data, OR
3. The schema is outdated (missing new columns like `image_url`, `display_price_type`)

### Solution: Run SQL Files in Correct Order

Follow these steps **in your Supabase SQL Editor**:

## Step 1: Create Tables (Schema)

Go to your Supabase project → SQL Editor → New Query

Copy and paste the contents of: `lib/supabase/schema.sql`

Click **Run** to execute.

✅ This creates all the necessary tables (services, customers, bookings, jobs, etc.)

---

## Step 2: Update Services Table (Add New Columns)

In SQL Editor → New Query

Copy and paste the contents of: `lib/supabase/update-services-schema.sql`

Click **Run** to execute.

✅ This adds the new columns:
- `image_url` (for service images)
- `min_price` and `max_price` (for price ranges)
- `display_price_type` (single or range)

---

## Step 3: Insert Sample Data

In SQL Editor → New Query

Copy and paste the contents of: `lib/supabase/seed-data.sql`

Click **Run** to execute.

✅ This inserts:
- 8 Services
- 8 Customers
- 8 Staff Members
- 10 Inventory Items
- 8 Equipment Items
- 3 Bookings
- 3 Jobs
- 9 Settings

---

## Step 4: Setup Storage (Optional - For Service Images)

In SQL Editor → New Query

Copy and paste the contents of: `lib/supabase/setup-storage.sql`

Click **Run** to execute.

✅ This creates a storage bucket for service images with proper security policies.

---

## Step 5: Setup RBAC (Optional - For Row Level Security)

In SQL Editor → New Query

Copy and paste the contents of: `lib/supabase/rbac.sql`

Click **Run** to execute.

✅ This sets up role-based access control for different user types.

---

## Verification

After running all SQL files:

1. **Check Services in Database:**
   ```sql
   SELECT * FROM services;
   ```
   You should see 8 services listed.

2. **Restart Your Development Server:**
   ```bash
   npm run dev
   ```

3. **Visit Landing Page:**
   - Go to `http://localhost:3000`
   - You should now see 8 services displayed
   - Categories: Fumigation, Pest Control, Cleaning

---

## Troubleshooting

### Still seeing "No services available"?

1. **Check Browser Console** (F12 → Console tab):
   - Look for API errors
   - Check if `/api/services` is returning data

2. **Test API Directly:**
   - Open: `http://localhost:3000/api/services`
   - Should return JSON: `{"services": [...]}`

3. **Verify Environment Variables:**
   - Check `.env.local` has correct Supabase URL and keys
   - Restart dev server after changing env vars

4. **Check Supabase Connection:**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is correct

5. **Check RLS Policies:**
   If services table has RLS enabled, add this policy:
   ```sql
   -- Allow public read access to active services
   CREATE POLICY "Public can view active services" ON services
       FOR SELECT USING (is_active = true);
   ```

---

## Quick Fix: If You Already Ran seed-data.sql Before

If you already inserted services but they're missing the new columns:

```sql
-- Update existing services to have display_price_type
UPDATE services 
SET display_price_type = 'single' 
WHERE display_price_type IS NULL;

-- Optional: Set some services to use price ranges
UPDATE services 
SET 
    display_price_type = 'range',
    min_price = base_price * 0.8,
    max_price = base_price * 1.5
WHERE name IN ('Commercial Fumigation', 'Termite Treatment', 'Disinfection Service');
```

---

## Database Structure

**Main Tables:**
- `services` - Service offerings
- `customers` - Customer information
- `bookings` - Service bookings
- `quotations` - Price quotations
- `jobs` - Service execution/jobs
- `invoices` - Billing
- `payments` - Payment tracking
- `staff` - Team members
- `equipment` - Vehicles and tools
- `inventory` - Materials and supplies

**Complete workflow:**
Customer → Booking → Quotation → Job → Invoice → Payment

---

## Next Steps

After database is set up and services are showing:

1. ✅ Test customer booking flow
2. ✅ Test admin dashboard
3. ✅ Upload service images (optional)
4. ✅ Customize service descriptions
5. ✅ Configure email settings
6. ✅ Set up authentication

For more details, see:
- `AUTHENTICATION_GUIDE.md` - User authentication setup
- `API_ROUTES_GUIDE.md` - API documentation
- `WHATS_REMAINING.md` - Outstanding tasks
