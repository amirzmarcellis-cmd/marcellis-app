-- Remove platform admin associations from company_users table
-- Platform admins should have system-wide access, not company-specific access
DELETE FROM public.company_users 
WHERE role = 'platform_admin';

-- Create a separate function to check platform admin status without company association
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Platform admins are identified by having a profile with a special flag
  -- We'll use the profiles table with a new column for this
  SELECT false; -- Temporary implementation
$$;