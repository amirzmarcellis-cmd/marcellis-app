-- Enable RLS on linkedin_connection_attempts if not already enabled
ALTER TABLE linkedin_connection_attempts ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own connection attempts
CREATE POLICY "Users can insert own connection attempts"
ON linkedin_connection_attempts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);