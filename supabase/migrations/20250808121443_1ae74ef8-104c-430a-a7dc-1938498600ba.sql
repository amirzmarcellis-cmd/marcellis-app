-- Add longlist column to Jobs table
ALTER TABLE public."Jobs" 
ADD COLUMN longlist integer NOT NULL DEFAULT 0;