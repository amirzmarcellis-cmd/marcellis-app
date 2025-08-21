-- Fix superadmin@goonyx.ai to be platform admin again
DO $$
DECLARE
    dms_company_id uuid;
    superadmin_user_id uuid;
BEGIN
    -- Get DMS company ID
    SELECT id INTO dms_company_id FROM companies WHERE name = 'DMS' LIMIT 1;
    
    -- Get superadmin user ID
    SELECT user_id INTO superadmin_user_id FROM profiles WHERE name = 'superadmin' LIMIT 1;
    
    IF superadmin_user_id IS NULL THEN
        RAISE EXCEPTION 'Superadmin user not found';
    END IF;
    
    -- Remove current company_admin role
    DELETE FROM company_users 
    WHERE user_id = superadmin_user_id AND company_id = dms_company_id;
    
    -- Add platform_admin role for DMS company
    INSERT INTO company_users (user_id, company_id, role, joined_at)
    VALUES (superadmin_user_id, dms_company_id, 'platform_admin', now());
    
    RAISE NOTICE 'Updated superadmin (%) to platform_admin for DMS company', superadmin_user_id;
    
END $$;