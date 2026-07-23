-- Update Services Table to add image_url and price range fields

-- Add image_url column for service images
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add min_price and max_price columns for price range
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS min_price DECIMAL(10, 2);

ALTER TABLE services 
ADD COLUMN IF NOT EXISTS max_price DECIMAL(10, 2);

-- Add display_price_type column to choose between single price or price range
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS display_price_type VARCHAR(20) DEFAULT 'single' CHECK (display_price_type IN ('single', 'range'));

-- Comment for documentation
COMMENT ON COLUMN services.image_url IS 'URL to the service image stored in Supabase Storage';
COMMENT ON COLUMN services.base_price IS 'Single fixed price (used when display_price_type = single)';
COMMENT ON COLUMN services.min_price IS 'Minimum price in range (used when display_price_type = range)';
COMMENT ON COLUMN services.max_price IS 'Maximum price in range (used when display_price_type = range)';
COMMENT ON COLUMN services.display_price_type IS 'Price display type: single (fixed price) or range (min-max)';

-- Migrate existing data: set display_price_type to 'single' for all existing services
UPDATE services 
SET display_price_type = 'single' 
WHERE display_price_type IS NULL;
