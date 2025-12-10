-- Create push_device_tokens table for storing mobile push notification tokens
CREATE TABLE public.push_device_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  device_token text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('android', 'ios')),
  email_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, device_token)
);

-- Enable RLS
ALTER TABLE public.push_device_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own tokens
CREATE POLICY "Users can manage their own push tokens"
  ON public.push_device_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_push_device_tokens_updated_at
  BEFORE UPDATE ON public.push_device_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();