-- First, let's see what users exist in the system
-- We need to grant admin access to existing users

-- Insert a super_admin role for the first user (if any users exist)
INSERT INTO user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users 
WHERE id IS NOT NULL
ORDER BY created_at
LIMIT 1
ON CONFLICT (user_id, role) DO NOTHING;

-- Also create a default admin user role for any users in the profiles table
INSERT INTO user_roles (user_id, role)
SELECT user_id, 'admin'::app_role
FROM profiles
WHERE user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;