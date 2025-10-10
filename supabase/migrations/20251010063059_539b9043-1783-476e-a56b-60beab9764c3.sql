-- Update the function to have a secure search_path
CREATE OR REPLACE FUNCTION format_scheduled_time_iso(ts timestamp without time zone)
RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT to_char(ts, 'YYYY-MM-DD"T"HH24:MI:SS.MS');
$$;