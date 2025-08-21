-- Update existing profiles with email addresses from auth.users
-- This populates the email column for users created before the email column was added

UPDATE public.profiles 
SET email = auth_users.email
FROM auth.users AS auth_users
WHERE profiles.user_id = auth_users.id 
AND profiles.email IS NULL;