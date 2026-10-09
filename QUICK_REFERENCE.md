# Quick Reference Guide - Advanced Features

One-page reference for all 7 implemented features.

---

## 🚀 Quick Start

```bash
# 1. Run database migrations
psql -f lib/supabase/add-staff-roles.sql
psql -f lib/supabase/add-subscriptions.sql
psql -f lib/supabase/add-feedback-system.sql
psql -f lib/supabase/add-tax-system.sql

# 2. Configure tax settings
# Visit /admin/settings and set up tax configuration

# 3. Assign staff roles
# Update staff records with system_role field

# 4. Start using features!
```

---

## 📚 Feature Reference

### 1. WhatsApp Share
```tsx
import { WhatsAppShareButton } from '@/components/WhatsAppShareButton';

<WhatsAppShareButton
  invoiceNumber="INV-001"
  customerName="John Doe"
  amount={118000}
  shareUrl="https://app.com/invoice/123"
/>
```

### 2. Staff Roles & Permissions
```tsx
import { PermissionGuard } from '@/components/PermissionGuard';
import { PERMISSIONS } from '@/lib/constants/roles';

// Protect UI elements
<PermissionGuard permission={PERMISSIONS.INVOICE_CREATE}>
  <button>Create Invoice</button>
</PermissionGuard>

// Check in code
const { hasPermission, isAdmin } = useAuth();
if (hasPermission(PERMISSIONS.JOB_MANAGE)) {
  // Show job management
}
```

**Roles**: Admin (full access) | Supervisor (operations) | Staff (assigned jobs only)

### 3. Subscriptions
```tsx
import { SubscriptionFormModal } from '@/components/SubscriptionFormModal';
import { calculateSubscriptionPrice } from '@/lib/constants/subscriptions';

// Calculate pricing
const price = calculateSubscriptionPrice(50000, 'monthly', 12);
// { basePrice: 50000, discount: 5, finalPrice: 47500, totalCost: 570000 }

// Create subscription
<SubscriptionFormModal
  customerId="customer-id"
  serviceId="service-id"
  onSave={handleSave}
/>
```

**Discounts**: Weekly 0% | Monthly 5% | Quarterly 10% | Yearly 20%

### 4. Feedback Collection
```tsx
import { FeedbackModal } from '@/components/FeedbackModal';

<FeedbackModal
  jobId="job-id"
  customerId="customer-id"
  serviceId="service-id"
  onSubmit={handleFeedback}
  onClose={() => setShowModal(false)}
/>
```

**Auto-triggers** when job status = 'completed'

### 5. Service Tips
```tsx
import { 
  ServiceTips, 
  ServiceTipsBanner, 
  TipsWidget 
} from '@/components/ServiceTips';

// Full display
<ServiceTips serviceCategory="Cleaning and Fumigation" />

// Post-service banner
<ServiceTipsBanner serviceCategory="Gardening and Landscaping" />

// Dashboard widget
<TipsWidget />
```

**132+ tips** across 4 categories

### 6. Tax Calculations
```tsx
import { 
  calculateTaxBreakdown,
  formatCurrency 
} from '@/lib/constants/taxes';

// Calculate tax
const breakdown = calculateTaxBreakdown(100000);
/*
{
  subtotal: 100000,
  tax_rate: 18,
  tax_amount: 18000,
  total: 118000,
  formatted: {
    subtotal: 'RWF 100,000',
    tax_amount: 'RWF 18,000',
    total: 'RWF 118,000',
    tax_label: 'VAT (18%)'
  }
}
*/

// Tax settings UI
import { TaxConfiguration } from '@/components/TaxConfiguration';
<TaxConfiguration onSave={handleSave} />
```

**Auto-calculates** via database triggers

### 7. Employment Types
```typescript
// Part of Staff interface
interface Staff {
  employment_type: 'permanent' | 'casual' | 'contract' | 'part_time';
  system_role: 'admin' | 'supervisor' | 'staff';
  // ... other fields
}
```

---

## 🗄️ Database Quick Reference

### Key Tables
```sql
-- Tax configuration
SELECT * FROM tax_configuration;

-- Subscriptions
SELECT * FROM subscriptions WHERE status = 'active';
SELECT * FROM subscription_history;

-- Feedback
SELECT * FROM feedback WHERE is_public = true;
SELECT * FROM v_public_feedback;
SELECT * FROM v_service_ratings;

-- Staff roles
SELECT * FROM v_active_staff;
```

### Key Functions
```sql
-- Tax
SELECT calculate_tax(100000, 18);              -- Returns 18000
SELECT calculate_total_with_tax(100000, 18);   -- Returns 118000

-- Subscriptions
SELECT complete_subscription_service('sub-id', 'job-id');
SELECT pause_subscription('sub-id', 'Reason');
SELECT resume_subscription('sub-id');
SELECT cancel_subscription('sub-id', 'user-id', 'Reason');
```

### Tax Reports
```sql
-- Monthly tax report
SELECT * FROM v_tax_report 
WHERE period >= '2026-01-01' 
ORDER BY period DESC;

-- Custom period
SELECT 
  SUM(subtotal) as total_sales,
  SUM(tax_amount) as total_tax
FROM invoices
WHERE created_at BETWEEN '2026-01-01' AND '2026-01-31'
AND status IN ('paid', 'partially_paid');
```

---

## 🔑 Key Constants

### Permissions (40+)
```typescript
PERMISSIONS.DASHBOARD_VIEW
PERMISSIONS.JOB_VIEW, JOB_CREATE, JOB_UPDATE, JOB_DELETE, JOB_MANAGE
PERMISSIONS.BOOKING_VIEW, BOOKING_CREATE, BOOKING_UPDATE, BOOKING_DELETE
PERMISSIONS.CUSTOMER_VIEW, CUSTOMER_CREATE, CUSTOMER_UPDATE, CUSTOMER_DELETE
PERMISSIONS.STAFF_VIEW, STAFF_CREATE, STAFF_UPDATE, STAFF_DELETE, STAFF_MANAGE
PERMISSIONS.INVOICE_VIEW, INVOICE_CREATE, INVOICE_UPDATE, INVOICE_DELETE
PERMISSIONS.PAYMENT_VIEW, PAYMENT_CREATE, PAYMENT_UPDATE, PAYMENT_DELETE
// ... and more
```

### Tax Rates
```typescript
TAX_RATES.VAT = 18              // Rwanda standard VAT
TAX_RATES.WITHHOLDING_TAX = 15
TAX_COMPLIANCE.vat_registration_threshold = 20000000  // RWF
TAX_COMPLIANCE.payment_deadline_days = 15
```

### Subscription Billing
```typescript
BILLING_CYCLES.WEEKLY   // 0% discount
BILLING_CYCLES.MONTHLY  // 5% discount
BILLING_CYCLES.QUARTERLY // 10% discount
BILLING_CYCLES.YEARLY   // 20% discount
```

---

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| `ADVANCED_FEATURES_COMPLETE.md` | Complete feature overview |
| `IMPLEMENTATION_SUMMARY.md` | Implementation details |
| `DEPLOYMENT_CHECKLIST.md` | Step-by-step deployment |
| `STAFF_ROLES_GUIDE.md` | Staff roles documentation |
| `SUBSCRIPTIONS_GUIDE.md` | Subscription system guide |
| `TAX_SYSTEM_GUIDE.md` | Tax calculation guide |
| `QUICK_REFERENCE.md` | This file |

---

## 🧪 Quick Tests

### Test Tax Calculation
```sql
INSERT INTO invoices (invoice_number, subtotal) VALUES ('TEST-001', 100000);
SELECT subtotal, tax_amount, total_amount FROM invoices WHERE invoice_number = 'TEST-001';
-- Expected: 100000, 18000, 118000
```

### Test Subscription
```sql
INSERT INTO subscriptions (customer_id, service_id, subscription_type, status, base_price)
VALUES ('cust-id', 'serv-id', 'monthly', 'active', 50000);
SELECT * FROM subscriptions WHERE subscription_type = 'monthly';
```

### Test Staff Roles
```sql
UPDATE staff SET system_role = 'admin' WHERE email = 'admin@company.com';
SELECT name, system_role, employment_type FROM staff WHERE is_active = true;
```

### Test Feedback Trigger
```sql
UPDATE jobs SET status = 'completed' WHERE id = 'job-id';
-- Check feedback table for auto-created request
SELECT * FROM feedback WHERE job_id = 'job-id';
```

---

## 🚨 Common Issues & Solutions

### Issue: Tax not calculating
**Solution**: Ensure `subtotal` field is set, not `total_amount`
```typescript
// ✅ Correct
await supabase.from('invoices').insert({ subtotal: 100000 });

// ❌ Wrong
await supabase.from('invoices').insert({ total_amount: 118000 });
```

### Issue: Permission denied
**Solution**: Check user's system_role is set correctly
```sql
SELECT system_role FROM staff WHERE email = 'user@company.com';
UPDATE staff SET system_role = 'admin' WHERE email = 'user@company.com';
```

### Issue: Subscription discount not applied
**Solution**: Use `calculateSubscriptionPrice()` function
```typescript
const price = calculateSubscriptionPrice(basePrice, billingCycle, duration);
```

### Issue: Feedback not auto-requesting
**Solution**: Verify trigger is active
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trigger_auto_request_feedback';
```

---

## 💡 Pro Tips

1. **Always use subtotal** - Let triggers calculate tax automatically
2. **Use PermissionGuard** - Wrap all sensitive UI elements
3. **Check user role** - Use `hasPermission()` hook in code
4. **Test with real data** - Use actual customer/service IDs
5. **Monitor tax reports** - Check monthly for accuracy
6. **Track subscriptions** - Review subscription_history regularly
7. **Respond to feedback** - Add company responses to reviews
8. **Share tips** - Show ServiceTipsBanner after job completion

---

## 🔗 Quick Links

### Admin Pages
- Tax Settings: `/admin/settings`
- Staff Management: `/admin/staff`
- Subscription Management: `/admin/subscriptions` (to be created)
- Feedback Review: `/admin/feedback` (to be created)
- Tax Reports: `/admin/reports` (to be created)

### Customer Pages
- Service Tips: `/tips` (to be created)
- Feedback Form: Shown after job completion
- Invoice View: `/invoice/[id]`
- Quotation View: `/customer/quotations/[id]`

---

## 📞 Need Help?

- **Technical Issues**: Check comprehensive guides in root directory
- **Database Issues**: Review migration SQL files
- **UI Issues**: Check component files in `components/`
- **Permission Issues**: Review `STAFF_ROLES_GUIDE.md`
- **Tax Questions**: Review `TAX_SYSTEM_GUIDE.md`
- **Subscription Help**: Review `SUBSCRIPTIONS_GUIDE.md`

---

**Version**: 2.0.0  
**Last Updated**: January 2026  
**Status**: ✅ Production Ready
