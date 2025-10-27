-- Drop the restrictive policies for EMPLOYEE users and add broader access

-- For Jobs table: Allow all authenticated users to view all jobs
DROP POLICY IF EXISTS "Users can view their assigned jobs" ON "Jobs";
DROP POLICY IF EXISTS "Team leaders can view team jobs" ON "Jobs";

CREATE POLICY "All authenticated users can view all jobs"
ON "Jobs"
FOR SELECT
TO authenticated
USING (true);

-- Allow EMPLOYEE users to update their assigned jobs (keep this restriction)
-- This policy already exists and is fine

-- For Jobs_CVs table: Allow all authenticated users to view all candidate data
DROP POLICY IF EXISTS "Users can view Jobs_CVs for their assigned jobs" ON "Jobs_CVs";

CREATE POLICY "All authenticated users can view all Jobs_CVs"
ON "Jobs_CVs"
FOR SELECT
TO authenticated
USING (true);