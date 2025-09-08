-- Migration to assign admin role to cale.mcnulty@superbuilders.school

-- First, ensure the user_roles table exists (it should from previous migrations)
-- This migration assigns admin role to the specified user

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get the user ID for cale.mcnulty@superbuilders.school
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = 'cale.mcnulty@superbuilders.school'
    LIMIT 1;
    
    -- Only proceed if user exists
    IF target_user_id IS NOT NULL THEN
        -- Delete any existing role for this user
        DELETE FROM public.user_roles 
        WHERE user_id = target_user_id;
        
        -- Insert admin role
        INSERT INTO public.user_roles (
            user_id,
            role,
            partner_id,
            permissions,
            created_at,
            updated_at
        ) VALUES (
            target_user_id,
            'admin',
            NULL,
            '["view_all_partners", "manage_all_api_keys", "view_all_analytics", "manage_users"]'::jsonb,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Successfully assigned admin role to cale.mcnulty@superbuilders.school (ID: %)', target_user_id;
    ELSE
        RAISE NOTICE 'User cale.mcnulty@superbuilders.school not found. Admin role not assigned.';
    END IF;
END $$;
