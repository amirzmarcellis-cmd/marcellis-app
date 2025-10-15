-- Create trigger function to automatically update job status when AI requirements are added
CREATE OR REPLACE FUNCTION public.update_job_status_on_ai_requirements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if AI requirements were just added (previously empty, now has content)
  -- and job is currently Active and not paused
  IF NEW."Processed" = 'Yes' AND NEW.status = 'Active' THEN
    -- Check if any AI requirement now has content
    IF (TRIM(COALESCE(NEW.things_to_look_for, '')) != '' OR 
        TRIM(COALESCE(NEW.musttohave, '')) != '' OR 
        TRIM(COALESCE(NEW.nicetohave, '')) != '') THEN
      -- Update status to Processing
      NEW.status = 'Processing';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger function to automatically update job status when first candidate is added
CREATE OR REPLACE FUNCTION public.update_job_status_on_first_candidate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  job_status TEXT;
  job_processed TEXT;
  candidate_count INTEGER;
BEGIN
  -- Get current job status and processed state
  SELECT status, "Processed" INTO job_status, job_processed
  FROM "Jobs"
  WHERE job_id = NEW.job_id;
  
  -- Only update if job is currently Processing and active
  IF job_status = 'Processing' AND job_processed = 'Yes' THEN
    -- Check if this is the first candidate (count should be 1 after this insert)
    SELECT COUNT(*) INTO candidate_count
    FROM "Jobs_CVs"
    WHERE job_id = NEW.job_id;
    
    -- If this is the first candidate, update job to Recruiting
    IF candidate_count = 1 THEN
      UPDATE "Jobs"
      SET status = 'Recruiting'
      WHERE job_id = NEW.job_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on Jobs table for AI requirements
DROP TRIGGER IF EXISTS trigger_update_status_on_ai_requirements ON "Jobs";
CREATE TRIGGER trigger_update_status_on_ai_requirements
  BEFORE UPDATE ON "Jobs"
  FOR EACH ROW
  WHEN (
    OLD.things_to_look_for IS DISTINCT FROM NEW.things_to_look_for OR
    OLD.musttohave IS DISTINCT FROM NEW.musttohave OR
    OLD.nicetohave IS DISTINCT FROM NEW.nicetohave
  )
  EXECUTE FUNCTION public.update_job_status_on_ai_requirements();

-- Create trigger on Jobs_CVs table for first candidate
DROP TRIGGER IF EXISTS trigger_update_status_on_first_candidate ON "Jobs_CVs";
CREATE TRIGGER trigger_update_status_on_first_candidate
  AFTER INSERT ON "Jobs_CVs"
  FOR EACH ROW
  EXECUTE FUNCTION public.update_job_status_on_first_candidate();