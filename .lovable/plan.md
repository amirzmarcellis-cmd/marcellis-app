

## Investigation Results: Auto-Dial Disabling Unexpectedly

### Root Cause Analysis

After thorough investigation, I identified **6 mechanisms** that can disable automatic dialing:

---

### All Auto-Dial Disable Mechanisms

| # | Mechanism | Location | Condition | Status |
|---|-----------|----------|-----------|--------|
| 1 | **48-Hour Expiration** | Cron job `disable_expired_auto_dial()` | Runs hourly; disables when `auto_dial_enabled_at` is older than 48 hours | ✅ Active |
| 2 | **6 Shortlisted Threshold** | DB Trigger `trigger_disable_auto_dial` | Fires when job reaches 6+ candidates with score ≥75 | ✅ Active |
| 3 | **Manual UI Toggle** | `JobDetails.tsx`, `JobManagementPanel.tsx` | User toggles switch off | ✅ Active |
| 4 | **Pause Job Button** | `JobDetails.tsx` (handlePauseJob) | Pausing a job also disables auto-dial | ✅ Active |
| 5 | **Longlist Only Mode** | `AddJob.tsx` | Jobs created with this option start with auto-dial off | ✅ Active |
| 6 | **Admin Global Pause** | `Settings.tsx` | Blocks UI but doesn't change existing jobs | Currently OFF |

---

### Suspicious Finding

I found jobs that were disabled without matching any automated conditions:

| Job ID | Enabled Timestamp | Time Active | Shortlisted | Status |
|--------|-------------------|-------------|-------------|--------|
| me-j-0250 | 2026-02-05 05:21 | ~16 minutes | 0 | Disabled |
| me-j-0248 | 2026-02-05 05:15 | ~23 minutes | 0 | Disabled |
| me-j-0247 | 2026-02-05 05:12 | ~25 minutes | 0 | Disabled |

These jobs have:
- `auto_dial_enabled_at` timestamps from **minutes ago** (not 48 hours)
- **Zero shortlisted candidates** (not 6+)
- Yet `automatic_dial = false`

---

### Likely Causes of Random Disabling

1. **Manual User Action**: Someone clicked the auto-dial toggle or Pause Job button
2. **External Integration**: Make.com workflows may be updating the Jobs table directly
3. **Race Condition**: The timestamp is set but then immediately overwritten by another update

---

### Recommended Investigation Steps

To pinpoint the exact cause, we should:

1. **Add Audit Logging**: Track who/what changes `automatic_dial` field with timestamps
2. **Check Make.com Workflows**: Review if any automation updates Jobs table
3. **Monitor in Real-Time**: Watch for changes as they happen

---

### Technical Implementation Plan

**Phase 1: Add Audit Trigger**
Create a trigger that logs every change to `automatic_dial`:

```sql
-- Create audit log table
CREATE TABLE IF NOT EXISTS auto_dial_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id TEXT NOT NULL,
  old_value BOOLEAN,
  new_value BOOLEAN,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by TEXT, -- Will show 'trigger' or user ID
  source TEXT -- 'manual', 'cron', 'threshold_trigger', 'pause_job'
);

-- Create audit trigger
CREATE OR REPLACE FUNCTION audit_auto_dial_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.automatic_dial IS DISTINCT FROM NEW.automatic_dial THEN
    INSERT INTO auto_dial_audit_log (job_id, old_value, new_value, changed_by)
    VALUES (NEW.job_id, OLD.automatic_dial, NEW.automatic_dial, 
            COALESCE(current_setting('app.current_user_id', true), 'system'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_auto_dial_trigger
  AFTER UPDATE ON "Jobs"
  FOR EACH ROW
  EXECUTE FUNCTION audit_auto_dial_changes();
```

**Phase 2: Update Existing Triggers**
Modify the threshold trigger to log its action:

```sql
-- Update disable_auto_dial_at_threshold to include audit
-- Add source = 'threshold_trigger' to audit log
```

**Phase 3: Update Frontend**
Pass source context when updating auto-dial from UI

---

### Summary

The auto-dial can be disabled by:
1. ⏰ **48-hour cron job** - checks hourly
2. 📊 **6 shortlist threshold** - database trigger
3. 🔘 **Manual toggle** - user action
4. ⏸️ **Pause job button** - side effect of pausing
5. 📋 **Longlist only** - at job creation
6. 🔒 **Admin pause** - UI block only

To find the exact cause of random disabling, implementing audit logging is recommended.

