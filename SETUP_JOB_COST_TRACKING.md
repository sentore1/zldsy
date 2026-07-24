# Setup Guide: Job Cost Tracking Feature

## What's Been Created

### 1. New Page: Job Detail with Cost Tracking
**File**: `app/admin/jobs/[id]/page.tsx`
- View complete job details
- Add/remove staff assignments with hours and costs
- Add/remove materials with automatic inventory deduction
- Add/remove equipment with fuel tracking
- Real-time profitability dashboard showing:
  - Service Revenue
  - Total Costs (breakdown by staff, materials, equipment)
  - Gross Profit
  - Profit Margin %

### 2. New API Routes

#### Staff Management
- `POST /api/jobs/[id]/staff` - Assign staff to job
- `DELETE /api/jobs/[id]/staff/[staffId]` - Remove staff assignment

#### Materials Management
- `POST /api/jobs/[id]/materials` - Add materials to job (auto-deducts from inventory)
- `DELETE /api/jobs/[id]/materials/[materialId]` - Remove materials (restores inventory)

#### Equipment Management
- `POST /api/jobs/[id]/equipment` - Assign equipment to job
- `DELETE /api/jobs/[id]/equipment/[equipmentId]` - Remove equipment

### 3. Database Function
**File**: `lib/supabase/update-inventory-function.sql`
- Function to update inventory quantities when materials are added/removed from jobs

### 4. Updated Jobs List Page
**File**: `app/admin/jobs/page.tsx`
- Added "View Details & Costs" button to navigate to job detail page

### 5. Documentation
- `JOB_COST_TRACKING_GUIDE.md` - Complete user guide

## Installation Steps

### Step 1: Apply Database Function
Run the SQL function to enable inventory updates:

```bash
# Navigate to your project
cd d:\zldsystem\service-management-system

# Apply the function using Supabase CLI or dashboard
```

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste content from `lib/supabase/update-inventory-function.sql`
4. Click "Run"

**Option B: Using Supabase CLI**
```bash
supabase db execute --file lib/supabase/update-inventory-function.sql
```

### Step 2: Verify Database Schema
The schema should already have these tables (check `lib/supabase/schema.sql`):
- ✅ `job_staff` - for staff assignments
- ✅ `job_materials` - for materials tracking
- ✅ `job_equipment` - for equipment tracking

If they don't exist, run the full schema file.

### Step 3: Install Dependencies (if needed)
```bash
npm install
```

### Step 4: Test the Feature

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Navigate to Jobs**
   - Go to `http://localhost:3000/admin/jobs`
   
3. **Create or Select a Job**
   - Click "View Details & Costs" on any job
   
4. **Add Staff**
   - Select a staff member
   - Enter hours worked
   - Click "Add Staff"
   - Verify cost calculation
   
5. **Add Materials**
   - Select a material
   - Enter quantity
   - Click "Add Material"
   - Check inventory was reduced
   
6. **Add Equipment**
   - Select equipment
   - Enter fuel details
   - Click "Add Equipment"
   - Verify equipment status changed to "in_use"
   
7. **Check Profitability Dashboard**
   - Verify all calculations are correct
   - Check profit margin calculation

## Prerequisites

Before using this feature, ensure:

1. **Staff Records Exist** with hourly rates set
   - Go to Admin → Staff
   - Add staff members with their hourly rates
   
2. **Inventory Items Exist** with unit costs
   - Go to Admin → Inventory
   - Add materials with unit costs and quantities
   
3. **Equipment Records Exist**
   - Go to Admin → Equipment
   - Add vehicles/machines

4. **Jobs/Bookings Exist**
   - Go to Admin → Bookings
   - Create and confirm bookings
   - Create jobs from confirmed bookings

## Troubleshooting

### Issue: "Failed to add material"
**Solution**: Make sure the inventory item exists and has sufficient quantity

### Issue: Staff cost shows as 0
**Solution**: Check that staff member has a hourly_rate set in the staff table

### Issue: Inventory not updating
**Solution**: Make sure the `update_inventory_quantity` function was applied to your database

### Issue: Equipment status not changing
**Solution**: Verify equipment record exists and API has permission to update it

### Issue: Can't see job details page
**Solution**: 
1. Make sure Next.js has rebuilt the pages
2. Try stopping and restarting the dev server
3. Clear `.next` folder and rebuild

## Verification Checklist

- [ ] Database function created successfully
- [ ] Can navigate to job detail page
- [ ] Can add staff with automatic cost calculation
- [ ] Can add materials with inventory deduction
- [ ] Can add equipment
- [ ] Can remove staff/materials/equipment
- [ ] Profitability dashboard shows correct calculations
- [ ] Inventory updates when materials are added/removed
- [ ] Equipment status changes to "in_use"

## Next Steps

After setup is complete:

1. **Configure Master Data**
   - Set up all staff with correct hourly rates
   - Add inventory items with accurate unit costs
   - Register all equipment
   
2. **Train Users**
   - Show staff how to track costs
   - Explain importance of accurate tracking
   - Demonstrate profitability analysis
   
3. **Start Tracking**
   - Begin with a few test jobs
   - Verify all calculations
   - Adjust as needed
   
4. **Analyze Results**
   - Review profit margins after first week
   - Identify high-cost resources
   - Optimize pricing strategy

## Support

If you encounter issues:
1. Check browser console for errors (F12)
2. Check terminal for API errors
3. Verify database tables and functions exist
4. Ensure Supabase connection is working
5. Review the JOB_COST_TRACKING_GUIDE.md for usage help
