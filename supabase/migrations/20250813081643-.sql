-- Allow anonymous applications to be inserted into CVs
ALTER TABLE public."CVs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit CV applications (anon insert)"
ON public."CVs"
FOR INSERT
TO anon
WITH CHECK (true);
