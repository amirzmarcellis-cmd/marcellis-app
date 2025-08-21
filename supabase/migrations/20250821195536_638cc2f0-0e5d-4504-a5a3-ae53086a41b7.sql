-- Add admin@goonyx.ai as company admin for DMS company
INSERT INTO public.company_users (user_id, company_id, role, joined_at, invited_at)
VALUES (
  'd452eb93-c9ab-4abb-8f6e-23f603f8ac00',  -- admin@goonyx.ai user_id
  'd6047151-290e-4a59-ac8f-9e541ace16aa',  -- DMS company_id
  'company_admin',
  now(),
  now()
)
ON CONFLICT (user_id, company_id) 
DO UPDATE SET 
  role = 'company_admin',
  joined_at = now();