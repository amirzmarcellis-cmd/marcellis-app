-- Fix INSERT policies on CVs to allow public applications while keeping auth users support
-- 1) Drop restrictive INSERT policy that forces authenticated role
DROP POLICY IF EXISTS "Authenticated users can insert CVs" ON "CVs";

-- 2) Recreate it as PERMISSIVE (default) so it does not block other policies
CREATE POLICY "Authenticated users can insert CVs"
ON "CVs"
FOR INSERT
TO authenticated
WITH CHECK (true);
