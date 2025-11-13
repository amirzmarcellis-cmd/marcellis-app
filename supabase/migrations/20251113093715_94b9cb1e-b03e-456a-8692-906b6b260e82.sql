-- Normalize existing emails in Jobs_CVs
UPDATE "Jobs_CVs"
SET candidate_email = LOWER(TRIM(candidate_email))
WHERE candidate_email IS NOT NULL 
  AND candidate_email != LOWER(TRIM(candidate_email));

-- Normalize existing emails in CVs
UPDATE "CVs"
SET email = LOWER(TRIM(email))
WHERE email IS NOT NULL 
  AND email != LOWER(TRIM(email));