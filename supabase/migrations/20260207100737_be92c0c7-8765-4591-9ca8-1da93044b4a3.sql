-- Drop the trigger first
DROP TRIGGER IF EXISTS audit_auto_dial_trigger ON "Jobs";

-- Drop the function
DROP FUNCTION IF EXISTS public.audit_auto_dial_changes();

-- Drop the table
DROP TABLE IF EXISTS public.auto_dial_audit_log;