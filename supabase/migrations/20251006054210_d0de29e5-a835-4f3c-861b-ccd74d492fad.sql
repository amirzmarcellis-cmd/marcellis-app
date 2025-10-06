-- Add formatted_cv column to CVs table
ALTER TABLE public."CVs" 
ADD COLUMN formatted_cv text;