CREATE OR REPLACE FUNCTION public.disable_longlist_more_at_threshold()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE "Jobs"
  SET longlist_more = false
  WHERE longlist_more = true
    AND (
      SELECT COUNT(*)
      FROM "Jobs_CVs"
      WHERE "Jobs_CVs".job_id = "Jobs".job_id
    ) >= 150;
END;
$$;