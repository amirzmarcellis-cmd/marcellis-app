-- Create function to manually assign platform admin role to admin@goonyx.ai
-- First, let's make sure we can assign platform admin role

-- Add platform admin role to admin@goonyx.ai if user exists
DO $$
DECLARE
    admin_user_id uuid;
    default_company_id uuid;
BEGIN
    -- Get the user_id for admin@goonyx.ai from profiles table (since we can't query auth.users directly)
    -- We'll need to find a way to identify this user
    
    -- Get the first company (usually the default company)
    SELECT id INTO default_company_id FROM companies LIMIT 1;
    
    -- If we find a profile with a name or other identifier that matches admin@goonyx.ai
    -- For now, let's create a mechanism to manually assign this
    
    -- This is a placeholder - in practice, you'd identify the user by their profile data
    -- or have them log in and then run a query to assign the role
    
    RAISE NOTICE 'To assign platform admin role to admin@goonyx.ai:';
    RAISE NOTICE '1. Have the user log in first';
    RAISE NOTICE '2. Run: INSERT INTO company_users (user_id, company_id, role) VALUES ((SELECT user_id FROM profiles WHERE name = ''Admin User''), (SELECT id FROM companies LIMIT 1), ''platform_admin'') ON CONFLICT DO NOTHING;';
    RAISE NOTICE '3. Or update the user management interface to allow role assignment';
END $$;