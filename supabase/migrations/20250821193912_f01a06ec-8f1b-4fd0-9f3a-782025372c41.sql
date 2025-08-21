-- The issue is likely that multiple policies are conflicting
-- We need to ensure platform admins have unrestricted access
-- Let's check if the platform admin policy is being properly recognized

-- Test the function call directly
DO $$
BEGIN
  RAISE NOTICE 'Platform admin check result: %', public.is_platform_admin('edd650b8-3346-49b0-9757-3f56951f8512');
END $$;

-- Let's also add a more explicit policy that handles the function call better
DROP POLICY IF EXISTS "Platform admins can manage all companies" ON public.companies;

CREATE POLICY "Platform admins can manage all companies" 
ON public.companies 
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