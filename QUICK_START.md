# Quick Start Guide - 5 Minutes to Running

Get the Service Management System running locally in just 5 minutes!

## 🚀 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)

## ⚡ Quick Setup

### 1. Install Dependencies (2 minutes)

```bash
cd service-management-system
npm install
```

### 2. Set Up Supabase (2 minutes)

**Option A: Use Existing Supabase Project**

If you have Supabase set up:

```bash
# Copy the example env file
cp .env.local.example .env.local

# Edit .env.local and add your Supabase credentials
```

**Option B: Create New Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Create new project (takes ~2 minutes)
3. Go to Settings → API
4. Copy your Project URL and anon key
5. Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Database (1 minute)

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy content from `lib/supabase/schema.sql`
4. Paste and click "Run"

### 4. Start Development Server (30 seconds)

```bash
npm run dev
```

### 5. Open in Browser (5 seconds)

Visit: **http://localhost:3000**

## 🎉 You're Done!

### What You Can Do Now

**Customer Portal:**
- Browse services: http://localhost:3000/customer
- Book a service: http://localhost:3000/customer/booking
- Track service: http://localhost:3000/customer/track

**Admin Dashboard:**
- Dashboard: http://localhost:3000/admin/dashboard
- Manage customers: http://localhost:3000/admin/customers
- Manage services: http://localhost:3000/admin/services
- View jobs: http://localhost:3000/admin/jobs
- Track invoices: http://localhost:3000/admin/invoices
- Staff management: http://localhost:3000/admin/staff
- View reports: http://localhost:3000/admin/reports

## 📝 Current Status

The system is running with:
- ✅ Complete UI/UX
- ✅ All pages functional
- ✅ Database schema ready
- ✅ Mock data for testing
- 🔄 Backend integration needed (see PROJECT_OVERVIEW.md)

## ⚠️ Important Notes

1. **Mock Data**: All pages currently show sample data
2. **No Auth**: Admin panel is accessible to everyone (add auth before production)
3. **No File Upload**: Photo upload UI exists but doesn't save to storage yet
4. **Database Empty**: Run seed script to add sample data (optional)

## 🔧 Optional: Add Sample Data

Create `lib/supabase/seed.sql` with:

```sql
-- Sample Services
INSERT INTO services (name, description, base_price, unit, category, is_active) VALUES
('Cleaning Service', 'Professional cleaning', 50.00, 'per sqm', 'Cleaning', true),
('Fumigation', 'Pest control services', 80.00, 'per property', 'Pest Control', true),
('Maintenance', 'General repairs', 60.00, 'per hour', 'Maintenance', true);

-- Sample Staff
INSERT INTO staff (name, email, phone, role, hourly_rate, is_active) VALUES
('Mike Johnson', 'mike@example.com', '+1234567890', 'Technician', 25.00, true),
('Sarah Williams', 'sarah@example.com', '+1234567891', 'Assistant', 18.00, true);
```

Run this in Supabase SQL Editor.

## 🆘 Troubleshooting

### "Module not found" error
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Can't connect to Supabase"
- Check your `.env.local` file
- Verify Supabase URL and key
- Restart dev server: `npm run dev`

### Port 3000 already in use
```bash
# Use different port
npm run dev -- -p 3001
```

## 📚 Next Steps

1. **Read Documentation**
   - `README.md` - Full documentation
   - `SETUP_GUIDE.md` - Detailed setup
   - `PROJECT_OVERVIEW.md` - Architecture & roadmap

2. **Customize**
   - Update colors in `tailwind.config.js`
   - Modify services in admin panel
   - Add your branding

3. **Deploy**
   - Push to GitHub
   - Deploy to Vercel (one-click)
   - Add environment variables

## 🎯 Support

Questions? Check the README.md or create an issue!

---

**That's it! You're ready to start building.** 🚀
