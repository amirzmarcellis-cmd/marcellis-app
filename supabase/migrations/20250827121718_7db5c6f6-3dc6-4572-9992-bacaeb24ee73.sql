-- Add itris_job_id column to Jobs table
ALTER TABLE public.Jobs 
ADD COLUMN itris_job_id text;