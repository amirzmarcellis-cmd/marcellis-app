
## Plan: Fix Auto-Dial 48-Hour Timer Reset

### Problem Summary

When you turn auto-dial back ON via the UI, the system correctly sets `auto_dial_enabled_at` to the current time, which should give you another 48 hours. However, there are two issues:

1. **New jobs created via AddJob don't set the timestamp** - Jobs are created with `automatic_dial = true` (database default) but `auto_dial_enabled_at = NULL`, so the 48-hour timer never starts
2. **The old `expire_old_jobs()` function was incorrectly disabling jobs** - This has been removed as of Jan 26

### Current State

| Mechanism | Status | Behavior |
|-----------|--------|----------|
| `disable_expired_auto_dial()` cron | Active (hourly) | Disables jobs where timestamp > 48 hours old |
| `expire_old_jobs()` cron | **DELETED** | Was incorrectly disabling jobs |
| Shortlist threshold trigger | Active | Disables when 6+ candidates score >= 74 |
| UI toggle sets timestamp | Working | Sets `auto_dial_enabled_at` to current time when turning ON |

### Solution

**Step 1: Add timestamp when creating new jobs**

Update `src/pages/AddJob.tsx` to include `auto_dial_enabled_at: new Date().toISOString()` in the insert statement.

This ensures newly created jobs start their 48-hour timer immediately.

**Step 2 (Optional): Set timestamp for existing jobs with NULL**

Run a one-time UPDATE to set `auto_dial_enabled_at` for jobs that currently have `automatic_dial = true` but no timestamp:
- `me-j-0235`
- `me-j-0236`

### Technical Details

**File: `src/pages/AddJob.tsx`**

Add to the insert object at line ~596:
```typescript
automatic_dial: true,  // Keep the default
auto_dial_enabled_at: new Date().toISOString()  // Start the 48-hour timer
```

**SQL for existing jobs (one-time fix via Supabase SQL Editor):**
```sql
UPDATE "Jobs"
SET auto_dial_enabled_at = NOW()
WHERE automatic_dial = TRUE
  AND auto_dial_enabled_at IS NULL;
```

### Behavior After Fix

1. **New jobs**: Created with auto-dial ON and 48-hour timer started
2. **Turning auto-dial OFF then ON**: Timer resets to 48 hours (already working)
3. **Reaching 6 shortlisted**: Auto-dial disabled by threshold trigger
4. **After 48 hours**: Auto-dial disabled by cron

### Files Changed

| File | Change |
|------|--------|
| `src/pages/AddJob.tsx` | Add `auto_dial_enabled_at` to job insert |

### Risks

- **None to existing functionality** - Only adds a timestamp field to new job creation
- **Existing jobs with NULL timestamp** - These will continue to run indefinitely until you run the optional SQL fix or toggle them via UI
