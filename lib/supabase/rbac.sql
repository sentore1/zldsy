-- RBAC: User Roles Table
-- Links Supabase auth.users to a role

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'staff', -- admin, manager, staff
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read their own role
CREATE POLICY "Users can read own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Only service role (admin API) can insert/update roles
CREATE POLICY "Service role can manage roles" ON user_roles
    FOR ALL USING (auth.role() = 'service_role');

-- Trigger to keep updated_at fresh
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------
-- Seed: Create initial admin user
-- Run this AFTER creating the user via Supabase Auth dashboard
-- or use the auth.users insert below (only works with service role)
-- -------------------------------------------------------

-- Step 1: Create user in Supabase Auth Dashboard with:
--   Email: admin@zldsystem.com
--   Password: (set a strong password)

-- Step 2: Then run this to assign the admin role (replace the UUID):
-- INSERT INTO user_roles (user_id, role)
-- VALUES ('<paste-user-uuid-here>', 'admin');

-- -------------------------------------------------------
-- Role permissions reference:
--   admin   → full access to everything
--   manager → dashboard, customers, operations, financial, reports (no settings)
--   staff   → dashboard, jobs only
-- -------------------------------------------------------
