-- Allow anonymous users to view Jobs_CVs records for the call candidate flow
-- This is needed because webhook links from emails/SMS/LinkedIn are accessed by unauthenticated users
CREATE POLICY "Public users can view Jobs_CVs for call candidate flow"
ON "Jobs_CVs"
FOR SELECT
TO anon
USING (true);