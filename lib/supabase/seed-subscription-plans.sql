-- Sample Subscription Plans
-- Run this to populate subscription plans for testing

-- First, let's get service IDs (adjust these based on your actual services)
-- You'll need to replace these UUIDs with actual service IDs from your services table

-- Example: Insert sample subscription plans
-- Note: Replace 'SERVICE_ID_HERE' with actual service IDs from your services table

-- Get services first:
-- SELECT id, name FROM services;

-- Then insert plans with actual service_ids:

-- Weekly Plans
INSERT INTO subscription_plans (
  name, 
  description, 
  service_id, 
  billing_cycle, 
  price, 
  setup_fee, 
  included_visits, 
  visit_duration, 
  priority_level, 
  discount_percentage,
  is_active,
  is_featured,
  display_ordera
) VALUES 
  -- Weekly House Cleaning Plan
  (
    'Weekly House Cleaning', 
    'Professional house cleaning service every week', 
    NULL, -- Replace wdith your House Cleaning service ID, or leave NULL for all services
    'weekly', 
    10000, -- RWF 10,000 per week
    0, 
    4, -- 4 visits per month
    120, -- 2 hours
    'standard', 
    0,
    true,
    false,
    1
  ),
  
  -- Weekly Premium Cleaning
  (
    'Weekly Premium Cleaning', 
    'Premium weekly cleaning with deep clean services', 
    NULL, -- Replace with your service ID
    'weekly', 
    15000, -- RWF 15,000 per week
    5000, 
    4, 
    180, -- 3 hours
    'priority', 
    10,
    true,
    true,
    2
  );

-- Monthly Plans
INSERT INTO subscription_plans (
  name, 
  description, 
  service_id, 
  billing_cycle, 
  price, 
  setup_fee, 
  included_visits, 
  visit_duration, 
  priority_level, 
  discount_percentage,
  is_active,
  is_featured,
  display_order
) VALUES 
  -- Monthly Fumigation Plan
  (
    'Monthly Fumigation Premium', 
    'Professional fumigation service monthly', 
    NULL, -- Replace with your Fumigation service ID
    'monthly', 
    40000, -- RWF 40,000 per month
    0, 
    1, -- 1 visit per month
    120,
    'standard', 
    0,
    true,
    false,
    10
  ),
  
  -- Monthly All Services
  (
    'Monthly All Services Package', 
    'Unlimited access to all services monthly', 
    NULL, -- NULL = applies to all services
    'monthly', 
    50000, -- RWF 50,000 per month
    10000, 
    NULL, -- Unlimited visits
    120,
    'priority', 
    15,
    true,
    true,
    11
  ),
  
  -- Monthly Basic
  (
    'Monthly Basic Plan', 
    'Basic monthly maintenance package', 
    NULL,
    'monthly', 
    30000, -- RWF 30,000 per month
    0, 
    2, -- 2 visits per month
    90,
    'standard', 
    5,
    true,
    false,
    12
  );

-- Yearly Plans
INSERT INTO subscription_plans (
  name, 
  description, 
  service_id, 
  billing_cycle, 
  price, 
  setup_fee, 
  included_visits, 
  visit_duration, 
  priority_level, 
  discount_percentage,
  is_active,
  is_featured,
  display_order
) VALUES 
  -- Annual Premium
  (
    'Annual Premium Package', 
    'Full year of premium services with 20% discount', 
    NULL,
    'yearly', 
    480000, -- RWF 480,000 per year (saves 20%)
    0, 
    12, -- 12 visits per year (1 per month)
    120,
    'priority', 
    20,
    true,
    true,
    20
  ),
  
  -- Annual Maintenance
  (
    'Annual Facility Maintenance', 
    'Comprehensive yearly facility maintenance', 
    NULL,
    'yearly', 
    600000, -- RWF 600,000 per year
    50000, 
    24, -- 24 visits per year (2 per month)
    180,
    'urgent', 
    15,
    true,
    true,
    21
  );

-- Permanent Contract Plans
INSERT INTO subscription_plans (
  name, 
  description, 
  service_id, 
  billing_cycle, 
  price, 
  setup_fee, 
  included_visits, 
  visit_duration, 
  priority_level, 
  discount_percentage,
  is_active,
  is_featured,
  display_order
) VALUES 
  -- Permanent Contract
  (
    'Permanent Facility Management', 
    'Long-term facility management contract', 
    NULL,
    'permanent', 
    10000000, -- RWF 10,000,000 one-time
    100000, 
    NULL, -- Unlimited
    240,
    'urgent', 
    25,
    true,
    true,
    30
  );

-- Verify the inserted plans
SELECT 
  id,
  name, 
  billing_cycle, 
  price, 
  included_visits,
  is_active
FROM subscription_plans
ORDER BY display_order;

-- To link plans to specific services, first get your service IDs:
-- SELECT id, name FROM services;

-- Then update plans with service_id:
-- UPDATE subscription_plans 
-- SET service_id = 'YOUR_SERVICE_UUID_HERE' 
-- WHERE name = 'Plan Name Here';
