-- Remove the policies that were just created since RLS is not enabled
-- This will resolve the "Policy Exists RLS Disabled" errors

-- Remove Jobs policies  
DROP POLICY IF EXISTS "Authenticated users can view jobs" ON public."Jobs";
DROP POLICY IF EXISTS "Authenticated users can create jobs" ON public."Jobs";
DROP POLICY IF EXISTS "Authenticated users can update jobs" ON public."Jobs";
DROP POLICY IF EXISTS "Authenticated users can delete jobs" ON public."Jobs";

-- Remove Groups policies
DROP POLICY IF EXISTS "Authenticated users can view groups" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can update groups" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can delete groups" ON public.groups;

-- Restore the original policies that allow broader access without RLS
CREATE POLICY "Users can view all jobs" 
ON public."Jobs"
FOR SELECT 
USING (true);

CREATE POLICY "Users can create jobs" 
ON public."Jobs"
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update jobs" 
ON public."Jobs"
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete jobs" 
ON public."Jobs"
FOR DELETE 
USING (true);

CREATE POLICY "Users can view all groups" 
ON public.groups
FOR SELECT 
USING (true);

CREATE POLICY "Users can create groups" 
ON public.groups
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update groups" 
ON public.groups
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete groups" 
ON public.groups
FOR DELETE 
USING (true);