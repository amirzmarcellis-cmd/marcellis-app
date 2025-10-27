-- Add RLS policies to memberships table
CREATE POLICY "Admins and Management can view all memberships"
ON public.memberships
FOR SELECT
TO authenticated
USING (
  has_org_role(auth.uid(), 'ADMIN'::org_role) OR 
  has_org_role(auth.uid(), 'MANAGEMENT'::org_role)
);

CREATE POLICY "Users can view their own memberships"
ON public.memberships
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins and Management can insert memberships"
ON public.memberships
FOR INSERT
TO authenticated
WITH CHECK (
  has_org_role(auth.uid(), 'ADMIN'::org_role) OR 
  has_org_role(auth.uid(), 'MANAGEMENT'::org_role)
);

CREATE POLICY "Admins and Management can update memberships"
ON public.memberships
FOR UPDATE
TO authenticated
USING (
  has_org_role(auth.uid(), 'ADMIN'::org_role) OR 
  has_org_role(auth.uid(), 'MANAGEMENT'::org_role)
);

CREATE POLICY "Admins and Management can delete memberships"
ON public.memberships
FOR DELETE
TO authenticated
USING (
  has_org_role(auth.uid(), 'ADMIN'::org_role) OR 
  has_org_role(auth.uid(), 'MANAGEMENT'::org_role)
);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON public."Jobs"(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_cvs_job_id ON public."Jobs_CVs"(job_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_team_id ON public.memberships(team_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_linkedin_id ON public.profiles(linkedin_id);