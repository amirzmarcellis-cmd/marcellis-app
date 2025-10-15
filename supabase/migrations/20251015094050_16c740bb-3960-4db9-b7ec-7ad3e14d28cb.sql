-- First, update all existing jobs with candidates from Processing to Recruiting
UPDATE "Jobs"
SET status = 'Recruiting'
WHERE status = 'Processing'
AND "Processed" = 'Yes'
AND EXISTS (
  SELECT 1 FROM "Jobs_CVs" WHERE "Jobs_CVs".job_id = "Jobs".job_id
);

-- Then, update remaining Processing jobs to Sourcing
UPDATE "Jobs"
SET status = 'Sourcing'
WHERE status = 'Processing';

-- Update the trigger function to use "Sourcing" instead of "Processing"
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
      -- Update status to Sourcing
      NEW.status = 'Sourcing';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update the first candidate trigger to use "Sourcing" instead of "Processing"
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
  
  -- Only update if job is currently Sourcing and active
  IF job_status = 'Sourcing' AND job_processed = 'Yes' THEN
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