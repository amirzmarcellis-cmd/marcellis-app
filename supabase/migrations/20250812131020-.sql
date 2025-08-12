-- Allow public read and write (insert) to the 'cvs' storage bucket for the Apply form uploads
-- This enables unauthenticated applicants to upload their CVs while restricting access to the 'cvs' bucket only.

-- Public can view files in 'cvs' (defensive, in case not already allowed)
CREATE POLICY "Public can view cvs"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'cvs');

-- Public can upload files to 'cvs'
CREATE POLICY "Public can upload cvs"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'cvs');