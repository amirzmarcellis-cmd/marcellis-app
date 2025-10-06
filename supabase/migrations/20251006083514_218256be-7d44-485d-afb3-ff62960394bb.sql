-- Create function to disable auto dial after 48 hours
CREATE OR REPLACE FUNCTION disable_expired_auto_dial()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE "Jobs"
  SET automatic_dial = FALSE
  WHERE automatic_dial = TRUE
    AND auto_dial_enabled_at IS NOT NULL
    AND auto_dial_enabled_at < NOW() - INTERVAL '48 hours';
END;
$$;

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the function to run every hour
SELECT cron.schedule(
  'disable-expired-auto-dial',
  '0 * * * *', -- Run every hour at minute 0
  $$
  SELECT disable_expired_auto_dial();
  $$
);