

## Why the Jobs Page is Slow

### Root Cause
In `JobManagementPanel.tsx` (line 159-170), the code fetches candidate counts by making **one separate Supabase query per job**. With 368 jobs, that's 368 parallel HTTP requests to `Jobs_CVs`, each with a 500-row limit. This takes ~4 seconds.

### The Fix

Replace the per-job queries with a **single batched query** using `.in('job_id', jobIds)`, then group results client-side.

### Technical Details

**Current code (slow — N+1 query pattern):**
```
const perJobPromises = jobIds.map(jid => 
  supabase.from('Jobs_CVs').select(...).eq('job_id', jid).limit(500)
);
const perJobResults = await Promise.all(perJobPromises);
```

**Proposed fix (single query with batching):**
Since Supabase has a 1000-row default limit, we only need a few columns for counting. We'll:

1. Replace 368 individual queries with batched `.in()` queries (chunks of ~50 job IDs) selecting only the columns needed for counts: `job_id, contacted, after_call_score, source`.
2. Use `.limit(5000)` per batch (or paginate) to ensure we get all candidates.
3. Group results into `candidatesByJob` map client-side.

This reduces ~368 requests down to ~8 requests, cutting load time by ~90%.

**Additional optimization:**
- The real-time subscription on `Jobs` table triggers a full `fetchJobs()` on every change — this re-runs all 368 queries again. After fixing the N+1, this becomes acceptable.

### Changes
- **File:** `src/components/jobs/JobManagementPanel.tsx` — Replace lines 158-170 with batched query logic.

