-- Fix the infinite recursion in the profiles RLS policy
-- The issue is that the policy is querying the same table it's protecting
-- We need to use a different approach that doesn't cause recursion

DROP POLICY IF EXISTS "Platform admins can view all profiles" ON public.profiles;

-- Create a security definer function to check platform admin status
CREATE OR REPLACE FUNCTION public.check_platform_admin_status()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_platform_admin, false) 
  FROM public.profiles 
  WHERE user_id = auth.uid();
$$;

-- Now create the policy using the function
CREATE POLICY "Platform admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (public.check_platform_admin_status());