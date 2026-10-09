-- Subscription and Contract Management System
-- This schema adds recurring billing and contract management for weekly, monthly, yearly, and permanent services

-- Subscription Plans Table
-- Defines the types of subscription plans available
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    
    -- Billing configuration
    billing_cycle VARCHAR(50) NOT NULL CHECK (billing_cycle IN ('weekly', 'monthly', 'yearly', 'permanent')),
    price DECIMAL(10, 2) NOT NULL,
    setup_fee DECIMAL(10, 2) DEFAULT 0,
    
    -- Plan features
    included_visits INTEGER, -- Number of service visits included per billing cycle (NULL for unlimited)
    visit_duration INTEGER, -- Expected duration per visit in minutes
    priority_level VARCHAR(50) DEFAULT 'standard', -- standard, priority, urgent
    
    -- Discounts and promotions
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    promotional_price DECIMAL(10, 2), -- Special promotional pricing
    promotion_valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Contract terms
    minimum_commitment_months INTEGER DEFAULT 0, -- Minimum contract duration (0 for no commitment)
    cancellation_notice_days INTEGER DEFAULT 30, -- Days notice required for cancellation
    auto_renewal BOOLEAN DEFAULT TRUE,
    
    -- Plan status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Subscriptions Table
-- Tracks active and historical subscriptions for customers
CREATE TABLE customer_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    subscription_plan_id UUID REFERENCES subscription_plans(id),
    
    -- Subscription status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired', 'pending')),
    
    -- Subscription dates
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE, -- NULL for ongoing subscriptions
    next_billing_date TIMESTAMP WITH TIME ZONE,
    last_billing_date TIMESTAMP WITH TIME ZONE,
    
    -- Cancellation tracking
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by VARCHAR(100), -- customer, admin, system
    cancellation_reason TEXT,
    cancellation_effective_date TIMESTAMP WITH TIME ZONE, -- When cancellation takes effect
    
    -- Pricing (locked at subscription time)
    current_price DECIMAL(10, 2) NOT NULL,
    discount_applied DECIMAL(5, 2) DEFAULT 0,
    
    -- Usage tracking
    visits_used INTEGER DEFAULT 0,
    visits_remaining INTEGER,
    
    -- Payment method
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255), -- External payment system reference
    
    -- Trial period
    is_trial BOOLEAN DEFAULT FALSE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    
    -- Notes
    notes TEXT,
    admin_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contracts Table
-- For permanent and custom long-term service agreements
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES customer_subscriptions(id),
    
    -- Contract type
    contract_type VARCHAR(50) CHECK (contract_type IN ('subscription', 'permanent', 'fixed_term', 'maintenance')),
    
    -- Contract details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE, -- NULL for permanent contracts
    signed_date DATE,
    
    -- Parties
    signatory_name VARCHAR(255),
    signatory_title VARCHAR(100),
    witness_name VARCHAR(255),
    
    -- Terms and conditions
    terms_and_conditions TEXT,
    special_clauses TEXT,
    
    -- Financials
    total_value DECIMAL(10, 2),
    payment_terms TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'active', 'completed', 'terminated', 'expired')),
    
    -- Documents
    pdf_url TEXT,
    digital_signature_url TEXT,
    
    -- Renewal
    auto_renewal BOOLEAN DEFAULT FALSE,
    renewal_notice_days INTEGER DEFAULT 30,
    renewed_from_contract_id UUID REFERENCES contracts(id), -- Links to previous contract if renewed
    
    -- Termination
    terminated_at TIMESTAMP WITH TIME ZONE,
    termination_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Billing History Table
-- Records all billing transactions for subscriptions
CREATE TABLE subscription_billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES customer_subscriptions(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id),
    
    -- Billing details
    billing_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    
    -- Amounts
    amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'refunded')),
    
    -- Payment details
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    payment_date TIMESTAMP WITH TIME ZONE,
    
    -- Retry logic for failed payments
    retry_count INTEGER DEFAULT 0,
    next_retry_date TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    
    -- Prorations
    is_prorated BOOLEAN DEFAULT FALSE,
    proration_details TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Service Schedule Table
-- Schedules recurring service visits for subscriptions
CREATE TABLE subscription_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES customer_subscriptions(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id), -- Links to actual job once scheduled
    
    -- Schedule details
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_time_slot VARCHAR(50), -- morning, afternoon, specific time
    duration_minutes INTEGER,
    
    -- Status
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled', 'missed')),
    
    -- Recurrence
    is_recurring BOOLEAN DEFAULT TRUE,
    recurrence_rule TEXT, -- RRULE format for complex patterns
    occurrence_number INTEGER DEFAULT 1, -- Which occurrence in the series
    
    -- Completion tracking
    completed_at TIMESTAMP WITH TIME ZONE,
    completion_notes TEXT,
    
    -- Rescheduling
    rescheduled_from_id UUID REFERENCES subscription_schedules(id),
    rescheduled_to_id UUID REFERENCES subscription_schedules(id),
    reschedule_reason TEXT,
    
    -- Service details
    service_type VARCHAR(255),
    special_instructions TEXT,
    
    -- Notifications
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Add-ons Table
-- Additional services or features that can be added to subscriptions
CREATE TABLE subscription_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Pricing
    price DECIMAL(10, 2) NOT NULL,
    billing_type VARCHAR(50) CHECK (billing_type IN ('one_time', 'recurring', 'per_use')),
    
    -- Compatibility
    applies_to_plans JSONB, -- Array of plan IDs this addon is compatible with
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Addon Usage Table
-- Tracks which addons are active for each subscription
CREATE TABLE subscription_addon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES customer_subscriptions(id) ON DELETE CASCADE,
    addon_id UUID REFERENCES subscription_addons(id),
    
    -- Usage details
    quantity INTEGER DEFAULT 1,
    price_at_addition DECIMAL(10, 2) NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    removed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Pauses Table
-- Tracks temporary pauses in subscriptions
CREATE TABLE subscription_pauses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES customer_subscriptions(id) ON DELETE CASCADE,
    
    -- Pause details
    pause_start_date DATE NOT NULL,
    pause_end_date DATE, -- NULL for indefinite pause
    reason TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    
    -- Billing adjustment
    billing_suspended BOOLEAN DEFAULT TRUE,
    pro_rata_credit DECIMAL(10, 2) DEFAULT 0,
    
    requested_by VARCHAR(100), -- customer, admin
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Usage Logs Table
-- Detailed logging of subscription usage
CREATE TABLE subscription_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES customer_subscriptions(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id),
    
    -- Usage details
    event_type VARCHAR(100) NOT NULL, -- visit_completed, visit_cancelled, addon_used, etc.
    event_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Quantity tracking
    quantity_used DECIMAL(10, 2) DEFAULT 1,
    unit VARCHAR(50),
    
    -- Details
    description TEXT,
    metadata JSONB, -- Flexible storage for additional data
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_subscription_plans_service ON subscription_plans(service_id);
CREATE INDEX idx_subscription_plans_billing_cycle ON subscription_plans(billing_cycle);
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);

CREATE INDEX idx_customer_subscriptions_customer ON customer_subscriptions(customer_id);
CREATE INDEX idx_customer_subscriptions_plan ON customer_subscriptions(subscription_plan_id);
CREATE INDEX idx_customer_subscriptions_status ON customer_subscriptions(status);
CREATE INDEX idx_customer_subscriptions_next_billing ON customer_subscriptions(next_billing_date);

CREATE INDEX idx_contracts_customer ON contracts(customer_id);
CREATE INDEX idx_contracts_subscription ON contracts(subscription_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_contract_number ON contracts(contract_number);

CREATE INDEX idx_subscription_billing_subscription ON subscription_billing(subscription_id);
CREATE INDEX idx_subscription_billing_status ON subscription_billing(status);
CREATE INDEX idx_subscription_billing_date ON subscription_billing(billing_date);

CREATE INDEX idx_subscription_schedules_subscription ON subscription_schedules(subscription_id);
CREATE INDEX idx_subscription_schedules_date ON subscription_schedules(scheduled_date);
CREATE INDEX idx_subscription_schedules_status ON subscription_schedules(status);

CREATE INDEX idx_subscription_usage_logs_subscription ON subscription_usage_logs(subscription_id);
CREATE INDEX idx_subscription_usage_logs_date ON subscription_usage_logs(event_date);

-- Create updated_at triggers
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_subscriptions_updated_at BEFORE UPDATE ON customer_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_billing_updated_at BEFORE UPDATE ON subscription_billing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_schedules_updated_at BEFORE UPDATE ON subscription_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_addons_updated_at BEFORE UPDATE ON subscription_addons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_pauses_updated_at BEFORE UPDATE ON subscription_pauses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate next billing date
CREATE OR REPLACE FUNCTION calculate_next_billing_date(
    p_current_date TIMESTAMP WITH TIME ZONE,
    p_billing_cycle VARCHAR(50)
)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    CASE p_billing_cycle
        WHEN 'weekly' THEN
            RETURN p_current_date + INTERVAL '7 days';
        WHEN 'monthly' THEN
            RETURN p_current_date + INTERVAL '1 month';
        WHEN 'yearly' THEN
            RETURN p_current_date + INTERVAL '1 year';
        WHEN 'permanent' THEN
            RETURN NULL; -- Permanent contracts don't have next billing date
        ELSE
            RETURN NULL;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update next billing date after payment
CREATE OR REPLACE FUNCTION update_subscription_billing_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
        UPDATE customer_subscriptions
        SET 
            next_billing_date = calculate_next_billing_date(NEW.billing_date, (
                SELECT billing_cycle FROM subscription_plans 
                WHERE id = (SELECT subscription_plan_id FROM customer_subscriptions WHERE id = NEW.subscription_id)
            )),
            last_billing_date = NEW.billing_date
        WHERE id = NEW.subscription_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscription_billing_date
AFTER UPDATE ON subscription_billing
FOR EACH ROW
EXECUTE FUNCTION update_subscription_billing_date();

-- Function to update visits remaining after schedule completion
CREATE OR REPLACE FUNCTION update_subscription_visits()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE customer_subscriptions
        SET 
            visits_used = visits_used + 1,
            visits_remaining = CASE 
                WHEN visits_remaining IS NOT NULL THEN visits_remaining - 1
                ELSE NULL
            END
        WHERE id = NEW.subscription_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscription_visits
AFTER UPDATE ON subscription_schedules
FOR EACH ROW
EXECUTE FUNCTION update_subscription_visits();

-- Function to check if subscription should be expired
CREATE OR REPLACE FUNCTION check_subscription_expiry()
RETURNS void AS $$
BEGIN
    UPDATE customer_subscriptions
    SET status = 'expired'
    WHERE 
        status = 'active' 
        AND end_date IS NOT NULL 
        AND end_date < NOW()
        AND (SELECT billing_cycle FROM subscription_plans WHERE id = subscription_plan_id) != 'permanent';
END;
$$ LANGUAGE plpgsql;

-- Function to generate recurring schedules
CREATE OR REPLACE FUNCTION generate_subscription_schedules(
    p_subscription_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_occurrences INTEGER DEFAULT 12
)
RETURNS void AS $$
DECLARE
    v_billing_cycle VARCHAR(50);
    v_schedule_date TIMESTAMP WITH TIME ZONE;
    v_counter INTEGER := 0;
BEGIN
    -- Get billing cycle
    SELECT sp.billing_cycle INTO v_billing_cycle
    FROM customer_subscriptions cs
    JOIN subscription_plans sp ON cs.subscription_plan_id = sp.id
    WHERE cs.id = p_subscription_id;
    
    v_schedule_date := p_start_date;
    
    -- Generate schedules based on billing cycle
    WHILE v_counter < p_occurrences LOOP
        INSERT INTO subscription_schedules (
            subscription_id,
            scheduled_date,
            occurrence_number,
            is_recurring
        ) VALUES (
            p_subscription_id,
            v_schedule_date,
            v_counter + 1,
            TRUE
        );
        
        -- Calculate next date
        v_schedule_date := calculate_next_billing_date(v_schedule_date, v_billing_cycle);
        
        -- Exit if permanent (no next date)
        EXIT WHEN v_schedule_date IS NULL;
        
        v_counter := v_counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your authentication setup)
CREATE POLICY "Users can view active subscription plans" ON subscription_plans
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can view own subscriptions" ON customer_subscriptions
    FOR SELECT USING (customer_id IN (SELECT id FROM customers WHERE auth.uid()::text = id::text));

CREATE POLICY "Users can view own contracts" ON contracts
    FOR SELECT USING (customer_id IN (SELECT id FROM customers WHERE auth.uid()::text = id::text));

-- Insert sample subscription plans
INSERT INTO subscription_plans (name, description, billing_cycle, price, included_visits, visit_duration) VALUES
('Weekly Basic', 'Weekly cleaning and maintenance service', 'weekly', 99.99, 1, 120),
('Weekly Premium', 'Weekly premium service with priority scheduling', 'weekly', 149.99, 1, 180),
('Monthly Standard', 'Monthly comprehensive service package', 'monthly', 299.99, 4, 120),
('Monthly Premium', 'Monthly premium service with extended coverage', 'monthly', 499.99, 4, 180),
('Yearly Value', 'Annual service plan with best value', 'yearly', 2999.99, 48, 120),
('Yearly Elite', 'Elite annual service with unlimited visits', 'yearly', 4999.99, NULL, 180),
('Permanent Contract', 'Long-term service agreement with custom terms', 'permanent', 10000.00, NULL, NULL);

-- Comments for documentation
COMMENT ON TABLE subscription_plans IS 'Defines available subscription plans with billing cycles (weekly, monthly, yearly, permanent)';
COMMENT ON TABLE customer_subscriptions IS 'Tracks active and historical customer subscriptions';
COMMENT ON TABLE contracts IS 'Formal contracts for long-term and permanent service agreements';
COMMENT ON TABLE subscription_billing IS 'Records all billing transactions for subscriptions';
COMMENT ON TABLE subscription_schedules IS 'Manages recurring service visit schedules';
COMMENT ON TABLE subscription_addons IS 'Additional services that can be added to subscriptions';
COMMENT ON TABLE subscription_pauses IS 'Tracks temporary subscription pauses';
COMMENT ON TABLE subscription_usage_logs IS 'Detailed logging of subscription service usage';

COMMENT ON COLUMN subscription_plans.billing_cycle IS 'Frequency: weekly, monthly, yearly, or permanent';
COMMENT ON COLUMN subscription_plans.included_visits IS 'Number of visits per billing cycle (NULL for unlimited)';
COMMENT ON COLUMN customer_subscriptions.visits_remaining IS 'Remaining visits in current billing cycle (NULL for unlimited)';
COMMENT ON COLUMN contracts.contract_type IS 'Type: subscription, permanent, fixed_term, or maintenance';
