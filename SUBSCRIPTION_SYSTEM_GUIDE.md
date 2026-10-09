# Subscription and Contract Management System

## Overview

This comprehensive subscription and contract management system allows you to offer:
- **Weekly subscriptions** - Recurring services every week
- **Monthly subscriptions** - Recurring services every month  
- **Yearly subscriptions** - Annual service contracts
- **Permanent contracts** - Long-term service agreements without recurring billing

## Features

### 1. Subscription Plans
- Flexible billing cycles (weekly, monthly, yearly, permanent)
- Customizable pricing with promotional offers
- Included visits per billing cycle (or unlimited)
- Priority levels (standard, priority, urgent)
- Auto-renewal options
- Minimum commitment periods
- Cancellation notice requirements

### 2. Customer Subscriptions
- Active subscription management
- Usage tracking (visits used/remaining)
- Trial periods
- Pause and resume functionality
- Cancellation with effective dates
- Multiple payment methods
- Notes and admin notes

### 3. Contracts
- Formal contract documents
- Multiple contract types (subscription, permanent, fixed-term, maintenance)
- Digital signatures
- Terms and conditions management
- Auto-renewal options
- Contract lifecycle tracking

### 4. Recurring Billing
- Automated billing generation
- Pro-rated billing support
- Failed payment retry logic
- Invoice generation
- Payment tracking
- Billing history

### 5. Service Scheduling
- Automated recurring schedules
- Rescheduling capabilities
- Service completion tracking
- Reminder notifications
- Schedule cancellation during pauses

### 6. Add-ons
- Additional services/features
- One-time or recurring add-ons
- Per-use billing options
- Plan compatibility controls

## Database Schema

### Core Tables

#### subscription_plans
Defines available subscription plans with pricing and features.

**Key fields:**
- `billing_cycle`: weekly, monthly, yearly, or permanent
- `price`: Base subscription price
- `included_visits`: Number of visits per cycle (NULL for unlimited)
- `minimum_commitment_months`: Minimum contract duration
- `cancellation_notice_days`: Required notice period

#### customer_subscriptions
Tracks active and historical customer subscriptions.

**Key fields:**
- `status`: active, paused, cancelled, expired, pending
- `start_date`, `end_date`: Subscription period
- `next_billing_date`: When next payment is due
- `visits_remaining`: Remaining visits in current cycle
- `current_price`: Locked-in pricing

#### contracts
Formal service agreements for long-term commitments.

**Key fields:**
- `contract_type`: subscription, permanent, fixed_term, maintenance
- `contract_number`: Unique identifier
- `status`: draft, pending_signature, active, completed, terminated
- `terms_and_conditions`: Contract terms

#### subscription_billing
Records all billing transactions.

**Key fields:**
- `billing_period_start/end`: Billing period dates
- `status`: pending, processing, paid, failed, refunded
- `retry_count`: Failed payment retry attempts
- `is_prorated`: Indicates pro-rated billing

#### subscription_schedules
Manages recurring service visit schedules.

**Key fields:**
- `scheduled_date`: When service is scheduled
- `status`: scheduled, completed, cancelled, rescheduled
- `occurrence_number`: Which occurrence in series
- `recurrence_rule`: RRULE format for complex patterns

## API Endpoints

### Subscription Plans

```
GET    /api/subscriptions/plans              - List all plans
POST   /api/subscriptions/plans              - Create new plan
GET    /api/subscriptions/plans?billing_cycle=weekly  - Filter by cycle
```

### Subscriptions

```
GET    /api/subscriptions                    - List all subscriptions
POST   /api/subscriptions                    - Create new subscription
GET    /api/subscriptions/[id]               - Get subscription details
PATCH  /api/subscriptions/[id]               - Update subscription
DELETE /api/subscriptions/[id]               - Cancel subscription
POST   /api/subscriptions/[id]/pause         - Pause subscription
DELETE /api/subscriptions/[id]/pause         - Resume subscription
```

### Contracts

```
GET    /api/contracts                        - List all contracts
POST   /api/contracts                        - Create new contract
GET    /api/contracts/[id]                   - Get contract details
PATCH  /api/contracts/[id]                   - Update contract
```

### Billing

```
POST   /api/subscriptions/billing/process    - Process recurring billing
GET    /api/subscriptions/billing/process?days=7  - Upcoming billing summary
```

## Usage Examples

### Creating a Weekly Subscription Plan

```typescript
const plan = {
  name: "Weekly Premium Cleaning",
  description: "Weekly professional cleaning service",
  billing_cycle: "weekly",
  price: 149.99,
  included_visits: 1,
  visit_duration: 120,
  priority_level: "priority",
  cancellation_notice_days: 7,
  auto_renewal: true
};

const response = await fetch('/api/subscriptions/plans', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(plan)
});
```

### Subscribing a Customer

```typescript
const subscription = {
  customer_id: "customer-uuid",
  subscription_plan_id: "plan-uuid",
  start_date: "2024-01-01",
  payment_method: "credit_card",
  is_trial: false,
  notes: "Customer prefers morning appointments"
};

const response = await fetch('/api/subscriptions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(subscription)
});
```

### Pausing a Subscription

```typescript
const pauseData = {
  pause_start_date: "2024-06-01",
  pause_end_date: "2024-07-01",
  reason: "Customer on vacation",
  billing_suspended: true
};

const response = await fetch('/api/subscriptions/[id]/pause', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(pauseData)
});
```

### Creating a Permanent Contract

```typescript
const contract = {
  customer_id: "customer-uuid",
  contract_type: "permanent",
  title: "Long-term Maintenance Agreement",
  description: "Ongoing facility maintenance services",
  start_date: "2024-01-01",
  end_date: null, // Permanent
  total_value: 50000,
  payment_terms: "Monthly installments",
  auto_renewal: false,
  terms_and_conditions: "Full T&Cs here..."
};

const response = await fetch('/api/contracts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(contract)
});
```

## Automated Processes

### Billing Automation

The system includes functions for automated billing:

1. **calculate_next_billing_date()** - Automatically calculates next billing date based on cycle
2. **update_subscription_billing_date()** - Trigger that updates next billing after payment
3. **check_subscription_expiry()** - Checks and marks expired subscriptions
4. **generate_subscription_schedules()** - Creates recurring service schedules

### Setup Cron Job for Billing

You can set up a cron job to process billing automatically:

```bash
# Daily at 2 AM
0 2 * * * curl -X POST https://your-domain.com/api/subscriptions/billing/process
```

Or use Vercel Cron Jobs in `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/subscriptions/billing/process",
    "schedule": "0 2 * * *"
  }]
}
```

## Revenue Metrics

The system calculates important business metrics:

- **MRR (Monthly Recurring Revenue)**: Total monthly revenue from all active subscriptions
- **ARR (Annual Recurring Revenue)**: MRR × 12
- **Churn Rate**: Percentage of cancelled subscriptions
- **Active Subscriptions**: Count by status and billing cycle

## Best Practices

### 1. Subscription Lifecycle
1. Create subscription plans first
2. Subscribe customers to plans
3. System auto-generates schedules
4. Process billing automatically
5. Track usage and completion
6. Handle cancellations gracefully

### 2. Contract Management
1. Draft contract with all terms
2. Get customer signature
3. Mark as active
4. Track renewal dates
5. Send renewal reminders
6. Process renewals or terminations

### 3. Billing
1. Review upcoming billing 7 days ahead
2. Verify payment methods are valid
3. Process billing batch daily
4. Handle failed payments with retries
5. Send invoices automatically
6. Track payment status

### 4. Customer Communication
1. Send subscription confirmations
2. Reminder before each service visit
3. Billing notifications before charges
4. Payment receipts
5. Renewal reminders
6. Cancellation confirmations

## Installation

1. **Run the SQL migration:**
```bash
psql -h your-db-host -d your-database -f lib/supabase/add-subscription-system.sql
```

2. **Verify tables created:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'subscription_%' OR table_name = 'contracts';
```

3. **Insert sample plans:**
The migration includes 7 sample subscription plans to get started.

4. **Access the UI:**
Navigate to `/admin/subscriptions` to manage subscriptions.

## Integration Points

### With Existing System

The subscription system integrates with:
- **Customers**: Links subscriptions to customer records
- **Services**: Associates plans with specific services
- **Jobs**: Creates jobs from scheduled visits
- **Invoices**: Generates invoices from billing
- **Payments**: Tracks subscription payments

### Webhook Events

Consider adding webhooks for:
- `subscription.created`
- `subscription.cancelled`
- `subscription.paused`
- `subscription.resumed`
- `billing.processed`
- `payment.failed`
- `contract.signed`

## Security

The system includes Row Level Security (RLS) policies:
- Customers can only view their own subscriptions
- Active plans are publicly viewable
- Billing data is protected
- Contracts require authentication

Adjust RLS policies based on your authentication setup.

## Support

For questions or issues:
1. Check the API documentation
2. Review database schema comments
3. Test with sample data
4. Check logs for errors

## Future Enhancements

Potential additions:
- Multi-currency support
- Volume discounts
- Referral programs
- Loyalty points
- Advanced analytics
- Customer self-service portal
- Payment gateway integration
- Dunning management for failed payments
- Subscription upgrades/downgrades
- Usage-based billing
