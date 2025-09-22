-- Enable RLS on CVs table
ALTER TABLE public."CVs" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for CVs table
-- Allow authenticated users to view all CVs
CREATE POLICY "Authenticated users can view CVs" 
ON public."CVs" 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert CVs
CREATE POLICY "Authenticated users can insert CVs" 
ON public."CVs" 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update CVs
CREATE POLICY "Authenticated users can update CVs" 
ON public."CVs" 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete CVs
CREATE POLICY "Authenticated users can delete CVs" 
ON public."CVs" 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Enable RLS on CVs_duplicate table
ALTER TABLE public."CVs_duplicate" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for CVs_duplicate table
CREATE POLICY "Authenticated users can view CVs_duplicate" 
ON public."CVs_duplicate" 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert CVs_duplicate" 
ON public."CVs_duplicate" 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update CVs_duplicate" 
ON public."CVs_duplicate" 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete CVs_duplicate" 
ON public."CVs_duplicate" 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Enable RLS on candidates table
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for candidates table
CREATE POLICY "Authenticated users can view candidates" 
ON public.candidates 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert candidates" 
ON public.candidates 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update candidates" 
ON public.candidates 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete candidates" 
ON public.candidates 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles table
CREATE POLICY "Authenticated users can view user_roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert user_roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update user_roles" 
ON public.user_roles 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete user_roles" 
ON public.user_roles 
FOR DELETE 
USING (auth.role() = 'authenticated');