-- Allow authenticated users to delete jobs (note: table name is case-sensitive)
CREATE POLICY "Allow authenticated users to delete Jobs" 
ON public."Jobs" 
FOR DELETE 
USING (auth.uid() IS NOT NULL);