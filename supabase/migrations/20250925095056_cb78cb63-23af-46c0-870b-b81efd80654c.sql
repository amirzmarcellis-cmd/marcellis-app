-- Check for any remaining policies on tables without RLS enabled
-- The remaining 2 "Policy Exists RLS Disabled" errors could be from these tables

-- Drop any lingering policies from Jobs table (RLS not enabled)
DROP POLICY IF EXISTS "Users can view all jobs" ON public."Jobs";
DROP POLICY IF EXISTS "Users can create jobs" ON public."Jobs"; 
DROP POLICY IF EXISTS "Users can update jobs" ON public."Jobs";
DROP POLICY IF EXISTS "Users can delete jobs" ON public."Jobs";

-- Drop any lingering policies from groups table (RLS not enabled)  
DROP POLICY IF EXISTS "Users can view all groups" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Users can update groups" ON public.groups;
DROP POLICY IF EXISTS "Users can delete groups" ON public.groups;

-- Also check if there are any policies on tables I might have missed
DROP POLICY IF EXISTS "Enable read access for all users" ON public."Jobs";
DROP POLICY IF EXISTS "Enable insert for all users" ON public."Jobs";
DROP POLICY IF EXISTS "Enable update for all users" ON public."Jobs"; 
DROP POLICY IF EXISTS "Enable delete for all users" ON public."Jobs";

DROP POLICY IF EXISTS "Enable read access for all users" ON public.groups;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.groups;
DROP POLICY IF EXISTS "Enable update for all users" ON public.groups;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.groups;