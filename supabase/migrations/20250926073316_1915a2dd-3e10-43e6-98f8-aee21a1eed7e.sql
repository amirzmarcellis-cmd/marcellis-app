-- Add done_questions column to CVs table
ALTER TABLE public."CVs" 
ADD COLUMN done_questions boolean DEFAULT false;