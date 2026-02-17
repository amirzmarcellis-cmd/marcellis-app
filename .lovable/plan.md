

## Fix: Auto-Dial Should Only Auto-Disable Once and at 8+ Shortlisted

### Problem
Currently, the `disable_auto_dial_at_threshold` trigger fires every time a candidate's score is updated. It disables auto-dial whenever the shortlisted count reaches 6 or more. This means if a user manually re-enables auto-dial, the system immediately turns it off again on the next candidate update.

### Solution

1. **Add a new column** `auto_dial_system_disabled` (boolean, default `false`) to the `Jobs` table. This flag tracks whether the system has already auto-disabled the dial for this job.

2. **Update the trigger function** to:
   - Change the threshold from 6 to 8
   - Check the `auto_dial_system_disabled` flag -- if already `true`, skip (the system already disabled it once)
   - When disabling, set `auto_dial_system_disabled = true`

3. **Update the frontend toggle logic** so that when a user manually re-enables auto-dial, the `auto_dial_system_disabled` flag is NOT reset -- it stays `true`, preventing the system from disabling it again.

### Changes

**Database migration:**
- Add column `auto_dial_system_disabled` (boolean, default `false`) to `Jobs`
- Replace the `disable_auto_dial_at_threshold` function with updated logic (threshold = 8, check the flag)

**No frontend changes needed** -- the existing toggle code updates `automatic_dial` and `auto_dial_enabled_at` but does not touch `auto_dial_system_disabled`, which is exactly what we want.

### Technical Details

Updated trigger function logic:

```text
IF current_auto_dial = TRUE AND auto_dial_system_disabled = FALSE THEN
  -- count shortlisted (score >= 74, excluding Similar jobs)
  IF shortlisted_count >= 8 THEN
    UPDATE Jobs SET
      automatic_dial = FALSE,
      auto_dial_enabled_at = NULL,
      auto_dial_system_disabled = TRUE
    WHERE job_id = NEW.job_id;
  END IF;
END IF;
```

**Files modified:**
- New database migration (add column + update function)
- `src/integrations/supabase/types.ts` will auto-update

**Memory update:** The auto-dial-logic memory will need updating to reflect the new threshold (8) and one-time behavior.
