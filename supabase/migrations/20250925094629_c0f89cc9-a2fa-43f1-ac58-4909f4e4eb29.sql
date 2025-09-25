-- Remove all policies from tables that don't have RLS enabled to resolve security warnings
-- This addresses "Policy Exists RLS Disabled" errors

-- Check and remove policies from Jobs_CVs table (no RLS)
DROP POLICY IF EXISTS "Authenticated users can view Jobs_CVs" ON public."Jobs_CVs";
DROP POLICY IF EXISTS "Authenticated users can insert Jobs_CVs" ON public."Jobs_CVs";  
DROP POLICY IF EXISTS "Authenticated users can update Jobs_CVs" ON public."Jobs_CVs";
DROP POLICY IF EXISTS "Authenticated users can delete Jobs_CVs" ON public."Jobs_CVs";

-- Check and remove policies from linkedin_boolean_search table (no RLS)
DROP POLICY IF EXISTS "Authenticated users can view linkedin_boolean_search" ON public.linkedin_boolean_search;
DROP POLICY IF EXISTS "Authenticated users can insert linkedin_boolean_search" ON public.linkedin_boolean_search;
DROP POLICY IF EXISTS "Authenticated users can update linkedin_boolean_search" ON public.linkedin_boolean_search;
DROP POLICY IF EXISTS "Authenticated users can delete linkedin_boolean_search" ON public.linkedin_boolean_search;

-- Check and remove policies from user_roles table (no RLS) 
DROP POLICY IF EXISTS "Authenticated users can view user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can insert user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can update user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can delete user_roles" ON public.user_roles;

-- Check and remove policies from CVs_duplicate table (no RLS)
DROP POLICY IF EXISTS "Authenticated users can view CVs_duplicate" ON public."CVs_duplicate";
DROP POLICY IF EXISTS "Authenticated users can insert CVs_duplicate" ON public."CVs_duplicate";
DROP POLICY IF EXISTS "Authenticated users can update CVs_duplicate" ON public."CVs_duplicate";
DROP POLICY IF EXISTS "Authenticated users can delete CVs_duplicate" ON public."CVs_duplicate";