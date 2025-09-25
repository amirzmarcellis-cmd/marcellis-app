-- Remove any remaining policies from tables that might not have RLS enabled

-- Check memberships table - it might have policies but no RLS
DROP POLICY IF EXISTS "Admins can manage all memberships" ON public.memberships;
DROP POLICY IF EXISTS "Managers can manage memberships" ON public.memberships;
DROP POLICY IF EXISTS "Team leaders can view team memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can view their team memberships" ON public.memberships;

-- Check teams table
DROP POLICY IF EXISTS "Managers can create teams" ON public.teams;
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;

-- Check tasks table  
DROP POLICY IF EXISTS "Managers can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Task updates based on role" ON public.tasks;
DROP POLICY IF EXISTS "Task visibility based on role" ON public.tasks;

-- Check timers table
DROP POLICY IF EXISTS "Users can manage their own timers" ON public.timers;

-- Check notifications table
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;

-- Check calendar_preferences table
DROP POLICY IF EXISTS "Users can manage their own preferences" ON public.calendar_preferences;