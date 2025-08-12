-- Idempotent migration to apply recommended improvements without duplications
-- 1) Seed lookup tables safely (no duplicate rows)

-- Contacted status options
WITH vals(value, sort_order) AS (
  VALUES
    ('Not Contacted', 10),
    ('Attempted', 20),
    ('Connected', 30),
    ('Left Voicemail', 40),
    ('No Answer', 50),
    ('Rejected', 60),
    ('Qualified', 70),
    ('Scheduled Interview', 80)
)
INSERT INTO public.status_contacted_lookup (value, label, sort_order, active)
SELECT v.value, v.value, v.sort_order, true
FROM vals v
WHERE NOT EXISTS (
  SELECT 1 FROM public.status_contacted_lookup s WHERE s.value = v.value
);

-- Candidate status options
WITH vals(value, sort_order) AS (
  VALUES
    ('New', 10),
    ('Longlisted', 20),
    ('Shortlisted', 30),
    ('Interview', 40),
    ('Offer', 50),
    ('Hired', 60),
    ('Rejected', 70)
)
INSERT INTO public.status_candidate_lookup (value, label, sort_order, active)
SELECT v.value, v.value, v.sort_order, true
FROM vals v
WHERE NOT EXISTS (
  SELECT 1 FROM public.status_candidate_lookup s WHERE s.value = v.value
);

-- 2) Attach validation and auditing triggers only if they don't already exist

-- Validate Jobs_CVs.Contacted against lookup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_jobs_cvs_validate_contacted'
  ) THEN
    CREATE TRIGGER trg_jobs_cvs_validate_contacted
    BEFORE INSERT OR UPDATE ON public."Jobs_CVs"
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_contacted_status();
  END IF;
END$$;

-- Validate CVs.CandidateStatus against lookup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cvs_validate_candidate_status'
  ) THEN
    CREATE TRIGGER trg_cvs_validate_candidate_status
    BEFORE INSERT OR UPDATE ON public."CVs"
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_candidate_status();
  END IF;
END$$;

-- Log contacted change on Jobs_CVs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_jobs_cvs_log_contacted_change'
  ) THEN
    CREATE TRIGGER trg_jobs_cvs_log_contacted_change
    AFTER UPDATE ON public."Jobs_CVs"
    FOR EACH ROW
    WHEN (OLD."Contacted" IS DISTINCT FROM NEW."Contacted")
    EXECUTE FUNCTION public.jobs_cvs_log_contacted_change();
  END IF;
END$$;

-- Log notes change on Jobs_CVs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_jobs_cvs_log_notes_change'
  ) THEN
    CREATE TRIGGER trg_jobs_cvs_log_notes_change
    AFTER UPDATE ON public."Jobs_CVs"
    FOR EACH ROW
    WHEN (COALESCE(OLD."Notes", '') IS DISTINCT FROM COALESCE(NEW."Notes", ''))
    EXECUTE FUNCTION public.jobs_cvs_log_notes_change();
  END IF;
END$$;

-- Log longlisted event when longlisted_at becomes set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_jobs_cvs_log_longlisted'
  ) THEN
    CREATE TRIGGER trg_jobs_cvs_log_longlisted
    AFTER UPDATE ON public."Jobs_CVs"
    FOR EACH ROW
    WHEN (OLD.longlisted_at IS DISTINCT FROM NEW.longlisted_at AND NEW.longlisted_at IS NOT NULL)
    EXECUTE FUNCTION public.jobs_cvs_log_longlisted();
  END IF;
END$$;

-- Log candidate status change on CVs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cvs_log_candidate_status_change'
  ) THEN
    CREATE TRIGGER trg_cvs_log_candidate_status_change
    AFTER UPDATE ON public."CVs"
    FOR EACH ROW
    WHEN (OLD."CandidateStatus" IS DISTINCT FROM NEW."CandidateStatus")
    EXECUTE FUNCTION public.cvs_log_candidate_status_change();
  END IF;
END$$;

-- Log call creation from call_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_call_logs_log_event'
  ) THEN
    CREATE TRIGGER trg_call_logs_log_event
    AFTER INSERT ON public.call_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.call_logs_log_event();
  END IF;
END$$;

-- 3) Keep updated_at fresh on mutable tables (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_call_logs_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_call_logs_set_updated_at
    BEFORE UPDATE ON public.call_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_comments_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_comments_set_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_tasks_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_tasks_set_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- 4) Ensure full row data for realtime (idempotent)
ALTER TABLE public."Jobs_CVs" REPLICA IDENTITY FULL;
ALTER TABLE public."CVs" REPLICA IDENTITY FULL;
ALTER TABLE public.call_logs REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.status_history REPLICA IDENTITY FULL;

-- 5) Helpful indexes for analytics and timeline (no duplicates)
CREATE INDEX IF NOT EXISTS idx_status_history_candidate_created_at ON public.status_history (candidate_id, created_at);
CREATE INDEX IF NOT EXISTS idx_status_history_job_created_at ON public.status_history (job_id, created_at);
CREATE INDEX IF NOT EXISTS idx_status_history_change_type ON public.status_history (change_type);

CREATE INDEX IF NOT EXISTS idx_call_logs_job_id ON public.call_logs (job_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_candidate_id ON public.call_logs (candidate_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_recruiter_id ON public.call_logs (recruiter_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_call_timestamp ON public.call_logs (call_timestamp);

CREATE INDEX IF NOT EXISTS idx_jobs_cvs_job_candidate ON public."Jobs_CVs" ("Job ID", "Candidate_ID");
CREATE INDEX IF NOT EXISTS idx_jobs_cvs_contacted ON public."Jobs_CVs" ("Contacted");
CREATE INDEX IF NOT EXISTS idx_jobs_cvs_longlisted_at ON public."Jobs_CVs" (longlisted_at);
CREATE INDEX IF NOT EXISTS idx_jobs_cvs_shortlisted_at ON public."Jobs_CVs" (shortlisted_at);

CREATE INDEX IF NOT EXISTS idx_cvs_candidate_status ON public."CVs" ("CandidateStatus");

-- 6) Refresh analytics materialized views
SELECT public.refresh_reporting_materialized_views();