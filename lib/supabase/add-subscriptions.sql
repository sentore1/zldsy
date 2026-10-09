-- Migration: Add Subscription and Contract Management System
-- This migration adds support for recurring services and permanent contracts

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id),
    
    -- Subscription details
    subscription_type VARCHAR(50) NOT NULL, -- weekly, monthly, yearly, custom
    contract_type VARCHAR(50) DEFAULT 'one_time', -- permanent, fixed_term, one_time
    status VARCHAR(50) DEFAULT 'pending', -- active, paused, cancelled, expired, pending
    
    -- Scheduling
    start_date DATE NOT NULL,
    end_date DATE, -- NULL for permanent contracts
    next_service_date DATE,
    custom_frequency_days INTEGER, -- For custom schedules
    
    -- Pricing
    base_price DECIMAL(10, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    discounted_price DECIMAL(10, 2),
    billing_cycle VARCHAR(50) DEFAULT 'monthly', -- weekly, monthly, quarterly, yearly, upfront
    
    -- Contract details
    total_services INTEGER, -- NULL for permanent, number for fixed term
    completed_services INTEGER DEFAULT 0,
    remaining_services INTEGER,
    
    -- Payment
    payment_method VARCHAR(50), -- cash, card, mobile_money, bank_transfer
    auto_renewal BOOLEAN DEFAULT FALSE,
    auto_renewal_notify_days INTEGER DEFAULT 7,
    
    -- Additional details
    notes TEXT,
    terms_accepted BOOLEAN DEFAULT FALSE,
    terms_accepted_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID, -- Staff member who created
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID, -- Staff member who cancelled
    cancellation_reason TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_service ON subscriptions(service_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_service ON subscriptions(next_service_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_type ON subscriptions(subscription_type);

-- Create subscription history table for tracking changes
CREATE TABLE IF NOT EXISTS subscription_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    
    -- What changed
    action VARCHAR(50) NOT NULL, -- created, activated, paused, resumed, renewed, cancelled, service_completed
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    
    -- Service execution
    service_date DATE,
    job_id UUID REFERENCES jobs(id),
    
    -- Payment
    amount_charged DECIMAL(10, 2),
    payment_status VARCHAR(50), -- pending, paid, failed
    
    -- Details
    notes TEXT,
    performed_by UUID, -- Staff member
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_history_subscription ON subscription_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_action ON subscription_history(action);

-- Add subscription_id to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id);
CREATE INDEX IF NOT EXISTS idx_bookings_subscription ON bookings(subscription_id);

-- Add subscription_id to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id);
CREATE INDEX IF NOT EXISTS idx_jobs_subscription ON jobs(subscription_id);

-- Create view for active subscriptions
CREATE OR REPLACE VIEW v_active_subscriptions AS
SELECT 
    s.id,
    s.customer_id,
    c.name as customer_name,
    c.phone as customer_phone,
    c.email as customer_email,
    c.address as customer_address,
    s.service_id,
    srv.name as service_name,
    srv.category as service_category,
    s.subscription_type,
    s.contract_type,
    s.status,
    s.start_date,
    s.end_date,
    s.next_service_date,
    s.custom_frequency_days,
    s.base_price,
    s.discount_percentage,
    s.discounted_price,
    s.billing_cycle,
    s.total_services,
    s.completed_services,
    s.remaining_services,
    s.auto_renewal,
    s.created_at,
    CASE 
        WHEN s.subscription_type = 'weekly' THEN 'Weekly Service'
        WHEN s.subscription_type = 'monthly' THEN 'Monthly Service'
        WHEN s.subscription_type = 'yearly' THEN 'Yearly Service'
        WHEN s.subscription_type = 'custom' THEN 'Custom Schedule'
        ELSE s.subscription_type
    END as subscription_type_label,
    CASE 
        WHEN s.contract_type = 'permanent' THEN 'Permanent Contract'
        WHEN s.contract_type = 'fixed_term' THEN 'Fixed Term Contract'
        WHEN s.contract_type = 'one_time' THEN 'One-Time Service'
        ELSE s.contract_type
    END as contract_type_label,
    -- Calculate if due for service
    CASE 
        WHEN s.next_service_date <= CURRENT_DATE + INTERVAL '3 days' THEN TRUE
        ELSE FALSE
    END as is_due_soon,
    -- Calculate days until next service
    s.next_service_date - CURRENT_DATE as days_until_service
FROM subscriptions s
JOIN customers c ON s.customer_id = c.id
JOIN services srv ON s.service_id = srv.id
WHERE s.status = 'active'
ORDER BY s.next_service_date ASC;

-- Create view for expiring contracts
CREATE OR REPLACE VIEW v_expiring_contracts AS
SELECT 
    s.id,
    s.customer_id,
    c.name as customer_name,
    c.phone as customer_phone,
    s.service_id,
    srv.name as service_name,
    s.end_date,
    s.end_date - CURRENT_DATE as days_until_expiry,
    s.discounted_price,
    s.auto_renewal,
    s.status
FROM subscriptions s
JOIN customers c ON s.customer_id = c.id
JOIN services srv ON s.service_id = srv.id
WHERE s.status = 'active'
  AND s.end_date IS NOT NULL
  AND s.end_date <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY s.end_date ASC;

-- Function to calculate next service date
CREATE OR REPLACE FUNCTION calculate_next_service_date(
    p_subscription_id UUID
) RETURNS DATE AS $$
DECLARE
    v_subscription subscriptions%ROWTYPE;
    v_next_date DATE;
BEGIN
    SELECT * INTO v_subscription FROM subscriptions WHERE id = p_subscription_id;
    
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    CASE v_subscription.subscription_type
        WHEN 'weekly' THEN
            v_next_date := v_subscription.next_service_date + INTERVAL '7 days';
        WHEN 'monthly' THEN
            v_next_date := v_subscription.next_service_date + INTERVAL '1 month';
        WHEN 'yearly' THEN
            v_next_date := v_subscription.next_service_date + INTERVAL '1 year';
        WHEN 'custom' THEN
            v_next_date := v_subscription.next_service_date + (v_subscription.custom_frequency_days || ' days')::INTERVAL;
        ELSE
            v_next_date := v_subscription.next_service_date + INTERVAL '1 month';
    END CASE;
    
    RETURN v_next_date;
END;
$$ LANGUAGE plpgsql;

-- Function to mark service as completed and schedule next
CREATE OR REPLACE FUNCTION complete_subscription_service(
    p_subscription_id UUID,
    p_job_id UUID,
    p_performed_by UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_subscription subscriptions%ROWTYPE;
    v_next_date DATE;
BEGIN
    -- Get subscription
    SELECT * INTO v_subscription FROM subscriptions WHERE id = p_subscription_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Subscription not found';
    END IF;
    
    -- Calculate next service date
    v_next_date := calculate_next_service_date(p_subscription_id);
    
    -- Update subscription
    UPDATE subscriptions SET
        completed_services = completed_services + 1,
        remaining_services = CASE 
            WHEN total_services IS NOT NULL THEN total_services - (completed_services + 1)
            ELSE NULL
        END,
        next_service_date = v_next_date,
        status = CASE 
            WHEN total_services IS NOT NULL AND (completed_services + 1) >= total_services THEN 'expired'
            ELSE status
        END,
        updated_at = NOW()
    WHERE id = p_subscription_id;
    
    -- Log in history
    INSERT INTO subscription_history (
        subscription_id,
        action,
        previous_status,
        new_status,
        service_date,
        job_id,
        performed_by
    ) VALUES (
        p_subscription_id,
        'service_completed',
        v_subscription.status,
        CASE 
            WHEN v_subscription.total_services IS NOT NULL AND (v_subscription.completed_services + 1) >= v_subscription.total_services THEN 'expired'
            ELSE v_subscription.status
        END,
        CURRENT_DATE,
        p_job_id,
        p_performed_by
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to pause subscription
CREATE OR REPLACE FUNCTION pause_subscription(
    p_subscription_id UUID,
    p_reason TEXT DEFAULT NULL,
    p_paused_by UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE subscriptions SET
        status = 'paused',
        updated_at = NOW()
    WHERE id = p_subscription_id AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    INSERT INTO subscription_history (
        subscription_id,
        action,
        previous_status,
        new_status,
        notes,
        performed_by
    ) VALUES (
        p_subscription_id,
        'paused',
        'active',
        'paused',
        p_reason,
        p_paused_by
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to resume subscription
CREATE OR REPLACE FUNCTION resume_subscription(
    p_subscription_id UUID,
    p_resumed_by UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE subscriptions SET
        status = 'active',
        updated_at = NOW()
    WHERE id = p_subscription_id AND status = 'paused';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    INSERT INTO subscription_history (
        subscription_id,
        action,
        previous_status,
        new_status,
        performed_by
    ) VALUES (
        p_subscription_id,
        'resumed',
        'paused',
        'active',
        p_resumed_by
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to cancel subscription
CREATE OR REPLACE FUNCTION cancel_subscription(
    p_subscription_id UUID,
    p_reason TEXT,
    p_cancelled_by UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE subscriptions SET
        status = 'cancelled',
        cancelled_at = NOW(),
        cancelled_by = p_cancelled_by,
        cancellation_reason = p_reason,
        updated_at = NOW()
    WHERE id = p_subscription_id AND status IN ('active', 'paused', 'pending');
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    INSERT INTO subscription_history (
        subscription_id,
        action,
        new_status,
        notes,
        performed_by
    ) VALUES (
        p_subscription_id,
        'cancelled',
        'cancelled',
        p_reason,
        p_cancelled_by
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscription_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_updated_at();

-- Comments
COMMENT ON TABLE subscriptions IS 'Recurring service subscriptions and contracts';
COMMENT ON TABLE subscription_history IS 'Audit trail for subscription changes and service completions';
COMMENT ON COLUMN subscriptions.contract_type IS 'permanent: ongoing indefinitely, fixed_term: specific duration, one_time: single service';
COMMENT ON COLUMN subscriptions.remaining_services IS 'NULL for permanent contracts, calculated for fixed term';
COMMENT ON VIEW v_active_subscriptions IS 'Active subscriptions with customer and service details';
COMMENT ON VIEW v_expiring_contracts IS 'Contracts expiring within 30 days';

-- Grant permissions
GRANT SELECT ON v_active_subscriptions TO authenticated;
GRANT SELECT ON v_expiring_contracts TO authenticated;
