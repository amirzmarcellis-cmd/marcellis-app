-- Fix the Ocean user profile to have the correct company_id
UPDATE profiles 
SET company_id = 'e2bf7296-2d99-43d0-b357-0cda2c202399'
WHERE user_id = '328894ce-f352-4e70-9ae6-55d17b038680' AND company_id IS NULL;