-- Create function to automatically disable auto-dial when 6 candidates are shortlisted
CREATE OR REPLACE FUNCTION public.disable_auto_dial_at_threshold()
RETURNS TRIGGER AS $$
DECLARE
  shortlisted_count INTEGER;
  current_auto_dial BOOLEAN;
BEGIN
  -- Get current automatic_dial status
  SELECT automatic_dial INTO current_auto_dial
  FROM "Jobs"
  WHERE job_id = NEW.job_id;
  
  -- Only proceed if automatic_dial is currently enabled
  IF current_auto_dial = TRUE THEN
    -- Count shortlisted candidates (after_call_score >= 74)
    SELECT COUNT(*) INTO shortlisted_count
    FROM "Jobs_CVs"
    WHERE job_id = NEW.job_id
      AND (after_call_score::INTEGER) >= 74;
    
    -- Disable auto-dial if we've reached 6 shortlisted candidates
    IF shortlisted_count >= 6 THEN
      UPDATE "Jobs"
      SET automatic_dial = FALSE,
          auto_dial_enabled_at = NULL
      WHERE job_id = NEW.job_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on Jobs_CVs for INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_disable_auto_dial ON "Jobs_CVs";
CREATE TRIGGER trigger_disable_auto_dial
  AFTER INSERT OR UPDATE OF after_call_score
  ON "Jobs_CVs"
  FOR EACH ROW
  EXECUTE FUNCTION public.disable_auto_dial_at_threshold();