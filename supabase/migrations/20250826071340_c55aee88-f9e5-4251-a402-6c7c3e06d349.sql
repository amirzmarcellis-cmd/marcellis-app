-- Add slug column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN slug text UNIQUE;

-- Add a comment to explain the slug purpose
COMMENT ON COLUMN public.profiles.slug IS 'Company slug used for generating job IDs in format {slug}-j-{number}';

-- Create an index for better performance on slug lookups
CREATE INDEX idx_profiles_slug ON public.profiles(slug);