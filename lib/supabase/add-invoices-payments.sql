-- Add Sample Invoices and Payments
-- Run this after seed-data.sql to add invoices and payment records

-- First, let's insert invoices for the completed and scheduled jobs
DO $$
DECLARE
    job1_id UUID;
    job2_id UUID;
    job3_id UUID;
    invoice1_id UUID;
    invoice2_id UUID;
    invoice3_id UUID;
BEGIN
    -- Get job IDs
    SELECT id INTO job1_id FROM jobs WHERE job_number = 'JOB-2024-001';
    SELECT id INTO job2_id FROM jobs WHERE job_number = 'JOB-2024-002';
    SELECT id INTO job3_id FROM jobs WHERE job_number = 'JOB-2024-003';
    
    -- Insert Invoice for Job 1 (Completed - Fully Paid)
    INSERT INTO invoices (
        job_id, 
        invoice_number, 
        total_amount, 
        tax, 
        discount, 
        final_amount, 
        status, 
        due_date, 
        paid_date,
        payment_method,
        created_at
    ) VALUES (
        job1_id,
        'INV-2024-001',
        450.00,
        45.00,
        0.00,
        495.00,
        'paid',
        NOW() + INTERVAL '30 days',
        NOW() - INTERVAL '1 day',
        'credit_card',
        NOW() - INTERVAL '5 days'
    ) RETURNING id INTO invoice1_id;
    
    -- Insert Invoice for Job 2 (Scheduled - Partially Paid)
    INSERT INTO invoices (
        job_id, 
        invoice_number, 
        total_amount, 
        tax, 
        discount, 
        final_amount, 
        status, 
        due_date,
        created_at
    ) VALUES (
        job2_id,
        'INV-2024-002',
        240.00,
        24.00,
        0.00,
        264.00,
        'pending',
        NOW() + INTERVAL '30 days',
        NOW() - INTERVAL '3 days'
    ) RETURNING id INTO invoice2_id;
    
    -- Insert Invoice for Job 3 (Pending - Unpaid)
    INSERT INTO invoices (
        job_id, 
        invoice_number, 
        total_amount, 
        tax, 
        discount, 
        final_amount, 
        status, 
        due_date,
        created_at
    ) VALUES (
        job3_id,
        'INV-2024-003',
        600.00,
        60.00,
        50.00,
        610.00,
        'pending',
        NOW() + INTERVAL '30 days',
        NOW() - INTERVAL '2 days'
    ) RETURNING id INTO invoice3_id;
    
    -- Insert additional invoices with different statuses
    -- Invoice 4 - Older completed job, paid in cash
    INSERT INTO invoices (
        job_id, 
        invoice_number, 
        total_amount, 
        tax, 
        discount, 
        final_amount, 
        status, 
        due_date, 
        paid_date,
        payment_method,
        created_at
    ) VALUES (
        job1_id, -- Reusing for demo
        'INV-2024-004',
        320.00,
        32.00,
        0.00,
        352.00,
        'paid',
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '10 days',
        'cash',
        NOW() - INTERVAL '45 days'
    );
    
    -- Invoice 5 - Overdue
    INSERT INTO invoices (
        job_id, 
        invoice_number, 
        total_amount, 
        tax, 
        discount, 
        final_amount, 
        status, 
        due_date,
        created_at
    ) VALUES (
        job2_id, -- Reusing for demo
        'INV-2024-005',
        180.00,
        18.00,
        0.00,
        198.00,
        'overdue',
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '50 days'
    );
    
    -- Now insert payments
    
    -- Payment 1 - Full payment for Invoice 1 (credit card)
    INSERT INTO payments (
        invoice_id,
        amount,
        payment_method,
        transaction_reference,
        payment_date,
        notes
    ) VALUES (
        invoice1_id,
        495.00,
        'credit_card',
        'CC-TX-20240101-001',
        NOW() - INTERVAL '1 day',
        'Full payment received via credit card'
    );
    
    -- Payment 2 - Partial payment for Invoice 2 (bank transfer)
    INSERT INTO payments (
        invoice_id,
        amount,
        payment_method,
        transaction_reference,
        payment_date,
        notes
    ) VALUES (
        invoice2_id,
        150.00,
        'bank_transfer',
        'BNK-TX-20240103-001',
        NOW() - INTERVAL '2 days',
        'Partial payment - balance pending'
    );
    
    -- Payment 3 - Full payment for Invoice 4 (cash)
    INSERT INTO payments (
        invoice_id,
        amount,
        payment_method,
        transaction_reference,
        payment_date,
        notes
    ) VALUES (
        (SELECT id FROM invoices WHERE invoice_number = 'INV-2024-004'),
        352.00,
        'cash',
        'CASH-20231201-001',
        NOW() - INTERVAL '10 days',
        'Cash payment received at office'
    );
    
    -- Payment 4 - Another credit card payment (different invoice)
    INSERT INTO payments (
        invoice_id,
        amount,
        payment_method,
        transaction_reference,
        payment_date,
        notes
    ) VALUES (
        invoice1_id, -- Adding another payment to same invoice for demo
        100.00,
        'credit_card',
        'CC-TX-20240105-002',
        NOW() - INTERVAL '5 days',
        'Additional payment'
    );
    
    -- Payment 5 - Check payment
    INSERT INTO payments (
        invoice_id,
        amount,
        payment_method,
        transaction_reference,
        payment_date,
        notes
    ) VALUES (
        invoice2_id,
        50.00,
        'check',
        'CHK-123456',
        NOW() - INTERVAL '1 day',
        'Check payment received'
    );
    
    -- Payment 6 - Recent bank transfer
    INSERT INTO payments (
        invoice_id,
        amount,
        payment_method,
        transaction_reference,
        payment_date,
        notes
    ) VALUES (
        invoice3_id,
        200.00,
        'bank_transfer',
        'BNK-TX-20240110-003',
        NOW(),
        'Deposit payment'
    );
    
    RAISE NOTICE '✅ Invoices and payments inserted successfully!';
    RAISE NOTICE '📄 5 Invoices created';
    RAISE NOTICE '💰 6 Payments recorded';
    RAISE NOTICE '💵 Total payments: $1,347.00';
END $$;

-- Verify data inserted
SELECT 'Invoices' as table_name, COUNT(*) as count FROM invoices
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments;

-- Show summary of payments by method
SELECT 
    payment_method,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount
FROM payments
GROUP BY payment_method
ORDER BY total_amount DESC;

-- Show invoice payment status
SELECT 
    i.invoice_number,
    i.final_amount as invoice_amount,
    COALESCE(SUM(p.amount), 0) as paid_amount,
    i.final_amount - COALESCE(SUM(p.amount), 0) as balance,
    i.status
FROM invoices i
LEFT JOIN payments p ON i.id = p.invoice_id
GROUP BY i.id, i.invoice_number, i.final_amount, i.status
ORDER BY i.invoice_number;
