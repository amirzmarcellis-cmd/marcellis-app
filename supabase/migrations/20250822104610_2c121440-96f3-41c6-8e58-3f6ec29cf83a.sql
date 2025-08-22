-- Update Amir Ziani's candidate ID to use Ocean company format
UPDATE "CVs" 
SET candidate_id = 'OCEAN-C-0001'
WHERE candidate_id = 'DMS-C-6253' AND first_name = 'Amir' AND last_name = 'Ziani';