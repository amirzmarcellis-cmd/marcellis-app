-- Add policy for admins and management to view all teams
CREATE POLICY "Admins and Management can view all teams"
ON public.teams
FOR SELECT
TO authenticated
USING (
  has_org_role(auth.uid(), 'ADMIN'::org_role) OR 
  has_org_role(auth.uid(), 'MANAGEMENT'::org_role)
);