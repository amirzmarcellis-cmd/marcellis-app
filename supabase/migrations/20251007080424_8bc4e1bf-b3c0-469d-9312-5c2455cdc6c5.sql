-- Add name column to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN name TEXT;

-- Populate the name column with existing user names from profiles
UPDATE public.user_roles ur
SET name = p.name
FROM public.profiles p
WHERE ur.user_id = p.user_id;

-- Create a trigger function to auto-update name when profile changes
CREATE OR REPLACE FUNCTION public.sync_user_role_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_roles
  SET name = NEW.name
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table to keep user_roles name in sync
CREATE TRIGGER sync_user_role_name_trigger
AFTER UPDATE OF name ON public.profiles
FOR EACH ROW
WHEN (OLD.name IS DISTINCT FROM NEW.name)
EXECUTE FUNCTION public.sync_user_role_name();