-- Apply auto-dial disable rule to existing records
-- Disable auto-dial for jobs that already have 6+ shortlisted candidates

UPDATE "Jobs"
SET automatic_dial = FALSE,
    auto_dial_enabled_at = NULL
WHERE automatic_dial = TRUE
  AND job_id IN (
    SELECT job_id
    FROM "Jobs_CVs"
    WHERE (after_call_score::INTEGER) >= 74
    GROUP BY job_id
    HAVING COUNT(*) >= 6
  );