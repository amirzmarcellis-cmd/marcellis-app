-- Allow managers to update teams
CREATE POLICY "Managers can update teams" 
ON public.teams 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM memberships 
    WHERE memberships.user_id = auth.uid() 
    AND memberships.role = 'MANAGER'
  )
);