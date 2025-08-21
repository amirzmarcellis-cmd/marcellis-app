-- Fix the platform admin policy on profiles table
-- The issue is that has_role() looks for 'platform_admin' role in company_users table
-- but platform admin status is stored in profiles.is_platform_admin

DROP POLICY IF EXISTS "Platform admins can view all profiles" ON public.profiles;

CREATE POLICY "Platform admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS admin_profile
    WHERE admin_profile.user_id = auth.uid() 
    AND admin_profile.is_platform_admin = true
  )
);