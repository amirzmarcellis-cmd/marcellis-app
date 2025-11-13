-- Step 1: Add unique constraint on Jobs_CVs
ALTER TABLE "Jobs_CVs" 
ADD CONSTRAINT jobs_cvs_job_user_unique 
UNIQUE (job_id, user_id);

-- Step 2: Create email normalization function for Jobs_CVs
CREATE OR REPLACE FUNCTION normalize_jobs_cvs_email()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.candidate_email IS NOT NULL THEN
    NEW.candidate_email = LOWER(TRIM(NEW.candidate_email));
  END IF;
  RETURN NEW;
END;
$$;

-- Step 3: Create email normalization function for CVs
CREATE OR REPLACE FUNCTION normalize_cvs_email()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    NEW.email = LOWER(TRIM(NEW.email));
  END IF;
  RETURN NEW;
END;
$$;

-- Step 4: Create triggers
CREATE TRIGGER normalize_jobs_cvs_email
BEFORE INSERT OR UPDATE ON "Jobs_CVs"
FOR EACH ROW
EXECUTE FUNCTION normalize_jobs_cvs_email();

CREATE TRIGGER normalize_cvs_email
BEFORE INSERT OR UPDATE ON "CVs"
FOR EACH ROW
EXECUTE FUNCTION normalize_cvs_email();