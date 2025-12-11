-- Add default value to updated_time column
ALTER TABLE public.linkedin_campaigns 
ALTER COLUMN updated_time SET DEFAULT now();