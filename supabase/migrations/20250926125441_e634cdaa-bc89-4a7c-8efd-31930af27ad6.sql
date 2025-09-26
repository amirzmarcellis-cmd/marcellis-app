-- Update Ayush's admin status
UPDATE profiles 
SET is_admin = true, updated_at = now()
WHERE email = 'ayush.s@marc-ellis.com';