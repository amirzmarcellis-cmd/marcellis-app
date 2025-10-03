-- Add timestamp column to track when auto dial was enabled
ALTER TABLE public."Jobs"
ADD COLUMN IF NOT EXISTS auto_dial_enabled_at TIMESTAMP WITH TIME ZONE;

-- Add comment to explain the column
COMMENT ON COLUMN public."Jobs".auto_dial_enabled_at IS 'Timestamp when automatic dial was last enabled. Used to automatically disable after 48 hours.';