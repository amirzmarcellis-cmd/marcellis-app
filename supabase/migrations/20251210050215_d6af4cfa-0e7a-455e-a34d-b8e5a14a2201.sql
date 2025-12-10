-- Update Shortlisted candidates (score ≥ 75 with shortlisted_at) to "Call Done"
UPDATE "Jobs_CVs"
SET contacted = 'Call Done'
WHERE job_id = 'me-j-0150'
  AND after_call_score >= 75
  AND shortlisted_at IS NOT NULL;

-- Update Low scored candidates (score > 1 AND score < 75) to "Low Scored"
UPDATE "Jobs_CVs"
SET contacted = 'Low Scored'
WHERE job_id = 'me-j-0150'
  AND after_call_score > 1
  AND after_call_score < 75;

-- Update candidates with callcount > 1 (and not already updated) to "Contacted"
UPDATE "Jobs_CVs"
SET contacted = 'Contacted'
WHERE job_id = 'me-j-0150'
  AND callcount > 1
  AND (after_call_score IS NULL OR after_call_score <= 1);

-- Update candidates with callcount = 0 (or NULL) to "Ready to Contact"
UPDATE "Jobs_CVs"
SET contacted = 'Ready to Contact'
WHERE job_id = 'me-j-0150'
  AND (callcount = 0 OR callcount IS NULL)
  AND (after_call_score IS NULL OR after_call_score <= 1);