-- Enable Row Level Security on Jobs table
ALTER TABLE public."Jobs" ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all jobs
CREATE POLICY "Users can view all jobs" 
ON public."Jobs" 
FOR SELECT 
TO authenticated
USING (true);

-- Allow authenticated users to insert jobs
CREATE POLICY "Users can create jobs" 
ON public."Jobs" 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update jobs
CREATE POLICY "Users can update jobs" 
ON public."Jobs" 
FOR UPDATE 
TO authenticated
USING (true);

-- Allow authenticated users to delete jobs
CREATE POLICY "Users can delete jobs" 
ON public."Jobs" 
FOR DELETE 
TO authenticated
USING (true);