-- Pause all jobs created before December 8, 2025
UPDATE "Jobs"
SET "Processed" = 'No'
WHERE "Timestamp" IS NOT NULL 
  AND "Timestamp" != ''
  AND (
    CASE 
      WHEN "Timestamp" LIKE '%T%' THEN 
        "Timestamp"::timestamp < '2025-12-08'::timestamp
      ELSE 
        to_timestamp("Timestamp", 'YYYY-MM-DD HH24:MI') < '2025-12-08'::timestamp
    END
  );