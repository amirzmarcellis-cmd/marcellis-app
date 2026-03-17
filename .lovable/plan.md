

## Lazy-Load Candidate Counts by Tab

### Problem
Currently, candidate counts are fetched for **all jobs** (active + paused) on initial load. With 368 jobs, this means thousands of rows from `Jobs_CVs` even though the user only sees the "Active" tab first.

### Approach

1. **Split `fetchJobs` into two phases:**
   - **Phase 1 (initial load):** Fetch all jobs from `Jobs` table (lightweight), then fetch `Jobs_CVs` counts only for **active jobs** (`Processed === 'Yes'`).
   - **Phase 2 (on-demand):** When user clicks "Paused" or "All" tab, fetch `Jobs_CVs` counts for paused jobs if not already loaded.

2. **Track which jobs have counts loaded** using a `Set` or boolean flag (`pausedCountsLoaded`).

3. **Tab change handler:** Add `onValueChange` to `<Tabs>` component. When switching to "paused" or "all", trigger the deferred fetch for paused job IDs.

### Changes — `src/components/jobs/JobManagementPanel.tsx`

- Add state: `const [pausedCountsLoaded, setPausedCountsLoaded] = useState(false)`
- In `fetchJobs`: After fetching all jobs, split `jobIds` into `activeJobIds` (where `Processed === 'Yes'`) and `pausedJobIds`. Only batch-fetch `Jobs_CVs` for `activeJobIds`. Set paused jobs with counts = 0 initially.
- Add `fetchPausedCounts` function: Takes `pausedJobIds`, does the same batched `.in()` query, then merges counts into `jobs` state.
- On `<Tabs onValueChange>`: If tab is "paused" or "all" and `!pausedCountsLoaded`, call `fetchPausedCounts`.
- The paused tab shows a small loading indicator while counts are being fetched.

This cuts initial query volume roughly in half (only active job candidates fetched upfront).

