-- Enable RLS policies for Jobs table
-- Allow authenticated users to view jobs based on their role and assignment

-- Admins and Management can view all jobs
CREATE POLICY "Admins and Management can view all jobs"
ON "Jobs"
FOR SELECT
TO authenticated
USING (
  has_org_role(auth.uid(), 'ADMIN'::org_role) OR 
  has_org_role(auth.uid(), 'MANAGEMENT'::org_role)
);

-- Team leaders can view jobs assigned to their team members
CREATE POLICY "Team leaders can view team jobs"
ON "Jobs"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memberships m
    JOIN profiles p ON p.user_id = auth.uid()
    WHERE m.user_id = auth.uid()
      AND m.role = 'TEAM_LEADER'::user_role
      AND "Jobs".recruiter_id = p.linkedin_id
  )
);

-- Users can view jobs assigned to them
CREATE POLICY "Users can view their assigned jobs"
ON "Jobs"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
      AND "Jobs".recruiter_id = profiles.linkedin_id
  )
);

-- Admins and Management can insert jobs
CREATE POLICY "Admins and Management can insert jobs"
ON "Jobs"
FOR INSERT
TO authenticated
WITH CHECK (
  has_org_role(auth.uid(), 'ADMIN'::org_role) OR 
  has_org_role(auth.uid(), 'MANAGEMENT'::org_role)
);

-- Admins and Management can update all jobs
CREATE POLICY "Admins and Management can update all jobs"
ON "Jobs"
FOR UPDATE
TO authenticated
USING (
  has_org_role(auth.uid(), 'ADMIN'::org_role) OR 
  has_org_role(auth.uid(), 'MANAGEMENT'::org_role)
);

-- Users can update their assigned jobs
CREATE POLICY "Users can update their assigned jobs"
ON "Jobs"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
      AND "Jobs".recruiter_id = profiles.linkedin_id
  )
);

-- Admins can delete jobs
CREATE POLICY "Admins can delete jobs"
ON "Jobs"
FOR DELETE
TO authenticated
USING (
  has_org_role(auth.uid(), 'ADMIN'::org_role)
);