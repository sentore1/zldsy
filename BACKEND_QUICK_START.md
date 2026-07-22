# Backend Quick Start Guide

## ✅ What's Been Implemented

Your Service Management System now has a **fully functional REST API backend** with 30+ endpoints covering all core business operations.

## 🚀 Getting Started (3 Steps)

### Step 1: Database Setup (5 minutes)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Open your project: `ycngtmmoomwgmkabqasy`

2. **Run the SQL Schema**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"
   - Copy the entire content from `lib/supabase/schema.sql`
   - Paste and click "Run"
   - Wait for success message

3. **Verify Tables Created**
   - Click on "Table Editor" in left sidebar
   - You should see 19 tables:
     - customers, services, bookings, booking_photos
     - quotations, quotation_items
     - staff, jobs, job_staff, job_materials, job_equipment
     - inventory, equipment
     - invoices, payments
     - feedback, expenses, attendance, settings

### Step 2: Start Development Server

```bash
npm run dev
```

Your backend is now running at http://localhost:3000/api

### Step 3: Test Your First API Call

**Option A: Using curl (Command Line)**
```bash
curl http://localhost:3000/api/reports/dashboard
```

**Option B: Using Browser**
Open http://localhost:3000/api/reports/dashboard in your browser

**Option C: Using Postman/Thunder Client**
- Create a GET request to http://localhost:3000/api/reports/dashboard
- Click Send

You should see a JSON response with dashboard statistics!

---

## 📋 Available API Endpoints

### Core Resources
- ✅ **Services**: `/api/services` - Manage service catalog
- ✅ **Customers**: `/api/customers` - Customer management
- ✅ **Bookings**: `/api/bookings` - Service bookings
- ✅ **Quotations**: `/api/quotations` - Auto-generated quotes
- ✅ **Jobs**: `/api/jobs` - Service execution tracking
- ✅ **Staff**: `/api/staff` - Employee management
- ✅ **Invoices**: `/api/invoices` - Billing and invoicing
- ✅ **Payments**: `/api/payments` - Payment processing
- ✅ **Inventory**: `/api/inventory` - Stock management
- ✅ **Reports**: `/api/reports/dashboard` - Business analytics

### Common Operations
Each resource supports:
- `GET /api/[resource]` - List all
- `POST /api/[resource]` - Create new
- `GET /api/[resource]/[id]` - Get single
- `PATCH /api/[resource]/[id]` - Update
- `DELETE /api/[resource]/[id]` - Delete

---

## 🎯 Quick Test Workflow

### 1. Create a Service
```bash
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Home Fumigation",
    "description": "Complete fumigation service",
    "base_price": 150.00,
    "unit": "per service",
    "category": "Fumigation",
    "is_active": true
  }'
```

**Save the `id` from the response!**

### 2. Create a Booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "customer_info": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "address": "123 Main St"
    },
    "service_id": "YOUR_SERVICE_ID_HERE",
    "preferred_date": "2024-08-15T10:00:00Z",
    "notes": "First test booking"
  }'
```

**Save the `id` from the response!**

### 3. Generate Quotation
```bash
curl -X POST http://localhost:3000/api/quotations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "YOUR_BOOKING_ID_HERE"
  }'
```

### 4. View Dashboard
```bash
curl http://localhost:3000/api/reports/dashboard
```

---

## 🔗 Connect Frontend to Backend

Your admin pages currently use mock data. Here's how to connect them to the real API:

### Example: Update Jobs Page

**Before (Mock Data):**
```typescript
// app/admin/jobs/page.tsx
const mockJobs = [
  { id: '1', customer: 'John Doe', ... }
]
```

**After (Real API):**
```typescript
// app/admin/jobs/page.tsx
'use client'
import { useEffect, useState } from 'react'

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        setJobs(data.jobs)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {jobs.map(job => (
        <div key={job.id}>{job.job_number}</div>
      ))}
    </div>
  )
}
```

---

## 📚 Documentation Files

1. **BACKEND_IMPLEMENTATION.md** - Complete API documentation
2. **API_TESTING_GUIDE.md** - Detailed testing examples for all endpoints
3. **API_ROUTES_GUIDE.md** - Implementation reference
4. **This file** - Quick start guide

---

## 🛠️ Troubleshooting

### Issue: "Failed to fetch"
- ✅ Check if dev server is running (`npm run dev`)
- ✅ Verify URL is correct: `http://localhost:3000/api/...`
- ✅ Check browser console for errors

### Issue: "Supabase connection error"
- ✅ Verify `.env.local` file exists (copy from `.env.local.example`)
- ✅ Check Supabase credentials are correct
- ✅ Restart dev server after changing env variables

### Issue: "Table does not exist"
- ✅ Run the schema.sql in Supabase SQL Editor
- ✅ Verify tables appear in Table Editor
- ✅ Check project URL matches your .env.local

### Issue: Empty response / No data
- ✅ Database is empty! Create some data using POST endpoints
- ✅ Check Supabase Table Editor to see data
- ✅ Verify filters in query params aren't excluding everything

---

## 🎨 Admin Panel Integration

Your admin pages are ready at:
- http://localhost:3000/admin/dashboard
- http://localhost:3000/admin/customers
- http://localhost:3000/admin/services
- http://localhost:3000/admin/jobs
- http://localhost:3000/admin/invoices
- http://localhost:3000/admin/staff
- http://localhost:3000/admin/bookings
- http://localhost:3000/admin/inventory
- http://localhost:3000/admin/reports

They currently show mock data. Update them to use the API endpoints to see real data!

---

## ✨ What Works Right Now

✅ **Full CRUD Operations** on all resources
✅ **Auto-generation** of quotations from bookings
✅ **Auto-numbering** for quotations, invoices, jobs
✅ **Smart relationships** - fetch related data in one call
✅ **Status management** - payments auto-update invoice status
✅ **Filtering & search** - query params for all list endpoints
✅ **Dashboard statistics** - real-time business metrics
✅ **Error handling** - comprehensive error responses

---

## 🚀 Next Steps

### Phase 1: Connect Frontend (1-2 days)
- Replace mock data in admin pages with API calls
- Add loading states
- Add error handling
- Add form submissions

### Phase 2: Add Features (3-5 days)
- File upload for booking photos
- PDF generation for invoices/quotations
- Email notifications
- Payment gateway integration

### Phase 3: Authentication (2-3 days)
- Supabase Auth integration
- Protected routes
- Role-based access control

### Phase 4: Production (1-2 days)
- Deploy to Vercel
- Set up production database
- Configure environment variables
- Test end-to-end

---

## 💡 Pro Tips

1. **Use Thunder Client** (VS Code extension) for quick API testing
2. **Watch the terminal** - All errors are logged there
3. **Check Supabase logs** - Real-time database operations
4. **Start simple** - Test one endpoint at a time
5. **Save test data** - Use Postman collections or scripts

---

## 📞 Need Help?

1. Check the terminal where `npm run dev` is running for error details
2. Review API_TESTING_GUIDE.md for endpoint examples
3. Check BACKEND_IMPLEMENTATION.md for complete documentation
4. Verify Supabase dashboard for database issues
5. Check browser Network tab for API request/response

---

**Your backend is ready! Start testing and connecting your frontend. Good luck! 🎉**
