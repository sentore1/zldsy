# Subscription & Contract System Guide
## Recurring Services and Permanent Contracts

---

## Overview

The system now supports recurring service subscriptions and permanent contracts, allowing customers to:
- Subscribe to weekly, monthly, or yearly services
- Create custom schedules
- Establish permanent service contracts
- Get automatic discounts for subscriptions
- Auto-renew contracts

---

## 📅 Subscription Types

### 1. Weekly Service
- **Frequency:** Every 7 days
- **Discount:** 0% (standard pricing)
- **Best For:** High-traffic areas, businesses, frequent cleaning

### 2. Monthly Service
- **Frequency:** Once per month
- **Discount:** 10% off base price
- **Best For:** Residential properties, regular maintenance

### 3. Yearly Service
- **Frequency:** Once per year
- **Discount:** 20% off base price
- **Best For:** Annual contracts, long-term commitments
- **Benefits:** Priority scheduling, dedicated account manager

### 4. Custom Schedule
- **Frequency:** User-defined (e.g., every 14 days)
- **Discount:** 5% off base price
- **Best For:** Specific requirements, flexible schedules

---

## 📝 Contract Types

### 1. Permanent Contract
- **Duration:** Ongoing indefinitely
- **Services:** Unlimited
- **End Date:** None
- **Use Case:** Long-term service agreements

### 2. Fixed Term Contract
- **Duration:** Specific start and end dates
- **Services:** Defined number (e.g., 12 services)
- **End Date:** Required
- **Use Case:** Project-based, seasonal services

### 3. One-Time Service
- **Duration:** Single service
- **Services:** 1
- **End Date:** Service date
- **Use Case:** Trial, specific needs

---

## 💰 Pricing Structure

### Discount Calculation
```
Base Price: RWF 10,000
Subscription: Monthly (10% discount)
Discounted Price: RWF 9,000
```

### Billing Cycles
| Cycle | Description |
|-------|-------------|
| **Weekly** | Billed every week |
| **Monthly** | Billed once per month |
| **Quarterly** | Billed every 3 months |
| **Yearly** | Billed once per year |
| **Upfront** | Full payment at start |

---

## 🔄 Auto-Renewal

### How It Works
1. Customer enables auto-renewal
2. System sends notification 7 days before renewal
3. Payment is processed automatically
4. New contract period begins

### Settings
- **Notification Period:** 7 days before expiry
- **Max Failed Attempts:** 3
- **Retry Interval:** 24 hours

---

## 📊 Database Schema

### Main Tables

#### subscriptions
```sql
- id (UUID)
- customer_id (UUID)
- service_id (UUID)
- subscription_type (weekly, monthly, yearly, custom)
- contract_type (permanent, fixed_term, one_time)
- status (active, paused, cancelled, expired, pending)
- start_date, end_date
- next_service_date
- base_price, discount_percentage, discounted_price
- total_services, completed_services, remaining_services
- auto_renewal
```

#### subscription_history
```sql
- id (UUID)
- subscription_id (UUID)
- action (created, activated, paused, resumed, renewed, cancelled, service_completed)
- service_date
- job_id (UUID)
- amount_charged
```

### Views

#### v_active_subscriptions
Shows all active subscriptions with customer and service details

#### v_expiring_contracts
Shows contracts expiring within 30 days for renewal reminders

---

## 🛠️ Implementation Files

### Backend
- `lib/supabase/add-subscriptions.sql` - Database schema and functions
- `lib/constants/subscriptions.ts` - Constants and calculations
- `types/index.ts` - TypeScript interfaces

### Frontend
- `components/SubscriptionFormModal.tsx` - Subscription creation form

### Database Functions

**calculate_next_service_date(subscription_id)**
- Calculates next service date based on subscription type

**complete_subscription_service(subscription_id, job_id)**
- Marks service as completed
- Increments completed_services
- Schedules next service
- Updates status if contract complete

**pause_subscription(subscription_id, reason)**
- Pauses active subscription
- Logs in history

**resume_subscription(subscription_id)**
- Resumes paused subscription
- Logs in history

**cancel_subscription(subscription_id, reason)**
- Cancels subscription
- Records cancellation reason
- Logs in history

---

## 📋 Usage Examples

### Create Monthly Subscription

```typescript
const subscription = {
  customer_id: 'customer-uuid',
  service_id: 'service-uuid',
  subscription_type: 'monthly',
  contract_type: 'fixed_term',
  start_date: '2025-02-01',
  end_date: '2026-02-01',
  base_price: 10000,
  billing_cycle: 'monthly',
  total_services: 12,
  auto_renewal: true,
};

// POST /api/subscriptions
```

### Complete a Service

```sql
SELECT complete_subscription_service(
  'subscription-uuid',
  'job-uuid',
  'staff-uuid'
);
```

### Check Due Services

```sql
SELECT * FROM v_active_subscriptions
WHERE is_due_soon = TRUE;
```

### Get Expiring Contracts

```sql
SELECT * FROM v_expiring_contracts
WHERE days_until_expiry <= 7;
```

---

## 🔔 Renewal Reminders

### Reminder Schedule

| Days Before Expiry | Reminder Type |
|-------------------|---------------|
| 30 days | First Reminder |
| 14 days | Second Reminder |
| 7 days | Final Reminder |
| 3 days | Urgent Reminder |

### Reminder Content
- Contract details
- Expiry date
- Renewal options
- Contact information
- Link to renew

---

## 💡 Features & Benefits

### For Customers
- ✅ Automatic discounts (up to 20%)
- ✅ Priority scheduling
- ✅ Consistent service quality
- ✅ Budget planning (fixed costs)
- ✅ Auto-renewal convenience
- ✅ Flexible contract options

### For Business
- ✅ Predictable revenue
- ✅ Customer retention
- ✅ Reduced admin overhead
- ✅ Better resource planning
- ✅ Automated reminders
- ✅ Detailed service history

---

## 📈 Subscription Lifecycle

```
1. PENDING
   ↓ (Customer activates)
2. ACTIVE
   ↓ (Service scheduled)
3. Service Completed
   ↓ (Next service scheduled)
4. ACTIVE (recurring)
   ↓ (Options)
   - PAUSED (temporary hold)
   - CANCELLED (terminated)
   - EXPIRED (contract ended)
   - RENEWED (new term)
```

---

## 🎯 Best Practices

### 1. Service Frequency
- Weekly: High-traffic commercial spaces
- Monthly: Residential homes, offices
- Yearly: Annual deep cleans, inspections
- Custom: Special requirements

### 2. Contract Duration
- Permanent: Established customers, ongoing needs
- Fixed Term: Trials, seasonal services
- One-Time: New customers, specific needs

### 3. Pricing Strategy
- Offer larger discounts for longer commitments
- Bundle services for better value
- Provide flexible payment options
- Reward loyalty with additional perks

### 4. Communication
- Send reminders before due dates
- Notify before auto-renewals
- Confirm service completions
- Request feedback regularly

---

## 🔧 Admin Tasks

### Create Subscription
1. Navigate to customer profile
2. Click "Add Subscription"
3. Select service and type
4. Configure schedule and pricing
5. Review terms
6. Activate subscription

### Manage Subscription
- View all subscriptions
- Pause/Resume subscriptions
- Cancel subscriptions
- Update pricing
- Modify schedule
- View service history

### Renewal Management
- Review expiring contracts
- Send renewal reminders
- Process renewals
- Update terms if needed

---

## 📞 API Endpoints (To Implement)

```
POST   /api/subscriptions          - Create subscription
GET    /api/subscriptions          - List subscriptions
GET    /api/subscriptions/:id      - Get subscription
PATCH  /api/subscriptions/:id      - Update subscription
POST   /api/subscriptions/:id/pause    - Pause subscription
POST   /api/subscriptions/:id/resume   - Resume subscription
POST   /api/subscriptions/:id/cancel   - Cancel subscription
POST   /api/subscriptions/:id/renew    - Renew subscription
GET    /api/subscriptions/due          - Get due services
GET    /api/subscriptions/expiring     - Get expiring contracts
```

---

## 🚀 Next Steps

1. Run database migration:
   ```bash
   # Execute: lib/supabase/add-subscriptions.sql
   ```

2. Create API routes for subscriptions

3. Add subscription management to admin panel

4. Implement automated reminder system

5. Create customer subscription portal

6. Set up payment processing for auto-renewals

7. Add reporting and analytics

---

## 📊 Metrics to Track

- Active subscriptions count
- Monthly recurring revenue (MRR)
- Annual recurring revenue (ARR)
- Churn rate
- Renewal rate
- Average contract value
- Customer lifetime value
- Services per subscription

---

**Last Updated:** January 2025  
**Version:** 1.0
