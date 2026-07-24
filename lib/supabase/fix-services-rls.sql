-- Fix Row Level Security for Services Table
-- This allows public (unauthenticated) users to view active services on the landing page

-- First, make sure RLS is enabled on services table
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view active services" ON services;
DROP POLICY IF EXISTS "Service role can manage services" ON services;

-- Allow anyone (including unauthenticated users) to view active services
-- This is needed for the public landing page
CREATE POLICY "Public can view active services" ON services
    FOR SELECT 
    USING (is_active = true);

-- Allow service role (admin API) to manage all services
-- This is needed for the admin dashboard to CRUD services
CREATE POLICY "Service role can manage services" ON services
    FOR ALL 
    USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'services';
