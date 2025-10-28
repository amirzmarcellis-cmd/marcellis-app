-- Allow public (anonymous) users to submit job applications via the Apply page
CREATE POLICY "Public users can submit job applications"
ON "CVs"
FOR INSERT
TO anon
WITH CHECK (true);