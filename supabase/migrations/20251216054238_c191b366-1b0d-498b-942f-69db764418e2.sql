-- Create the hourly cron job to expire old jobs
SELECT cron.schedule(
  'expire-old-jobs-hourly',
  '0 * * * *',
  $$SELECT expire_old_jobs();$$
);

-- Run immediately to expire all existing old jobs
SELECT expire_old_jobs();