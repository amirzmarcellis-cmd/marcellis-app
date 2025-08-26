-- Update all existing job IDs to use slug format
DO $$
DECLARE
    company_slug text;
    job_record record;
    counter integer := 1;
BEGIN
    -- Get the company slug (assuming single company structure)
    SELECT slug INTO company_slug FROM profiles WHERE slug IS NOT NULL LIMIT 1;
    
    -- If no slug found, use 'default' as fallback
    IF company_slug IS NULL THEN
        company_slug := 'default';
    END IF;
    
    -- Update all jobs with new IDs in chronological order
    FOR job_record IN 
        SELECT job_id, "Timestamp" FROM "Jobs" 
        ORDER BY "Timestamp" ASC
    LOOP
        -- Update each job with new slug-based ID
        UPDATE "Jobs" 
        SET job_id = company_slug || '-j-' || LPAD(counter::text, 4, '0')
        WHERE job_id = job_record.job_id;
        
        counter := counter + 1;
    END LOOP;
    
    RAISE NOTICE 'Updated % jobs with new slug-based IDs using slug: %', counter - 1, company_slug;
END $$;