-- Create a simple SQL query to assign platform admin role to admin@goonyx.ai
-- This will help the user manually assign the role after they log in

-- Create a helper function to assign platform admin role
CREATE OR REPLACE FUNCTION assign_platform_admin_by_email(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id uuid;
    default_company_id uuid;
    result_message text;
BEGIN
    -- Get the default company
    SELECT id INTO default_company_id FROM companies ORDER BY created_at LIMIT 1;
    
    IF default_company_id IS NULL THEN
        RETURN 'Error: No company found. Please create a company first.';
    END IF;
    
    -- Find user by checking profiles table (this is a workaround since we can't query auth.users directly)
    -- The user needs to log in first so their profile exists
    SELECT user_id INTO target_user_id 
    FROM profiles 
    WHERE user_id IN (
        -- This is a placeholder - in practice you'd need another way to identify the user
        -- since we can't directly query auth.users table
        SELECT id FROM auth.users WHERE email = user_email
    )
    LIMIT 1;
    
    IF target_user_id IS NULL THEN
        RETURN 'Error: User not found. Please make sure the user has logged in at least once.';
    END IF;
    
    -- Check if user already has platform admin role
    IF EXISTS (
        SELECT 1 FROM company_users 
        WHERE user_id = target_user_id AND role = 'platform_admin'
    ) THEN
        RETURN 'User already has platform admin role.';
    END IF;
    
    -- Assign platform admin role
    INSERT INTO company_users (user_id, company_id, role, joined_at)
    VALUES (target_user_id, default_company_id, 'platform_admin', now())
    ON CONFLICT (user_id, company_id) 
    DO UPDATE SET role = 'platform_admin', joined_at = now();
    
    RETURN 'Successfully assigned platform admin role to user: ' || user_email;
END;
$$;

-- Also create a simpler approach using user_id directly
CREATE OR REPLACE FUNCTION assign_platform_admin_by_user_id(target_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    default_company_id uuid;
BEGIN
    -- Get the default company
    SELECT id INTO default_company_id FROM companies ORDER BY created_at LIMIT 1;
    
    IF default_company_id IS NULL THEN
        RETURN 'Error: No company found. Please create a company first.';
    END IF;
    
    -- Assign platform admin role
    INSERT INTO company_users (user_id, company_id, role, joined_at)
    VALUES (target_user_id, default_company_id, 'platform_admin', now())
    ON CONFLICT (user_id, company_id) 
    DO UPDATE SET role = 'platform_admin', joined_at = now();
    
    RETURN 'Successfully assigned platform admin role to user ID: ' || target_user_id;
END;
$$;