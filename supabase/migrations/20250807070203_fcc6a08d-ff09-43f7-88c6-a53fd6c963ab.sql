-- Modify the "Applied for" field in CVs table to support multiple job IDs
ALTER TABLE "CVs" 
ALTER COLUMN "Applied for" TYPE text[] USING 
  CASE 
    WHEN "Applied for" IS NULL OR "Applied for" = '' THEN NULL
    ELSE ARRAY["Applied for"]
  END;