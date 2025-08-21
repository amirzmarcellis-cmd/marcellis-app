-- Add platform admin flag to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_platform_admin boolean DEFAULT false;

-- Update the platform admin function to check the profiles table
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(is_platform_admin, false) 
  FROM public.profiles 
  WHERE user_id = _user_id;
$$;

-- Set the superadmin@goonyx.ai user as platform admin
UPDATE public.profiles 
SET is_platform_admin = true 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'superadmin@goonyx.ai'
);