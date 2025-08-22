-- Update existing Jobs_CVs records that have NULL company_id
-- First, try to get company_id from the associated job
UPDATE public."Jobs_CVs" 
SET company_id = j.company_id
FROM public."Jobs" j
WHERE "Jobs_CVs".job_id = j.job_id 
  AND "Jobs_CVs".company_id IS NULL
  AND j.company_id IS NOT NULL;

-- Then, for any remaining NULL company_id records, get from CVs table
UPDATE public."Jobs_CVs" 
SET company_id = c.company_id
FROM public."CVs" c
WHERE "Jobs_CVs"."Candidate_ID" = c.candidate_id 
  AND "Jobs_CVs".company_id IS NULL
  AND c.company_id IS NOT NULL;

-- Create trigger function to automatically set company_id for Jobs_CVs
CREATE OR REPLACE FUNCTION public.set_jobs_cvs_company_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If company_id is not provided, try to get it from the job first
  IF NEW.company_id IS NULL AND NEW.job_id IS NOT NULL THEN
    SELECT company_id INTO NEW.company_id 
    FROM public."Jobs" 
    WHERE job_id = NEW.job_id;
  END IF;
  
  -- If still NULL, try to get it from the candidate
  IF NEW.company_id IS NULL AND NEW."Candidate_ID" IS NOT NULL THEN
    SELECT company_id INTO NEW.company_id 
    FROM public."CVs" 
    WHERE candidate_id = NEW."Candidate_ID";
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Create trigger that fires before insert or update
CREATE TRIGGER jobs_cvs_set_company_id
  BEFORE INSERT OR UPDATE ON public."Jobs_CVs"
  FOR EACH ROW
  EXECUTE FUNCTION public.set_jobs_cvs_company_id();