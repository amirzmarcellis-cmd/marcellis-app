UPDATE "Jobs"
SET longlist_more = false
WHERE longlist_more = true
  AND (
    SELECT COUNT(*)
    FROM "Jobs_CVs"
    WHERE "Jobs_CVs".job_id = "Jobs".job_id
  ) >= 150;