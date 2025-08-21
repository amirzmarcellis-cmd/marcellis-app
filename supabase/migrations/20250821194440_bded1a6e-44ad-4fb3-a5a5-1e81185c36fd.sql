-- Fix platform admin RLS policy on company_users table
-- The issue is that has_role() looks for 'platform_admin' role in company_users table
-- but platform admin status is stored in profiles.is_platform_admin

DROP POLICY IF EXISTS "Platform admins can manage all company users" ON public.company_users;

CREATE POLICY "Platform admins can manage all company users" 
ON public.company_users 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND is_platform_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND is_platform_admin = true
  )
);