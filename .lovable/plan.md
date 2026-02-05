

## Exclude "Shortlisted from Similar Jobs" from AI Longlist

### Summary
Add a filter to the AI Longlist query to exclude candidates with `contacted = 'Shortlisted from Similar jobs'`. This ensures imported candidates only appear in their dedicated "Similar Jobs" tab.

---

### Technical Changes

**File: `src/pages/JobDetails.tsx`** (lines 898-906)

Update the `fetchLonglistedCandidates` function:

```typescript
// Before
const { data: longlistedData, error: longlistedError } = await supabase
  .from("Jobs_CVs")
  .select("*")
  .eq("job_id", jobId)
  .limit(10000)
  .order("cv_score", {
    ascending: false,
    nullsLast: true,
  });

// After
const { data: longlistedData, error: longlistedError } = await supabase
  .from("Jobs_CVs")
  .select("*")
  .eq("job_id", jobId)
  .neq("contacted", "Shortlisted from Similar jobs")  // Exclude imported candidates
  .limit(10000)
  .order("cv_score", {
    ascending: false,
    nullsLast: true,
  });
```

---

### Note on Field Name
The field storing candidate status is `contacted` (not `status`). This is consistent with:
- The auto-dial threshold trigger we just updated
- The Similar Jobs tab filter
- The shortlist exclusion pattern used elsewhere in the system

---

### Result
- AI Longlist will only display organic candidates
- Candidates sorted by highest score first (already configured)
- Imported candidates remain in the "Shortlisted from Similar Jobs" tab
- Longlist count in the tab header will be accurate

