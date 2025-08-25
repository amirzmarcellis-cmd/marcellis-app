-- Add automatic_dial field to companies table with default true
ALTER TABLE public.companies 
ADD COLUMN automatic_dial boolean NOT NULL DEFAULT true;