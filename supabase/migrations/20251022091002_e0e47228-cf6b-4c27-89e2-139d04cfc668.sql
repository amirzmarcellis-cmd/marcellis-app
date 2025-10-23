-- Create cvs storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can upload CVs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view CVs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update CVs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete CVs" ON storage.objects;

-- Allow anyone to upload to cvs bucket
CREATE POLICY "Anyone can upload CVs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cvs');

-- Allow anyone to view CVs
CREATE POLICY "Anyone can view CVs"
ON storage.objects FOR SELECT
USING (bucket_id = 'cvs');

-- Allow anyone to update CVs
CREATE POLICY "Anyone can update CVs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'cvs');

-- Allow anyone to delete CVs
CREATE POLICY "Anyone can delete CVs"
ON storage.objects FOR DELETE
USING (bucket_id = 'cvs');