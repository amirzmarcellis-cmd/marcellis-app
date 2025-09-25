-- Check for any remaining policies on tables that might not have RLS enabled
-- Based on the table list, these might still have policies without RLS

-- Check candidates table - might have policies but not RLS enabled at table level
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('candidates', 'CVs_duplicate', 'user_roles', 'Jobs_CVs', 'linkedin_boolean_search', 'Jobs', 'groups');