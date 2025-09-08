-- Migration: User Roles and Permissions for Partner Dashboard
-- Purpose: Add role-based access control for admin and partner users
-- Created: December 2024

-- ============================================
-- 1. USER ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT CHECK (role IN ('admin', 'partner', 'user')) DEFAULT 'user',
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. UPDATE EXISTING RLS POLICIES
-- ============================================

-- Drop existing policies to recreate with role support
DROP POLICY IF EXISTS "Partners can view own data" ON partners;
DROP POLICY IF EXISTS "Partners can view own API keys" ON api_keys;
DROP POLICY IF EXISTS "Partners can view own requests" ON api_requests;
DROP POLICY IF EXISTS "Partners can view own video generations" ON video_generations;
DROP POLICY IF EXISTS "Admins can manage all partner data" ON partners;

-- ============================================
-- 3. HELPER FUNCTIONS FOR ROLE CHECKING
-- ============================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = $1 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is partner
CREATE OR REPLACE FUNCTION is_partner(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = $1 
    AND role = 'partner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's partner_id
CREATE OR REPLACE FUNCTION get_user_partner_id(user_id UUID)
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT partner_id FROM user_roles 
    WHERE user_roles.user_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. NEW RLS POLICIES WITH ROLE SUPPORT
-- ============================================

-- Partners table policies
CREATE POLICY "Admins can view all partners" ON partners
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Partners can view own partner" ON partners
  FOR SELECT USING (
    id = get_user_partner_id(auth.uid())
  );

CREATE POLICY "Admins can manage all partners" ON partners
  FOR ALL USING (is_admin(auth.uid()));

-- API Keys policies
CREATE POLICY "Admins can view all API keys" ON api_keys
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Partners can view own API keys" ON api_keys
  FOR SELECT USING (
    partner_id = get_user_partner_id(auth.uid())
  );

CREATE POLICY "Admins can manage all API keys" ON api_keys
  FOR ALL USING (is_admin(auth.uid()));

-- API Requests policies
CREATE POLICY "Admins can view all requests" ON api_requests
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Partners can view own requests" ON api_requests
  FOR SELECT USING (
    partner_id = get_user_partner_id(auth.uid())
  );

-- Video Generations policies
CREATE POLICY "Admins can view all generations" ON video_generations
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Partners can view own generations" ON video_generations
  FOR SELECT USING (
    partner_id = get_user_partner_id(auth.uid())
  );

-- LMS Publications policies
CREATE POLICY "Admins can view all publications" ON lms_publications
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Partners can view own publications" ON lms_publications
  FOR SELECT USING (
    partner_id = get_user_partner_id(auth.uid())
  );

-- SLA Metrics policies
CREATE POLICY "Admins can view all SLA metrics" ON sla_metrics
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Partners can view own SLA metrics" ON sla_metrics
  FOR SELECT USING (
    partner_id = get_user_partner_id(auth.uid())
  );

-- User Roles policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON user_roles
  FOR ALL USING (is_admin(auth.uid()));

-- ============================================
-- 5. DASHBOARD ACCESS VIEW
-- ============================================

CREATE OR REPLACE VIEW user_dashboard_access AS
SELECT 
  u.id as user_id,
  u.email,
  ur.role,
  ur.partner_id,
  p.name as partner_name,
  p.partner_code,
  CASE 
    WHEN ur.role = 'admin' THEN 'all'
    WHEN ur.role = 'partner' THEN p.partner_code
    ELSE 'none'
  END as access_level
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN partners p ON p.id = ur.partner_id;

-- ============================================
-- 6. FUNCTION TO GET USER DASHBOARD DATA
-- ============================================

CREATE OR REPLACE FUNCTION get_user_dashboard_data()
RETURNS TABLE (
  role TEXT,
  partner_id UUID,
  partner_name TEXT,
  partner_code TEXT,
  can_view_all_partners BOOLEAN,
  accessible_partner_ids UUID[]
) AS $$
DECLARE
  user_role TEXT;
  user_partner_id UUID;
BEGIN
  -- Get user's role and partner_id
  SELECT ur.role, ur.partner_id 
  INTO user_role, user_partner_id
  FROM user_roles ur
  WHERE ur.user_id = auth.uid();
  
  -- If no role found, default to user
  IF user_role IS NULL THEN
    user_role := 'user';
  END IF;
  
  RETURN QUERY
  SELECT 
    user_role,
    user_partner_id,
    p.name,
    p.partner_code,
    user_role = 'admin',
    CASE 
      WHEN user_role = 'admin' THEN 
        ARRAY(SELECT id FROM partners)
      WHEN user_role = 'partner' AND user_partner_id IS NOT NULL THEN 
        ARRAY[user_partner_id]
      ELSE 
        ARRAY[]::UUID[]
    END
  FROM partners p
  WHERE p.id = user_partner_id OR user_role = 'admin'
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. SEED INITIAL ADMIN AND PARTNER USERS
-- ============================================

-- Note: Replace these with actual user IDs after users sign up
-- Example: Create an admin user role (you'll need to get the actual user ID)
-- INSERT INTO user_roles (user_id, role, permissions)
-- VALUES (
--   'YOUR_ADMIN_USER_ID',
--   'admin',
--   '["view_all", "manage_partners", "export_data", "manage_api_keys"]'::jsonb
-- );

-- Example: Create a partner user role for Incept
-- INSERT INTO user_roles (user_id, role, partner_id, permissions)
-- VALUES (
--   'INCEPT_USER_ID',
--   'partner',
--   (SELECT id FROM partners WHERE partner_code = 'INCEPT'),
--   '["view_own_data", "export_own_data", "manage_own_api_keys"]'::jsonb
-- );

-- ============================================
-- 8. FUNCTION TO ASSIGN USER ROLE
-- ============================================

CREATE OR REPLACE FUNCTION assign_user_role(
  p_user_id UUID,
  p_role TEXT,
  p_partner_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO user_roles (user_id, role, partner_id)
  VALUES (p_user_id, p_role, p_partner_id)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = EXCLUDED.role,
    partner_id = EXCLUDED.partner_id,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. TRIGGER TO AUTO-ASSIGN DEFAULT ROLE
-- ============================================

CREATE OR REPLACE FUNCTION auto_assign_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-assign 'user' role to new users
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_user_role();
