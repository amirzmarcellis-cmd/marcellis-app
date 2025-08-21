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

-- Revoke access to materialized views for security
REVOKE ALL ON mv_calls_daily FROM anon, authenticated;
REVOKE ALL ON mv_candidate_status_counts FROM anon, authenticated;
REVOKE ALL ON mv_contacted_status_counts_by_job FROM anon, authenticated;