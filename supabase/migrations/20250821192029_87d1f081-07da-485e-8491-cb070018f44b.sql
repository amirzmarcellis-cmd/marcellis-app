-- Fix the overly permissive Jobs policies that allow public access to all jobs
-- The "Public can view jobs for application" policy was allowing access to ALL jobs

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view jobs for application" ON public."Jobs";

-- Replace with a more specific policy for job applications that doesn't compromise data isolation
-- This allows public access for job applications but only for specific use cases
-- For now, we'll rely on the authenticated user policies for proper data isolation

-- If we need public job viewing later, we can add a specific column like "is_public" or "allow_applications"
-- CREATE POLICY "Public can view published jobs" ON public."Jobs"
-- FOR SELECT USING (allow_public_applications = true);

-- Verify all Jobs policies are now properly restrictive
-- Only authenticated users in the same company should see jobs