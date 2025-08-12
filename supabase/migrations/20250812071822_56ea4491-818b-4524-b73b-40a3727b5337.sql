-- Enable RLS on all relevant public tables (idempotent)
ALTER TABLE IF EXISTS public."CVs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."Jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."Jobs_CVs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.status_contacted_lookup ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.status_candidate_lookup ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

-- Adjust view security to avoid SECURITY DEFINER issues if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'v_time_to_shortlist'
  ) THEN
    -- Postgres 15+: set security invoker; safe if already set
    EXECUTE 'ALTER VIEW public.v_time_to_shortlist SET (security_invoker = true)';
  END IF;
END $$;
