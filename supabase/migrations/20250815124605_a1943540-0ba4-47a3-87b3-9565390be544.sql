-- Create sequence for interview ID
CREATE SEQUENCE IF NOT EXISTS interview_id_seq START 1;

-- Create function to generate formatted interview ID
CREATE OR REPLACE FUNCTION generate_interview_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'int-' || LPAD(nextval('interview_id_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create interview table
CREATE TABLE public.interview (
  intid TEXT PRIMARY KEY DEFAULT generate_interview_id(),
  candidate_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  callid BIGINT NOT NULL,
  appoint1 TEXT,
  appoint2 TEXT,
  appoint3 TEXT,
  inttype TEXT NOT NULL,
  intlink TEXT DEFAULT NULL,
  intstatus TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.interview ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view interviews"
ON public.interview
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create interviews"
ON public.interview
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update interviews"
ON public.interview
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_interview_updated_at
BEFORE UPDATE ON public.interview
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();