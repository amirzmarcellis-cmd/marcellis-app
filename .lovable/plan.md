

## Auto-Disable longlist_more When Longlist Exceeds 150

### What This Does
Creates a scheduled job that runs every 5 minutes to check all jobs in the `Jobs` table. If a job's `longlist` count is 150 or more, it automatically sets `longlist_more` to `false` so no more candidates are added to the longlist.

### Implementation

**Step 1: Create the database function (via migration)**

```sql
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
```

**Step 2: Schedule a cron job every 5 minutes (via insert tool)**

This uses the `pg_cron` extension to run the function directly in the database every 5 minutes:

```sql
SELECT cron.schedule(
  'disable-longlist-more-check',
  '*/5 * * * *',
  $$SELECT public.disable_longlist_more_at_threshold();$$
);
```

### How It Works
- Every 5 minutes, the cron job calls the function
- The function finds all jobs where `longlist >= 150` AND `longlist_more = true`
- It sets `longlist_more = false` for those jobs
- Jobs already set to `false` are skipped (no unnecessary updates)

### Notes
- This requires the `pg_cron` and `pg_net` extensions to be enabled in your Supabase project (they are available by default)
- The cron schedule SQL will be run via the insert tool (not migration) since it contains runtime configuration

