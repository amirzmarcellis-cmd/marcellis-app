-- Update the AI Automation Engineer job ID to use Ocean company format
UPDATE "Jobs" 
SET job_id = 'OCEAN-J-0001'
WHERE job_id = 'DMS-J-0008' AND job_title = 'AI Automation Engineer';