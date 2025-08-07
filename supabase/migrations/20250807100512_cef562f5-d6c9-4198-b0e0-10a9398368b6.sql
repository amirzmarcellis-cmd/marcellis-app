-- Add new columns to Jobs table
ALTER TABLE public."Jobs" 
ADD COLUMN "Notice Period" text,
ADD COLUMN "Nationality to include" text,
ADD COLUMN "Nationality to Exclude" text,
ADD COLUMN "Type" text,
ADD COLUMN "Contract Length" text,
ADD COLUMN "Currency" text;