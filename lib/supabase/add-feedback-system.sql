-- Migration: Add Customer Feedback System
-- Collect ratings and reviews after job completion

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id),
    
    -- Rating (1-5 stars)
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    
    -- Detailed ratings
    service_quality_rating INTEGER CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
    staff_professionalism_rating INTEGER CHECK (staff_professionalism_rating >= 1 AND staff_professionalism_rating <= 5),
    timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    value_for_money_rating INTEGER CHECK (value_for_money_rating >= 1 AND value_for_money_rating <= 5),
    
    -- Review
    review_title VARCHAR(200),
    review_text TEXT,
    
    -- Sentiment analysis (can be calculated/added later)
    sentiment VARCHAR(50), -- positive, neutral, negative
    
    -- Would recommend?
    would_recommend BOOLEAN,
    
    -- Media
    photo_urls TEXT[], -- Array of photo URLs
    
    -- Response from company
    company_response TEXT,
    company_response_date TIMESTAMP WITH TIME ZONE,
    company_response_by UUID REFERENCES staff(id),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, flagged, hidden
    is_public BOOLEAN DEFAULT TRUE, -- Show on public reviews
    is_featured BOOLEAN DEFAULT FALSE, -- Feature this review
    
    -- Metadata
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Verification
    verified_purchase BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_feedback_job ON feedback(job_id);
CREATE INDEX IF NOT EXISTS idx_feedback_booking ON feedback(booking_id);
CREATE INDEX IF NOT EXISTS idx_feedback_customer ON feedback(customer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_service ON feedback(service_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_is_public ON feedback(is_public);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);

-- Add feedback_requested flag to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS feedback_requested BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS feedback_requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS feedback_submitted BOOLEAN DEFAULT FALSE;

-- Create feedback summary view
CREATE OR REPLACE VIEW v_feedback_summary AS
SELECT 
    f.id,
    f.job_id,
    f.booking_id,
    f.customer_id,
    c.name as customer_name,
    c.phone as customer_phone,
    f.service_id,
    s.name as service_name,
    s.category as service_category,
    f.rating,
    f.service_quality_rating,
    f.staff_professionalism_rating,
    f.timeliness_rating,
    f.value_for_money_rating,
    f.review_title,
    f.review_text,
    f.would_recommend,
    f.company_response,
    f.company_response_date,
    f.status,
    f.is_public,
    f.is_featured,
    f.submitted_at,
    f.verified_purchase,
    j.job_number,
    j.completion_date as service_date
FROM feedback f
JOIN customers c ON f.customer_id = c.id
JOIN services s ON f.service_id = s.id
LEFT JOIN jobs j ON f.job_id = j.id
ORDER BY f.submitted_at DESC;

-- Create view for public reviews
CREATE OR REPLACE VIEW v_public_reviews AS
SELECT 
    f.id,
    f.service_id,
    s.name as service_name,
    s.category as service_category,
    c.name as customer_name,
    -- Anonymize customer name for privacy
    CASE 
        WHEN LENGTH(c.name) > 0 THEN 
            SUBSTRING(c.name FROM 1 FOR 1) || REPEAT('*', GREATEST(LENGTH(c.name) - 2, 0)) || 
            CASE WHEN LENGTH(c.name) > 1 THEN SUBSTRING(c.name FROM LENGTH(c.name) FOR 1) ELSE '' END
        ELSE 'Anonymous'
    END as customer_display_name,
    f.rating,
    f.service_quality_rating,
    f.staff_professionalism_rating,
    f.timeliness_rating,
    f.value_for_money_rating,
    f.review_title,
    f.review_text,
    f.would_recommend,
    f.company_response,
    f.company_response_date,
    f.is_featured,
    f.submitted_at,
    f.verified_purchase,
    j.completion_date as service_date
FROM feedback f
JOIN customers c ON f.customer_id = c.id
JOIN services s ON f.service_id = s.id
LEFT JOIN jobs j ON f.job_id = j.id
WHERE f.is_public = TRUE 
  AND f.status = 'approved'
ORDER BY 
    f.is_featured DESC,
    f.submitted_at DESC;

-- Create view for service ratings
CREATE OR REPLACE VIEW v_service_ratings AS
SELECT 
    s.id as service_id,
    s.name as service_name,
    s.category as service_category,
    COUNT(f.id) as total_reviews,
    ROUND(AVG(f.rating), 2) as average_rating,
    ROUND(AVG(f.service_quality_rating), 2) as avg_quality_rating,
    ROUND(AVG(f.staff_professionalism_rating), 2) as avg_professionalism_rating,
    ROUND(AVG(f.timeliness_rating), 2) as avg_timeliness_rating,
    ROUND(AVG(f.value_for_money_rating), 2) as avg_value_rating,
    COUNT(CASE WHEN f.rating = 5 THEN 1 END) as five_star_count,
    COUNT(CASE WHEN f.rating = 4 THEN 1 END) as four_star_count,
    COUNT(CASE WHEN f.rating = 3 THEN 1 END) as three_star_count,
    COUNT(CASE WHEN f.rating = 2 THEN 1 END) as two_star_count,
    COUNT(CASE WHEN f.rating = 1 THEN 1 END) as one_star_count,
    COUNT(CASE WHEN f.would_recommend = TRUE THEN 1 END) as recommend_count,
    ROUND(
        COUNT(CASE WHEN f.would_recommend = TRUE THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(f.id), 0) * 100, 
        2
    ) as recommend_percentage
FROM services s
LEFT JOIN feedback f ON s.id = f.service_id AND f.status = 'approved'
GROUP BY s.id, s.name, s.category;

-- Function to request feedback for completed job
CREATE OR REPLACE FUNCTION request_job_feedback(
    p_job_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_job jobs%ROWTYPE;
BEGIN
    -- Get job details
    SELECT * INTO v_job FROM jobs WHERE id = p_job_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Job not found';
    END IF;
    
    -- Check if job is completed
    IF v_job.status != 'completed' THEN
        RAISE EXCEPTION 'Job must be completed before requesting feedback';
    END IF;
    
    -- Check if feedback already requested
    IF v_job.feedback_requested THEN
        RETURN FALSE;
    END IF;
    
    -- Mark as feedback requested
    UPDATE jobs SET
        feedback_requested = TRUE,
        feedback_requested_at = NOW()
    WHERE id = p_job_id;
    
    -- TODO: Trigger notification to customer (email/SMS)
    -- This would be handled by application layer
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to submit feedback
CREATE OR REPLACE FUNCTION submit_feedback(
    p_job_id UUID,
    p_rating INTEGER,
    p_review_text TEXT DEFAULT NULL,
    p_would_recommend BOOLEAN DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_job jobs%ROWTYPE;
    v_feedback_id UUID;
BEGIN
    -- Get job details
    SELECT * INTO v_job FROM jobs WHERE id = p_job_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Job not found';
    END IF;
    
    -- Check if feedback already exists
    IF EXISTS (SELECT 1 FROM feedback WHERE job_id = p_job_id) THEN
        RAISE EXCEPTION 'Feedback already submitted for this job';
    END IF;
    
    -- Insert feedback
    INSERT INTO feedback (
        job_id,
        booking_id,
        customer_id,
        service_id,
        rating,
        review_text,
        would_recommend,
        verified_purchase,
        status
    )
    SELECT 
        p_job_id,
        v_job.booking_id,
        b.customer_id,
        b.service_id,
        p_rating,
        p_review_text,
        p_would_recommend,
        TRUE,
        'pending' -- Needs approval
    FROM bookings b
    WHERE b.id = v_job.booking_id
    RETURNING id INTO v_feedback_id;
    
    -- Mark job as feedback submitted
    UPDATE jobs SET
        feedback_submitted = TRUE
    WHERE id = p_job_id;
    
    RETURN v_feedback_id;
END;
$$ LANGUAGE plpgsql;

-- Function to approve feedback
CREATE OR REPLACE FUNCTION approve_feedback(
    p_feedback_id UUID,
    p_approved_by UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE feedback SET
        status = 'approved',
        updated_at = NOW()
    WHERE id = p_feedback_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to add company response
CREATE OR REPLACE FUNCTION add_company_response(
    p_feedback_id UUID,
    p_response TEXT,
    p_responded_by UUID
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE feedback SET
        company_response = p_response,
        company_response_date = NOW(),
        company_response_by = p_responded_by,
        updated_at = NOW()
    WHERE id = p_feedback_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate average rating for a service
CREATE OR REPLACE FUNCTION get_service_average_rating(
    p_service_id UUID
) RETURNS NUMERIC AS $$
DECLARE
    v_avg_rating NUMERIC;
BEGIN
    SELECT ROUND(AVG(rating), 2) INTO v_avg_rating
    FROM feedback
    WHERE service_id = p_service_id
      AND status = 'approved';
    
    RETURN COALESCE(v_avg_rating, 0);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_feedback_updated_at
    BEFORE UPDATE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_feedback_updated_at();

-- Trigger to auto-request feedback when job completes
CREATE OR REPLACE FUNCTION trigger_request_feedback_on_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- If job status changed to completed and feedback not yet requested
    IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.feedback_requested = FALSE THEN
        NEW.feedback_requested = TRUE;
        NEW.feedback_requested_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_request_feedback
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION trigger_request_feedback_on_completion();

-- Comments
COMMENT ON TABLE feedback IS 'Customer feedback and reviews for completed services';
COMMENT ON COLUMN feedback.rating IS 'Overall rating from 1 to 5 stars';
COMMENT ON COLUMN feedback.verified_purchase IS 'Whether this is from an actual customer who used the service';
COMMENT ON COLUMN feedback.is_featured IS 'Featured reviews shown prominently';
COMMENT ON VIEW v_public_reviews IS 'Public-facing reviews with anonymized customer names';
COMMENT ON VIEW v_service_ratings IS 'Aggregated ratings and statistics per service';

-- Grant permissions
GRANT SELECT ON v_feedback_summary TO authenticated;
GRANT SELECT ON v_public_reviews TO anon, authenticated;
GRANT SELECT ON v_service_ratings TO anon, authenticated;
