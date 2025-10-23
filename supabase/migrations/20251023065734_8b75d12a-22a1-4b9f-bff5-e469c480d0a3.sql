-- Create table for tracking LinkedIn connection attempts
CREATE TABLE IF NOT EXISTS public.linkedin_connection_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  account_id TEXT,
  error_message TEXT
);

-- Create indexes for better query performance
CREATE INDEX idx_connection_attempts_name ON public.linkedin_connection_attempts(connection_name);
CREATE INDEX idx_connection_attempts_user ON public.linkedin_connection_attempts(user_id);

-- Enable Row Level Security
ALTER TABLE public.linkedin_connection_attempts ENABLE ROW LEVEL SECURITY;

-- Users can view their own connection attempts
CREATE POLICY "Users can view own connection attempts"
  ON public.linkedin_connection_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role has full access (needed for webhook)
CREATE POLICY "Service role has full access"
  ON public.linkedin_connection_attempts
  FOR ALL
  USING (auth.role() = 'service_role');