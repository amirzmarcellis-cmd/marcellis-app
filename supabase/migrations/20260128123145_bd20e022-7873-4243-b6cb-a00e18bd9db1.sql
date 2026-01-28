-- First drop the existing default
ALTER TABLE "Jobs" ALTER COLUMN "Job_difficulty" DROP DEFAULT;

-- Update all existing values to 75 (as text) for safe conversion
UPDATE "Jobs" SET "Job_difficulty" = '75';

-- Change column type from text to integer
ALTER TABLE "Jobs" ALTER COLUMN "Job_difficulty" TYPE integer USING "Job_difficulty"::integer;

-- Set new default value to 75
ALTER TABLE "Jobs" ALTER COLUMN "Job_difficulty" SET DEFAULT 75;