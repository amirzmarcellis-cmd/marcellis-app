-- Create task_candidates table for tracking tasked candidates
CREATE TABLE IF NOT EXISTS public.task_candidates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  taskid text NOT NULL,
  callid bigint,
  candidate_id text NOT NULL,
  job_id text NOT NULL,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Received', 'Reviewed')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.task_candidates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view task candidates" 
ON public.task_candidates 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create task candidates" 
ON public.task_candidates 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update task candidates" 
ON public.task_candidates 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete task candidates" 
ON public.task_candidates 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_task_candidates_updated_at
BEFORE UPDATE ON public.task_candidates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_task_candidates_job_id ON public.task_candidates(job_id);
CREATE INDEX idx_task_candidates_candidate_id ON public.task_candidates(candidate_id);
CREATE INDEX idx_task_candidates_status ON public.task_candidates(status);