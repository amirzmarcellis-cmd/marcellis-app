-- Add automatic_dial column to Jobs table
ALTER TABLE public."Jobs" 
ADD COLUMN automatic_dial boolean DEFAULT true;

-- Update existing jobs to match their company's automatic_dial setting
UPDATE public."Jobs" 
SET automatic_dial = c.automatic_dial
FROM public.companies c
WHERE public."Jobs".company_id = c.id;

-- Create function to sync automatic_dial when company setting changes
CREATE OR REPLACE FUNCTION sync_jobs_automatic_dial()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all jobs for this company when automatic_dial changes
  IF OLD.automatic_dial IS DISTINCT FROM NEW.automatic_dial THEN
    UPDATE public."Jobs" 
    SET automatic_dial = NEW.automatic_dial 
    WHERE company_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically sync when company automatic_dial changes
CREATE TRIGGER sync_jobs_automatic_dial_trigger
  AFTER UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION sync_jobs_automatic_dial();

-- Create function to set automatic_dial for new jobs based on company setting
CREATE OR REPLACE FUNCTION set_job_automatic_dial()
RETURNS TRIGGER AS $$
BEGIN
  -- Set automatic_dial based on company setting when creating new job
  IF NEW.company_id IS NOT NULL THEN
    SELECT automatic_dial INTO NEW.automatic_dial
    FROM public.companies
    WHERE id = NEW.company_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new jobs
CREATE TRIGGER set_job_automatic_dial_trigger
  BEFORE INSERT ON public."Jobs"
  FOR EACH ROW
  EXECUTE FUNCTION set_job_automatic_dial();