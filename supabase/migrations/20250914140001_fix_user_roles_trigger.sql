-- Fix the user_roles trigger to properly handle new user signups

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.auto_assign_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-assign 'user' role to new users
  -- Use public schema explicitly
  INSERT INTO public.user_roles (user_id, role, permissions, created_at, updated_at)
  VALUES (NEW.id, 'user', '[]'::jsonb, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to auto-assign user role: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_user_role();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_roles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.user_roles TO authenticated;
GRANT SELECT ON public.user_roles TO anon;


