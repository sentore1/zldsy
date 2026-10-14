# Fix: Subscription Plans Not Showing

## Problem
The subscription plan dropdown is empty (showing "Select a plan" only).

## Root Cause
There are **no subscription plans created** in the database yet.

---

## ✅ Solution: Create Subscription Plans

### Option 1: Use the Web Interface (Recommended)

1. **Navigate to Subscription Plans page:**
   ```
   http://localhost:3000/admin/subscription-plans
   ```

2. **Click "New Plan" button**

3. **Fill in the form:**
   - Plan Name: e.g., "Monthly Fumigation Premium"
   - Description: e.g., "Professional fumigation service monthly"
   - Service: Select from dropdown (e.g., "Fumigation") or leave as "All Services"
   - Billing Cycle: Select "monthly"
   - Price: e.g., 40000
   - Setup Fee: e.g., 0
   - Included Visits: e.g., 1
   - Visit Duration: e.g., 120 (minutes)
   - Priority Level: "standard"
   - Discount: 0
   - Check "Active"

4. **Click "Create Plan"**

5. **Repeat** to create multiple plans for different services/prices

---

### Option 2: Use SQL Script

1. **Open Supabase SQL Editor**

2. **Run this script to get your service IDs:**
   ```sql
   SELECT id, name FROM services;
   ```

3. **Copy the service IDs** you want to use

4. **Open the seed script:**
   ```
   lib/supabase/seed-subscription-plans.sql
   ```

5. **Replace `NULL` with actual service IDs** (or leave as NULL for "All Services")

6. **Run the modified script** in Supabase SQL Editor

7. **Verify plans were created:**
   ```sql
   SELECT id, name, billing_cycle, price, service_id 
   FROM subscription_plans;
   ```

---

## 📋 Sample Plans to Create

### For Fumigation Service:
| Plan Name | Service | Cycle | Price | Visits |
|-----------|---------|-------|-------|--------|
| Weekly Fumigation | Fumigation | weekly | 10,000 | 4 |
| Monthly Fumigation Premium | Fumigation | monthly | 40,000 | 1 |
| Quarterly Fumigation | Fumigation | yearly | 100,000 | 4 |

### For All Services:
| Plan Name | Service | Cycle | Price | Visits |
|-----------|---------|-------|-------|--------|
| Monthly Basic | All Services | monthly | 30,000 | 2 |
| Monthly All Services | All Services | monthly | 50,000 | Unlimited |
| Annual Premium | All Services | yearly | 480,000 | 12 |

### For House Cleaning:
| Plan Name | Service | Cycle | Price | Visits |
|-----------|---------|-------|-------|--------|
| Weekly Cleaning | House Cleaning | weekly | 10,000 | 4 |
| Bi-Weekly Cleaning | House Cleaning | monthly | 40,000 | 2 |

---

## 🔍 Verify Plans Are Showing

### 1. Check in Subscription Plans page:
```
http://localhost:3000/admin/subscription-plans
```
You should see cards for each plan.

### 2. Check in Create Subscription modal:
- Go to: `http://localhost:3000/admin/subscriptions`
- Click "Create Subscription"
- Select a customer
- The "Subscription Plan" dropdown should now show your plans

### 3. Check browser console:
- Open DevTools (F12)
- Look for: `Fetched plans: [...]`
- Should show array with your plans

---

## ⚠️ Current Warning Message

If no plans exist, you'll now see:
```
⚠️ No subscription plans available. Please create plans first at Subscription Plans
```

This message has a link that takes you directly to the plan creation page.

---

## 🎯 What Plans Should Look Like in Dropdown

Once plans are created, the dropdown will show:
```
Select a plan
⭐ Monthly Fumigation Premium - Fumigation - RWF 40,000 / monthly (Best Match)
⭐ Monthly All Services - All Services - RWF 45,000 / monthly (Best Match)
   Weekly Fumigation - Fumigation - RWF 10,000 / weekly
   Monthly Basic - All Services - RWF 30,000 / monthly
```

---

## 🐛 Debugging

### Check API Response:
Open browser DevTools → Network tab → Filter by "plans" → Click the request → Check Response

**Should return:**
```json
[
  {
    "id": "uuid-here",
    "name": "Monthly Fumigation Premium",
    "service": {
      "id": "service-uuid",
      "name": "Fumigation"
    },
    "price": 40000,
    "billing_cycle": "monthly",
    ...
  }
]
```

**If returns empty array `[]`:**
→ No plans in database. Create some!

**If returns error:**
→ Check Supabase connection and table permissions

---

## ✅ Quick Test

### Create One Test Plan:

**Via Web UI:**
1. Go to `/admin/subscription-plans`
2. Click "New Plan"
3. Fill:
   - Name: "Test Monthly Plan"
   - Service: "All Services"
   - Billing Cycle: "monthly"
   - Price: 40000
   - Active: ✓
4. Click "Create Plan"
5. Go back to `/admin/subscriptions`
6. Click "Create Subscription"
7. Select a customer
8. Check dropdown - should show "Test Monthly Plan"

---

## 📊 Expected Result

After creating plans, your subscription creation modal should look like:

```
┌────────────────────────────────────┐
│ Create New Subscription            │
├────────────────────────────────────┤
│ Customer *                         │
│ [Select customer dropdown]         │
│                                    │
│ [Customer Activity Box]            │
│                                    │
│ Subscription Plan *                │
│ ┌──────────────────────────────┐  │
│ │ ⭐ Monthly Fumigation - ...  │  │
│ │    Monthly Basic - ...       │  │
│ │    Weekly Cleaning - ...     │  │
│ └──────────────────────────────┘  │
│                                    │
│ 💡 Plans marked with ⭐ match...   │
└────────────────────────────────────┘
```

---

## 🚀 Next Steps

1. ✅ Create at least 3-5 subscription plans
2. ✅ Verify they show in dropdown
3. ✅ Test creating a subscription
4. ✅ Create plans for different services
5. ✅ Test the smart recommendation feature

---

## 💡 Pro Tips

- **Create plans for your most common services first**
- **Match plans to typical customer spending patterns**
- **Use descriptive names** (e.g., "Weekly Premium Cleaning" not just "Plan 1")
- **Set realistic visit counts and durations**
- **Use the "All Services" option** for flexible packages
- **Mark popular plans as "Featured"**

---

## Summary

**Plans not showing = No plans created yet**

**Fix:**
1. Go to `/admin/subscription-plans`
2. Click "New Plan"
3. Create some plans
4. Plans will now appear in dropdown

**That's it!** 🎉
