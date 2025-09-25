-- Add recruiter_id column to Jobs table to assign jobs to specific recruiters
ALTER TABLE public."Jobs" 
ADD COLUMN recruiter_id text;

-- Add index for better query performance
CREATE INDEX idx_jobs_recruiter_id ON public."Jobs"(recruiter_id);