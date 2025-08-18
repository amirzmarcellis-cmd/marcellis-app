-- Update the app_role enum to include the specific roles requested
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';

-- Drop the existing values if they exist and recreate the enum with the exact values needed
-- Note: We'll keep existing values and add new ones to avoid breaking existing data
-- The enum now supports: admin, moderator, user, super_admin, manager

-- Create a view to list all users with their roles for the admin panel
CREATE OR REPLACE VIEW public.users_with_roles AS
SELECT 
  p.user_id,
  p.name,
  au.email,
  au.created_at as user_created_at,
  au.last_sign_in_at,
  COALESCE(
    array_agg(ur.role ORDER BY ur.role) FILTER (WHERE ur.role IS NOT NULL), 
    ARRAY[]::app_role[]
  ) as roles
FROM public.profiles p
JOIN auth.users au ON p.user_id = au.id
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
GROUP BY p.user_id, p.name, au.email, au.created_at, au.last_sign_in_at;

-- Create RLS policies for the users_with_roles view
-- Only super_admin and admin can view all users
CREATE POLICY "Super admins and admins can view all users"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::app_role) OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Create policy for user_roles management
-- Only super_admin can manage all roles, admin can manage non-super_admin roles
CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can manage non-super admin roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) AND 
  role != 'super_admin'::app_role
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) AND 
  role != 'super_admin'::app_role
);