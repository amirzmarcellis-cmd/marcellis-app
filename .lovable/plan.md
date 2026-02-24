

## Add Pipeline Count to Job Cards on Jobs Tab

### Overview
Add a "Pipeline" count badge to each job card in the Jobs tab, positioned between "Rejected" and "Submitted". The count logic mirrors the existing JobFunnel: candidates with `contacted = 'Pipeline'`.

### Changes

#### 1. `src/components/jobs/JobManagementPanel.tsx`

**Type update (~line 37-42):** Add `pipeline_count?: number` to the job interface.

**Count calculation (~line 218-227):** Add pipeline count computation after the rejected count:
```typescript
const pipeline_count = longlistedCandidates.filter(c => {
  const contacted = (c.contacted || "").trim();
  return contacted === 'Pipeline';
}).length;
```

Include `pipeline_count` in the returned job object (~line 228-234).

**UI update (~line 897):** Change grid from `grid-cols-4` to `grid-cols-5` (desktop) and keep `grid-cols-2` for mobile. Add a new Pipeline card between Rejected and Submitted:
- Violet color scheme (`bg-violet-500/10`, `border-violet-500/20`, `text-violet-500`)
- Clickable, navigates to the job's shortlist tab
- Shows `job.pipeline_count || 0`

The final order will be: **Longlisted | Shortlisted | Rejected | Pipeline | Submitted**

### No database or backend changes required
The `contacted` field already supports the "Pipeline" value. This is purely a UI addition with client-side count logic.

