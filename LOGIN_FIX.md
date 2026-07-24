# 🔧 Login Issue - Complete Fix Guide

## 🔍 Problem Identified

Your login system is **properly configured** to use Supabase authentication, but **no user accounts exist** in the Supabase Auth system yet.

The authentication guide mentions demo credentials (`admin@zldsystem.com` / `admin123`), but these are from an old implementation. The current system uses **real Supabase authentication** which requires actual user accounts.

---

## ✅ Solution: Create Admin User in Supabase

### Step 1: Access Supabase Dashboard

1. Go to: https://app.supabase.com/project/ycngtmmoomwgmkabqasy
2. Login to your Supabase account

### Step 2: Create User via Authentication

1. In Supabase Dashboard, click **"Authentication"** in the left sidebar
2. Click **"Users"** tab
3. Click **"Add user"** button (top right)
4. Choose **"Create new user"**
5. Fill in the form:
   - **Email**: `admin@zldsystem.com`
   - **Password**: `admin123` (or your preferred secure password)
   - **Auto Confirm User**: ✅ Check this box (important!)
6. Click **"Create user"**
7. **Copy the User UUID** from the users list (you'll need this in Step 3)

### Step 3: Assign Admin Role

1. In Supabase Dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Paste this SQL (replace `YOUR_USER_UUID` with the UUID from Step 2):

```sql
-- Replace YOUR_USER_UUID with the actual UUID from the users table
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_USER_UUID', 'admin');
```

Example:
```sql
-- If your user UUID is: a1b2c3d4-e5f6-7890-abcd-ef1234567890
INSERT INTO user_roles (user_id, role)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin');
```

4. Click **"Run"** (or press Ctrl+Enter)
5. You should see: "Success. No rows returned"

### Step 4: Verify Setup

Run this query to confirm the user role was created:

```sql
SELECT 
    ur.role,
    au.email,
    au.created_at
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id;
```

You should see:
```
role  | email                  | created_at
------|------------------------|------------------
admin | admin@zldsystem.com    | 2024-XX-XX ...
```

---

## 🚀 Test Login

1. **Start your dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Open login page**:
   ```
   http://localhost:3000/login
   ```

3. **Enter credentials**:
   - **Email**: `admin@zldsystem.com`
   - **Password**: `admin123` (or whatever you set)

4. **Click "Sign in"**
   - You should be redirected to `/admin/dashboard`
   - The sidebar should show your email

---

## 🎯 Quick Alternative: SQL Script Method

If you prefer to do everything in one SQL script:

### Option A: Create User Directly in Database (Advanced)

⚠️ **Warning**: This bypasses Supabase Auth UI and requires encrypted password

```sql
-- This is complex because passwords must be encrypted
-- Better to use the Dashboard method above
```

### Option B: Use Supabase CLI (Recommended for Multiple Users)

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Create user
supabase auth create-user admin@zldsystem.com --password admin123

# Then assign role in SQL Editor as shown in Step 3
```

---

## 🔐 Create Additional Users

To create more users (managers, staff):

### Manager Account:
1. Create user in Supabase Auth Dashboard:
   - Email: `manager@zldsystem.com`
   - Password: `manager123`
   - Auto Confirm: ✅
2. Assign role:
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('MANAGER_USER_UUID', 'manager');
   ```

### Staff Account:
1. Create user in Supabase Auth Dashboard:
   - Email: `staff@zldsystem.com`
   - Password: `staff123`
   - Auto Confirm: ✅
2. Assign role:
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('STAFF_USER_UUID', 'staff');
   ```

---

## 🛡️ Role Permissions Reference

After login, each role has different access:

| Role    | Access Level                                    |
|---------|-------------------------------------------------|
| admin   | ✅ Full access to all pages                     |
| manager | ✅ Dashboard, Customers, Services, Bookings, Quotations, Jobs, Invoices, Payments, Staff, Inventory, Equipment, Reports |
| staff   | ✅ Dashboard, Jobs only                         |

---

## 🐛 Troubleshooting

### Issue: "Invalid login credentials"
**Causes**:
- User doesn't exist in Supabase Auth
- Password is incorrect
- User email is not confirmed

**Fix**:
1. Go to Supabase Dashboard → Authentication → Users
2. Check if user exists
3. Check if "Confirmed" column shows ✅
4. If not confirmed, click the user → Click "Confirm user"

### Issue: "User authenticated but redirects to login"
**Causes**:
- User exists in auth.users but not in user_roles table
- Middleware can't find role

**Fix**:
1. Run this query to check:
   ```sql
   SELECT * FROM user_roles WHERE user_id = 'YOUR_USER_UUID';
   ```
2. If empty, run the INSERT statement from Step 3

### Issue: "Access denied to admin pages"
**Causes**:
- User has wrong role (staff trying to access manager pages)

**Fix**:
1. Check user's role:
   ```sql
   SELECT role FROM user_roles WHERE user_id = 'YOUR_USER_UUID';
   ```
2. Update if needed:
   ```sql
   UPDATE user_roles 
   SET role = 'admin' 
   WHERE user_id = 'YOUR_USER_UUID';
   ```

### Issue: Browser shows "Network error" or "Failed to fetch"
**Causes**:
- Supabase environment variables are wrong
- Supabase project is paused/deleted

**Fix**:
1. Verify `.env.local` has correct values
2. Check Supabase Dashboard to ensure project is active
3. Test connection:
   ```bash
   curl https://ycngtmmoomwgmkabqasy.supabase.co/rest/v1/
   ```

---

## 📋 Complete Setup Checklist

- [ ] Supabase project is active
- [ ] `.env.local` has correct Supabase URL and keys
- [ ] User created in Supabase Auth Dashboard
- [ ] User is confirmed (email verified)
- [ ] User role assigned in `user_roles` table
- [ ] Dev server is running (`npm run dev`)
- [ ] Can access `/login` page
- [ ] Can login with credentials
- [ ] Redirected to `/admin/dashboard` after login
- [ ] Sidebar shows user email
- [ ] Can access admin pages based on role
- [ ] Logout button works

---

## 🎉 Success!

Once you complete Step 1-4, you'll be able to:

✅ Login at `http://localhost:3000/login`
✅ Access admin dashboard
✅ Manage services, customers, jobs, etc.
✅ Logout and login again

---

## 📝 Summary

**The issue**: No user accounts exist in Supabase Auth system
**The fix**: Create user in Supabase Dashboard + assign role in database
**Test credentials** (after setup):
- Email: `admin@zldsystem.com`
- Password: `admin123`

---

**Need Help?**

1. Check Supabase Dashboard → Authentication → Users (should see your user)
2. Check Supabase Dashboard → Table Editor → user_roles (should see role assigned)
3. Check browser console for error messages
4. Check Network tab to see API responses

---

Let me know if you encounter any issues! 🚀
