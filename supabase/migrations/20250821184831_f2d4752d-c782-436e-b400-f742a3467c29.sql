-- Fix admin@goonyx.ai company assignment
DO $$
DECLARE
    dms_company_id uuid;
    ocean_company_id uuid;
    admin_user_id uuid;
BEGIN
    -- Get company IDs
    SELECT id INTO dms_company_id FROM companies WHERE name = 'DMS' LIMIT 1;
    SELECT id INTO ocean_company_id FROM companies WHERE name = 'Ocean' LIMIT 1;
    
    -- Find the admin user (assuming it's the superadmin user based on auth logs)
    -- This user should be admin@goonyx.ai based on the auth logs showing superadmin@goonyx.ai
    SELECT user_id INTO admin_user_id FROM profiles WHERE name = 'superadmin' LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'Admin user not found with name superadmin';
        RETURN;
    END IF;
    
    -- Remove any existing assignments for this user from Ocean company
    DELETE FROM company_users 
    WHERE user_id = admin_user_id AND company_id = ocean_company_id;
    
    -- Ensure the user is company_admin for DMS (not platform_admin)
    -- First remove any existing assignment to DMS
    DELETE FROM company_users 
    WHERE user_id = admin_user_id AND company_id = dms_company_id;
    
    -- Add as company_admin to DMS
    INSERT INTO company_users (user_id, company_id, role, joined_at)
    VALUES (admin_user_id, dms_company_id, 'company_admin', now());
    
    RAISE NOTICE 'Updated admin user (%) to be company_admin for DMS company', admin_user_id;
    
    -- Also check if there are any users assigned to Ocean that should be moved to DMS
    -- Move Ocean company admin to DMS if that's the intent
    UPDATE company_users 
    SET company_id = dms_company_id 
    WHERE company_id = ocean_company_id 
    AND role = 'company_admin';
    
    RAISE NOTICE 'Moved Ocean company admin to DMS company';
    
END $$;