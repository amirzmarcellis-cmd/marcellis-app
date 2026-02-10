
-- Trigger function for CVs table
CREATE OR REPLACE FUNCTION public.normalize_candidate_names_cvs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW."Firstname" IS NOT NULL THEN
    NEW."Firstname" = INITCAP(TRIM(NEW."Firstname"));
  END IF;
  IF NEW."Lastname" IS NOT NULL THEN
    NEW."Lastname" = INITCAP(TRIM(NEW."Lastname"));
  END IF;
  IF NEW.name IS NOT NULL THEN
    NEW.name = INITCAP(TRIM(NEW.name));
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger function for Jobs_CVs table
CREATE OR REPLACE FUNCTION public.normalize_candidate_names_jobs_cvs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.candidate_name IS NOT NULL THEN
    NEW.candidate_name = INITCAP(TRIM(NEW.candidate_name));
  END IF;
  RETURN NEW;
END;
$$;

-- Attach triggers
CREATE TRIGGER trg_normalize_cvs_names
  BEFORE INSERT OR UPDATE ON "CVs"
  FOR EACH ROW
  EXECUTE FUNCTION normalize_candidate_names_cvs();

CREATE TRIGGER trg_normalize_jobs_cvs_names
  BEFORE INSERT OR UPDATE ON "Jobs_CVs"
  FOR EACH ROW
  EXECUTE FUNCTION normalize_candidate_names_jobs_cvs();
