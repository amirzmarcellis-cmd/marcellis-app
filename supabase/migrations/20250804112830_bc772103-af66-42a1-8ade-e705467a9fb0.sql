-- Create policies for public access to CVs table (since this appears to be a recruitment tool that may need public access)
CREATE POLICY "Allow public read access to CVs" 
ON public."CVs" 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public write access to CVs" 
ON public."CVs" 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to CVs" 
ON public."CVs" 
FOR UPDATE 
USING (true);

-- Create policies for public access to Jobs table
CREATE POLICY "Allow public read access to Jobs" 
ON public."Jobs" 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public write access to Jobs" 
ON public."Jobs" 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to Jobs" 
ON public."Jobs" 
FOR UPDATE 
USING (true);

-- Create policies for public access to Jobs_CVs table
CREATE POLICY "Allow public read access to Jobs_CVs" 
ON public."Jobs_CVs" 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public write access to Jobs_CVs" 
ON public."Jobs_CVs" 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to Jobs_CVs" 
ON public."Jobs_CVs" 
FOR UPDATE 
USING (true);