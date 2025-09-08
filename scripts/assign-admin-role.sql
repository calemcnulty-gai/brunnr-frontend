-- Script to assign admin role to a user
-- Run this in the Supabase SQL editor

-- First, check if the user exists and get their ID
DO $$
DECLARE
    user_id_var UUID;
BEGIN
    -- Get the user ID for the email
    SELECT id INTO user_id_var
    FROM auth.users
    WHERE email = 'cale.mcnulty@superbuilders.school';
    
    IF user_id_var IS NULL THEN
        RAISE NOTICE 'User with email cale.mcnulty@superbuilders.school not found';
    ELSE
        RAISE NOTICE 'Found user with ID: %', user_id_var;
        
        -- Check if user already has a role
        IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = user_id_var) THEN
            -- Update existing role to admin
            UPDATE public.user_roles
            SET 
                role = 'admin',
                partner_id = NULL,  -- Admins don't belong to a specific partner
                permissions = ARRAY['view_all_partners', 'manage_all_api_keys', 'view_all_analytics', 'manage_users'],
                updated_at = NOW()
            WHERE user_id = user_id_var;
            
            RAISE NOTICE 'Updated existing role to admin for user %', user_id_var;
        ELSE
            -- Insert new admin role
            INSERT INTO public.user_roles (
                user_id,
                role,
                partner_id,
                permissions,
                created_at,
                updated_at
            ) VALUES (
                user_id_var,
                'admin',
                NULL,
                ARRAY['view_all_partners', 'manage_all_api_keys', 'view_all_analytics', 'manage_users'],
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Created new admin role for user %', user_id_var;
        END IF;
        
        -- Verify the role was set correctly
        PERFORM * FROM public.user_roles 
        WHERE user_id = user_id_var AND role = 'admin';
        
        IF FOUND THEN
            RAISE NOTICE 'Successfully assigned admin role to cale.mcnulty@superbuilders.school';
        ELSE
            RAISE EXCEPTION 'Failed to assign admin role';
        END IF;
    END IF;
END $$;

-- Verify the assignment by checking the user's role
SELECT 
    u.email,
    ur.role,
    ur.permissions,
    ur.created_at,
    ur.updated_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'cale.mcnulty@superbuilders.school';
