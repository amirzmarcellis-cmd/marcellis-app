-- Create the audit_log table
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  changed_fields jsonb,
  performed_by uuid,
  performed_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX idx_audit_log_operation ON public.audit_log(operation);
CREATE INDEX idx_audit_log_performed_at ON public.audit_log(performed_at DESC);
CREATE INDEX idx_audit_log_record_id ON public.audit_log(record_id);

-- Create the generic audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_old_data jsonb := NULL;
  v_new_data jsonb := NULL;
  v_changed_fields jsonb := NULL;
  v_record_id text;
BEGIN
  -- Determine the record ID based on the table
  IF TG_TABLE_NAME = 'Jobs' THEN
    v_record_id := COALESCE(NEW.job_id, OLD.job_id);
  ELSIF TG_TABLE_NAME = 'Jobs_CVs' THEN
    v_record_id := COALESCE(NEW.recordid::text, OLD.recordid::text);
  ELSIF TG_TABLE_NAME = 'CVs' THEN
    v_record_id := COALESCE(NEW.user_id, OLD.user_id);
  ELSE
    v_record_id := 'unknown';
  END IF;

  -- Set old_data for UPDATE and DELETE
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    v_old_data := to_jsonb(OLD);
  END IF;

  -- Set new_data for INSERT and UPDATE
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    v_new_data := to_jsonb(NEW);
  END IF;

  -- Calculate changed fields for UPDATE
  IF TG_OP = 'UPDATE' THEN
    SELECT jsonb_object_agg(key, value)
    INTO v_changed_fields
    FROM jsonb_each(v_new_data)
    WHERE v_new_data->key IS DISTINCT FROM v_old_data->key;
  END IF;

  -- Insert audit log entry
  INSERT INTO public.audit_log (
    table_name,
    operation,
    record_id,
    old_data,
    new_data,
    changed_fields,
    performed_by,
    performed_at
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    v_record_id,
    v_old_data,
    v_new_data,
    v_changed_fields,
    auth.uid(),
    now()
  );

  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create trigger for Jobs table
CREATE TRIGGER audit_jobs_trigger
AFTER INSERT OR UPDATE OR DELETE ON public."Jobs"
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Create trigger for Jobs_CVs table
CREATE TRIGGER audit_jobs_cvs_trigger
AFTER INSERT OR UPDATE OR DELETE ON public."Jobs_CVs"
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Create trigger for CVs table
CREATE TRIGGER audit_cvs_trigger
AFTER INSERT OR UPDATE OR DELETE ON public."CVs"
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Enable RLS on audit_log table
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only Admins can view audit logs
CREATE POLICY "Admins can view all audit logs"
ON public.audit_log
FOR SELECT
USING (public.has_org_role(auth.uid(), 'ADMIN'::org_role));

-- Allow system to insert audit logs (via trigger with SECURITY DEFINER)
CREATE POLICY "System can insert audit logs"
ON public.audit_log
FOR INSERT
WITH CHECK (true);