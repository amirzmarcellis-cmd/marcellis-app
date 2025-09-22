-- Add cv_link column to CVs table
ALTER TABLE public.CVs ADD COLUMN cv_link text;

-- Create a storage bucket for CVs that can be publicly accessed
INSERT INTO storage.buckets (id, name, public) VALUES ('cvs', 'cvs', true);

-- Create RLS policies for CV storage bucket
-- Allow anyone to view CVs (public access)
CREATE POLICY "Anyone can view CVs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cvs');

-- Allow authenticated users to upload CVs
CREATE POLICY "Authenticated users can upload CVs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cvs' AND auth.role() = 'authenticated');

-- Allow users to update their own uploaded CVs
CREATE POLICY "Users can update their own CVs" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'cvs' AND auth.role() = 'authenticated');

-- Allow users to delete their own uploaded CVs
CREATE POLICY "Users can delete their own CVs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'cvs' AND auth.role() = 'authenticated');