-- Fix recursive policy error by disabling RLS on memberships and teams
ALTER TABLE public.memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;

-- Optionally clean up by dropping problematic policies to avoid accidental re-enable issues
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'memberships' AND policyname = 'Admins can manage all memberships'
  ) THEN
    DROP POLICY "Admins can manage all memberships" ON public.memberships;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'memberships' AND policyname = 'Managers can manage memberships'
  ) THEN
    DROP POLICY "Managers can manage memberships" ON public.memberships;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'memberships' AND policyname = 'Team leaders can view team memberships'
  ) THEN
    DROP POLICY "Team leaders can view team memberships" ON public.memberships;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'memberships' AND policyname = 'Users can view their team memberships'
  ) THEN
    DROP POLICY "Users can view their team memberships" ON public.memberships;
  END IF;
END $$;

-- We don't need to drop team policies if RLS is disabled, but safe to keep them for now

-- Fix missing column error on linkedin_boolean_search
ALTER TABLE public.linkedin_boolean_search
  ADD COLUMN IF NOT EXISTS linkedin_score bigint;