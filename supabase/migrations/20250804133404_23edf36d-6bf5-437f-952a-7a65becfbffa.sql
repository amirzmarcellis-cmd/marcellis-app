-- Create RLS policies for CVs table to allow authenticated users to read data
CREATE POLICY "Allow authenticated users to read CVs" 
ON "CVs" 
FOR SELECT 
TO authenticated
USING (true);

-- Create RLS policies for Jobs_CVs table to allow authenticated users to read data
CREATE POLICY "Allow authenticated users to read Jobs_CVs" 
ON "Jobs_CVs" 
FOR SELECT 
TO authenticated
USING (true);

-- Also create policies for authenticated users to insert/update if needed
CREATE POLICY "Allow authenticated users to insert CVs" 
ON "CVs" 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update CVs" 
ON "CVs" 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert Jobs_CVs" 
ON "Jobs_CVs" 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update Jobs_CVs" 
ON "Jobs_CVs" 
FOR UPDATE 
TO authenticated
USING (true);