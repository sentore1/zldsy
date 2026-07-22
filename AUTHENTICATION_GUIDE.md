# Authentication & Dynamic Services Guide

## ✅ What's Been Implemented

### 1. Admin Login System
- **Login Page**: `/login`
- **Protected Admin Routes**: All `/admin/*` routes require authentication
- **Auto-redirect**: Unauthenticated users are redirected to login
- **Logout Functionality**: Logout button in admin sidebar

### 2. Dynamic Services Management
- **Full CRUD**: Create, Read, Update, Delete services
- **Real-time Updates**: Connected to live API
- **Toggle Status**: Activate/deactivate services
- **Search & Filter**: Find services quickly
- **Modal Forms**: User-friendly add/edit interface

---

## 🚀 Quick Start

### Step 1: Login to Admin Panel

1. **Start the development server** (if not running):
   ```bash
   npm run dev
   ```

2. **Open the login page**:
   ```
   http://localhost:3000/login
   ```

3. **Use demo credentials**:
   - **Email**: `admin@zldsystem.com`
   - **Password**: `admin123`

4. **Click "Sign In"**
   - You'll be redirected to `/admin/dashboard`

### Step 2: Manage Services

1. **Go to Services page**:
   ```
   http://localhost:3000/admin/services
   ```

2. **Add a new service**:
   - Click "Add Service" button
   - Fill in the form:
     - **Name**: e.g., "Home Fumigation"
     - **Description**: Brief description
     - **Category**: e.g., "Fumigation"
     - **Base Price**: e.g., 150.00
     - **Unit**: e.g., "per service"
     - **Active**: Check if service should be visible
   - Click "Add Service"

3. **Edit existing service**:
   - Click "Edit" button on any service card
   - Update the information
   - Click "Save Changes"

4. **Toggle service status**:
   - Click the toggle icon (top right of service card)
   - Service becomes active/inactive instantly

5. **Delete service**:
   - Click the trash icon
   - Confirm deletion

### Step 3: Test on Customer Side

1. **Go to customer portal**:
   ```
   http://localhost:3000/customer
   ```

2. **See your services**:
   - Only **active** services appear
   - Services show real-time from database

3. **Book a service**:
   - Click "Book Now"
   - Fill in the booking form
   - Service data is pulled from your admin settings

---

## 🔐 Authentication Details

### How It Works

1. **Middleware Protection** (`middleware.ts`):
   - Checks all `/admin/*` routes
   - Verifies authentication cookie
   - Redirects to `/login` if not authenticated

2. **Login Process**:
   - User enters credentials
   - Simple validation (can be upgraded to Supabase Auth)
   - Sets authentication flag in localStorage
   - Redirects to admin dashboard

3. **Logout Process**:
   - Click "Logout" in sidebar
   - Clears authentication data
   - Redirects to login page

### Current Credentials

**Default Admin Account:**
- Email: `admin@zldsystem.com`
- Password: `admin123`

> **Note**: This is a simple authentication for demo purposes. For production, implement Supabase Authentication (see upgrade guide below).

---

## 🎨 Services Management Features

### What You Can Do

#### 1. **View All Services**
- Grid layout with service cards
- Real-time data from database
- Shows: name, description, price, unit, category, status

#### 2. **Add New Service**
- Modal form with all fields
- Input validation
- Instant addition to database
- Auto-refresh service list

#### 3. **Edit Service**
- Pre-filled form with current data
- Update any field
- Save changes instantly
- Reflects immediately in UI

#### 4. **Delete Service**
- Confirmation prompt
- Removes from database
- Updates UI automatically

#### 5. **Toggle Active/Inactive**
- One-click status change
- Visual feedback (color coding)
- Affects customer visibility

#### 6. **Search Services**
- Filter by name or category
- Real-time search results
- No page reload needed

### UI Features

- **Statistics Cards**: Total, Active, Categories, Average Price
- **Color-coded Status**: Green (active), Red (inactive)
- **Responsive Design**: Works on mobile, tablet, desktop
- **Loading States**: Shows spinner while fetching data
- **Error Handling**: Displays errors with retry option

---

## 📱 Customer Experience

When customers visit your site, they will:

1. **See only ACTIVE services** on `/customer` page
2. **Book services** with current pricing
3. **Get real-time data** from your admin settings

**Example Flow:**
```
Admin adds "Home Fumigation" service ($150)
    ↓
Service appears on customer page immediately
    ↓
Customer books service
    ↓
Booking appears in admin dashboard
```

---

## 🔄 API Integration

The services page connects to these endpoints:

```typescript
// Get all services
GET /api/services

// Create service
POST /api/services
Body: { name, description, category, base_price, unit, is_active }

// Update service
PATCH /api/services/[id]
Body: { field_to_update: new_value }

// Delete service
DELETE /api/services/[id]

// Toggle status
PATCH /api/services/[id]
Body: { is_active: true/false }
```

---

## 🎯 Testing Checklist

### Login System
- [ ] Visit `/login` page
- [ ] Try wrong password (should show error)
- [ ] Login with correct credentials
- [ ] Redirect to `/admin/dashboard`
- [ ] Try accessing `/admin/services` without login (should redirect)
- [ ] Click logout button
- [ ] Verify redirected to login

### Services Management
- [ ] View all services
- [ ] Add new service
- [ ] Edit existing service
- [ ] Delete service
- [ ] Toggle service status
- [ ] Search for service
- [ ] Verify stats update correctly

### Customer View
- [ ] Visit `/customer` page
- [ ] See only active services
- [ ] Verify prices match admin settings
- [ ] Try booking a service

---

## 🚀 Upgrade to Production Authentication

### Option 1: Supabase Authentication (Recommended)

1. **Install Supabase Auth helpers**:
   ```bash
   npm install @supabase/auth-helpers-nextjs
   ```

2. **Replace login logic** in `app/login/page.tsx`:
   ```typescript
   const { data, error } = await supabase.auth.signInWithPassword({
     email,
     password,
   })
   ```

3. **Update middleware** to use Supabase session:
   ```typescript
   import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
   
   const supabase = createMiddlewareClient({ req, res })
   const { data: { session } } = await supabase.auth.getSession()
   ```

4. **Add user registration**:
   ```typescript
   const { data, error } = await supabase.auth.signUp({
     email,
     password,
   })
   ```

### Option 2: NextAuth.js

1. **Install NextAuth**:
   ```bash
   npm install next-auth
   ```

2. **Configure providers** (Google, GitHub, etc.)
3. **Protect routes** with session checks

### Option 3: Custom JWT Authentication

1. **Install jsonwebtoken**:
   ```bash
   npm install jsonwebtoken
   ```

2. **Create API route** for token generation
3. **Verify tokens** in middleware

---

## 📊 Database Setup

Make sure your database has services data:

1. **Run schema**:
   ```sql
   -- Already done if you followed BACKEND_QUICK_START.md
   ```

2. **Add sample services** (or use the admin UI):
   ```sql
   INSERT INTO services (name, description, base_price, unit, category, is_active)
   VALUES 
     ('Home Fumigation', 'Complete fumigation service', 150.00, 'per service', 'Fumigation', true),
     ('Pest Control', 'General pest control', 80.00, 'per visit', 'Pest Control', true);
   ```

3. **Verify in Supabase**:
   - Go to Supabase Dashboard
   - Click "Table Editor"
   - Select "services" table
   - See your data

---

## 🐛 Troubleshooting

### "Cannot access admin page"
- ✅ Did you login at `/login`?
- ✅ Check browser console for errors
- ✅ Clear localStorage and login again

### "Services not loading"
- ✅ Is dev server running? (`npm run dev`)
- ✅ Did you run database schema?
- ✅ Check `/api/services` in browser
- ✅ Check browser Network tab for API errors

### "Changes not saving"
- ✅ Check browser console for errors
- ✅ Verify Supabase connection
- ✅ Check `.env.local` has correct keys
- ✅ Look at terminal logs for API errors

### "Logout doesn't work"
- ✅ Clear browser cache
- ✅ Clear localStorage manually (DevTools → Application → Local Storage)
- ✅ Restart development server

---

## 📝 Files Modified/Created

### New Files:
- ✅ `middleware.ts` - Route protection
- ✅ `app/login/page.tsx` - Login page
- ✅ `app/admin/services/page.tsx` - Connected services page (replaced)

### Modified Files:
- ✅ `app/admin/layout.tsx` - Added logout button, active nav state

### Backup Files:
- `app/admin/services/page-old.tsx` - Original mock data version

---

## 🎉 Summary

You now have:

✅ **Secure Admin Login** - Password protected admin panel
✅ **Dynamic Services** - Add, edit, delete services in real-time
✅ **Live Database Connection** - All changes persist to database
✅ **Customer Integration** - Services appear automatically on customer portal
✅ **Professional UI** - Modal forms, search, filters, status toggles

**Next Steps:**
1. Try adding/editing services
2. Check customer portal to see changes
3. Upgrade to Supabase Auth for production
4. Apply same pattern to other admin pages (customers, jobs, etc.)

---

**Demo Credentials**: 
- Email: `admin@zldsystem.com`
- Password: `admin123`

**Login URL**: http://localhost:3000/login

**Admin Dashboard**: http://localhost:3000/admin/dashboard

**Services Management**: http://localhost:3000/admin/services

---

Ready to manage your services! 🚀
