-- Auto-confirm emails for local development
-- This trigger automatically sets email_confirmed_at for new users

CREATE OR REPLACE FUNCTION public.auto_confirm_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Auto-confirm email for new users in local development
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS auto_confirm_email_on_signup ON auth.users;
CREATE TRIGGER auto_confirm_email_on_signup
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_email();

-- Also update any existing users with unconfirmed emails
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

COMMENT ON FUNCTION public.auto_confirm_email() IS 'Auto-confirms user emails for local development';
