-- Backfill rejected_at for candidates that were rejected before the column was properly set
UPDATE "Jobs_CVs"
SET rejected_at = COALESCE(
  -- Try to use notes_updated_at if it looks like a timestamp
  CASE WHEN notes_updated_at ~ '^\d{4}-\d{2}-\d{2}' THEN notes_updated_at::timestamp with time zone ELSE NULL END,
  -- Otherwise use current timestamp as fallback
  NOW()
)
WHERE contacted = 'Rejected' AND rejected_at IS NULL;

-- Backfill submitted_at for candidates that were submitted before the column was properly set
UPDATE "Jobs_CVs"
SET submitted_at = COALESCE(
  CASE WHEN notes_updated_at ~ '^\d{4}-\d{2}-\d{2}' THEN notes_updated_at::timestamp with time zone ELSE NULL END,
  NOW()
)
WHERE contacted = 'Submitted' AND submitted_at IS NULL;