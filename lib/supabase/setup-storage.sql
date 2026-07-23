-- Supabase Storage Setup for Photo Uploads
-- Run this in your Supabase SQL Editor

-- Create storage bucket for service photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-photos',
  'service-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete" ON storage.objects;

-- Allow public read access to photos
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'service-photos' );

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'service-photos' );

-- Allow service role to upload (for API uploads)
CREATE POLICY "Service role can upload"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK ( bucket_id = 'service-photos' );

-- Allow authenticated users to delete their own photos
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'service-photos' );

-- Allow service role to delete (for API)
CREATE POLICY "Service role can delete"
ON storage.objects FOR DELETE
TO service_role
USING ( bucket_id = 'service-photos' );

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Storage bucket "service-photos" created successfully!';
    RAISE NOTICE '📸 You can now upload photos via the booking form';
    RAISE NOTICE '🔗 Public URL format: https://ycngtmmoomwgmkabqasy.supabase.co/storage/v1/object/public/service-photos/...';
END $$;
