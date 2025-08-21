-- Fix security issues by enabling RLS and creating policies for remaining tables

-- Enable RLS on remaining tables
ALTER TABLE public."Jobs_CVs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview ENABLE ROW LEVEL SECURITY;

-- Update Jobs_CVs RLS policies for multi-tenancy
DROP POLICY IF EXISTS "Allow authenticated users to read Jobs_CVs" ON public."Jobs_CVs";
DROP POLICY IF EXISTS "Allow authenticated users to insert Jobs_CVs" ON public."Jobs_CVs";
DROP POLICY IF EXISTS "Allow authenticated users to update Jobs_CVs" ON public."Jobs_CVs";

CREATE POLICY "Users can view Jobs_CVs in their companies" ON public."Jobs_CVs"
FOR SELECT
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can create Jobs_CVs in their companies" ON public."Jobs_CVs"
FOR INSERT
TO authenticated
WITH CHECK (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can update Jobs_CVs in their companies" ON public."Jobs_CVs"
FOR UPDATE
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())));

-- Update tasks RLS policies for multi-tenancy
DROP POLICY IF EXISTS "Users can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their tasks" ON public.tasks;

CREATE POLICY "Users can view tasks in their companies" ON public.tasks
FOR SELECT
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can create tasks in their companies" ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (company_id IN (SELECT get_user_companies(auth.uid())) AND created_by = auth.uid());

CREATE POLICY "Users can update their tasks in their companies" ON public.tasks
FOR UPDATE
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())) AND created_by = auth.uid());

CREATE POLICY "Users can delete their tasks in their companies" ON public.tasks
FOR DELETE
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())) AND created_by = auth.uid());

-- Update task_candidates RLS policies for multi-tenancy
DROP POLICY IF EXISTS "Authenticated users can view task candidates" ON public.task_candidates;
DROP POLICY IF EXISTS "Authenticated users can create task candidates" ON public.task_candidates;
DROP POLICY IF EXISTS "Authenticated users can update task candidates" ON public.task_candidates;
DROP POLICY IF EXISTS "Authenticated users can delete task candidates" ON public.task_candidates;

CREATE POLICY "Users can view task candidates in their companies" ON public.task_candidates
FOR SELECT
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can create task candidates in their companies" ON public.task_candidates
FOR INSERT
TO authenticated
WITH CHECK (company_id IN (SELECT get_user_companies(auth.uid())) AND created_by = auth.uid());

CREATE POLICY "Users can update task candidates in their companies" ON public.task_candidates
FOR UPDATE
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can delete task candidates in their companies" ON public.task_candidates
FOR DELETE
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())) AND created_by = auth.uid());

-- Update status_history RLS policies for multi-tenancy
DROP POLICY IF EXISTS "Status history read" ON public.status_history;
DROP POLICY IF EXISTS "Status history insert" ON public.status_history;

CREATE POLICY "Users can view status history in their companies" ON public.status_history
FOR SELECT
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can create status history in their companies" ON public.status_history
FOR INSERT
TO authenticated
WITH CHECK (company_id IN (SELECT get_user_companies(auth.uid())) AND user_id = auth.uid());

-- Update activity_logs RLS policies for multi-tenancy
DROP POLICY IF EXISTS "Authenticated users can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Authenticated users can create activity logs" ON public.activity_logs;

CREATE POLICY "Users can view activity logs in their companies" ON public.activity_logs
FOR SELECT
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can create activity logs in their companies" ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (company_id IN (SELECT get_user_companies(auth.uid())) AND user_id = auth.uid());

-- Update comments RLS policies for multi-tenancy
DROP POLICY IF EXISTS "Authenticated users can view comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their comments" ON public.comments;

CREATE POLICY "Users can view comments in their companies" ON public.comments
FOR SELECT
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can create comments in their companies" ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (company_id IN (SELECT get_user_companies(auth.uid())) AND user_id = auth.uid());

CREATE POLICY "Users can update their comments in their companies" ON public.comments
FOR UPDATE
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())) AND user_id = auth.uid());

-- Update file_uploads RLS policies for multi-tenancy
DROP POLICY IF EXISTS "Authenticated users can view file uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "Authenticated users can create file uploads" ON public.file_uploads;

CREATE POLICY "Users can view file uploads in their companies" ON public.file_uploads
FOR SELECT
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can create file uploads in their companies" ON public.file_uploads
FOR INSERT
TO authenticated
WITH CHECK (company_id IN (SELECT get_user_companies(auth.uid())) AND uploaded_by = auth.uid());

-- Update interview RLS policies for multi-tenancy
DROP POLICY IF EXISTS "Authenticated users can view interviews" ON public.interview;
DROP POLICY IF EXISTS "Authenticated users can create interviews" ON public.interview;
DROP POLICY IF EXISTS "Authenticated users can update interviews" ON public.interview;

CREATE POLICY "Users can view interviews in their companies" ON public.interview
FOR SELECT
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can create interviews in their companies" ON public.interview
FOR INSERT
TO authenticated
WITH CHECK (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can update interviews in their companies" ON public.interview
FOR UPDATE
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())));

-- Update call_logs RLS policies for multi-tenancy
DROP POLICY IF EXISTS "Authenticated users can view call logs" ON public.call_logs;
DROP POLICY IF EXISTS "Authenticated users can create call logs" ON public.call_logs;
DROP POLICY IF EXISTS "Users can update their call logs" ON public.call_logs;

CREATE POLICY "Users can view call logs in their companies" ON public.call_logs
FOR SELECT
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can create call logs in their companies" ON public.call_logs
FOR INSERT
TO authenticated
WITH CHECK (company_id IN (SELECT get_user_companies(auth.uid())) AND recruiter_id = auth.uid());

CREATE POLICY "Users can update their call logs in their companies" ON public.call_logs
FOR UPDATE
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())) AND recruiter_id = auth.uid());

-- Fix function search path for existing functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    name = COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', profiles.name);
  RETURN new;
END;
$$;