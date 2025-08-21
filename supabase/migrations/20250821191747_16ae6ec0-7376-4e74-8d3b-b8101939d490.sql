-- Comprehensive fix for company data isolation
-- Ensure all tables have proper RLS policies that respect company boundaries

-- First, let's make sure all tables have RLS enabled
ALTER TABLE public."CVs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Jobs_CVs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be interfering and recreate them properly
-- This ensures clean, consistent policies across all tables

-- CVs table policies
DROP POLICY IF EXISTS "Users can view CVs in their companies" ON public."CVs";
DROP POLICY IF EXISTS "Users can create CVs in their companies" ON public."CVs";
DROP POLICY IF EXISTS "Users can update CVs in their companies" ON public."CVs";
DROP POLICY IF EXISTS "Public can submit CV applications" ON public."CVs";

CREATE POLICY "Users can view CVs in their companies" ON public."CVs"
FOR SELECT USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can create CVs in their companies" ON public."CVs"
FOR INSERT WITH CHECK (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can update CVs in their companies" ON public."CVs"
FOR UPDATE USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Public can submit CV applications" ON public."CVs"
FOR INSERT WITH CHECK (true);

-- Jobs table policies  
DROP POLICY IF EXISTS "Users can view jobs in their companies" ON public."Jobs";
DROP POLICY IF EXISTS "Users can create jobs in their companies" ON public."Jobs";
DROP POLICY IF EXISTS "Users can update jobs in their companies" ON public."Jobs";
DROP POLICY IF EXISTS "Users can delete jobs in their companies" ON public."Jobs";
DROP POLICY IF EXISTS "Public can view jobs for application" ON public."Jobs";

CREATE POLICY "Users can view jobs in their companies" ON public."Jobs"
FOR SELECT USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can create jobs in their companies" ON public."Jobs"
FOR INSERT WITH CHECK (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can update jobs in their companies" ON public."Jobs"
FOR UPDATE USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can delete jobs in their companies" ON public."Jobs"
FOR DELETE USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Public can view jobs for application" ON public."Jobs"
FOR SELECT USING (true);

-- Jobs_CVs table policies
DROP POLICY IF EXISTS "Users can view Jobs_CVs in their companies" ON public."Jobs_CVs";
DROP POLICY IF EXISTS "Users can create Jobs_CVs in their companies" ON public."Jobs_CVs";
DROP POLICY IF EXISTS "Users can update Jobs_CVs in their companies" ON public."Jobs_CVs";

CREATE POLICY "Users can view Jobs_CVs in their companies" ON public."Jobs_CVs"
FOR SELECT USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can create Jobs_CVs in their companies" ON public."Jobs_CVs"
FOR INSERT WITH CHECK (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can update Jobs_CVs in their companies" ON public."Jobs_CVs"
FOR UPDATE USING (company_id IN (SELECT get_user_companies(auth.uid())));

-- Call logs policies
DROP POLICY IF EXISTS "Users can view call logs in their companies" ON public.call_logs;
DROP POLICY IF EXISTS "Users can create call logs in their companies" ON public.call_logs;
DROP POLICY IF EXISTS "Users can update their call logs in their companies" ON public.call_logs;

CREATE POLICY "Users can view call logs in their companies" ON public.call_logs
FOR SELECT USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can create call logs in their companies" ON public.call_logs
FOR INSERT WITH CHECK (company_id IN (SELECT get_user_companies(auth.uid())) AND recruiter_id = auth.uid());

CREATE POLICY "Users can update their call logs in their companies" ON public.call_logs
FOR UPDATE USING (company_id IN (SELECT get_user_companies(auth.uid())) AND recruiter_id = auth.uid());

-- Interview table policies
DROP POLICY IF EXISTS "Users can view interviews in their companies" ON public.interview;
DROP POLICY IF EXISTS "Users can create interviews in their companies" ON public.interview;
DROP POLICY IF EXISTS "Users can update interviews in their companies" ON public.interview;

CREATE POLICY "Users can view interviews in their companies" ON public.interview
FOR SELECT USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can create interviews in their companies" ON public.interview
FOR INSERT WITH CHECK (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can update interviews in their companies" ON public.interview
FOR UPDATE USING (company_id IN (SELECT get_user_companies(auth.uid())));

-- Tasks table policies
DROP POLICY IF EXISTS "Users can view tasks in their companies" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks in their companies" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their tasks in their companies" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their tasks in their companies" ON public.tasks;

CREATE POLICY "Users can view tasks in their companies" ON public.tasks
FOR SELECT USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can create tasks in their companies" ON public.tasks
FOR INSERT WITH CHECK (company_id IN (SELECT get_user_companies(auth.uid())) AND created_by = auth.uid());

CREATE POLICY "Users can update their tasks in their companies" ON public.tasks
FOR UPDATE USING (company_id IN (SELECT get_user_companies(auth.uid())) AND created_by = auth.uid());

CREATE POLICY "Users can delete their tasks in their companies" ON public.tasks
FOR DELETE USING (company_id IN (SELECT get_user_companies(auth.uid())) AND created_by = auth.uid());