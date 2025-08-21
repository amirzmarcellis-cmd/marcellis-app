-- Phase 1: Multi-tenant SaaS transformation
-- Create enhanced role system for multi-tenancy
DROP TYPE IF EXISTS app_role CASCADE;
CREATE TYPE app_role AS ENUM ('platform_admin', 'company_admin', 'manager', 'recruiter');

-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  plan_type TEXT DEFAULT 'trial',
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create company subscriptions table
CREATE TABLE public.company_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'trial',
  status TEXT NOT NULL DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create company users junction table
CREATE TABLE public.company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  invited_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, user_id, role)
);

-- Add company_id to existing tables
ALTER TABLE public.profiles ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public."Jobs" ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public."CVs" ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public."Jobs_CVs" ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.call_logs ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.tasks ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.task_candidates ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.status_history ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.activity_logs ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.comments ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.file_uploads ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.interview ADD COLUMN company_id UUID REFERENCES public.companies(id);

-- Enable RLS on new tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;

-- Create updated has_role function for multi-tenancy
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role, _company_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_users cu
    WHERE cu.user_id = _user_id
      AND cu.role = _role
      AND (_company_id IS NULL OR cu.company_id = _company_id)
  )
$$;

-- Create function to get user's companies
CREATE OR REPLACE FUNCTION public.get_user_companies(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT company_id
  FROM public.company_users
  WHERE user_id = _user_id
$$;

-- Create function to get user's current company (first one for now)
CREATE OR REPLACE FUNCTION public.get_current_company(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT company_id
  FROM public.company_users
  WHERE user_id = _user_id
  ORDER BY joined_at ASC, invited_at ASC
  LIMIT 1
$$;

-- RLS Policies for companies table
CREATE POLICY "Users can view companies they belong to" ON public.companies
FOR SELECT
TO authenticated
USING (id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Platform admins can manage all companies" ON public.companies
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'platform_admin'));

CREATE POLICY "Company admins can update their company" ON public.companies
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'company_admin', id));

-- RLS Policies for company_subscriptions table
CREATE POLICY "Users can view subscriptions for their companies" ON public.company_subscriptions
FOR SELECT
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Platform admins can manage all subscriptions" ON public.company_subscriptions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'platform_admin'));

CREATE POLICY "Company admins can view their subscription" ON public.company_subscriptions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'company_admin', company_id));

-- RLS Policies for company_users table
CREATE POLICY "Users can view company users for their companies" ON public.company_users
FOR SELECT
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Platform admins can manage all company users" ON public.company_users
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'platform_admin'));

CREATE POLICY "Company admins can manage users in their company" ON public.company_users
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'company_admin', company_id));

-- Update profiles RLS policies for multi-tenancy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins and admins can view all users" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can view profiles in their companies" ON public.profiles
FOR SELECT
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Platform admins can view all profiles" ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'platform_admin'));

-- Update Jobs RLS policies for multi-tenancy
DROP POLICY IF EXISTS "Allow public read access to Jobs" ON public."Jobs";
DROP POLICY IF EXISTS "Allow public write access to Jobs" ON public."Jobs";
DROP POLICY IF EXISTS "Allow public update access to Jobs" ON public."Jobs";
DROP POLICY IF EXISTS "Allow authenticated users to delete Jobs" ON public."Jobs";

CREATE POLICY "Users can view jobs in their companies" ON public."Jobs"
FOR SELECT
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can create jobs in their companies" ON public."Jobs"
FOR INSERT
TO authenticated
WITH CHECK (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can update jobs in their companies" ON public."Jobs"
FOR UPDATE
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can delete jobs in their companies" ON public."Jobs"
FOR DELETE
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Public can view jobs for application" ON public."Jobs"
FOR SELECT
TO anon
USING (true);

-- Update CVs RLS policies for multi-tenancy
DROP POLICY IF EXISTS "Allow authenticated users to read CVs" ON public."CVs";
DROP POLICY IF EXISTS "Allow authenticated users to insert CVs" ON public."CVs";
DROP POLICY IF EXISTS "Allow authenticated users to update CVs" ON public."CVs";
DROP POLICY IF EXISTS "Public can submit CV applications (anon insert)" ON public."CVs";

CREATE POLICY "Users can view CVs in their companies" ON public."CVs"
FOR SELECT
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Users can create CVs in their companies" ON public."CVs"
FOR INSERT
TO authenticated
WITH CHECK (company_id = get_current_company(auth.uid()));

CREATE POLICY "Users can update CVs in their companies" ON public."CVs"
FOR UPDATE
TO authenticated
USING (company_id IN (SELECT get_user_companies(auth.uid())));

CREATE POLICY "Public can submit CV applications" ON public."CVs"
FOR INSERT
TO anon
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_companies_subdomain ON public.companies(subdomain);
CREATE INDEX idx_company_users_user_id ON public.company_users(user_id);
CREATE INDEX idx_company_users_company_id ON public.company_users(company_id);
CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX idx_jobs_company_id ON public."Jobs"(company_id);
CREATE INDEX idx_cvs_company_id ON public."CVs"(company_id);
CREATE INDEX idx_jobs_cvs_company_id ON public."Jobs_CVs"(company_id);

-- Create a default company for existing data migration
INSERT INTO public.companies (name, subdomain, plan_type) 
VALUES ('Default Company', 'default', 'enterprise');

-- Get the default company ID for data migration
DO $$
DECLARE
    default_company_id UUID;
BEGIN
    SELECT id INTO default_company_id FROM public.companies WHERE subdomain = 'default';
    
    -- Update existing data to belong to default company
    UPDATE public.profiles SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public."Jobs" SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public."CVs" SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public."Jobs_CVs" SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public.call_logs SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public.tasks SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public.task_candidates SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public.status_history SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public.activity_logs SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public.comments SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public.file_uploads SET company_id = default_company_id WHERE company_id IS NULL;
    UPDATE public.interview SET company_id = default_company_id WHERE company_id IS NULL;
    
    -- Create company_users entries for existing users
    INSERT INTO public.company_users (company_id, user_id, role, joined_at)
    SELECT default_company_id, user_id, 'company_admin', now()
    FROM public.profiles
    WHERE user_id IS NOT NULL
    ON CONFLICT (company_id, user_id, role) DO NOTHING;
END $$;