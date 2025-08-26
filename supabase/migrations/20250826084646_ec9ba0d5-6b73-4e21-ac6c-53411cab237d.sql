-- Enable RLS on CVs table
ALTER TABLE public."CVs" ENABLE ROW LEVEL SECURITY;

-- Create policies for CVs table
CREATE POLICY "Users can view all CVs" 
ON public."CVs" 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create CVs" 
ON public."CVs" 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update CVs" 
ON public."CVs" 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete CVs" 
ON public."CVs" 
FOR DELETE 
USING (true);