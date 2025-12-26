-- Create admin_settings table for global lock controls
CREATE TABLE public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value BOOLEAN NOT NULL DEFAULT false,
  updated_by uuid,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings (to check if locked)
CREATE POLICY "Everyone can view admin settings"
ON public.admin_settings
FOR SELECT
USING (true);

-- Only ADMIN can update settings
CREATE POLICY "Only admins can update admin settings"
ON public.admin_settings
FOR UPDATE
USING (has_org_role(auth.uid(), 'ADMIN'))
WITH CHECK (has_org_role(auth.uid(), 'ADMIN'));

-- Insert initial settings
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES 
  ('pause_job_creation', false),
  ('pause_automatic_dial', false);