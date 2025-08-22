-- Restore accidentally deleted candidates from audit table
INSERT INTO "Jobs_CVs" (
  "Candidate_ID", "agency_experience", "callcount", "callid", "candidate_email", 
  "candidate_name", "candidate_phone_number", "company_id", "cons", "contacted", 
  "current_salary", "cv_link", "duration", "group_id", "job_id", "lastcalltime", 
  "longlisted_at", "notes", "notes_updated_at", "notes_updated_by", "notice_period", 
  "pros", "recording", "relatable_cv", "salary_expectations", "score_and_reason", 
  "shortlisted_at", "success_score", "summary", "transcript", "two_questions_of_interview"
)
SELECT 
  (original_record->>'Candidate_ID')::text,
  COALESCE((original_record->>'agency_experience')::text, ''),
  COALESCE((original_record->>'callcount')::numeric, 0),
  (original_record->>'callid')::bigint,
  (original_record->>'candidate_email')::text,
  (original_record->>'candidate_name')::text,
  (original_record->>'candidate_phone_number')::text,
  (original_record->>'company_id')::uuid,
  (original_record->>'cons')::text,
  (original_record->>'contacted')::text,
  (original_record->>'current_salary')::text,
  (original_record->>'cv_link')::text,
  (original_record->>'duration')::text,
  CASE 
    WHEN original_record->>'group_id' = '<nil>' OR original_record->>'group_id' IS NULL 
    THEN NULL 
    ELSE (original_record->>'group_id')::numeric 
  END,
  (original_record->>'job_id')::text,
  CASE 
    WHEN original_record->>'lastcalltime' IS NOT NULL 
    THEN (original_record->>'lastcalltime')::timestamp with time zone 
    ELSE NULL 
  END,
  CASE 
    WHEN original_record->>'longlisted_at' IS NOT NULL 
    THEN (original_record->>'longlisted_at')::timestamp with time zone 
    ELSE NULL 
  END,
  CASE 
    WHEN original_record->>'notes' = '<nil>' OR original_record->>'notes' IS NULL 
    THEN NULL 
    ELSE (original_record->>'notes')::text 
  END,
  CASE 
    WHEN original_record->>'notes_updated_at' = '<nil>' OR original_record->>'notes_updated_at' IS NULL 
    THEN NULL 
    ELSE (original_record->>'notes_updated_at')::timestamp with time zone 
  END,
  CASE 
    WHEN original_record->>'notes_updated_by' = '<nil>' OR original_record->>'notes_updated_by' IS NULL 
    THEN NULL 
    ELSE (original_record->>'notes_updated_by')::uuid 
  END,
  (original_record->>'notice_period')::text,
  (original_record->>'pros')::text,
  (original_record->>'recording')::text,
  (original_record->>'relatable_cv')::text,
  (original_record->>'salary_expectations')::text,
  (original_record->>'score_and_reason')::text,
  CASE 
    WHEN original_record->>'shortlisted_at' = '<nil>' OR original_record->>'shortlisted_at' IS NULL 
    THEN NULL 
    ELSE (original_record->>'shortlisted_at')::timestamp with time zone 
  END,
  (original_record->>'success_score')::text,
  (original_record->>'summary')::text,
  (original_record->>'transcript')::text,
  (original_record->>'two_questions_of_interview')::text
FROM deleted_jobs_cvs_audit 
WHERE deleted_at >= NOW() - INTERVAL '1 hour'
AND (original_record->>'job_id')::text = 'DMS-J-0001'
ON CONFLICT ("callid") DO NOTHING;