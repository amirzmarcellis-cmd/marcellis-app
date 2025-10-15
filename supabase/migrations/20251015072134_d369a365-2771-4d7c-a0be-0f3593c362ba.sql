-- Initialize status column for existing jobs
UPDATE "Jobs" 
SET status = CASE 
  WHEN "Processed" = 'No' THEN 'Completed'
  WHEN things_to_look_for IS NOT NULL OR musttohave IS NOT NULL OR nicetohave IS NOT NULL THEN 'Processing'
  ELSE 'Active'
END
WHERE status IS NULL OR status = '';

-- Update to Recruiting if candidates exist and not paused
UPDATE "Jobs" j
SET status = 'Recruiting'
WHERE EXISTS (
  SELECT 1 FROM "Jobs_CVs" jc WHERE jc.job_id = j.job_id
)
AND "Processed" = 'Yes'
AND status = 'Processing';