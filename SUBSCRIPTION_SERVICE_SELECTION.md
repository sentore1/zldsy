# Subscription Plan Service Selection Feature

## Overview
Added the ability to select a specific service when creating or editing subscription plans on both web and mobile apps. Previously, services were hardcoded; now users can choose which service a subscription plan applies to.

## What Was Implemented

### 1. Web App (Next.js)

#### New Page: Subscription Plans Management
**File:** `app/admin/subscription-plans/page.tsx`

Features:
- ✅ Full CRUD for subscription plans
- ✅ Service dropdown (loads from services API)
- ✅ Select specific service OR "All Services"
- ✅ Visual card-based layout with edit/delete buttons
- ✅ Form validation
- ✅ All plan fields configurable:
  - Plan name, description
  - **Service selection** (NEW)
  - Billing cycle (weekly/monthly/yearly/permanent)
  - Price, setup fee, discount
  - Included visits, visit duration
  - Priority level
  - Active/Featured status
  - Display order

#### API Routes Created
**File:** `app/api/subscriptions/plans/[id]/route.ts`

Endpoints:
- `GET /api/subscriptions/plans/[id]` - Get single plan
- `PATCH /api/subscriptions/plans/[id]` - Update plan
- `DELETE /api/subscriptions/plans/[id]` - Delete plan (prevents deletion if active subscriptions exist)

Existing:
- `GET /api/subscriptions/plans` - List all plans (already existed)
- `POST /api/subscriptions/plans` - Create plan (already existed)

### 2. Mobile App (Flutter)

#### New Screen: Subscription Plan Form
**File:** `zldapp/lib/screens/admin/subscription_plan_form_screen.dart`

Features:
- ✅ Create new subscription plans
- ✅ Edit existing plans
- ✅ Service dropdown with service names and prices
- ✅ "All Services" option (service_id = null)
- ✅ Full form with all plan fields
- ✅ Form validation
- ✅ Loading states
- ✅ Success/error feedback

#### Updated Services
**File:** `zldapp/lib/services/subscription_service.dart`

New methods added:
- `createSubscriptionPlan(Map<String, dynamic> data)` - Create plan via API
- `updateSubscriptionPlan(String id, Map<String, dynamic> data)` - Update plan via API
- `deleteSubscriptionPlan(String id)` - Delete plan via API

#### Updated Screen: Subscriptions Management
**File:** `zldapp/lib/screens/admin/subscriptions_screen.dart`

Changes:
- ✅ Added "New Plan" button in Plans tab
- ✅ Added Edit/Delete icons to each plan card
- ✅ Navigation to create/edit form
- ✅ Delete confirmation dialog
- ✅ Refresh data after create/edit/delete

### 3. Database Schema
**Already existed** - No changes needed

The `subscription_plans` table already has:
- `service_id` column (UUID, nullable, foreign key to services table)
- Index on `service_id` for performance
- When `service_id` is NULL, plan applies to all services
- When `service_id` is set, plan applies only to that specific service

## How to Use

### Web App
1. Navigate to `/admin/subscription-plans`
2. Click "New Plan"
3. Fill in plan details
4. Select a service from the dropdown (or leave as "All Services")
5. Click "Create Plan"

To edit:
- Click the edit icon (pencil) on any plan card
- Modify fields including service selection
- Click "Update Plan"

### Mobile App
1. Go to Subscriptions screen
2. Switch to "Plans" tab
3. Tap "New Plan" button (top right)
4. Fill in plan details
5. Select service from dropdown
6. Tap checkmark or "Create Plan" button

To edit:
- Tap the edit icon on any plan
- Modify fields
- Tap checkmark or "Update Plan"

## Testing

### Test Scenarios

1. **Create plan with specific service**
   - Select "House Cleaning" service
   - Plan should show service name in list
   - API should save service_id

2. **Create plan for all services**
   - Leave dropdown at "All Services"
   - Plan should show "All Services" in list
   - API should save service_id as null

3. **Edit plan to change service**
   - Open existing plan
   - Change from "All Services" to specific service
   - Save and verify change persists

4. **Delete plan with active subscriptions**
   - Should show error message
   - Plan should not be deleted

5. **Delete plan without active subscriptions**
   - Should delete successfully
   - Plan should disappear from list

## API Endpoints Summary

```
GET    /api/subscriptions/plans          - List all plans
POST   /api/subscriptions/plans          - Create new plan
GET    /api/subscriptions/plans/[id]     - Get single plan
PATCH  /api/subscriptions/plans/[id]     - Update plan
DELETE /api/subscriptions/plans/[id]     - Delete plan
GET    /api/services?active=true         - Get services for dropdown
```

## Files Changed/Created

### Created:
- `app/admin/subscription-plans/page.tsx` (Web: Plans management page)
- `app/api/subscriptions/plans/[id]/route.ts` (API: Individual plan routes)
- `zldapp/lib/screens/admin/subscription_plan_form_screen.dart` (Mobile: Form screen)

### Modified:
- `zldapp/lib/services/subscription_service.dart` (Added CRUD methods for plans)
- `zldapp/lib/screens/admin/subscriptions_screen.dart` (Added navigation and UI updates)

### Already Existed (No Changes):
- `lib/supabase/add-subscription-system.sql` (Schema already has service_id)
- `lib/types/subscriptions.ts` (Types already include service_id)
- `zldapp/lib/models/subscription.dart` (Model already has serviceId)
- `app/api/subscriptions/plans/route.ts` (GET/POST already existed)

## Benefits

1. **Flexibility**: Plans can be service-specific or apply to all services
2. **Better Organization**: Users can see which service each plan is for
3. **Accurate Pricing**: Different services can have different subscription pricing
4. **Business Logic**: Enables service-specific subscription strategies
5. **Reporting**: Can analyze subscriptions by service type

## Notes

- The `service_id` field is **optional** - leave it null for general plans
- The web page is accessible at `/admin/subscription-plans` (separate from `/admin/subscriptions`)
- Mobile app integrates plan management into existing Subscriptions screen
- Service dropdown loads **active services only**
- Plans with active subscriptions **cannot be deleted** (must deactivate instead)
- All changes are reflected immediately on both platforms via API

## Next Steps (Optional Enhancements)

1. Add service name/icon display on subscription cards
2. Filter subscriptions by service
3. Service-specific subscription analytics
4. Bulk plan creation for multiple services
5. Plan templates based on service type
6. Subscription upgrade/downgrade between plans of same service
