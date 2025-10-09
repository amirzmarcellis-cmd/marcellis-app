-- Add headhunting_companies column to Jobs table
ALTER TABLE "Jobs" ADD COLUMN IF NOT EXISTS "headhunting_companies" text;