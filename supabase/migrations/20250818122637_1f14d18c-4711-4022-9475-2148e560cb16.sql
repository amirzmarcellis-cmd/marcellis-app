-- Update existing profiles to sync names from auth user metadata
-- This will fix the current "Unnamed User" issue

-- Update profiles with names from auth user metadata where they exist
UPDATE profiles 
SET name = COALESCE(
  (SELECT au.raw_user_meta_data ->> 'full_name' 
   FROM auth.users au 
   WHERE au.id = profiles.user_id), 
  ''
)
WHERE name IS NULL OR name = '';

-- Ensure all users have a profile entry
INSERT INTO profiles (user_id, name)
SELECT 
  au.id, 
  COALESCE(au.raw_user_meta_data ->> 'full_name', au.raw_user_meta_data ->> 'name', '') as name
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = au.id)
ON CONFLICT (user_id) DO NOTHING;