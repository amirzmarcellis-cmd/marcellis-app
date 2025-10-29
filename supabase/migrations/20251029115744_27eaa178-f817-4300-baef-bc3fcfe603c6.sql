-- Fix RLS so recruiters can update their assigned jobs regardless of ID format
-- Drop the existing narrow update policy and recreate it with broader matching
DROP POLICY IF EXISTS "Users can update their assigned jobs" ON public."Jobs";

CREATE POLICY "Users can update their assigned jobs"
ON public."Jobs"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND (
        -- Allow when recruiter_id stores LinkedIn ID
        "Jobs".recruiter_id = profiles.linkedin_id
        -- Or when recruiter_id stores the user's UUID as text
        OR "Jobs".recruiter_id = profiles.user_id::text
        -- Or when the job assignment matches the user's email
        OR "Jobs".assignment = profiles.email
      )
  )
);
