-- Add vapi_ai_assistant column to Jobs table
ALTER TABLE "Jobs" ADD COLUMN IF NOT EXISTS vapi_ai_assistant text;