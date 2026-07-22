# 🔗 Admin Pages Backend Connection Guide

## ✅ What's Already Connected

### 1. **Dashboard** (`/admin/dashboard`)
- ✅ Real-time statistics from `/api/reports/dashboard`
- ✅ Job counts by status
- ✅ Revenue and financial data
- ✅ Staff count
- ✅ Low stock alerts
- ✅ Recent jobs list

### 2. **Services** (`/admin/services`)
- ✅ Full CRUD operations
- ✅ Add, edit, delete services
- ✅ Toggle active/inactive
- ✅ Search and filter
- ✅ Real-time database updates

---

## 🚀 Quick Connection Pattern

All other admin pages follow the same pattern. Here's the template:

### Step 1: Add State & Fetch Function

```typescript
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchItems();
}, []);

const fetchItems = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/RESOURCE_NAME');
    const data = await response.json();
    setItems(data.RESOURCE_NAME || []);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
```

### Step 2: Add Create Function

```typescript
const handleCreate = async (formData) => {
  const response = await fetch('/api/RESOURCE_NAME', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  
  if (response.ok) {
    fetchItems(); // Refresh list
  }
};
```

### Step 3: Add Update Function

```typescript
const handleUpdate = async (id, updates) => {
  const response = await fetch(`/api/RESOURCE_NAME/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  if (response.ok) {
    fetchItems(); // Refresh list
  }
};
```

### Step 4: Add Delete Function

```typescript
const handleDelete = async (id) => {
  if (!confirm('Are you sure?')) return;
  
  const response = await fetch(`/api/RESOURCE_NAME/${id}`, {
    method: 'DELETE',
  });
  
  if (response.ok) {
    setItems(items.filter(item => item.id !== id));
  }
};
```

---

## 📋 Pages That Need Connection

### 1. **Customers Page** (`/admin/customers`)

**API Endpoint**: `/api/customers`

**Quick Connect:**
```typescript
// Replace mock data with:
const [customers, setCustomers] = useState([]);

useEffect(() => {
  fetch('/api/customers')
    .then(res => res.json())
    .then(data => setCustomers(data.customers || []))
}, []);
```

**Features to Add:**
- View all customers
- Add new customer
- Edit customer details
- Delete customer
- Search customers

---

### 2. **Bookings Page** (`/admin/bookings`)

**API Endpoint**: `/api/bookings`

**Quick Connect:**
```typescript
const [bookings, setBookings] = useState([]);

useEffect(() => {
  fetch('/api/bookings')
    .then(res => res.json())
    .then(data => setBookings(data.bookings || []))
}, []);
```

**Features to Add:**
- View all bookings
- Filter by status
- Update booking status
- View booking details
- Assign to jobs

---

### 3. **Jobs Page** (`/admin/jobs`)

**API Endpoint**: `/api/jobs`

**Quick Connect:**
```typescript
const [jobs, setJobs] = useState([]);

useEffect(() => {
  fetch('/api/jobs')
    .then(res => res.json())
    .then(data => setJobs(data.jobs || []))
}, []);
```

**Features to Add:**
- View all jobs
- Update job status
- Assign staff
- Track materials used
- Complete jobs

---

### 4. **Invoices Page** (`/admin/invoices`)

**API Endpoint**: `/api/invoices`

**Quick Connect:**
```typescript
const [invoices, setInvoices] = useState([]);

useEffect(() => {
  fetch('/api/invoices')
    .then(res => res.json())
    .then(data => setInvoices(data.invoices || []))
}, []);
```

**Features to Add:**
- View all invoices
- Filter by status
- Mark as paid
- Generate PDF
- Send to customer

---

### 5. **Staff Page** (`/admin/staff`)

**API Endpoint**: `/api/staff`

**Quick Connect:**
```typescript
const [staff, setStaff] = useState([]);

useEffect(() => {
  fetch('/api/staff')
    .then(res => res.json())
    .then(data => setStaff(data.staff || []))
}, []);
```

**Features to Add:**
- View all staff
- Add new staff
- Edit staff details
- Toggle active/inactive
- View assigned jobs

---

### 6. **Inventory Page** (`/admin/inventory`)

**API Endpoint**: `/api/inventory`

**Quick Connect:**
```typescript
const [inventory, setInventory] = useState([]);

useEffect(() => {
  fetch('/api/inventory')
    .then(res => res.json())
    .then(data => setInventory(data.inventory || []))
}, []);
```

**Features to Add:**
- View all inventory
- Add new items
- Update stock levels
- Low stock alerts
- Reorder items

---

## 🎯 Priority Order for Connection

1. **✅ Dashboard** - DONE
2. **✅ Services** - DONE
3. **Customers** - Basic view (high priority)
4. **Jobs** - Status tracking (high priority)
5. **Invoices** - Payment tracking (high priority)
6. **Bookings** - Customer requests (medium priority)
7. **Staff** - Team management (medium priority)
8. **Inventory** - Stock management (low priority)

---

## 📦 Copy-Paste Template

Use this as a starting point for any page:

```typescript
"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";

export default function ResourcePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/RESOURCE_NAME');
      const data = await response.json();
      
      if (response.ok) {
        setItems(data.RESOURCE_NAME || []);
      } else {
        setError(data.error || 'Failed to fetch');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Resource Name</h1>
      
      {/* Your UI here */}
      <div className="grid grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-lg shadow">
            {/* Item display */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🧪 Testing Each Connection

After connecting a page:

1. **Check data loads**: Open page, see data from database
2. **Test create**: Add new item, verify it appears
3. **Test update**: Edit item, verify changes save
4. **Test delete**: Remove item, verify it's gone
5. **Test search**: Filter/search, verify results

---

## 📊 Example: Connecting Customers Page

### Before (Mock Data):
```typescript
const [customers, setCustomers] = useState([
  { id: '1', name: 'John Doe', email: 'john@example.com' }
]);
```

### After (Real API):
```typescript
const [customers, setCustomers] = useState([]);

useEffect(() => {
  fetch('/api/customers')
    .then(res => res.json())
    .then(data => setCustomers(data.customers || []))
    .catch(err => console.error(err));
}, []);

const handleAddCustomer = async (customerData) => {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData),
  });
  
  if (response.ok) {
    const { customer } = await response.json();
    setCustomers([...customers, customer]);
  }
};
```

---

## ✅ Benefits of Connection

Once connected:
- ✅ Data persists across sessions
- ✅ Changes visible to all users
- ✅ Real database backing
- ✅ Can generate reports
- ✅ Production-ready
- ✅ Scalable

---

## 🔧 Troubleshooting

### "Failed to fetch"
- Check API endpoint exists
- Verify server is running
- Check browser console for errors

### "Empty data"
- Database might be empty
- Run seed-data.sql
- Add test data manually

### "Changes don't save"
- Check POST/PATCH endpoints work
- Verify request format
- Check server logs

---

## 📚 Reference Files

- **Services Page**: `app/admin/services/page.tsx` - Full example
- **Dashboard**: `app/admin/dashboard/page.tsx` - API integration
- **API Routes**: `app/api/*/route.ts` - Backend endpoints
- **API Testing Guide**: `API_TESTING_GUIDE.md` - Test endpoints

---

## 🎉 Summary

- ✅ **Dashboard & Services** are fully connected
- 📋 **6 more pages** ready to connect
- 🔄 **Same pattern** for all pages
- 📦 **Template provided** for quick start
- 🚀 **15 minutes per page** to connect

Start with **Customers** page - it's the simplest! Just copy the Services page pattern.

---

**Next Steps:**
1. Pick a page (start with Customers)
2. Copy the template above
3. Replace `RESOURCE_NAME` with actual resource (customers, jobs, etc.)
4. Test the connection
5. Move to next page!

🚀 **You've got this!**
