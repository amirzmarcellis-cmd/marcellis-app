-- Allow anonymous users to view Jobs records for the call candidate flow
-- This is needed to display job title on the public call candidate page
CREATE POLICY "Public users can view Jobs for call candidate flow"
ON "Jobs"
FOR SELECT
TO anon
USING (true);