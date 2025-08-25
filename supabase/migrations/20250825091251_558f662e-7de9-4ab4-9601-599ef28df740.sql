-- Add automatic_dial field to Jobs table
ALTER TABLE public."Jobs" 
ADD COLUMN automatic_dial boolean NOT NULL DEFAULT false;