-- Quick script to assign admin role to cale.mcnulty@superbuilders.school
-- Run this in Supabase SQL editor

-- Option 1: If the assign_user_role function exists (from migration 004)
SELECT assign_user_role(
    (SELECT id FROM auth.users WHERE email = 'cale.mcnulty@superbuilders.school'),
    'admin',
    NULL
);

-- Option 2: Direct insert/update (use if Option 1 doesn't work)
-- First delete any existing role
DELETE FROM public.user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'cale.mcnulty@superbuilders.school');

-- Then insert admin role
INSERT INTO public.user_roles (user_id, role, partner_id, permissions)
SELECT 
    id,
    'admin',
    NULL,
    ARRAY['view_all_partners', 'manage_all_api_keys', 'view_all_analytics', 'manage_users']
FROM auth.users 
WHERE email = 'cale.mcnulty@superbuilders.school';

-- Verify the role was assigned
SELECT 
    u.email,
    ur.role,
    ur.permissions,
    ur.created_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'cale.mcnulty@superbuilders.school';
