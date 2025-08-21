-- Assign all existing data to DMS company
-- Get DMS company ID (assuming it's the first company created)

DO $$
DECLARE
    dms_company_id uuid;
BEGIN
    -- Get DMS company ID
    SELECT id INTO dms_company_id FROM companies WHERE name = 'DMS' LIMIT 1;
    
    IF dms_company_id IS NULL THEN
        RAISE EXCEPTION 'DMS company not found';
    END IF;
    
    -- Update CVs table
    UPDATE "CVs" 
    SET company_id = dms_company_id 
    WHERE company_id IS NULL;
    
    -- Update Jobs table  
    UPDATE "Jobs" 
    SET company_id = dms_company_id 
    WHERE company_id IS NULL;
    
    -- Update Jobs_CVs table
    UPDATE "Jobs_CVs" 
    SET company_id = dms_company_id 
    WHERE company_id IS NULL;
    
    -- Update call_logs table
    UPDATE call_logs 
    SET company_id = dms_company_id 
    WHERE company_id IS NULL;
    
    -- Update tasks table
    UPDATE tasks 
    SET company_id = dms_company_id 
    WHERE company_id IS NULL;
    
    -- Update task_candidates table
    UPDATE task_candidates 
    SET company_id = dms_company_id 
    WHERE company_id IS NULL;
    
    -- Update interview table (already done in previous migration but ensuring completeness)
    UPDATE interview 
    SET company_id = dms_company_id 
    WHERE company_id IS NULL;
    
    -- Update activity_logs table
    UPDATE activity_logs 
    SET company_id = dms_company_id 
    WHERE company_id IS NULL;
    
    -- Update comments table
    UPDATE comments 
    SET company_id = dms_company_id 
    WHERE company_id IS NULL;
    
    -- Update file_uploads table
    UPDATE file_uploads 
    SET company_id = dms_company_id 
    WHERE company_id IS NULL;
    
    -- Update status_history table
    UPDATE status_history 
    SET company_id = dms_company_id 
    WHERE company_id IS NULL;
    
    RAISE NOTICE 'Successfully assigned all data to DMS company (ID: %)', dms_company_id;
END $$;