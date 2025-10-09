-- Add industry column to Jobs table
ALTER TABLE "Jobs" ADD COLUMN IF NOT EXISTS "industry" text;