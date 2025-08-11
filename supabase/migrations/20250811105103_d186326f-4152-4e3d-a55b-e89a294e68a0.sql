-- Enable RLS on storage.objects table (this is the correct way to handle storage RLS)
-- Note: Storage RLS is managed differently, we just need to ensure our policies are correct

-- Update storage policies to be more specific
DROP POLICY IF EXISTS "Anyone can view CVs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload CVs" ON storage.objects;  
DROP POLICY IF EXISTS "Authenticated users can update CVs" ON storage.objects;

-- Create proper storage policies for public CV access
CREATE POLICY "Public CV access"
ON storage.objects FOR SELECT
USING (bucket_id = 'cvs');

CREATE POLICY "Authenticated users can upload to CVs bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cvs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update CVs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'cvs' AND auth.uid() IS NOT NULL);