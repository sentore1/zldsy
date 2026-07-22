-- Sample Data for Service Management System
-- Run this after schema.sql to populate your database with test data

-- Insert Sample Services
INSERT INTO services (name, description, base_price, unit, category, is_active) VALUES
('Residential Fumigation', 'Complete fumigation service for residential properties including termite treatment', 150.00, 'per sqm', 'Fumigation', true),
('Commercial Fumigation', 'Professional fumigation for commercial buildings and offices', 250.00, 'per sqm', 'Fumigation', true),
('Pest Control - General', 'General pest control for common household pests', 80.00, 'per service', 'Pest Control', true),
('Termite Treatment', 'Specialized termite inspection and treatment', 200.00, 'per service', 'Fumigation', true),
('Rodent Control', 'Complete rodent elimination and prevention service', 120.00, 'per service', 'Pest Control', true),
('Deep Cleaning Service', 'Professional deep cleaning for homes and offices', 100.00, 'per hour', 'Cleaning', true),
('Disinfection Service', 'Complete disinfection and sanitization service', 180.00, 'per service', 'Cleaning', true),
('Garden Pest Control', 'Pest control for gardens and outdoor spaces', 90.00, 'per service', 'Pest Control', true);

-- Insert Sample Customers
INSERT INTO customers (name, email, phone, address) VALUES
('John Smith', 'john.smith@email.com', '+1-555-0101', '123 Main Street, New York, NY 10001'),
('Sarah Johnson', 'sarah.j@email.com', '+1-555-0102', '456 Oak Avenue, Los Angeles, CA 90001'),
('Michael Brown', 'mbrown@email.com', '+1-555-0103', '789 Pine Road, Chicago, IL 60601'),
('Emily Davis', 'emily.davis@email.com', '+1-555-0104', '321 Elm Street, Houston, TX 77001'),
('David Wilson', 'dwilson@email.com', '+1-555-0105', '654 Maple Drive, Phoenix, AZ 85001'),
('Lisa Anderson', 'lisa.a@email.com', '+1-555-0106', '987 Cedar Lane, Philadelphia, PA 19101'),
('Robert Taylor', 'rtaylor@email.com', '+1-555-0107', '147 Birch Court, San Antonio, TX 78201'),
('Jennifer Martinez', 'jmartinez@email.com', '+1-555-0108', '258 Spruce Way, San Diego, CA 92101');

-- Insert Sample Staff
INSERT INTO staff (name, email, phone, role, hourly_rate, is_active) VALUES
('Mike Johnson', 'mike.j@company.com', '+1-555-0201', 'Senior Technician', 28.00, true),
('Anna Williams', 'anna.w@company.com', '+1-555-0202', 'Technician', 22.00, true),
('Carlos Rodriguez', 'carlos.r@company.com', '+1-555-0203', 'Technician', 22.00, true),
('Susan Lee', 'susan.l@company.com', '+1-555-0204', 'Supervisor', 32.00, true),
('James Chen', 'james.c@company.com', '+1-555-0205', 'Driver', 18.00, true),
('Maria Garcia', 'maria.g@company.com', '+1-555-0206', 'Technician', 23.00, true),
('Tom Harris', 'tom.h@company.com', '+1-555-0207', 'Senior Technician', 30.00, true),
('Rachel Kim', 'rachel.k@company.com', '+1-555-0208', 'Office Manager', 25.00, true);

-- Insert Sample Inventory Items
INSERT INTO inventory (name, category, unit, quantity, unit_cost, reorder_level, is_active) VALUES
('Termite Treatment Chemical', 'chemicals', 'liters', 50.0, 35.00, 10.0, true),
('General Pesticide', 'chemicals', 'liters', 75.0, 25.00, 15.0, true),
('Rodent Bait Stations', 'equipment', 'units', 30.0, 15.00, 5.0, true),
('Safety Masks N95', 'safety_equipment', 'boxes', 20.0, 12.00, 5.0, true),
('Protective Gloves', 'safety_equipment', 'pairs', 100.0, 2.00, 20.0, true),
('Spray Bottles', 'equipment', 'units', 15.0, 8.00, 3.0, true),
('Disinfectant Concentrate', 'chemicals', 'liters', 40.0, 30.00, 10.0, true),
('Fuel - Diesel', 'fuel', 'liters', 200.0, 1.50, 50.0, true),
('Inspection Flashlights', 'equipment', 'units', 10.0, 20.00, 2.0, true),
('Ant Killer Gel', 'chemicals', 'tubes', 25.0, 8.00, 5.0, true);

-- Insert Sample Equipment
INSERT INTO equipment (name, type, registration_number, status, fuel_capacity, is_active) VALUES
('Service Van 1', 'vehicle', 'SVC-001', 'available', 60.0, true),
('Service Van 2', 'vehicle', 'SVC-002', 'available', 60.0, true),
('Pickup Truck', 'vehicle', 'PKP-001', 'available', 80.0, true),
('Fogger Machine 1', 'machine', 'FOG-001', 'available', 5.0, true),
('Fogger Machine 2', 'machine', 'FOG-002', 'available', 5.0, true),
('Pressure Sprayer 1', 'tool', 'SPR-001', 'available', 0.0, true),
('Pressure Sprayer 2', 'tool', 'SPR-002', 'available', 0.0, true),
('Industrial Vacuum', 'machine', 'VAC-001', 'available', 0.0, true);

-- Insert Sample Bookings
DO $$
DECLARE
    customer1_id UUID;
    customer2_id UUID;
    customer3_id UUID;
    service1_id UUID;
    service2_id UUID;
    service3_id UUID;
BEGIN
    -- Get customer IDs
    SELECT id INTO customer1_id FROM customers WHERE email = 'john.smith@email.com';
    SELECT id INTO customer2_id FROM customers WHERE email = 'sarah.j@email.com';
    SELECT id INTO customer3_id FROM customers WHERE email = 'mbrown@email.com';
    
    -- Get service IDs
    SELECT id INTO service1_id FROM services WHERE name = 'Residential Fumigation';
    SELECT id INTO service2_id FROM services WHERE name = 'Pest Control - General';
    SELECT id INTO service3_id FROM services WHERE name = 'Termite Treatment';
    
    -- Insert bookings
    INSERT INTO bookings (customer_id, service_id, booking_date, preferred_date, status, notes) VALUES
    (customer1_id, service1_id, NOW() - INTERVAL '5 days', NOW() + INTERVAL '3 days', 'confirmed', 'Customer reported termite activity in basement'),
    (customer2_id, service2_id, NOW() - INTERVAL '3 days', NOW() + INTERVAL '5 days', 'confirmed', 'Regular pest control service'),
    (customer3_id, service3_id, NOW() - INTERVAL '2 days', NOW() + INTERVAL '7 days', 'pending', 'Need inspection first');
END $$;

-- Insert Sample Settings
INSERT INTO settings (key, value) VALUES
('company_name', 'Premier Service Management'),
('company_email', 'info@premierservice.com'),
('company_phone', '+1-555-0100'),
('company_address', '100 Business Park Drive, Suite 200, New York, NY 10001'),
('tax_rate', '0.10'),
('currency', 'USD'),
('quotation_validity_days', '7'),
('invoice_due_days', '30'),
('timezone', 'America/New_York');

-- Insert Sample Jobs from Bookings
DO $$
DECLARE
    booking1_id UUID;
    booking2_id UUID;
    booking3_id UUID;
    staff1_id UUID;
    staff2_id UUID;
BEGIN
    -- Get booking IDs
    SELECT b.id INTO booking1_id FROM bookings b
    JOIN customers c ON b.customer_id = c.id
    WHERE c.email = 'john.smith@email.com';
    
    SELECT b.id INTO booking2_id FROM bookings b
    JOIN customers c ON b.customer_id = c.id
    WHERE c.email = 'sarah.j@email.com';
    
    SELECT b.id INTO booking3_id FROM bookings b
    JOIN customers c ON b.customer_id = c.id
    WHERE c.email = 'mbrown@email.com';
    
    -- Get staff IDs
    SELECT id INTO staff1_id FROM staff WHERE email = 'mike.j@company.com';
    SELECT id INTO staff2_id FROM staff WHERE email = 'anna.w@company.com';
    
    -- Insert jobs
    INSERT INTO jobs (job_number, booking_id, assigned_to, status, scheduled_date, notes) VALUES
    ('JOB-2024-001', booking1_id, staff1_id, 'completed', NOW() + INTERVAL '3 days', 'Residential fumigation - basement termite treatment'),
    ('JOB-2024-002', booking2_id, staff2_id, 'scheduled', NOW() + INTERVAL '5 days', 'Regular pest control maintenance'),
    ('JOB-2024-003', booking3_id, staff1_id, 'pending', NOW() + INTERVAL '7 days', 'Termite inspection required first');
END $$;

-- Verify data inserted
SELECT 'Services' as table_name, COUNT(*) as count FROM services
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers
UNION ALL
SELECT 'Staff', COUNT(*) FROM staff
UNION ALL
SELECT 'Inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'Equipment', COUNT(*) FROM equipment
UNION ALL
SELECT 'Bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'Jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'Settings', COUNT(*) FROM settings;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Sample data inserted successfully!';
    RAISE NOTICE '📊 8 Services';
    RAISE NOTICE '👥 8 Customers';
    RAISE NOTICE '👨‍💼 8 Staff Members';
    RAISE NOTICE '📦 10 Inventory Items';
    RAISE NOTICE '🚐 8 Equipment Items';
    RAISE NOTICE '📋 3 Bookings';
    RAISE NOTICE '🔧 3 Jobs';
    RAISE NOTICE '⚙️  9 Settings';
END $$;
