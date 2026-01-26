

## Remove Auto-Dial Expiration Mechanisms

This plan removes two automatic dial expiration systems that are turning off jobs prematurely.

---

### Changes Required

#### 1. Remove Frontend 48-Hour Check

**File:** `src/pages/JobDetails.tsx`

Remove the entire useEffect block that checks and disables auto-dial after 48 hours (lines 425-464).

```typescript
// REMOVE THIS ENTIRE BLOCK:
useEffect(() => {
  const checkAutoDialExpiry = async () => {
    if (!job?.automatic_dial || !job?.job_id) return;
    // ... all the 48-hour checking logic
  };
  if (job) {
    checkAutoDialExpiry();
  }
}, [job, toast]);
```

---

#### 2. Remove Database Cron Job and Function

Two SQL commands need to be executed to clean up the database:

**Step 1:** Unschedule the cron job (jobid: 2)
```sql
SELECT cron.unschedule(2);
```

**Step 2:** Drop the function
```sql
DROP FUNCTION IF EXISTS expire_old_jobs();
```

---

### Summary of What Gets Removed

| Mechanism | Location | Trigger | Action |
|-----------|----------|---------|--------|
| 72-hour expiry | Database cron | Every hour | ~~Disables auto-dial if job is 72+ hours old~~ |
| 48-hour expiry | JobDetails.tsx | User views job | ~~Disables auto-dial if enabled 48+ hours ago~~ |

---

### What Remains Active

After these changes, auto-dial will still be disabled by:

1. **Shortlist threshold trigger** - Disables when 6+ candidates reach score >= 74
2. **48-hour cron job (`disable_expired_auto_dial`)** - Still runs hourly based on `auto_dial_enabled_at`

If you also want to remove the 48-hour cron job mechanism, let me know and I can include that in the plan.

