-- RLS Policies for Jobs_CVs table
CREATE POLICY "Admins and Management can view all Jobs_CVs"
ON "Jobs_CVs"
FOR SELECT
TO authenticated
USING (
  has_org_role(auth.uid(), 'ADMIN'::org_role) OR 
  has_org_role(auth.uid(), 'MANAGEMENT'::org_role)
);

CREATE POLICY "Users can view Jobs_CVs for their assigned jobs"
ON "Jobs_CVs"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "Jobs" j
    JOIN profiles p ON p.user_id = auth.uid()
    WHERE j.job_id = "Jobs_CVs".job_id
      AND j.recruiter_id = p.linkedin_id
  )
);

CREATE POLICY "Authenticated users can insert Jobs_CVs"
ON "Jobs_CVs"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update Jobs_CVs"
ON "Jobs_CVs"
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete Jobs_CVs"
ON "Jobs_CVs"
FOR DELETE
TO authenticated
USING (
  has_org_role(auth.uid(), 'ADMIN'::org_role)
);

-- RLS Policies for candidates table
CREATE POLICY "Authenticated users can view all candidates"
ON "candidates"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert candidates"
ON "candidates"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update candidates"
ON "candidates"
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete candidates"
ON "candidates"
FOR DELETE
TO authenticated
USING (
  has_org_role(auth.uid(), 'ADMIN'::org_role)
);

-- RLS Policies for Rejection table
CREATE POLICY "Authenticated users can view all rejections"
ON "Rejection table"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert rejections"
ON "Rejection table"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update rejections"
ON "Rejection table"
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete rejections"
ON "Rejection table"
FOR DELETE
TO authenticated
USING (
  has_org_role(auth.uid(), 'ADMIN'::org_role)
);

-- RLS Policies for linkedin_boolean_search table
CREATE POLICY "Authenticated users can view all linkedin searches"
ON "linkedin_boolean_search"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert linkedin searches"
ON "linkedin_boolean_search"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update linkedin searches"
ON "linkedin_boolean_search"
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete linkedin searches"
ON "linkedin_boolean_search"
FOR DELETE
TO authenticated
USING (
  has_org_role(auth.uid(), 'ADMIN'::org_role)
);

-- RLS Policies for CVs_duplicate table
CREATE POLICY "Authenticated users can view all CVs_duplicate"
ON "CVs_duplicate"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert CVs_duplicate"
ON "CVs_duplicate"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update CVs_duplicate"
ON "CVs_duplicate"
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete CVs_duplicate"
ON "CVs_duplicate"
FOR DELETE
TO authenticated
USING (
  has_org_role(auth.uid(), 'ADMIN'::org_role)
);

-- RLS Policies for groups_duplicate table
CREATE POLICY "Authenticated users can view all groups_duplicate"
ON "groups_duplicate"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and Management can insert groups_duplicate"
ON "groups_duplicate"
FOR INSERT
TO authenticated
WITH CHECK (
  has_org_role(auth.uid(), 'ADMIN'::org_role) OR 
  has_org_role(auth.uid(), 'MANAGEMENT'::org_role)
);

CREATE POLICY "Admins and Management can update groups_duplicate"
ON "groups_duplicate"
FOR UPDATE
TO authenticated
USING (
  has_org_role(auth.uid(), 'ADMIN'::org_role) OR 
  has_org_role(auth.uid(), 'MANAGEMENT'::org_role)
);

CREATE POLICY "Admins can delete groups_duplicate"
ON "groups_duplicate"
FOR DELETE
TO authenticated
USING (
  has_org_role(auth.uid(), 'ADMIN'::org_role)
);

-- RLS Policies for groups table
CREATE POLICY "Authenticated users can view all groups"
ON "groups"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and Management can insert groups"
ON "groups"
FOR INSERT
TO authenticated
WITH CHECK (
  has_org_role(auth.uid(), 'ADMIN'::org_role) OR 
  has_org_role(auth.uid(), 'MANAGEMENT'::org_role)
);

CREATE POLICY "Admins and Management can update groups"
ON "groups"
FOR UPDATE
TO authenticated
USING (
  has_org_role(auth.uid(), 'ADMIN'::org_role) OR 
  has_org_role(auth.uid(), 'MANAGEMENT'::org_role)
);

CREATE POLICY "Admins can delete groups"
ON "groups"
FOR DELETE
TO authenticated
USING (
  has_org_role(auth.uid(), 'ADMIN'::org_role)
);