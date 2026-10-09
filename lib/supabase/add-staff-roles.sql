-- Migration: Add Staff Roles and Employment Types
-- This migration adds role-based access control to the staff table

-- Add new columns to staff table
ALTER TABLE staff 
ADD COLUMN IF NOT EXISTS system_role VARCHAR(50) DEFAULT 'staff',
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50) DEFAULT 'casual',
ADD COLUMN IF NOT EXISTS date_hired DATE,
ADD COLUMN IF NOT EXISTS date_terminated DATE,
ADD COLUMN IF NOT EXISTS can_login BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Add comments to columns
COMMENT ON COLUMN staff.system_role IS 'System role: admin, supervisor, staff';
COMMENT ON COLUMN staff.employment_type IS 'Employment type: permanent, casual, contract, part_time';
COMMENT ON COLUMN staff.role IS 'Job role/position: technician, driver, cleaner, etc.';
COMMENT ON COLUMN staff.date_hired IS 'Date when staff member was hired';
COMMENT ON COLUMN staff.date_terminated IS 'Date when staff member was terminated (if applicable)';
COMMENT ON COLUMN staff.can_login IS 'Whether staff member can log into the system';
COMMENT ON COLUMN staff.last_login IS 'Last time staff member logged in';

-- Create index on system_role for faster queries
CREATE INDEX IF NOT EXISTS idx_staff_system_role ON staff(system_role);
CREATE INDEX IF NOT EXISTS idx_staff_employment_type ON staff(employment_type);
CREATE INDEX IF NOT EXISTS idx_staff_can_login ON staff(can_login);

-- Add check constraints
ALTER TABLE staff 
ADD CONSTRAINT chk_staff_system_role 
CHECK (system_role IN ('admin', 'supervisor', 'staff'));

ALTER TABLE staff 
ADD CONSTRAINT chk_staff_employment_type 
CHECK (employment_type IN ('permanent', 'casual', 'contract', 'part_time'));

-- Create a view for active staff with their roles
CREATE OR REPLACE VIEW v_active_staff AS
SELECT 
    s.id,
    s.name,
    s.email,
    s.phone,
    s.role as job_role,
    s.system_role,
    s.employment_type,
    s.hourly_rate,
    s.date_hired,
    s.can_login,
    s.last_login,
    s.is_active,
    s.created_at,
    CASE 
        WHEN s.system_role = 'admin' THEN 'Administrator'
        WHEN s.system_role = 'supervisor' THEN 'Supervisor'
        ELSE 'Staff'
    END as role_display_name,
    CASE 
        WHEN s.employment_type = 'permanent' THEN 'Permanent Staff'
        WHEN s.employment_type = 'casual' THEN 'Casual Staff'
        WHEN s.employment_type = 'contract' THEN 'Contract Staff'
        WHEN s.employment_type = 'part_time' THEN 'Part-Time Staff'
        ELSE s.employment_type
    END as employment_type_display
FROM staff s
WHERE s.is_active = TRUE
ORDER BY 
    CASE s.system_role
        WHEN 'admin' THEN 1
        WHEN 'supervisor' THEN 2
        WHEN 'staff' THEN 3
        ELSE 4
    END,
    s.name;

-- Create a view for staff assigned to jobs (for staff role to see their jobs)
CREATE OR REPLACE VIEW v_staff_assigned_jobs AS
SELECT 
    js.staff_id,
    j.id as job_id,
    j.job_number,
    j.scheduled_date,
    j.start_time,
    j.end_time,
    j.status,
    j.notes,
    b.id as booking_id,
    b.preferred_date,
    s.id as service_id,
    s.name as service_name,
    s.category as service_category,
    c.name as customer_name,
    c.phone as customer_phone,
    c.address as customer_address,
    js.role as assignment_role,
    js.hours_worked,
    js.labor_cost
FROM job_staff js
JOIN jobs j ON js.job_id = j.id
JOIN bookings b ON j.booking_id = b.id
JOIN services s ON b.service_id = s.id
JOIN customers c ON b.customer_id = c.id
WHERE j.status NOT IN ('cancelled', 'completed')
ORDER BY j.scheduled_date DESC;

-- Function to get staff permissions (for backend validation)
CREATE OR REPLACE FUNCTION get_staff_permissions(staff_role TEXT)
RETURNS TEXT[] AS $$
BEGIN
    CASE staff_role
        WHEN 'admin' THEN
            -- Admin has all permissions
            RETURN ARRAY[
                'view_dashboard', 'view_reports', 'export_reports',
                'view_bookings', 'create_booking', 'edit_booking', 'delete_booking',
                'view_all_jobs', 'create_job', 'edit_job', 'delete_job', 'assign_staff',
                'view_customers', 'create_customer', 'edit_customer', 'delete_customer',
                'view_all_staff', 'create_staff', 'edit_staff', 'delete_staff', 'manage_roles',
                'view_services', 'create_service', 'edit_service', 'delete_service',
                'view_inventory', 'create_inventory', 'edit_inventory', 'delete_inventory',
                'view_equipment', 'create_equipment', 'edit_equipment', 'delete_equipment',
                'view_quotations', 'create_quotation', 'edit_quotation', 'delete_quotation',
                'view_invoices', 'create_invoice', 'edit_invoice', 'delete_invoice',
                'view_payments', 'process_payment', 'refund_payment',
                'view_settings', 'edit_settings', 'clock_in_out'
            ];
        WHEN 'supervisor' THEN
            -- Supervisor has limited admin permissions
            RETURN ARRAY[
                'view_dashboard', 'view_reports', 'export_reports',
                'view_bookings', 'create_booking', 'edit_booking',
                'view_all_jobs', 'create_job', 'edit_job', 'assign_staff',
                'view_customers', 'create_customer', 'edit_customer',
                'view_all_staff',
                'view_services',
                'view_inventory', 'create_inventory', 'edit_inventory',
                'view_equipment', 'edit_equipment',
                'view_quotations', 'create_quotation', 'edit_quotation',
                'view_invoices', 'create_invoice',
                'view_payments', 'process_payment',
                'clock_in_out'
            ];
        WHEN 'staff' THEN
            -- Normal staff can only view assigned jobs and clock in/out
            RETURN ARRAY['view_assigned_jobs', 'clock_in_out'];
        ELSE
            RETURN ARRAY[]::TEXT[];
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Update existing staff to have default roles if null
UPDATE staff 
SET system_role = 'staff' 
WHERE system_role IS NULL;

UPDATE staff 
SET employment_type = 'casual' 
WHERE employment_type IS NULL;

-- Sample data: Update first staff to be admin (if exists)
DO $$
DECLARE
    first_staff_id UUID;
BEGIN
    SELECT id INTO first_staff_id 
    FROM staff 
    WHERE is_active = TRUE 
    ORDER BY created_at 
    LIMIT 1;
    
    IF first_staff_id IS NOT NULL THEN
        UPDATE staff 
        SET 
            system_role = 'admin',
            employment_type = 'permanent',
            can_login = TRUE,
            date_hired = COALESCE(date_hired, created_at::DATE)
        WHERE id = first_staff_id;
        
        RAISE NOTICE 'Updated first staff member to admin role';
    END IF;
END $$;

-- Grant appropriate permissions
GRANT SELECT ON v_active_staff TO authenticated;
GRANT SELECT ON v_staff_assigned_jobs TO authenticated;

COMMENT ON VIEW v_active_staff IS 'Active staff members with role information';
COMMENT ON VIEW v_staff_assigned_jobs IS 'Jobs assigned to staff members (for staff portal)';
COMMENT ON FUNCTION get_staff_permissions(TEXT) IS 'Returns array of permissions for a given staff role';
