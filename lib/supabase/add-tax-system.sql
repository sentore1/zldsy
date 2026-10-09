-- =====================================================
-- Tax System for Service Management
-- =====================================================
-- This migration adds tax calculation support to the system
-- Rwanda VAT: 18% standard rate

-- =====================================================
-- 1. Tax Configuration Table
-- =====================================================

CREATE TABLE IF NOT EXISTS tax_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled BOOLEAN DEFAULT true,
  rate DECIMAL(5,2) DEFAULT 18.00, -- 18% VAT
  tax_type VARCHAR(20) DEFAULT 'vat' CHECK (tax_type IN ('vat', 'withholding', 'excise', 'none')),
  tax_id VARCHAR(20), -- Business TIN (Tax Identification Number)
  company_name VARCHAR(255),
  apply_to_services BOOLEAN DEFAULT true,
  apply_to_materials BOOLEAN DEFAULT true,
  apply_to_labor BOOLEAN DEFAULT true,
  apply_to_equipment BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Insert default tax configuration
INSERT INTO tax_configuration (enabled, rate, tax_type, apply_to_services, apply_to_materials, apply_to_labor, apply_to_equipment)
VALUES (true, 18.00, 'vat', true, true, true, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. Add Tax Columns to Invoices
-- =====================================================

-- Add tax-related columns if they don't exist
DO $$ 
BEGIN
  -- Add subtotal column (amount before tax)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'invoices' AND column_name = 'subtotal') THEN
    ALTER TABLE invoices ADD COLUMN subtotal DECIMAL(15,2);
    -- Populate existing records (assume current total_amount is already tax-inclusive)
    UPDATE invoices SET subtotal = total_amount / 1.18 WHERE subtotal IS NULL;
  END IF;

  -- Add tax rate column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'invoices' AND column_name = 'tax_rate') THEN
    ALTER TABLE invoices ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 18.00;
  END IF;

  -- Add tax amount column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'invoices' AND column_name = 'tax_amount') THEN
    ALTER TABLE invoices ADD COLUMN tax_amount DECIMAL(15,2);
    -- Calculate tax amount for existing records
    UPDATE invoices SET tax_amount = subtotal * (tax_rate / 100) WHERE tax_amount IS NULL;
  END IF;

  -- Add tax type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'invoices' AND column_name = 'tax_type') THEN
    ALTER TABLE invoices ADD COLUMN tax_type VARCHAR(20) DEFAULT 'vat';
  END IF;

  -- Add tax ID (TIN) column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'invoices' AND column_name = 'business_tin') THEN
    ALTER TABLE invoices ADD COLUMN business_tin VARCHAR(20);
  END IF;
END $$;

-- =====================================================
-- 3. Add Tax Columns to Quotations
-- =====================================================

DO $$ 
BEGIN
  -- Add subtotal column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'quotations' AND column_name = 'subtotal') THEN
    ALTER TABLE quotations ADD COLUMN subtotal DECIMAL(15,2);
    UPDATE quotations SET subtotal = total_amount / 1.18 WHERE subtotal IS NULL;
  END IF;

  -- Add tax rate column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'quotations' AND column_name = 'tax_rate') THEN
    ALTER TABLE quotations ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 18.00;
  END IF;

  -- Add tax amount column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'quotations' AND column_name = 'tax_amount') THEN
    ALTER TABLE quotations ADD COLUMN tax_amount DECIMAL(15,2);
    UPDATE quotations SET tax_amount = subtotal * (tax_rate / 100) WHERE tax_amount IS NULL;
  END IF;

  -- Add tax type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'quotations' AND column_name = 'tax_type') THEN
    ALTER TABLE quotations ADD COLUMN tax_type VARCHAR(20) DEFAULT 'vat';
  END IF;

  -- Add tax ID column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'quotations' AND column_name = 'business_tin') THEN
    ALTER TABLE quotations ADD COLUMN business_tin VARCHAR(20);
  END IF;
END $$;

-- =====================================================
-- 4. Add Tax Columns to Jobs (for cost tracking)
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'jobs' AND column_name = 'subtotal') THEN
    ALTER TABLE jobs ADD COLUMN subtotal DECIMAL(15,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'jobs' AND column_name = 'tax_amount') THEN
    ALTER TABLE jobs ADD COLUMN tax_amount DECIMAL(15,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'jobs' AND column_name = 'tax_rate') THEN
    ALTER TABLE jobs ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 18.00;
  END IF;
END $$;

-- =====================================================
-- 5. Tax Reports View
-- =====================================================

CREATE OR REPLACE VIEW v_tax_report AS
SELECT 
  DATE_TRUNC('month', i.created_at) as period,
  COUNT(*) as transaction_count,
  SUM(i.subtotal) as total_sales,
  SUM(i.tax_amount) as total_tax_collected,
  AVG(i.tax_rate) as average_tax_rate,
  i.tax_type
FROM invoices i
WHERE i.status IN ('paid', 'partially_paid')
GROUP BY DATE_TRUNC('month', i.created_at), i.tax_type
ORDER BY period DESC;

-- =====================================================
-- 6. Function: Calculate Tax
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_tax(
  p_subtotal DECIMAL,
  p_tax_rate DECIMAL DEFAULT 18.00
)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN ROUND(p_subtotal * (p_tax_rate / 100), 2);
END;
$$;

-- =====================================================
-- 7. Function: Calculate Total with Tax
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_total_with_tax(
  p_subtotal DECIMAL,
  p_tax_rate DECIMAL DEFAULT 18.00
)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
  v_tax_amount DECIMAL;
BEGIN
  v_tax_amount := calculate_tax(p_subtotal, p_tax_rate);
  RETURN p_subtotal + v_tax_amount;
END;
$$;

-- =====================================================
-- 8. Trigger: Auto-calculate Tax on Invoice Insert/Update
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_calculate_invoice_tax()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_tax_config RECORD;
BEGIN
  -- Get current tax configuration
  SELECT * INTO v_tax_config FROM tax_configuration ORDER BY created_at DESC LIMIT 1;
  
  -- If tax is enabled and subtotal exists
  IF v_tax_config.enabled AND NEW.subtotal IS NOT NULL THEN
    -- Use provided tax_rate or default from config
    NEW.tax_rate := COALESCE(NEW.tax_rate, v_tax_config.rate);
    NEW.tax_type := COALESCE(NEW.tax_type, v_tax_config.tax_type);
    NEW.business_tin := COALESCE(NEW.business_tin, v_tax_config.tax_id);
    
    -- Calculate tax amount
    NEW.tax_amount := calculate_tax(NEW.subtotal, NEW.tax_rate);
    
    -- Calculate total
    NEW.total_amount := NEW.subtotal + NEW.tax_amount;
  ELSE
    -- No tax
    NEW.tax_amount := 0;
    NEW.tax_rate := 0;
    NEW.total_amount := COALESCE(NEW.subtotal, NEW.total_amount);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for invoices
DROP TRIGGER IF EXISTS invoice_tax_calculation ON invoices;
CREATE TRIGGER invoice_tax_calculation
  BEFORE INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_invoice_tax();

-- =====================================================
-- 9. Trigger: Auto-calculate Tax on Quotation Insert/Update
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_calculate_quotation_tax()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_tax_config RECORD;
BEGIN
  -- Get current tax configuration
  SELECT * INTO v_tax_config FROM tax_configuration ORDER BY created_at DESC LIMIT 1;
  
  -- If tax is enabled and subtotal exists
  IF v_tax_config.enabled AND NEW.subtotal IS NOT NULL THEN
    NEW.tax_rate := COALESCE(NEW.tax_rate, v_tax_config.rate);
    NEW.tax_type := COALESCE(NEW.tax_type, v_tax_config.tax_type);
    NEW.business_tin := COALESCE(NEW.business_tin, v_tax_config.tax_id);
    
    NEW.tax_amount := calculate_tax(NEW.subtotal, NEW.tax_rate);
    NEW.total_amount := NEW.subtotal + NEW.tax_amount;
  ELSE
    NEW.tax_amount := 0;
    NEW.tax_rate := 0;
    NEW.total_amount := COALESCE(NEW.subtotal, NEW.total_amount);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for quotations
DROP TRIGGER IF EXISTS quotation_tax_calculation ON quotations;
CREATE TRIGGER quotation_tax_calculation
  BEFORE INSERT OR UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_quotation_tax();

-- =====================================================
-- 10. Function: Get Tax Configuration
-- =====================================================

CREATE OR REPLACE FUNCTION get_tax_configuration()
RETURNS TABLE (
  enabled BOOLEAN,
  rate DECIMAL,
  tax_type VARCHAR,
  tax_id VARCHAR,
  company_name VARCHAR,
  apply_to_services BOOLEAN,
  apply_to_materials BOOLEAN,
  apply_to_labor BOOLEAN,
  apply_to_equipment BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tc.enabled,
    tc.rate,
    tc.tax_type,
    tc.tax_id,
    tc.company_name,
    tc.apply_to_services,
    tc.apply_to_materials,
    tc.apply_to_labor,
    tc.apply_to_equipment
  FROM tax_configuration tc
  ORDER BY tc.created_at DESC
  LIMIT 1;
END;
$$;

-- =====================================================
-- 11. Update Timestamp Trigger for tax_configuration
-- =====================================================

CREATE OR REPLACE FUNCTION update_tax_configuration_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tax_configuration_timestamp ON tax_configuration;
CREATE TRIGGER tax_configuration_timestamp
  BEFORE UPDATE ON tax_configuration
  FOR EACH ROW
  EXECUTE FUNCTION update_tax_configuration_timestamp();

-- =====================================================
-- 12. Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_invoices_tax_type ON invoices(tax_type);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_quotations_tax_type ON quotations(tax_type);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON quotations(created_at);

-- =====================================================
-- 13. Comments for Documentation
-- =====================================================

COMMENT ON TABLE tax_configuration IS 'Stores business tax settings for Rwanda (VAT, Withholding Tax, etc.)';
COMMENT ON COLUMN invoices.subtotal IS 'Amount before tax';
COMMENT ON COLUMN invoices.tax_amount IS 'Calculated tax amount';
COMMENT ON COLUMN invoices.tax_rate IS 'Tax rate percentage applied';
COMMENT ON COLUMN invoices.business_tin IS 'Business Tax Identification Number (TIN)';
COMMENT ON VIEW v_tax_report IS 'Monthly tax collection summary for reporting';

-- =====================================================
-- End of Tax System Migration
-- =====================================================
