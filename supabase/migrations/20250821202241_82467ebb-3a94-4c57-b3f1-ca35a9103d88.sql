-- Fix critical RLS security issues - Enable RLS on tables that have policies but RLS disabled
-- This is required to ensure data isolation works properly

-- First, let's check which tables need RLS enabled
-- Enable RLS on any public tables that have policies but no RLS

-- Common tables that might need RLS enabled:
ALTER TABLE IF EXISTS public.deleted_jobs_cvs_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.v_time_to_shortlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

-- Add basic policies for the audit table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deleted_jobs_cvs_audit' AND table_schema = 'public') THEN
    -- Only platform admins can view audit records
    DROP POLICY IF EXISTS "Platform admins can view audit records" ON public.deleted_jobs_cvs_audit;
    CREATE POLICY "Platform admins can view audit records" 
    ON public.deleted_jobs_cvs_audit FOR SELECT 
    USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_platform_admin = true));
  END IF;
END$$;