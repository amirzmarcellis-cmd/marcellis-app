-- Update active jobs that have candidates to Recruiting status
UPDATE "Jobs" j
SET status = 'Recruiting'
WHERE j."Processed" = 'Yes'
  AND EXISTS (
    SELECT 1 FROM "Jobs_CVs" jc 
    WHERE jc.job_id = j.job_id
  );

-- Update active jobs without candidates based on AI requirements
UPDATE "Jobs" j
SET status = CASE 
  WHEN (j.things_to_look_for IS NOT NULL AND j.things_to_look_for != '') 
    OR (j.musttohave IS NOT NULL AND j.musttohave != '') 
    OR (j.nicetohave IS NOT NULL AND j.nicetohave != '') 
  THEN 'Processing'
  ELSE 'Active'
END
WHERE j."Processed" = 'Yes'
  AND NOT EXISTS (
    SELECT 1 FROM "Jobs_CVs" jc 
    WHERE jc.job_id = j.job_id
  );