

## Issue Summary

Job `me-j-0245` shows "Sourcing" status even though it has 15 longlisted candidates. The auto-transition logic (lines 577-616 in `JobDetails.tsx`) only triggers on **real-time INSERT events** - it doesn't check existing candidates when the page loads.

---

## Root Cause

The current auto-status-transition code subscribes to real-time `INSERT` events on the `Jobs_CVs` table. This means:
- It only updates status when a **new** candidate is added while the page is open
- Jobs that already have candidates but a stale `status = 'Processing'` never get corrected

---

## Solution

### 1. Database Fix (Immediate)
Update the job's status in the database:
```sql
UPDATE "Jobs" SET status = 'Recruiting' WHERE job_id = 'me-j-0245'
```

### 2. Code Fix (Prevent Future Issues)
Add logic to check existing candidates on page load and auto-correct the status if needed.

**File:** `src/pages/JobDetails.tsx`

**Add a new useEffect** after line 616 that checks on initial load:

```tsx
// Auto-correct status based on existing candidates on page load
useEffect(() => {
  if (!job || !job.job_id) return;
  
  // If status is Processing but Processed is Yes and we have candidates, 
  // it should be Recruiting
  if (job.status === 'Processing' && job.Processed === 'Yes' && candidates.length > 0) {
    const updateStatus = async () => {
      try {
        const { error } = await supabase
          .from('Jobs')
          .update({ status: 'Recruiting' })
          .eq('job_id', job.job_id);
        
        if (!error) {
          setJob((prev: any) => ({ ...prev, status: 'Recruiting' }));
        }
      } catch (error) {
        console.error('Error auto-correcting job status:', error);
      }
    };
    updateStatus();
  }
}, [job?.job_id, job?.status, job?.Processed, candidates.length]);
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/JobDetails.tsx` | Add useEffect after line 616 to auto-correct stale Processing status on page load |

---

## Technical Details

- The new useEffect checks if the job has `status = 'Processing'`, `Processed = 'Yes'`, and `candidates.length > 0`
- If all conditions are met, it automatically updates the status to `'Recruiting'`
- This ensures any jobs with stale status are auto-corrected when viewed

---

## Testing Checklist
1. Verify job `me-j-0245` shows "Making Calls" instead of "Sourcing" after refresh
2. Verify new jobs still transition correctly when AI generates candidates
3. Verify jobs without candidates still show "Sourcing" correctly

