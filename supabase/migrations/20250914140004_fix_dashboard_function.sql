-- Fix get_user_dashboard_data function column reference error
-- The function was referencing p.code but the column is p.partner_code

CREATE OR REPLACE FUNCTION public.get_user_dashboard_data(user_id_input uuid DEFAULT NULL::uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    target_user_id UUID;
    result JSON;
BEGIN
    -- Use the input user_id or default to the current user
    target_user_id := COALESCE(user_id_input, auth.uid());
    
    -- If no user ID available, return empty result
    IF target_user_id IS NULL THEN
        RETURN json_build_object(
            'role', 'user',
            'partner_id', NULL,
            'partner_name', NULL,
            'partner_code', NULL,
            'permissions', '[]'::jsonb
        );
    END IF;
    
    -- Get user role data with correct column reference
    SELECT json_build_object(
        'role', COALESCE(ur.role, 'user'),
        'partner_id', ur.partner_id,
        'partner_name', p.name,
        'partner_code', p.partner_code,  -- Fixed: was p.code, now p.partner_code
        'permissions', COALESCE(ur.permissions, '[]'::jsonb)
    ) INTO result
    FROM auth.users u
    LEFT JOIN public.user_roles ur ON u.id = ur.user_id
    LEFT JOIN public.partners p ON ur.partner_id = p.id
    WHERE u.id = target_user_id;
    
    -- If no result found, return default user role
    IF result IS NULL THEN
        RETURN json_build_object(
            'role', 'user',
            'partner_id', NULL,
            'partner_name', NULL,
            'partner_code', NULL,
            'permissions', '[]'::jsonb
        );
    END IF;
    
    RETURN result;
END;
$function$;
