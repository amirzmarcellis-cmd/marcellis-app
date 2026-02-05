

## Fix: Exclude "Shortlisted from Similar Jobs" from Auto-Dial Threshold

### Current Issue
The `disable_auto_dial_at_threshold()` trigger counts **all** candidates with `after_call_score >= 74`, including candidates with status `'Shortlisted from Similar jobs'`. This causes auto-dial to turn off prematurely when jobs have imported candidates.

### Solution
Add a filter to exclude candidates with `contacted = 'Shortlisted from Similar jobs'` from the shortlist count.

---

### Database Migration

```sql
CREATE OR REPLACE FUNCTION public.disable_auto_dial_at_threshold()
RETURNS TRIGGER AS $$
DECLARE
  shortlisted_count INTEGER;
  current_auto_dial BOOLEAN;
BEGIN
  -- Get current automatic_dial status
  SELECT automatic_dial INTO current_auto_dial
  FROM "Jobs"
  WHERE job_id = NEW.job_id;
  
  -- Only proceed if automatic_dial is currently enabled
  IF current_auto_dial = TRUE THEN
    -- Count shortlisted candidates (after_call_score >= 74)
    -- EXCLUDE candidates with status 'Shortlisted from Similar jobs'
    SELECT COUNT(*) INTO shortlisted_count
    FROM "Jobs_CVs"
    WHERE job_id = NEW.job_id
      AND (after_call_score::INTEGER) >= 74
      AND (contacted IS NULL OR contacted != 'Shortlisted from Similar jobs');
    
    -- Disable auto-dial if we've reached 6 shortlisted candidates
    IF shortlisted_count >= 6 THEN
      UPDATE "Jobs"
      SET automatic_dial = FALSE,
          auto_dial_enabled_at = NULL
      WHERE job_id = NEW.job_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

---

### Key Change

| Before | After |
|--------|-------|
| `WHERE after_call_score >= 74` | `WHERE after_call_score >= 74 AND contacted != 'Shortlisted from Similar jobs'` |

---

### Impact
- Auto-dial will only count "organic" shortlisted candidates
- Candidates imported from similar jobs won't trigger the 6+ threshold
- Aligns with the shortlist definition used in Job Details, Job Funnel, and Active Jobs Analytics

