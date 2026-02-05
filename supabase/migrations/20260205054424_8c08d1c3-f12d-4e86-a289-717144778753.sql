-- Create audit log table for auto-dial changes
CREATE TABLE IF NOT EXISTS public.auto_dial_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id TEXT NOT NULL,
  old_value BOOLEAN,
  new_value BOOLEAN,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by TEXT,
  source TEXT
);

-- Enable RLS
ALTER TABLE public.auto_dial_audit_log ENABLE ROW LEVEL SECURITY;

-- Allow admins to view audit logs
CREATE POLICY "Admins can view auto-dial audit logs"
ON public.auto_dial_audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_auto_dial_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.automatic_dial IS DISTINCT FROM NEW.automatic_dial THEN
    INSERT INTO public.auto_dial_audit_log (job_id, old_value, new_value, changed_by, source)
    VALUES (
      NEW.job_id, 
      OLD.automatic_dial, 
      NEW.automatic_dial, 
      COALESCE(auth.uid()::text, 'system'),
      CASE 
        WHEN auth.uid() IS NULL THEN 'system/cron'
        ELSE 'user_action'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on Jobs table
DROP TRIGGER IF EXISTS audit_auto_dial_trigger ON public."Jobs";
CREATE TRIGGER audit_auto_dial_trigger
  AFTER UPDATE ON public."Jobs"
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_auto_dial_changes();