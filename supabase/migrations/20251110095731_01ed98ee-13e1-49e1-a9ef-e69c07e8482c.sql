-- Delete duplicate linkedin_id records per job, keeping only the earliest one (lowest id)
DELETE FROM public.linkedin_boolean_search a
USING public.linkedin_boolean_search b
WHERE a.id > b.id 
  AND a.linkedin_id = b.linkedin_id 
  AND a.job_id = b.job_id
  AND a.linkedin_id IS NOT NULL 
  AND a.job_id IS NOT NULL;

-- Add unique constraint on linkedin_id and job_id combination
ALTER TABLE public.linkedin_boolean_search 
ADD CONSTRAINT linkedin_boolean_search_linkedin_id_job_id_key 
UNIQUE (linkedin_id, job_id);