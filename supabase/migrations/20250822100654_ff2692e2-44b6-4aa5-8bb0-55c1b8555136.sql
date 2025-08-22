-- Fix the candidate Amir Ziani that was created without company_id
UPDATE "CVs" 
SET company_id = 'd6047151-290e-4a59-ac8f-9e541ace16aa'
WHERE candidate_id = 'DMS-C-6253' 
AND company_id IS NULL;