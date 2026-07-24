-- Add notes column to equipment table
-- Run this in your Supabase SQL Editor

ALTER TABLE equipment 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Optional: Add a comment to document the column
COMMENT ON COLUMN equipment.notes IS 'Additional notes or description for the equipment';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'equipment'
ORDER BY ordinal_position;
