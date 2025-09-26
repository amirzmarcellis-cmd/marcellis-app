-- Add job_id column to CVs table (case-sensitive table name)
ALTER TABLE "CVs" 
ADD COLUMN job_id text;

-- Add notes column to CVs table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'CVs' AND column_name = 'notes') THEN
        ALTER TABLE "CVs" ADD COLUMN notes text;
    END IF;
END $$;