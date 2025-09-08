-- Verification script for partner tracking setup

-- Check if tables were created
SELECT 'Tables Created:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('partners', 'api_keys', 'video_generations', 'user_roles', 'sla_metrics', 'lms_publications')
ORDER BY table_name;

-- Check if Incept partner exists
SELECT 'Incept Partner:' as info;
SELECT id, name, partner_code, lms_integration_enabled, production_enabled
FROM partners 
WHERE partner_code = 'INCEPT';

-- Check for any existing users that need roles
SELECT 'Existing Users (first 5):' as info;
SELECT id, email, created_at
FROM auth.users
LIMIT 5;

-- Check if any roles have been assigned
SELECT 'Assigned Roles:' as info;
SELECT ur.*, u.email
FROM user_roles ur
LEFT JOIN auth.users u ON u.id = ur.user_id;

-- Check functions exist
SELECT 'Helper Functions:' as info;
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('is_admin', 'is_partner', 'get_user_partner_id', 'assign_user_role')
ORDER BY routine_name;
