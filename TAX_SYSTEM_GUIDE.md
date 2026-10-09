# Tax Calculation System Guide

## Overview
Comprehensive tax management system for Rwanda with 18% VAT support, automatic calculations, and compliance tracking.

## 🎯 Features

### Core Functionality
- ✅ Automatic tax calculation (18% VAT by default)
- ✅ Support for multiple tax types (VAT, Withholding, Excise)
- ✅ Business TIN (Tax Identification Number) management
- ✅ Itemized tax breakdown by cost type
- ✅ Tax exemption support
- ✅ Monthly tax reports and compliance tracking
- ✅ Auto-calculation triggers for invoices and quotations

### Tax Configuration
- Enable/disable tax system
- Configurable tax rates
- Apply tax selectively to:
  - Service charges
  - Materials & supplies
  - Labor costs
  - Equipment rental

## 📁 File Structure

```
lib/
├── constants/
│   └── taxes.ts                    # Tax rates, calculations, utilities
├── supabase/
│   └── add-tax-system.sql         # Database migration
components/
└── TaxConfiguration.tsx           # Tax settings UI
types/
└── index.ts                       # Updated with tax types
```

## 🗄️ Database Schema

### New Table: `tax_configuration`
```sql
- enabled: boolean (default true)
- rate: decimal (default 18.00)
- tax_type: varchar ('vat', 'withholding', 'excise', 'none')
- tax_id: varchar (Business TIN)
- company_name: varchar
- apply_to_services: boolean
- apply_to_materials: boolean
- apply_to_labor: boolean
- apply_to_equipment: boolean
```

### Updated Tables

#### Invoices
New columns:
- `subtotal` - Amount before tax
- `tax_amount` - Calculated tax
- `tax_rate` - Tax percentage applied
- `tax_type` - Type of tax
- `business_tin` - Business Tax ID

#### Quotations
Same new columns as invoices

#### Jobs
New columns for cost tracking:
- `subtotal`
- `tax_amount`
- `tax_rate`

## 📊 Functions & Calculations

### Tax Calculation Functions

```typescript
import {
  calculateTax,
  calculateTotalWithTax,
  calculateTaxBreakdown,
  formatCurrency,
} from '@/lib/constants/taxes';

// Basic tax calculation
const taxAmount = calculateTax(100000, 18); // 18000 RWF

// Total with tax
const total = calculateTotalWithTax(100000, 18); // 118000 RWF

// Full breakdown
const breakdown = calculateTaxBreakdown(100000);
/*
{
  subtotal: 100000,
  tax_rate: 18,
  tax_amount: 18000,
  total: 118000,
  tax_type: 'vat',
  formatted: {
    subtotal: 'RWF 100,000',
    tax_amount: 'RWF 18,000',
    total: 'RWF 118,000',
    tax_label: 'VAT (18%)'
  }
}
*/
```

### Itemized Tax Breakdown

```typescript
import { calculateItemizedTax } from '@/lib/constants/taxes';

const costs = {
  service: 50000,
  materials: 30000,
  labor: 20000,
  equipment: 10000
};

const itemizedTax = calculateItemizedTax(costs);
/*
{
  service_cost: 50000,
  service_tax: 9000,
  materials_cost: 30000,
  materials_tax: 5400,
  labor_cost: 20000,
  labor_tax: 3600,
  equipment_cost: 10000,
  equipment_tax: 1800,
  subtotal: 110000,
  total_tax: 19800,
  grand_total: 129800
}
*/
```

## 🔧 Database Migration

Run the SQL migration to add tax support:

```bash
# Using Supabase CLI
supabase db push

# Or run SQL file directly
psql -h your-db-host -U postgres -d your-db -f lib/supabase/add-tax-system.sql
```

### What the Migration Does

1. Creates `tax_configuration` table
2. Adds tax columns to `invoices`, `quotations`, and `jobs`
3. Creates automatic tax calculation triggers
4. Creates `v_tax_report` view for monthly reporting
5. Adds helper functions: `calculate_tax()`, `calculate_total_with_tax()`
6. Populates default tax configuration (18% VAT)

## 🎨 UI Components

### TaxConfiguration Component

Add to your settings page:

```tsx
import { TaxConfiguration } from '@/components/TaxConfiguration';

export default function SettingsPage() {
  const handleSave = async (config) => {
    // Save to database via API
    await fetch('/api/tax-configuration', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  };

  return (
    <div>
      <TaxConfiguration onSave={handleSave} />
    </div>
  );
}
```

### Display Tax on Invoice/Quotation

```tsx
import { calculateTaxBreakdown, formatCurrency } from '@/lib/constants/taxes';

function InvoiceDisplay({ subtotal, taxRate }) {
  const breakdown = calculateTaxBreakdown(subtotal, { rate: taxRate });

  return (
    <div>
      <div>Subtotal: {breakdown.formatted.subtotal}</div>
      <div>{breakdown.formatted.tax_label}: {breakdown.formatted.tax_amount}</div>
      <div className="font-bold">Total: {breakdown.formatted.total}</div>
    </div>
  );
}
```

## 🔄 Automatic Tax Calculation

Database triggers automatically calculate tax when:
- Creating new invoice
- Updating invoice subtotal
- Creating new quotation
- Updating quotation subtotal

The triggers:
1. Fetch current tax configuration
2. Check if tax is enabled
3. Calculate tax amount based on subtotal and rate
4. Update `tax_amount` and `total_amount` fields

## 📈 Tax Reports

### Monthly Tax Report View

```sql
SELECT * FROM v_tax_report
WHERE period >= '2026-01-01';
```

Returns:
- Period (month)
- Transaction count
- Total sales
- Total tax collected
- Average tax rate
- Tax type

### Generate Tax Report

```typescript
import { calculateTaxReport } from '@/lib/constants/taxes';

const transactions = [
  { subtotal: 100000, tax_amount: 18000, date: '2026-01-15' },
  { subtotal: 50000, tax_amount: 9000, date: '2026-01-20' },
];

const report = calculateTaxReport(
  transactions,
  '2026-01-01',
  '2026-01-31'
);
```

## 🇷🇼 Rwanda Tax Compliance

### Key Information

- **Standard VAT Rate**: 18%
- **VAT Registration Threshold**: RWF 20,000,000 annual turnover
- **Filing Frequency**: Monthly VAT returns
- **Payment Deadline**: 15th of following month
- **TIN Format**: 9 digits
- **Late Filing Penalty**: 5% of tax due
- **Late Payment Penalty**: 2% per month

### TIN Validation

```typescript
import { isValidTIN } from '@/lib/constants/taxes';

const isValid = isValidTIN('123456789'); // true
const invalid = isValidTIN('12345'); // false
```

### Calculate Late Penalties

```typescript
import { calculateLatePenalty } from '@/lib/constants/taxes';

const penalty = calculateLatePenalty(18000, 2); // 720 RWF (2 months late)
```

## 🔌 API Integration

### Save Tax Configuration

```typescript
// app/api/tax-configuration/route.ts
export async function POST(request: Request) {
  const config = await request.json();
  
  const { data, error } = await supabase
    .from('tax_configuration')
    .upsert(config)
    .select()
    .single();

  return Response.json({ data, error });
}
```

### Get Tax Configuration

```typescript
// app/api/tax-configuration/route.ts
export async function GET() {
  const { data, error } = await supabase
    .from('tax_configuration')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return Response.json({ data, error });
}
```

### Create Invoice with Tax

```typescript
// app/api/invoices/route.ts
export async function POST(request: Request) {
  const invoice = await request.json();
  
  // Tax will be calculated automatically by trigger
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      ...invoice,
      subtotal: invoice.subtotal, // Trigger will calculate tax_amount and total_amount
    })
    .select()
    .single();

  return Response.json({ data, error });
}
```

## 💡 Best Practices

### 1. Always Use Subtotal
Store the pre-tax amount as `subtotal` and let the system calculate tax automatically.

```typescript
// ✅ Good
await supabase.from('invoices').insert({
  subtotal: 100000,
  // tax_amount and total_amount calculated automatically
});

// ❌ Avoid
await supabase.from('invoices').insert({
  total_amount: 118000, // Manually calculated
});
```

### 2. Itemize Costs
Break down costs by type for accurate tax application:

```typescript
const costs = {
  service: serviceTotal,
  materials: materialsTotal,
  labor: laborTotal,
  equipment: equipmentTotal,
};

const breakdown = calculateItemizedTax(costs, taxConfig);
```

### 3. Display Tax Clearly
Always show tax breakdown to customers:

```tsx
<div>
  <div>Service: {formatCurrency(serviceCost)}</div>
  <div>Materials: {formatCurrency(materialsCost)}</div>
  <div className="border-t pt-2">
    <div>Subtotal: {formatCurrency(subtotal)}</div>
    <div>VAT (18%): {formatCurrency(taxAmount)}</div>
    <div className="font-bold text-lg">
      Total: {formatCurrency(total)}
    </div>
  </div>
</div>
```

### 4. Handle Tax Exemptions
Check for tax-exempt services:

```typescript
import { isTaxExempt } from '@/lib/constants/taxes';

if (isTaxExempt(serviceCategory)) {
  // Don't apply tax
  taxConfig.enabled = false;
}
```

## 🧪 Testing

### Test Tax Calculations

```typescript
// Test basic calculation
const tax = calculateTax(100000, 18);
console.assert(tax === 18000, 'Tax should be 18000');

// Test total with tax
const total = calculateTotalWithTax(100000, 18);
console.assert(total === 118000, 'Total should be 118000');

// Test reverse calculation
const subtotal = calculateSubtotalFromTotal(118000, 18);
console.assert(Math.round(subtotal) === 100000, 'Subtotal should be 100000');
```

### Test Database Triggers

```sql
-- Insert test invoice
INSERT INTO invoices (invoice_number, subtotal)
VALUES ('TEST-001', 100000);

-- Check calculated values
SELECT 
  subtotal,
  tax_rate,
  tax_amount,
  total_amount
FROM invoices
WHERE invoice_number = 'TEST-001';

-- Expected:
-- subtotal: 100000
-- tax_rate: 18
-- tax_amount: 18000
-- total_amount: 118000
```

## 🚀 Next Steps

1. **Run Database Migration**
   ```bash
   supabase db push
   ```

2. **Add Tax Settings to Admin Panel**
   - Navigate to `/admin/settings`
   - Add `<TaxConfiguration />` component

3. **Update Invoice Generation**
   - Use `calculateTaxBreakdown()` in invoice pages
   - Display tax breakdown clearly

4. **Update Quotation Generation**
   - Apply same tax calculations
   - Show tax in quotation preview

5. **Create Tax Reports Page**
   - Use `v_tax_report` view
   - Add filters for date ranges
   - Export functionality

6. **Test Thoroughly**
   - Create test invoices
   - Verify tax calculations
   - Check tax reports

## 📞 Support

For Rwanda-specific tax questions:
- **Rwanda Revenue Authority (RRA)**: https://www.rra.gov.rw
- **VAT Help**: +250 252 596 200
- **TIN Registration**: Visit RRA Service Centers

## 📝 Notes

- Tax rates can be updated in the tax configuration settings
- All amounts are stored in RWF (Rwandan Francs)
- Tax calculations are rounded to 2 decimal places
- Historical tax data is preserved even if rates change
- Triggers ensure consistent tax calculations across the system
