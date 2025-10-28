-- Drop the restrictive insert policy for Jobs
DROP POLICY IF EXISTS "Admins and Management can insert jobs" ON "Jobs";

-- Create new policy allowing all authenticated users to insert jobs
CREATE POLICY "Authenticated users can insert jobs"
ON "Jobs"
FOR INSERT
TO authenticated
WITH CHECK (true);