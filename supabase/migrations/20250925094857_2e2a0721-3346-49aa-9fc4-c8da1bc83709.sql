-- Restore policies for tables that have RLS enabled (the INFO "RLS Enabled No Policy" items)

-- Restore memberships policies (has RLS enabled)
CREATE POLICY "Admins can manage all memberships"
ON public.memberships
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Managers can manage memberships" 
ON public.memberships
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM memberships m2
    WHERE m2.team_id = memberships.team_id 
    AND m2.user_id = auth.uid() 
    AND m2.role = 'MANAGER'
  )
);

CREATE POLICY "Team leaders can view team memberships" 
ON public.memberships
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM memberships m2
    WHERE m2.team_id = memberships.team_id 
    AND m2.user_id = auth.uid() 
    AND m2.role = 'MANAGER'
  )
);

CREATE POLICY "Users can view their team memberships" 
ON public.memberships
FOR SELECT
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM memberships m2
    WHERE m2.team_id = memberships.team_id 
    AND m2.user_id = auth.uid() 
    AND m2.role = 'MANAGER'
  )
);

-- Restore teams policies (has RLS enabled)
CREATE POLICY "Managers can create teams" 
ON public.teams
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.user_id = auth.uid() 
    AND memberships.role = 'MANAGER'
  )
);

CREATE POLICY "Team members can view their teams" 
ON public.teams
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.team_id = teams.id 
    AND memberships.user_id = auth.uid()
  )
);