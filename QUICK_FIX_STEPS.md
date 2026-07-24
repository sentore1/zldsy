# Quick Fix: API Routes Returning 404

## Issue
`GET /api/services 404`

## Root Causes
1. ❌ Stale Next.js build cache
2. ❌ Database not set up (tables don't exist)
3. ❌ API routes not recognized by Next.js

## Fix Steps (In Order!)

### Step 1: Stop Development Server
Press `Ctrl+C` in your terminal to stop the running dev server.

### Step 2: Clear Build Cache
```bash
cd d:\zldsystem\service-management-system
rmdir /s /q .next
```

### Step 3: Set Up Database (CRITICAL!)
Go to **Supabase SQL Editor** and run these files **in order**:

1. **Create Tables** → Run: `lib/supabase/schema.sql`
2. **Update Schema** → Run: `lib/supabase/update-services-schema.sql`
3. **Insert Data** → Run: `lib/supabase/seed-data.sql`
4. **Fix RLS** → Run: `lib/supabase/fix-services-rls.sql`

**Verify in Supabase:**
```sql
SELECT * FROM services;
```
Should show 8 services.

### Step 4: Verify Environment Variables
Open `.env.local` and make sure these are correct:
```
NEXT_PUBLIC_SUPABASE_URL=https://ycngtmmoomwgmkabqasy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### Step 5: Install Dependencies (if needed)
```bash
npm install
```

### Step 6: Start Development Server
```bash
npm run dev
```

### Step 7: Test API Endpoint
Open in browser:
- `http://localhost:3000/api/test` → Should return: `{"message":"API is working!"}`
- `http://localhost:3000/api/services` → Should return: `{"services":[...]}`

### Step 8: Check Landing Page
Go to: `http://localhost:3000`

Should now show 8 services!

---

## Still Getting 404?

### Check 1: Verify API Route File Exists
```bash
dir app\api\services\route.ts
```
Should exist.

### Check 2: Check for TypeScript Errors
```bash
npm run build
```
Look for compilation errors.

### Check 3: Check Node Modules
```bash
npm install --force
```

### Check 4: Check Next.js Version
Open `package.json`, should show:
```json
"next": "16.2.10"
```

### Check 5: Test Supabase Connection Directly
Create a test file: `test-supabase.js`
```javascript
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ycngtmmoomwgmkabqasy.supabase.co',
  'eyJhbGci...' // your anon key
)

async function test() {
  const { data, error } = await supabase.from('services').select('*')
  console.log('Data:', data)
  console.log('Error:', error)
}

test()
```

Run: `node test-supabase.js`

---

## What Changed

I added these config options to `/app/api/services/route.ts`:
```typescript
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
```

This forces Next.js to:
- Always run the API route dynamically (not cache it)
- Use Node.js runtime (not Edge runtime)

---

## Summary

The 404 error happens because:
1. **Next.js build cache** is stale
2. **Database isn't set up** (services table empty or doesn't exist)
3. **API routes need specific configuration** for Next.js 16

**Solution:**
1. ✅ Clear `.next` folder
2. ✅ Set up database in Supabase
3. ✅ Added dynamic config to API route
4. ✅ Restart dev server

After following all steps, your landing page will show services! 🎉
