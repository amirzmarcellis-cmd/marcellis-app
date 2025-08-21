-- Add company_id to tables that don't have it yet for complete company isolation

-- Update interview table to include company_id for better filtering
UPDATE interview 
SET company_id = (
  SELECT company_id 
  FROM "Jobs" 
  WHERE "Jobs".job_id = interview.job_id 
  LIMIT 1
)
WHERE company_id IS NULL;