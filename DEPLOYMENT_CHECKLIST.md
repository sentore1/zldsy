# Deployment Checklist - Advanced Features

Quick reference guide for deploying all 7 advanced features to production.

---

## 📋 Pre-Deployment Checklist

### Environment Preparation
- [ ] Backup current database
- [ ] Test database connection
- [ ] Verify Node.js version compatibility
- [ ] Check environment variables in `.env.local`
- [ ] Ensure Supabase project is accessible

---

## 🗄️ Database Migration (Critical First Step)

### Step 1: Run Migrations in Order

```bash
# 1. Staff Roles System
psql -h your-db-host -U postgres -d your-database -f lib/supabase/add-staff-roles.sql

# 2. Subscription System
psql -h your-db-host -U postgres -d your-database -f lib/supabase/add-subscriptions.sql

# 3. Feedback System
psql -h your-db-host -U postgres -d your-database -f lib/supabase/add-feedback-system.sql

# 4. Tax System
psql -h your-db-host -U postgres -d your-database -f lib/supabase/add-tax-system.sql
```

**OR using Supabase CLI:**
```bash
supabase db push
```

### Step 2: Verify Migrations

```sql
-- Check new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tax_configuration', 'subscriptions', 'subscription_history', 'feedback');

-- Check new columns added
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'invoices' 
AND column_name IN ('subtotal', 'tax_amount', 'tax_rate');

SELECT column_name FROM information_schema.columns 
WHERE table_name = 'staff' 
AND column_name IN ('system_role', 'employment_type');

-- Check triggers exist
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name IN (
  'invoice_tax_calculation', 
  'quotation_tax_calculation', 
  'trigger_auto_request_feedback'
);

-- Check functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_type = 'FUNCTION' 
AND routine_name LIKE '%tax%' OR routine_name LIKE '%subscription%';
```

**Expected Results:**
- ✅ 4 new tables
- ✅ Tax columns in invoices, quotations, jobs
- ✅ Role columns in staff
- ✅ 3 triggers active
- ✅ 10+ functions created

---

## ⚙️ Configuration Steps

### Step 3: Configure Tax Settings

1. Navigate to: `http://your-domain/admin/settings`
2. Add TaxConfiguration component (or use SQL):

```sql
-- Insert or update tax configuration
INSERT INTO tax_configuration (
  enabled, 
  rate, 
  tax_type, 
  tax_id, 
  company_name,
  apply_to_services,
  apply_to_materials,
  apply_to_labor,
  apply_to_equipment
) VALUES (
  true,           -- enabled
  18.00,          -- 18% VAT
  'vat',          -- tax type
  '123456789',    -- Your TIN (9 digits)
  'Your Company Name',
  true,           -- apply to services
  true,           -- apply to materials
  true,           -- apply to labor
  true            -- apply to equipment
)
ON CONFLICT (id) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  rate = EXCLUDED.rate,
  tax_id = EXCLUDED.tax_id,
  company_name = EXCLUDED.company_name;
```

**Verify:**
```sql
SELECT * FROM tax_configuration;
```

### Step 4: Set Up Staff Roles

1. Update existing admin users:

```sql
-- Set admin role for main administrator
UPDATE staff 
SET system_role = 'admin', 
    employment_type = 'permanent',
    is_active = true
WHERE email = 'admin@yourcompany.com';

-- Set supervisor roles
UPDATE staff 
SET system_role = 'supervisor',
    employment_type = 'permanent',
    is_active = true
WHERE email IN ('supervisor1@yourcompany.com', 'supervisor2@yourcompany.com');

-- Set staff roles
UPDATE staff 
SET system_role = 'staff',
    is_active = true
WHERE system_role IS NULL;
```

**Verify:**
```sql
SELECT name, email, system_role, employment_type, is_active 
FROM staff 
ORDER BY system_role;
```

---

## 🧪 Feature Testing

### Step 5: Test Each Feature

#### ✅ Feature 1: WhatsApp Share
- [ ] Navigate to an invoice page
- [ ] Click "Share via WhatsApp"
- [ ] Verify WhatsApp opens with correct message
- [ ] Test "Copy Link" button
- [ ] Test on mobile device

#### ✅ Feature 2: Staff Roles
- [ ] Login as admin - verify full access
- [ ] Login as supervisor - verify limited access (no financial)
- [ ] Login as staff - verify job-only access
- [ ] Test PermissionGuard hiding/showing UI elements
- [ ] Verify staff can only see assigned jobs

**Test Permission Guards:**
```tsx
// Check if admin sees all buttons
// Check if supervisor sees operational buttons only
// Check if staff sees limited buttons
```

#### ✅ Feature 3: Subscriptions
- [ ] Create weekly subscription
- [ ] Create monthly subscription with auto-renewal
- [ ] Verify discount calculation (5% monthly, 20% yearly)
- [ ] Complete a subscription service
- [ ] Pause subscription
- [ ] Resume subscription
- [ ] Cancel subscription with reason

**Test Query:**
```sql
SELECT * FROM subscriptions WHERE status = 'active';
SELECT * FROM subscription_history ORDER BY created_at DESC LIMIT 10;
```

#### ✅ Feature 4: Feedback System
- [ ] Complete a job (set status to 'completed')
- [ ] Verify feedback request appears
- [ ] Submit feedback with 5-star rating
- [ ] Add review text
- [ ] Check sub-category ratings work
- [ ] Add company response
- [ ] View public feedback page

**Test Query:**
```sql
SELECT * FROM feedback ORDER BY created_at DESC LIMIT 5;
SELECT * FROM v_public_feedback LIMIT 5;
SELECT * FROM v_service_ratings;
```

#### ✅ Feature 5: Service Tips
- [ ] View tips for "Cleaning and Fumigation"
- [ ] View tips for "Maintenance and Renovations"
- [ ] View tips for "Gardening and Landscaping"
- [ ] View tips for "Moving and Property Management"
- [ ] Test all 3 display variants (full, compact, card)
- [ ] Test expand/collapse functionality
- [ ] Test search functionality (if enabled)

#### ✅ Feature 6: Tax Calculations
- [ ] Create new invoice
- [ ] Verify tax calculated automatically (18%)
- [ ] Check subtotal shown separately
- [ ] Verify tax amount correct
- [ ] Check total = subtotal + tax
- [ ] Test quotation tax calculation
- [ ] Generate monthly tax report

**Test Calculations:**
```sql
-- Create test invoice
INSERT INTO invoices (invoice_number, subtotal)
VALUES ('TEST-TAX-001', 100000);

-- Verify calculations
SELECT 
  invoice_number,
  subtotal,
  tax_rate,
  tax_amount,
  total_amount,
  (subtotal * tax_rate / 100) as expected_tax,
  (subtotal + tax_amount) as expected_total
FROM invoices 
WHERE invoice_number = 'TEST-TAX-001';

-- Should show:
-- subtotal: 100000
-- tax_rate: 18
-- tax_amount: 18000
-- total_amount: 118000
```

#### ✅ Feature 7: Employment Types
- [ ] Create new staff member
- [ ] Select employment type (permanent/casual/contract/part_time)
- [ ] Verify employment type saved
- [ ] Edit existing staff employment type

**Test Query:**
```sql
SELECT name, employment_type, system_role 
FROM staff 
WHERE is_active = true;
```

---

## 🔍 Post-Deployment Verification

### Step 6: System Health Checks

#### Database Health
```sql
-- Check for any errors in recent operations
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Verify trigger execution
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Check view accessibility
SELECT * FROM v_active_staff LIMIT 1;
SELECT * FROM v_tax_report LIMIT 1;
SELECT * FROM v_public_feedback LIMIT 1;
SELECT * FROM v_service_ratings LIMIT 1;
```

#### Application Health
- [ ] All pages load without errors
- [ ] No console errors in browser
- [ ] API routes responding correctly
- [ ] Authentication working properly
- [ ] Permission guards functioning

#### Performance Check
```sql
-- Check slow queries
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## 📊 Monitoring Setup

### Step 7: Enable Monitoring

#### Database Monitoring
```sql
-- Enable query statistics (if not already enabled)
ALTER SYSTEM SET track_activities = on;
ALTER SYSTEM SET track_counts = on;
ALTER SYSTEM SET track_io_timing = on;
ALTER SYSTEM SET track_functions = all;

-- Reload configuration
SELECT pg_reload_conf();
```

#### Application Monitoring
- [ ] Set up error logging
- [ ] Configure performance monitoring
- [ ] Enable user activity tracking
- [ ] Set up automated backups

---

## 🚨 Rollback Plan (If Needed)

### Emergency Rollback Steps

1. **Stop Application**
```bash
# Stop the Next.js application
pm2 stop your-app
# or
docker stop your-container
```

2. **Restore Database Backup**
```bash
# Restore from backup
pg_restore -h your-db-host -U postgres -d your-database backup_file.dump
```

3. **Revert Code Changes**
```bash
git revert HEAD~1  # Revert last commit
# or
git checkout previous-stable-tag
```

4. **Restart Application**
```bash
pm2 start your-app
# or
docker start your-container
```

---

## ✅ Final Verification

### Step 8: Complete System Test

#### User Acceptance Testing
- [ ] Admin can access all features
- [ ] Supervisor has appropriate access
- [ ] Staff member can view assigned jobs only
- [ ] Customer can submit feedback
- [ ] Invoices show correct tax calculations
- [ ] Subscriptions can be created and managed
- [ ] Service tips display correctly
- [ ] WhatsApp sharing works on all devices

#### Data Integrity
```sql
-- Verify data consistency
SELECT 
  COUNT(*) as total_invoices,
  SUM(CASE WHEN tax_amount IS NULL THEN 1 ELSE 0 END) as missing_tax,
  SUM(CASE WHEN subtotal IS NULL THEN 1 ELSE 0 END) as missing_subtotal
FROM invoices;

-- Should show 0 missing values for new invoices

-- Check subscription integrity
SELECT 
  COUNT(*) as total_subscriptions,
  status,
  COUNT(*) filter (where next_service_date < CURRENT_DATE) as overdue_services
FROM subscriptions
GROUP BY status;
```

---

## 📝 Documentation Update

### Step 9: Update Team Documentation

- [ ] Share `ADVANCED_FEATURES_COMPLETE.md` with team
- [ ] Share `STAFF_ROLES_GUIDE.md` with administrators
- [ ] Share `SUBSCRIPTIONS_GUIDE.md` with sales team
- [ ] Share `TAX_SYSTEM_GUIDE.md` with accounting
- [ ] Conduct training session for staff
- [ ] Create user manual for customers
- [ ] Update API documentation

---

## 🎯 Success Criteria

### Deployment Successful When:

- ✅ All 4 database migrations completed without errors
- ✅ All new tables and columns exist
- ✅ All triggers and functions working
- ✅ Tax calculations automatic and accurate
- ✅ Staff roles enforced correctly
- ✅ Subscriptions can be created and managed
- ✅ Feedback collection working
- ✅ Service tips display properly
- ✅ WhatsApp sharing functional
- ✅ No critical errors in logs
- ✅ Performance acceptable (< 2s page loads)
- ✅ All team members trained

---

## 📞 Support Contacts

### Technical Issues
- Database: Your DBA contact
- Application: Your dev team lead
- Infrastructure: Your DevOps contact

### Business Issues
- Accounting: For tax configuration questions
- Operations: For subscription management
- Customer Service: For feedback system

---

## 🎉 Deployment Complete!

Once all checkboxes are marked, your deployment is complete and the system is ready for production use.

**Post-Deployment Actions:**
1. Monitor error logs for 24 hours
2. Collect user feedback
3. Address any issues immediately
4. Schedule follow-up review in 1 week
5. Plan for next features/improvements

---

**Deployment Date**: _____________  
**Deployed By**: _____________  
**Verified By**: _____________  
**Status**: ⬜ In Progress | ⬜ Complete | ⬜ Rolled Back

---

**Quick Reference Links:**
- Complete Guide: `ADVANCED_FEATURES_COMPLETE.md`
- Staff Roles: `STAFF_ROLES_GUIDE.md`
- Subscriptions: `SUBSCRIPTIONS_GUIDE.md`
- Tax System: `TAX_SYSTEM_GUIDE.md`
- Summary: `IMPLEMENTATION_SUMMARY.md`
