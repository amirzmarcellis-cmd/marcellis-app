-- Create an immutable function to format timestamp to ISO format
CREATE OR REPLACE FUNCTION format_scheduled_time_iso(ts timestamp without time zone)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT to_char(ts, 'YYYY-MM-DD"T"HH24:MI:SS.MS');
$$;

-- Add a generated column using the immutable function
ALTER TABLE "Rejection table" 
ADD COLUMN scheduled_time_iso text 
GENERATED ALWAYS AS (format_scheduled_time_iso(scheduled_time)) STORED;