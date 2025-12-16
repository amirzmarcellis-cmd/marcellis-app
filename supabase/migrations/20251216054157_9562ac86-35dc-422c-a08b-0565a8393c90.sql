-- Update expire_old_jobs function to handle both timestamp formats
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
    AND (
      -- Handle ISO format (contains 'T')
      CASE 
        WHEN "Timestamp" LIKE '%T%' THEN 
          "Timestamp"::timestamp < NOW() - INTERVAL '72 hours'
        -- Handle YYYY-MM-DD HH:MI format
        ELSE 
          to_timestamp("Timestamp", 'YYYY-MM-DD HH24:MI') < NOW() - INTERVAL '72 hours'
      END
    );
END;
$$;