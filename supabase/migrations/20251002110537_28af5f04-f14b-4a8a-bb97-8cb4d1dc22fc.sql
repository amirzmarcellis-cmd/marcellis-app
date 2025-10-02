-- Add DELETE policy for teams table to allow managers to delete teams
CREATE POLICY "Managers can delete teams"
ON public.teams
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM memberships 
    WHERE memberships.user_id = auth.uid() 
    AND memberships.role = 'MANAGER'
  )
);