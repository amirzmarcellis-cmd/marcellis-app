CREATE OR REPLACE FUNCTION public.disable_longlist_more_at_threshold()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE "Jobs"
  SET longlist_more = false
  WHERE longlist >= 150
    AND longlist_more = true;
END;
$$;