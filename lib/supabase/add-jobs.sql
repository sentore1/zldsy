-- Add Jobs to existing bookings
-- Run this if you already have customers, services, staff, and bookings in your database

DO $$
DECLARE
    booking1_id UUID;
    booking2_id UUID;
    booking3_id UUID;
    staff1_id UUID;
    staff2_id UUID;
    job1_id UUID;
    job2_id UUID;
    job3_id UUID;
BEGIN
    -- Get booking IDs (first 3 bookings)
    SELECT id INTO booking1_id FROM bookings ORDER BY created_at LIMIT 1 OFFSET 0;
    SELECT id INTO booking2_id FROM bookings ORDER BY created_at LIMIT 1 OFFSET 1;
    SELECT id INTO booking3_id FROM bookings ORDER BY created_at LIMIT 1 OFFSET 2;
    
    -- Get staff IDs (first 2 staff members)
    SELECT id INTO staff1_id FROM staff ORDER BY created_at LIMIT 1 OFFSET 0;
    SELECT id INTO staff2_id FROM staff ORDER BY created_at LIMIT 1 OFFSET 1;
    
    -- Only insert jobs if bookings exist
    IF booking1_id IS NOT NULL THEN
        -- Insert job 1 (only if it doesn't already exist)
        INSERT INTO jobs (job_number, booking_id, status, scheduled_date, notes)
        SELECT 'JOB-2024-001', booking1_id, 'completed', NOW() + INTERVAL '3 days', 'Residential fumigation - basement termite treatment'
        WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE job_number = 'JOB-2024-001')
        RETURNING id INTO job1_id;
        
        -- Assign staff to job 1
        IF job1_id IS NOT NULL AND staff1_id IS NOT NULL THEN
            INSERT INTO job_staff (job_id, staff_id, role) VALUES (job1_id, staff1_id, 'Senior Technician');
        END IF;
    END IF;
    
    IF booking2_id IS NOT NULL THEN
        -- Insert job 2
        INSERT INTO jobs (job_number, booking_id, status, scheduled_date, notes)
        SELECT 'JOB-2024-002', booking2_id, 'scheduled', NOW() + INTERVAL '5 days', 'Regular pest control maintenance'
        WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE job_number = 'JOB-2024-002')
        RETURNING id INTO job2_id;
        
        -- Assign staff to job 2
        IF job2_id IS NOT NULL AND staff2_id IS NOT NULL THEN
            INSERT INTO job_staff (job_id, staff_id, role) VALUES (job2_id, staff2_id, 'Technician');
        END IF;
    END IF;
    
    IF booking3_id IS NOT NULL THEN
        -- Insert job 3
        INSERT INTO jobs (job_number, booking_id, status, scheduled_date, notes)
        SELECT 'JOB-2024-003', booking3_id, 'pending', NOW() + INTERVAL '7 days', 'Termite inspection required first'
        WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE job_number = 'JOB-2024-003')
        RETURNING id INTO job3_id;
        
        -- Assign staff to job 3
        IF job3_id IS NOT NULL AND staff1_id IS NOT NULL THEN
            INSERT INTO job_staff (job_id, staff_id, role) VALUES (job3_id, staff1_id, 'Senior Technician');
        END IF;
    END IF;
    
    RAISE NOTICE '✅ Jobs added successfully!';
    RAISE NOTICE 'Total jobs in database: %', (SELECT COUNT(*) FROM jobs);
    RAISE NOTICE 'Total job-staff assignments: %', (SELECT COUNT(*) FROM job_staff);
END $$;

-- Verify what we have
SELECT 
    j.job_number,
    j.status,
    j.scheduled_date,
    b.booking_date,
    c.name as customer_name,
    s.name as service_name,
    STRING_AGG(st.name, ', ') as assigned_staff
FROM jobs j
JOIN bookings b ON j.booking_id = b.id
JOIN customers c ON b.customer_id = c.id
JOIN services s ON b.service_id = s.id
LEFT JOIN job_staff js ON j.id = js.job_id
LEFT JOIN staff st ON js.staff_id = st.id
GROUP BY j.id, j.job_number, j.status, j.scheduled_date, b.booking_date, c.name, s.name
ORDER BY j.created_at DESC;
