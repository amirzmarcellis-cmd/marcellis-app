-- Enable RLS on tables that have policies but RLS is disabled
ALTER TABLE deleted_jobs_cvs_audit ENABLE ROW LEVEL SECURITY;

-- Enable RLS on materialized views that need it (if they don't have it already)
-- Note: These appear to be views that should have policies, let's check what's needed

-- The main issue is that we need to check if current user has roles assigned
-- Let's verify the user_roles table has the proper constraints and check our recent insertion