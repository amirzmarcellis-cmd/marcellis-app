-- Step 1: Fix the expire_old_jobs function to ONLY disable automatic_dial (not pause jobs)
CREATE OR REPLACE FUNCTION public.expire_old_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE "Jobs"
  SET automatic_dial = FALSE
  WHERE automatic_dial = TRUE
    AND "Timestamp" IS NOT NULL
    AND "Timestamp" != ''
    AND (
      CASE 
        WHEN "Timestamp" LIKE '%T%' THEN 
          "Timestamp"::timestamp < NOW() - INTERVAL '72 hours'
        ELSE 
          to_timestamp("Timestamp", 'YYYY-MM-DD HH24:MI') < NOW() - INTERVAL '72 hours'
      END
    );
END;
$$;

-- Step 2: Reactivate all paused jobs
UPDATE "Jobs"
SET "Processed" = 'Yes'
WHERE "Processed" = 'No';