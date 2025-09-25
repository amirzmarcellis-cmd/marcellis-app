-- Systematically remove all policies from tables that don't have RLS enabled
-- This should resolve the remaining "Policy Exists RLS Disabled" errors

-- CVs_duplicate table (no RLS)
DROP POLICY IF EXISTS "Authenticated users can view CVs_duplicate" ON public."CVs_duplicate";
DROP POLICY IF EXISTS "Authenticated users can insert CVs_duplicate" ON public."CVs_duplicate";
DROP POLICY IF EXISTS "Authenticated users can update CVs_duplicate" ON public."CVs_duplicate";
DROP POLICY IF EXISTS "Authenticated users can delete CVs_duplicate" ON public."CVs_duplicate";

-- Jobs_CVs table (no RLS)  
DROP POLICY IF EXISTS "Authenticated users can view Jobs_CVs" ON public."Jobs_CVs";
DROP POLICY IF EXISTS "Authenticated users can insert Jobs_CVs" ON public."Jobs_CVs";
DROP POLICY IF EXISTS "Authenticated users can update Jobs_CVs" ON public."Jobs_CVs";
DROP POLICY IF EXISTS "Authenticated users can delete Jobs_CVs" ON public."Jobs_CVs";

-- linkedin_boolean_search table (no RLS)
DROP POLICY IF EXISTS "Authenticated users can view linkedin_boolean_search" ON public.linkedin_boolean_search;
DROP POLICY IF EXISTS "Authenticated users can insert linkedin_boolean_search" ON public.linkedin_boolean_search;
DROP POLICY IF EXISTS "Authenticated users can update linkedin_boolean_search" ON public.linkedin_boolean_search;
DROP POLICY IF EXISTS "Authenticated users can delete linkedin_boolean_search" ON public.linkedin_boolean_search;

-- user_roles table (no RLS)
DROP POLICY IF EXISTS "Authenticated users can view user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can insert user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can update user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can delete user_roles" ON public.user_roles;

-- Jobs table (no RLS) - double check
DROP POLICY IF EXISTS "Authenticated users can view jobs" ON public."Jobs";
DROP POLICY IF EXISTS "Authenticated users can create jobs" ON public."Jobs";
DROP POLICY IF EXISTS "Authenticated users can update jobs" ON public."Jobs";
DROP POLICY IF EXISTS "Authenticated users can delete jobs" ON public."Jobs";

-- groups table (no RLS) - double check  
DROP POLICY IF EXISTS "Authenticated users can view groups" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can update groups" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can delete groups" ON public.groups;