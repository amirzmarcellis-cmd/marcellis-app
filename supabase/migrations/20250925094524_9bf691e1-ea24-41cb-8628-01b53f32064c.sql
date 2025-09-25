-- Update existing policies to be more restrictive without enabling RLS on new tables

-- Update Jobs policies to require authentication for sensitive data
DROP POLICY IF EXISTS "Users can view all jobs" ON public."Jobs";
CREATE POLICY "Authenticated users can view jobs" 
ON public."Jobs"
FOR SELECT 
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create jobs" ON public."Jobs";  
CREATE POLICY "Authenticated users can create jobs" 
ON public."Jobs"
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update jobs" ON public."Jobs";
CREATE POLICY "Authenticated users can update jobs" 
ON public."Jobs"
FOR UPDATE 
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete jobs" ON public."Jobs";
CREATE POLICY "Authenticated users can delete jobs" 
ON public."Jobs"
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Update Groups policies to require authentication  
DROP POLICY IF EXISTS "Users can view all groups" ON public.groups;
CREATE POLICY "Authenticated users can view groups" 
ON public.groups
FOR SELECT 
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
CREATE POLICY "Authenticated users can create groups" 
ON public.groups
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update groups" ON public.groups;
CREATE POLICY "Authenticated users can update groups" 
ON public.groups
FOR UPDATE 
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete groups" ON public.groups;
CREATE POLICY "Authenticated users can delete groups" 
ON public.groups
FOR DELETE 
USING (auth.role() = 'authenticated');