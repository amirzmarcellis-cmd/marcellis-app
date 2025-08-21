-- Update RLS policies for companies table to allow platform admins full access
-- First, check if the current policy is too restrictive

-- Drop existing platform admin policy and recreate it properly
DROP POLICY IF EXISTS "Platform admins can manage all companies" ON public.companies;

-- Create a comprehensive platform admin policy that uses the new is_platform_admin function
CREATE POLICY "Platform admins can manage all companies" 
ON public.companies 
FOR ALL 
TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));