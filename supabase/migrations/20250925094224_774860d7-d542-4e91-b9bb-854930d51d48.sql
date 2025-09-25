-- Add unique constraint to teams name if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'teams_name_key'
    ) THEN
        ALTER TABLE public.teams ADD CONSTRAINT teams_name_key UNIQUE (name);
    END IF;
END $$;

-- Insert the two required teams
INSERT INTO public.teams (name) 
SELECT 'Sales Team' 
WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Sales Team');

INSERT INTO public.teams (name) 
SELECT 'Delivery Team' 
WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'Delivery Team');

-- Create a function to get user's role in a team
CREATE OR REPLACE FUNCTION public.get_user_team_role(user_uuid uuid, team_name text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT m.role::text
  FROM memberships m
  JOIN teams t ON t.id = m.team_id
  WHERE m.user_id = user_uuid AND t.name = team_name;
$$;

-- Create a function to check if user is team leader
CREATE OR REPLACE FUNCTION public.is_team_leader(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships m
    JOIN teams t ON t.id = m.team_id  
    WHERE m.user_id = user_uuid 
    AND m.role = 'MANAGER'
    AND t.name IN ('Sales Team', 'Delivery Team')
  );
$$;

-- Create a function to get user's teams
CREATE OR REPLACE FUNCTION public.get_user_teams(user_uuid uuid)
RETURNS TABLE(team_name text, role text)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT t.name, m.role::text
  FROM memberships m
  JOIN teams t ON t.id = m.team_id
  WHERE m.user_id = user_uuid;
$$;

-- Update RLS policies for better team management
DROP POLICY IF EXISTS "Admins can manage all memberships" ON public.memberships;

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

-- Allow team leaders to view their team memberships
DROP POLICY IF EXISTS "Team leaders can view team memberships" ON public.memberships;

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