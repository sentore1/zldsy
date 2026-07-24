# Fix Equipment Notes Column Error

## Problem
When adding equipment, you're getting this error:
```
Could not find the 'notes' column of 'equipment' in the schema cache
```

This happens because the `equipment` table is missing the `notes` column that the application is trying to use.

---

## Solution: Add the Missing Column

### Step 1: Go to Supabase SQL Editor

1. Open your Supabase project: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

### Step 2: Run This SQL Command

Copy and paste this SQL code into the editor:

```sql
-- Add notes column to equipment table
ALTER TABLE equipment 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN equipment.notes IS 'Additional notes or description for the equipment';
```

### Step 3: Execute the Query

1. Click the **"Run"** button (or press `Ctrl+Enter`)
2. You should see a success message
3. The `notes` column is now added to your `equipment` table

### Step 4: Verify the Fix

1. Go back to your application
2. Try adding a new equipment item
3. The form should now work without errors!

---

## What This Does

- Adds a `notes` TEXT column to the `equipment` table
- Uses `IF NOT EXISTS` so it won't fail if the column already exists
- Allows equipment records to have optional notes/descriptions

---

## Alternative: Run from Command Line (if you have Supabase CLI)

If you have the Supabase CLI installed, you can also run:

```bash
supabase db execute -f lib/supabase/add-equipment-notes.sql
```

---

## After the Fix

Once the column is added, you'll be able to:
- ✅ Add equipment with notes
- ✅ Edit equipment and update notes
- ✅ View notes in equipment details
- ✅ Store additional information about each equipment item

---

## Files Created

- `lib/supabase/add-equipment-notes.sql` - The SQL migration script

---

**Need Help?** If you encounter any issues, check:
1. You're connected to the correct Supabase project
2. You have admin/owner permissions on the database
3. The equipment table exists (it should if other parts of the app are working)
