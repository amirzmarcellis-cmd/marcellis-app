-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anonymous users can upload CVs" ON storage.objects;
DROP POLICY IF EXISTS "Public users can view CVs" ON storage.objects;

-- Allow anonymous users to upload CVs to the storage bucket
CREATE POLICY "Anonymous users can upload CVs"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'cvs');

-- Allow anyone to read CVs from the storage bucket (since bucket is public)
CREATE POLICY "Public users can view CVs"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'cvs');