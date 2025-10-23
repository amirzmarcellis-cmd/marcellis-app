-- Add linkedin_search_enabled column to Jobs table
ALTER TABLE "Jobs"
ADD COLUMN linkedin_search_enabled boolean DEFAULT false;