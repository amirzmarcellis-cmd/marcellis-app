-- Update all paused jobs to have Completed status
UPDATE "Jobs" 
SET status = 'Completed'
WHERE "Processed" = 'No';