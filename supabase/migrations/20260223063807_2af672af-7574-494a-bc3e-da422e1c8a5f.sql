CREATE POLICY "Authenticated users can view message history"
  ON "message history WA"
  FOR SELECT
  USING (auth.role() = 'authenticated');