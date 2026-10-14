# Web App - Subscription Plans Management Guide

## ✅ YES! Web App is Fully Updated

The web application now has a **complete Subscription Plans Management system** with service selection!

---

## 🎯 Quick Access

### Navigation Path:
```
Admin Dashboard → Financial (sidebar) → Subscription Plans
```

### Direct URL:
```
http://localhost:3000/admin/subscription-plans
```

---

## 🎨 What You'll See

### Main Page Layout

```
┌─────────────────────────────────────────────────┐
│  Subscription Plans              [+ New Plan]   │
│  Manage recurring service plans                 │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────┐│
│  │ Plan Card 1  │  │ Plan Card 2  │  │ Plan 3 ││
│  │              │  │              │  │        ││
│  │ Weekly       │  │ Monthly      │  │ Yearly ││
│  │ Premium      │  │ Standard     │  │ Basic  ││
│  │              │  │              │  │        ││
│  │ Service:     │  │ Service:     │  │ Service││
│  │ Cleaning     │  │ All Services │  │ Fumig. ││
│  │              │  │              │  │        ││
│  │ $150.00      │  │ $500.00      │  │ $1200  ││
│  │              │  │              │  │        ││
│  │ [✏️ Edit] [🗑️] │  │ [✏️ Edit] [🗑️] │  │ [✏️][🗑️]││
│  └──────────────┘  └──────────────┘  └────────┘│
│                                                  │
└─────────────────────────────────────────────────┘
```

### Each Plan Card Shows:
- ✅ Plan Name & Billing Cycle
- ✅ **Service Name** (NEW! - shows which service or "All Services")
- ✅ Price with currency
- ✅ Number of included visits (if applicable)
- ✅ Discount percentage (if any)
- ✅ Status badges (Active/Inactive, Featured)
- ✅ Edit and Delete buttons

---

## 🆕 Creating a New Plan

### Click "New Plan" Button →

```
┌────────────────────────────────────────────────┐
│  New Subscription Plan                    [✕]  │
├────────────────────────────────────────────────┤
│                                                 │
│  Plan Name *                                    │
│  ┌─────────────────────────────────────────┐  │
│  │ e.g., Weekly Premium Cleaning           │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Description                                    │
│  ┌─────────────────────────────────────────┐  │
│  │ Describe the plan...                    │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Service ⭐ NEW!                                │
│  ┌─────────────────────────────────────────┐  │
│  │ ▼ Select service...                     │  │
│  │   • All Services                         │  │
│  │   • House Cleaning - $150.00            │  │
│  │   • Fumigation - $200.00                │  │
│  │   • Pest Control - $180.00              │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Billing Cycle *        Price *                │
│  ┌─────────────────┐  ┌──────────────────┐   │
│  │ ▼ Monthly       │  │ $ 500.00         │   │
│  └─────────────────┘  └──────────────────┘   │
│                                                 │
│  Setup Fee              Included Visits        │
│  ┌─────────────────┐  ┌──────────────────┐   │
│  │ $ 0.00          │  │ 4 (or leave blank)│   │
│  └─────────────────┘  └──────────────────┘   │
│                                                 │
│  Visit Duration         Priority Level         │
│  ┌─────────────────┐  ┌──────────────────┐   │
│  │ 120 minutes     │  │ ▼ Standard       │   │
│  └─────────────────┘  └──────────────────┘   │
│                                                 │
│  Discount (%)           Display Order          │
│  ┌─────────────────┐  ┌──────────────────┐   │
│  │ 0               │  │ 0                 │   │
│  └─────────────────┘  └──────────────────┘   │
│                                                 │
│  ☑ Active               ☐ Featured             │
│                                                 │
│  [💾 Create Plan]       [Cancel]               │
└────────────────────────────────────────────────┘
```

---

## 🔧 Key Features

### 1. Service Selection Dropdown ⭐
- **All Services**: Plan applies to any service
- **Specific Service**: Plan is tied to one service (e.g., only for cleaning)
- Shows service name + base price for easy reference
- Example: "House Cleaning - $150.00"

### 2. Billing Cycles
- ✅ Weekly
- ✅ Monthly
- ✅ Yearly
- ✅ Permanent (one-time contracts)

### 3. Flexible Pricing
- Base price
- Setup fee (optional)
- Discount percentage
- Promotional pricing (coming soon)

### 4. Visit Management
- Set number of included visits (or unlimited)
- Define visit duration in minutes
- Track usage automatically

### 5. Priority Levels
- Standard
- Priority
- Urgent

### 6. Status Controls
- **Active/Inactive**: Enable or disable plan
- **Featured**: Highlight special plans
- **Display Order**: Control sort order

---

## ✏️ Editing Plans

Click the **Edit** button (✏️) on any plan card:
- Modal opens with current values pre-filled
- Change any field including the service
- Click "Update Plan" to save

---

## 🗑️ Deleting Plans

Click the **Delete** button (🗑️):
- Shows confirmation dialog
- **Safety Check**: Cannot delete plans with active subscriptions
  - If active subscriptions exist: Shows error message
  - Suggestion: Deactivate the plan instead
- **Success**: Plan removed from list

---

## 📊 Plan Details Displayed

Each plan card shows:
```
┌──────────────────────────────┐
│ Weekly Premium Cleaning      │  ← Plan name
│ weekly                        │  ← Billing cycle
├──────────────────────────────┤
│ Service: House Cleaning      │  ⭐ NEW! Service name
│ Price: $150.00               │  ← Price
│ Visits: 4                    │  ← Included visits
│ Discount: 10%                │  ← If applicable
├──────────────────────────────┤
│ [Featured] [Active]          │  ← Status badges
│                              │
│ [✏️ Edit] [🗑️ Delete]         │  ← Actions
└──────────────────────────────┘
```

---

## 🔄 Integration with Subscriptions

The `/admin/subscriptions` page shows:
- Active customer subscriptions
- Links to their subscription plans
- The plan's service is now visible

When creating a subscription:
- Users select from available plans
- Each plan shows its associated service
- Makes it clear what service is being subscribed to

---

## 🎯 Use Cases

### Example 1: Service-Specific Plans
```
Plan: Weekly House Cleaning
Service: House Cleaning
Price: $150/week
Visits: 4 visits/month
```

### Example 2: All-Services Plans
```
Plan: Premium Maintenance Package
Service: All Services
Price: $500/month
Visits: Unlimited
```

### Example 3: Permanent Contract
```
Plan: Annual Facility Management
Service: Facility Management
Billing: Permanent (one-time)
Price: $10,000
```

---

## 📱 Cross-Platform

**Web** and **Mobile** are now synchronized:
- Create plan on web → visible on mobile
- Edit plan on mobile → updated on web
- Same service selection on both platforms
- Real-time via API

---

## 🔗 API Endpoints Used

```
GET    /api/subscriptions/plans           - List all plans
POST   /api/subscriptions/plans           - Create new plan
GET    /api/subscriptions/plans/[id]      - Get single plan
PATCH  /api/subscriptions/plans/[id]      - Update plan
DELETE /api/subscriptions/plans/[id]      - Delete plan
GET    /api/services?active=true          - Get services for dropdown
```

---

## ✅ What's Different from Before?

### Before:
❌ Services were hardcoded in plans
❌ No way to manage plans from web UI
❌ Had to edit database directly
❌ No service association

### Now:
✅ Full web interface for plan management
✅ Service dropdown with all active services
✅ "All Services" option for flexible plans
✅ Visual cards with service names displayed
✅ Edit/Delete functionality with safety checks
✅ Complete CRUD operations
✅ Mobile app integration

---

## 🎉 Summary

**YES, the web app is fully updated!** You now have:

1. ✅ New page: `/admin/subscription-plans`
2. ✅ Navigation link in Financial section
3. ✅ Service selection dropdown
4. ✅ Full CRUD for subscription plans
5. ✅ Beautiful card-based UI
6. ✅ Edit and delete functionality
7. ✅ Form validation
8. ✅ Safety checks
9. ✅ Real-time updates
10. ✅ Mobile app integration

**Go try it out!** 🚀
```
http://localhost:3000/admin/subscription-plans
```
