-- Continue restoring policies for remaining tables with RLS enabled

-- Restore tasks policies (has RLS enabled)
CREATE POLICY "Managers can create tasks" 
ON public.tasks
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.team_id = tasks.team_id 
    AND memberships.user_id = auth.uid() 
    AND memberships.role = 'MANAGER'
  )
);

CREATE POLICY "Task updates based on role" 
ON public.tasks
FOR UPDATE
USING (
  assignee_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.team_id = tasks.team_id 
    AND memberships.user_id = auth.uid() 
    AND memberships.role = 'MANAGER'
  )
);

CREATE POLICY "Task visibility based on role" 
ON public.tasks
FOR SELECT
USING (
  assignee_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.team_id = tasks.team_id 
    AND memberships.user_id = auth.uid() 
    AND memberships.role = 'MANAGER'
  )
);

-- Restore timers policies (has RLS enabled)
CREATE POLICY "Users can manage their own timers" 
ON public.timers
FOR ALL
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM tasks 
    JOIN memberships ON memberships.team_id = tasks.team_id
    WHERE tasks.id = timers.task_id 
    AND memberships.user_id = auth.uid() 
    AND memberships.role = 'MANAGER'
  )
);

-- Restore notifications policies (has RLS enabled)
CREATE POLICY "Users can update their own notifications" 
ON public.notifications
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can view their own notifications" 
ON public.notifications
FOR SELECT
USING (user_id = auth.uid());

-- Restore calendar_preferences policies (has RLS enabled)
CREATE POLICY "Users can manage their own preferences" 
ON public.calendar_preferences
FOR ALL
USING (user_id = auth.uid());