-- Drop existing delete policy
DROP POLICY IF EXISTS "Admins and Management can delete jobs" ON "Jobs";

-- Create new policy allowing Admins, Management, and job creators to delete jobs
CREATE POLICY "Users can delete their own jobs or admins can delete all"
ON "Jobs"
FOR DELETE
USING (
  has_org_role(auth.uid(), 'ADMIN'::org_role) OR 
  has_org_role(auth.uid(), 'MANAGEMENT'::org_role) OR
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.user_id = auth.uid()
      AND (
        "Jobs".recruiter_id = profiles.linkedin_id OR
        "Jobs".recruiter_id = profiles.user_id::text OR
        "Jobs".assignment = profiles.email
      )
  )
);