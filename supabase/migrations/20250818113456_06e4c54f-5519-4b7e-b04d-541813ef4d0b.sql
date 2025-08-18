-- Add new enum values one by one and commit them
-- First add super_admin
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Then add manager
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';