-- First drop the trigger that depends on the function
drop trigger if exists "auto_confirm_email_on_signup" on "auth"."users";

-- Now we can safely drop the function
drop function if exists "public"."auto_confirm_email"();

alter table "public"."projects" add column "api_responses" jsonb default '{}'::jsonb;

alter table "public"."projects" add column "manifest" jsonb;

alter table "public"."projects" add column "shotgroups" jsonb default '[]'::jsonb;

alter table "public"."projects" add column "template_images" jsonb default '[]'::jsonb;

CREATE INDEX idx_projects_api_responses ON public.projects USING gin (api_responses);

CREATE INDEX idx_projects_manifest ON public.projects USING gin (manifest);

set check_function_bodies = off;

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
    
    -- Get user role data
    SELECT json_build_object(
        'role', COALESCE(ur.role, 'user'),
        'partner_id', ur.partner_id,
        'partner_name', p.name,
        'partner_code', p.code,
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
$function$
;


