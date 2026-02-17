
-- Add flag to track if system already auto-disabled dial for this job
ALTER TABLE "Jobs" ADD COLUMN auto_dial_system_disabled boolean NOT NULL DEFAULT false;

-- Replace the trigger function with updated logic (threshold=8, one-time only)
CREATE OR REPLACE FUNCTION public.disable_auto_dial_at_threshold()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  shortlisted_count INTEGER;
  current_auto_dial BOOLEAN;
  current_system_disabled BOOLEAN;
BEGIN
  SELECT automatic_dial, auto_dial_system_disabled
  INTO current_auto_dial, current_system_disabled
  FROM "Jobs"
  WHERE job_id = NEW.job_id;

  IF current_auto_dial = TRUE AND current_system_disabled = FALSE THEN
    SELECT COUNT(*) INTO shortlisted_count
    FROM "Jobs_CVs"
    WHERE job_id = NEW.job_id
      AND (after_call_score::INTEGER) >= 74
      AND (contacted IS NULL OR contacted != 'Shortlisted from Similar jobs');

    IF shortlisted_count >= 8 THEN
      UPDATE "Jobs"
      SET automatic_dial = FALSE,
          auto_dial_enabled_at = NULL,
          auto_dial_system_disabled = TRUE
      WHERE job_id = NEW.job_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;
