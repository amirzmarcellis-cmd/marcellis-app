-- Unschedule the 72-hour job expiry cron job (jobid: 2)
SELECT cron.unschedule(2);

-- Drop the expire_old_jobs function
DROP FUNCTION IF EXISTS expire_old_jobs();