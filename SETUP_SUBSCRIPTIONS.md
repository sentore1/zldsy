# Quick Setup Guide - Subscription System

## Installation Steps

### 1. Run Database Migration

Execute the SQL migration file to create all necessary tables:

```bash
# Using psql
psql -h your-supabase-host -U postgres -d postgres -f lib/supabase/add-subscription-system.sql

# Or copy and paste the contents into Supabase SQL Editor
# https://app.supabase.com/project/YOUR_PROJECT/sql
```

### 2. Verify Installation

Check that all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'subscription_plans',
    'customer_subscriptions',
    'contracts',
    'subscription_billing',
    'subscription_schedules',
    'subscription_addons',
    'subscription_addon_usage',
    'subscription_pauses',
    'subscription_usage_logs'
);
```

You should see 9 tables.

### 3. Access the UI

Navigate to the subscriptions page in your admin panel:

```
http://localhost:3000/admin/subscriptions
```

Or click on **Financial > Subscriptions** in the sidebar.

## Quick Start Examples

### Example 1: Create Weekly Cleaning Service

```typescript
// 1. Create a service (if not exists)
const service = await fetch('/api/services', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Professional Cleaning',
    description: 'High-quality cleaning service',
    base_price: 99.99,
    category: 'Cleaning'
  })
});

// 2. Create weekly subscription plan
const plan = await fetch('/api/subscriptions/plans', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Weekly Basic Cleaning',
    description: 'Weekly professional cleaning service',
    service_id: service.id,
    billing_cycle: 'weekly',
    price: 99.99,
    included_visits: 1,
    visit_duration: 120, // 2 hours
    cancellation_notice_days: 7
  })
});

// 3. Subscribe a customer
const subscription = await fetch('/api/subscriptions', {
  method: 'POST',
  body: JSON.stringify({
    customer_id: 'customer-uuid-here',
    subscription_plan_id: plan.id,
    payment_method: 'credit_card',
    start_date: new Date().toISOString()
  })
});
```

### Example 2: Create Monthly Maintenance Contract

```typescript
// Create monthly maintenance plan
const maintenancePlan = await fetch('/api/subscriptions/plans', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Monthly Maintenance Package',
    description: 'Comprehensive monthly maintenance',
    billing_cycle: 'monthly',
    price: 499.99,
    included_visits: 4, // 4 visits per month
    visit_duration: 180, // 3 hours each
    minimum_commitment_months: 6,
    cancellation_notice_days: 30,
    auto_renewal: true
  })
});
```

### Example 3: Create Yearly Enterprise Contract

```typescript
// Create yearly enterprise plan
const enterprisePlan = await fetch('/api/subscriptions/plans', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Yearly Enterprise Package',
    description: 'Unlimited annual service with priority support',
    billing_cycle: 'yearly',
    price: 9999.99,
    included_visits: null, // Unlimited
    priority_level: 'urgent',
    minimum_commitment_months: 12,
    discount_percentage: 15,
    auto_renewal: true
  })
});

// Create formal contract
const contract = await fetch('/api/contracts', {
  method: 'POST',
  body: JSON.stringify({
    customer_id: 'customer-uuid',
    subscription_id: subscription.id,
    contract_type: 'subscription',
    title: 'Enterprise Service Agreement 2024',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    total_value: 9999.99,
    payment_terms: 'Annual payment in advance',
    terms_and_conditions: 'Full terms...',
    auto_renewal: true
  })
});
```

### Example 4: Create Permanent Facility Management Contract

```typescript
// Create permanent contract plan
const permanentPlan = await fetch('/api/subscriptions/plans', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Permanent Facility Management',
    description: 'Long-term facility management agreement',
    billing_cycle: 'permanent',
    price: 50000.00, // One-time or custom payment
    included_visits: null,
    minimum_commitment_months: 0
  })
});

// Create permanent contract
const permanentContract = await fetch('/api/contracts', {
  method: 'POST',
  body: JSON.stringify({
    customer_id: 'customer-uuid',
    contract_type: 'permanent',
    title: 'Permanent Facility Management Agreement',
    description: 'Ongoing comprehensive facility management',
    start_date: '2024-01-01',
    end_date: null, // No end date
    total_value: 50000.00,
    payment_terms: 'Quarterly payments of $12,500',
    auto_renewal: false
  })
});
```

## Testing the System

### 1. Test Subscription Creation

```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "YOUR_CUSTOMER_UUID",
    "subscription_plan_id": "YOUR_PLAN_UUID",
    "payment_method": "credit_card"
  }'
```

### 2. Test Billing Process

```bash
# Process all due subscriptions
curl -X POST http://localhost:3000/api/subscriptions/billing/process

# Process specific subscription
curl -X POST http://localhost:3000/api/subscriptions/billing/process \
  -H "Content-Type: application/json" \
  -d '{"subscription_id": "YOUR_SUBSCRIPTION_UUID"}'
```

### 3. Test Pause/Resume

```bash
# Pause subscription
curl -X POST http://localhost:3000/api/subscriptions/YOUR_ID/pause \
  -H "Content-Type: application/json" \
  -d '{
    "pause_start_date": "2024-06-01",
    "pause_end_date": "2024-07-01",
    "reason": "Customer vacation"
  }'

# Resume subscription
curl -X DELETE http://localhost:3000/api/subscriptions/YOUR_ID/pause
```

## Common Use Cases

### Use Case 1: Weekly Pool Cleaning Service

**Scenario:** Offer weekly pool cleaning with seasonal adjustments

```typescript
// Create plan
const poolPlan = {
  name: 'Weekly Pool Cleaning',
  billing_cycle: 'weekly',
  price: 79.99,
  included_visits: 1,
  visit_duration: 90
};

// Subscribe customer
// System auto-generates 12 weekly schedules

// Pause for winter
await pauseSubscription({
  pause_start_date: '2024-11-01',
  pause_end_date: '2025-03-31',
  reason: 'Winter season - pool closed',
  billing_suspended: true
});
```

### Use Case 2: Monthly HVAC Maintenance

**Scenario:** 12-month HVAC maintenance contract

```typescript
const hvacPlan = {
  name: 'Monthly HVAC Check',
  billing_cycle: 'monthly',
  price: 199.99,
  included_visits: 1,
  minimum_commitment_months: 12,
  visit_duration: 120
};

// Create contract with terms
const contract = {
  contract_type: 'maintenance',
  title: 'HVAC Annual Maintenance Agreement',
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  terms_and_conditions: `
    - Monthly HVAC system inspection
    - Filter replacement included
    - Priority emergency service
    - 10% discount on repairs
  `
};
```

### Use Case 3: Yearly Landscaping Service

**Scenario:** Annual landscaping with seasonal services

```typescript
const landscapingPlan = {
  name: 'Yearly Landscaping Premium',
  billing_cycle: 'yearly',
  price: 3999.99,
  included_visits: 24, // Twice monthly
  discount_percentage: 20, // 20% discount vs monthly
  auto_renewal: true
};

// Add seasonal add-ons
const springCleanupAddon = {
  name: 'Spring Cleanup',
  price: 299.99,
  billing_type: 'one_time'
};

const snowRemovalAddon = {
  name: 'Winter Snow Removal',
  price: 99.99,
  billing_type: 'per_use'
};
```

## Monitoring & Maintenance

### Daily Tasks

1. **Check Upcoming Billing**
   ```bash
   curl http://localhost:3000/api/subscriptions/billing/process?days=7
   ```

2. **Process Due Subscriptions**
   ```bash
   curl -X POST http://localhost:3000/api/subscriptions/billing/process
   ```

3. **Review Failed Payments**
   ```sql
   SELECT * FROM subscription_billing 
   WHERE status = 'failed' 
   AND retry_count < 3;
   ```

### Weekly Tasks

1. Review subscription metrics
2. Check expiring contracts
3. Follow up on failed payments
4. Send renewal reminders

### Monthly Tasks

1. Generate revenue reports (MRR/ARR)
2. Analyze churn rate
3. Review customer feedback
4. Update pricing strategies

## Troubleshooting

### Issue: Subscriptions not generating schedules

**Solution:** Run the schedule generator manually:

```sql
SELECT generate_subscription_schedules(
    'subscription-uuid',
    NOW(),
    12  -- Number of occurrences
);
```

### Issue: Billing not processing automatically

**Solution:** Check next_billing_date:

```sql
SELECT id, customer_id, next_billing_date, status
FROM customer_subscriptions
WHERE status = 'active'
AND next_billing_date < NOW();
```

### Issue: Visits not decrementing

**Solution:** Verify the trigger is working:

```sql
-- Check if trigger exists
SELECT * FROM pg_trigger 
WHERE tgname = 'trigger_update_subscription_visits';

-- Manually update if needed
UPDATE customer_subscriptions
SET visits_used = visits_used + 1,
    visits_remaining = visits_remaining - 1
WHERE id = 'subscription-uuid';
```

## Next Steps

1. ✅ Database migration complete
2. ✅ UI accessible at /admin/subscriptions
3. 📝 Create your first subscription plan
4. 👤 Subscribe a test customer
5. 🔔 Set up billing automation
6. 📊 Monitor metrics and revenue
7. 🔧 Customize as needed

## Support Resources

- **Full Documentation:** See `SUBSCRIPTION_SYSTEM_GUIDE.md`
- **API Reference:** Check individual route files in `/app/api/subscriptions/`
- **Database Schema:** Review `lib/supabase/add-subscription-system.sql`
- **Type Definitions:** See `lib/types/subscriptions.ts`

## Need Help?

Common questions:
1. How do I handle failed payments? → Check retry_count and set up webhook notifications
2. Can I prorate subscriptions? → Yes, set is_prorated = true in billing records
3. How do I offer free trials? → Set is_trial = true and trial_end_date
4. Can customers upgrade plans? → Create new subscription and cancel old one
5. How do I handle refunds? → Update billing status to 'refunded' and create credit

Enjoy your new subscription management system! 🎉
