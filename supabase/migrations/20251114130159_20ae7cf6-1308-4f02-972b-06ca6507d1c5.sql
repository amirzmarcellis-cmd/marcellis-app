-- Drop the auto-dial threshold trigger and function
-- This allows users to manually control auto-dial without automatic disabling

-- Drop the trigger first
DROP TRIGGER IF EXISTS trigger_disable_auto_dial ON "Jobs_CVs";

-- Drop the function
DROP FUNCTION IF EXISTS public.disable_auto_dial_at_threshold();