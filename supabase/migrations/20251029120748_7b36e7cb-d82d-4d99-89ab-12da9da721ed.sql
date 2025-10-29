-- Drop existing restrictive delete policy
DROP POLICY IF EXISTS "Admins can delete jobs" ON "Jobs";

-- Create new policy allowing Admins and Management to delete jobs
CREATE POLICY "Admins and Management can delete jobs"
ON "Jobs"
FOR DELETE
USING (
  has_org_role(auth.uid(), 'ADMIN'::org_role) OR 
  has_org_role(auth.uid(), 'MANAGEMENT'::org_role)
);