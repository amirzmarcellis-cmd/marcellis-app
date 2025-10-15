-- Corrective migration to fix job statuses for jobs with AI requirements
-- Set status based on candidates and AI requirements

UPDATE "Jobs"
SET status = CASE
  -- Jobs with candidates should be 'Recruiting'
  WHEN (SELECT COUNT(*) FROM "Jobs_CVs" WHERE "Jobs_CVs".job_id = "Jobs".job_id) > 0 
    THEN 'Recruiting'
  -- Jobs with AI requirements but no candidates should be 'Processing'
  WHEN (musttohave IS NOT NULL AND TRIM(musttohave) != '') 
    OR (nicetohave IS NOT NULL AND TRIM(nicetohave) != '')
    THEN 'Processing'
  -- Otherwise keep as Active
  ELSE 'Active'
END
WHERE job_id IN ('me-j-0050', 'me-j-0051', 'me-j-0052', 'me-j-0053', 'me-j-0054');