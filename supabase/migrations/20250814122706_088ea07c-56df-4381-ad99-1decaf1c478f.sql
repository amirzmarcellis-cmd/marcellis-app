-- Add column to track who updated notes in Jobs_CVs table
ALTER TABLE public."Jobs_CVs" 
ADD COLUMN notes_updated_by uuid REFERENCES auth.users(id),
ADD COLUMN notes_updated_at timestamp with time zone;