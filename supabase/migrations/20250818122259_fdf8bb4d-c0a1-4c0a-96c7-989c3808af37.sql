-- Ensure the profiles table has proper constraints and the name field is being used correctly
-- The profiles table already has a name column, so we just need to make sure it's properly utilized

-- Add a constraint to ensure every user has a profile
-- (This helps maintain data integrity)
ALTER TABLE profiles 
ADD CONSTRAINT unique_user_profile UNIQUE (user_id);

-- Update the trigger function to always create a profile with name from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    name = COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', profiles.name);
  RETURN new;
END;
$$;