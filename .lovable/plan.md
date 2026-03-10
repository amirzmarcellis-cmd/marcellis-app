

## Exclude "Shortlisted from Similar jobs" from Longlist Counts

Two places need filtering:

### 1. `src/components/jobs/JobFunnel.tsx` (Job Details page funnel bar)
- **Line 17-18**: Filter out candidates where `contacted === "Shortlisted from Similar jobs"` before counting longlist
- **Line 101**: Update the Total badge to use the filtered count

### 2. `src/components/jobs/JobManagementPanel.tsx` (Job cards on /jobs)
- **Line ~204**: Change `longlisted_count` from `candidates.length` to exclude candidates with `contacted === "Shortlisted from Similar jobs"`

Both changes are single-line filters adding `.filter(c => c.contacted !== "Shortlisted from Similar jobs")`.

