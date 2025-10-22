-- Add companies_to_exclude column to Jobs table
ALTER TABLE "Jobs"
ADD COLUMN companies_to_exclude text;