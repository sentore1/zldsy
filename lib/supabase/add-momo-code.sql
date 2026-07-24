-- Add momo_code to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS momo_code VARCHAR(50) DEFAULT '';
