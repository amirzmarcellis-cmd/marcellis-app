-- Drop existing user_roles table if it exists
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Create enum for organization-level roles
DO $$ BEGIN
  CREATE TYPE public.org_role AS ENUM ('ADMIN', 'MANAGEMENT', 'EMPLOYEE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create user_roles table for organization-level roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role org_role NOT NULL DEFAULT 'EMPLOYEE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check organization role
CREATE OR REPLACE FUNCTION public.has_org_role(_user_id UUID, _role org_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create security definer function to get user's organization role
CREATE OR REPLACE FUNCTION public.get_org_role(_user_id UUID)
RETURNS org_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view all organization roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins and management can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  public.has_org_role(auth.uid(), 'ADMIN') OR 
  public.has_org_role(auth.uid(), 'MANAGEMENT')
);

CREATE POLICY "Only admins and management can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_org_role(auth.uid(), 'ADMIN') OR 
  public.has_org_role(auth.uid(), 'MANAGEMENT')
);

-- Drop ALL policies that reference memberships.role before changing enum
DROP POLICY IF EXISTS "Managers can create teams" ON public.teams;
DROP POLICY IF EXISTS "Admins, Management, and Team Leaders can create teams" ON public.teams;
DROP POLICY IF EXISTS "Managers can update teams" ON public.teams;
DROP POLICY IF EXISTS "Admins, Management, and Team Leaders can update teams" ON public.teams;
DROP POLICY IF EXISTS "Managers can delete teams" ON public.teams;
DROP POLICY IF EXISTS "Admins, Management, and Team Leaders can delete teams" ON public.teams;
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;

DROP POLICY IF EXISTS "Managers can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Team Leaders can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Task updates based on role" ON public.tasks;
DROP POLICY IF EXISTS "Task visibility based on role" ON public.tasks;

DROP POLICY IF EXISTS "Users can manage their own timers" ON public.timers;

-- Remove default from memberships.role column before changing enum
ALTER TABLE public.memberships ALTER COLUMN role DROP DEFAULT;

-- Update memberships enum to use TEAM_LEADER instead of MANAGER
ALTER TYPE public.user_role RENAME TO user_role_old;
CREATE TYPE public.user_role AS ENUM ('TEAM_LEADER', 'EMPLOYEE');

-- Update existing data and column type
ALTER TABLE public.memberships 
  ALTER COLUMN role TYPE public.user_role 
  USING CASE 
    WHEN role::text = 'MANAGER' THEN 'TEAM_LEADER'::public.user_role
    ELSE 'EMPLOYEE'::public.user_role
  END;

-- Re-add default
ALTER TABLE public.memberships ALTER COLUMN role SET DEFAULT 'EMPLOYEE'::public.user_role;

-- Drop old enum
DROP TYPE public.user_role_old;

-- Update is_team_leader function
CREATE OR REPLACE FUNCTION public.is_team_leader(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships m
    JOIN teams t ON t.id = m.team_id  
    WHERE m.user_id = user_uuid 
    AND m.role = 'TEAM_LEADER'
    AND t.name IN ('Sales Team', 'Delivery Team')
  );
$$;

-- Re-create teams policies with organization roles
CREATE POLICY "Admins, Management, and Team Leaders can create teams"
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_org_role(auth.uid(), 'ADMIN') OR 
  public.has_org_role(auth.uid(), 'MANAGEMENT') OR
  EXISTS (
    SELECT 1 FROM memberships 
    WHERE user_id = auth.uid() AND role = 'TEAM_LEADER'
  )
);

CREATE POLICY "Admins, Management, and Team Leaders can update teams"
ON public.teams
FOR UPDATE
TO authenticated
USING (
  public.has_org_role(auth.uid(), 'ADMIN') OR 
  public.has_org_role(auth.uid(), 'MANAGEMENT') OR
  EXISTS (
    SELECT 1 FROM memberships 
    WHERE user_id = auth.uid() AND role = 'TEAM_LEADER'
  )
);

CREATE POLICY "Admins, Management, and Team Leaders can delete teams"
ON public.teams
FOR DELETE
TO authenticated
USING (
  public.has_org_role(auth.uid(), 'ADMIN') OR 
  public.has_org_role(auth.uid(), 'MANAGEMENT') OR
  EXISTS (
    SELECT 1 FROM memberships 
    WHERE user_id = auth.uid() AND role = 'TEAM_LEADER'
  )
);

CREATE POLICY "Team members can view their teams"
ON public.teams
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memberships 
    WHERE team_id = teams.id AND user_id = auth.uid()
  )
);

-- Re-create tasks policies
CREATE POLICY "Team Leaders can create tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_org_role(auth.uid(), 'ADMIN') OR 
  public.has_org_role(auth.uid(), 'MANAGEMENT') OR
  EXISTS (
    SELECT 1 FROM memberships 
    WHERE team_id = tasks.team_id 
    AND user_id = auth.uid() 
    AND role = 'TEAM_LEADER'
  )
);

CREATE POLICY "Task updates based on role"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
  assignee_id = auth.uid() OR
  public.has_org_role(auth.uid(), 'ADMIN') OR 
  public.has_org_role(auth.uid(), 'MANAGEMENT') OR
  EXISTS (
    SELECT 1 FROM memberships 
    WHERE team_id = tasks.team_id 
    AND user_id = auth.uid() 
    AND role = 'TEAM_LEADER'
  )
);

CREATE POLICY "Task visibility based on role"
ON public.tasks
FOR SELECT
TO authenticated
USING (
  assignee_id = auth.uid() OR
  public.has_org_role(auth.uid(), 'ADMIN') OR 
  public.has_org_role(auth.uid(), 'MANAGEMENT') OR
  EXISTS (
    SELECT 1 FROM memberships 
    WHERE team_id = tasks.team_id 
    AND user_id = auth.uid() 
    AND role = 'TEAM_LEADER'
  )
);

-- Re-create timers policy
CREATE POLICY "Users can manage their own timers"
ON public.timers
FOR ALL
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM tasks
    JOIN memberships ON memberships.team_id = tasks.team_id
    WHERE tasks.id = timers.task_id 
    AND memberships.user_id = auth.uid() 
    AND memberships.role = 'TEAM_LEADER'
  )
);

-- Create trigger to create default employee role for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, 'EMPLOYEE')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- Migrate existing is_admin users to ADMIN role
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'ADMIN'::org_role
FROM public.profiles
WHERE is_admin = true
ON CONFLICT (user_id) DO NOTHING;

-- Migrate existing non-admin users to EMPLOYEE role
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'EMPLOYEE'::org_role
FROM public.profiles
WHERE is_admin = false
ON CONFLICT (user_id) DO NOTHING;