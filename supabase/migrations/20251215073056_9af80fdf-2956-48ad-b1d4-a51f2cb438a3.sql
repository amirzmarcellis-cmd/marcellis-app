-- Create function to expire jobs older than 72 hours
CREATE OR REPLACE FUNCTION public.expire_old_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE "Jobs"
  SET 
    automatic_dial = FALSE,
    "Processed" = 'No'
  WHERE "Processed" = 'Yes'
    AND "Timestamp" IS NOT NULL
    AND "Timestamp" != ''
    AND to_timestamp("Timestamp", 'YYYY-MM-DD HH24:MI:SS') < NOW() - INTERVAL '72 hours';
END;
$$;