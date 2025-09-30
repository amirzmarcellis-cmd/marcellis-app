-- Add status column to Jobs table to track paused jobs
ALTER TABLE "Jobs" ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON "Jobs"(status);

-- Add comment for documentation
COMMENT ON COLUMN "Jobs".status IS 'Job status: active, paused, completed, archived';