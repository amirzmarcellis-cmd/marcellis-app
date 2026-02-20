
## Pipeline Button: Save Status & Show in Live Feed

### Overview
Two targeted changes:
1. **`src/pages/JobDetails.tsx`** — When Pipeline button is clicked, update `contacted` to `"Pipeline"` in `Jobs_CVs` and disable the button (show "In Pipeline") once done
2. **`src/pages/LiveCandidateFeed.tsx`** — Add a second section below the existing "Call Done Candidates" card that shows all candidates with `contacted = "Pipeline"`

No other changes will be made anywhere in the app.

---

### Change 1 — `src/pages/JobDetails.tsx` (Pipeline button, lines 3129–3137)

**Current state:** Pipeline button only shows a toast and does nothing to the database.

**What changes:**

Add a `handlePipeline` function (near `handleClientStatusChange`, around line 2094) that:
- Updates `contacted` to `"Pipeline"` in `Jobs_CVs` using `recordid` (which is the `Candidate_ID`) and `job_id`
- On success, updates local `candidates` state so the button immediately becomes disabled without needing a full refetch

```ts
const handlePipeline = async (candidateId: string) => {
  const { error } = await supabase
    .from("Jobs_CVs")
    .update({ contacted: "Pipeline" })
    .eq("user_id", candidateId)
    .eq("job_id", id!);

  if (!error) {
    toast({ title: "Pipeline", description: "Candidate added to pipeline." });
    // Update local state so button disables immediately
    setCandidates((prev) =>
      prev.map((c) =>
        c["user_id"] === candidateId || c["Candidate_ID"] === candidateId
          ? { ...c, Contacted: "Pipeline", contacted: "Pipeline" }
          : c
      )
    );
  }
};
```

**Replace the Pipeline button block (lines 3129–3137):**

```tsx
{mainCandidate["Contacted"] === "Pipeline" ? (
  <Button
    variant="outline"
    size="sm"
    disabled
    className="w-full sm:flex-1 min-w-0 sm:min-w-[120px] h-10 bg-transparent border-2 border-purple-400 text-purple-400 cursor-default opacity-60"
  >
    <GitBranch className="w-4 h-4 mr-1.5" />
    In Pipeline
  </Button>
) : (
  <Button
    variant="outline"
    size="sm"
    onClick={() => handlePipeline(candidateId)}
    className="w-full sm:flex-1 min-w-0 sm:min-w-[120px] h-10 bg-transparent border-2 border-purple-500 text-purple-600 hover:bg-purple-50 hover:border-purple-600 hover:text-purple-700 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-950/30 transition-all duration-200"
  >
    <GitBranch className="w-4 h-4 mr-1.5" />
    Pipeline
  </Button>
)}
```

No changes to Submit or Reject buttons. No other changes anywhere else in this file.

---

### Change 2 — `src/pages/LiveCandidateFeed.tsx`

**Current state:** Fetches only candidates with `contacted = "Call Done"`. Only one section shown.

**What changes:**

**A. Add a second parallel fetch for Pipeline candidates** inside `fetchData()`:

Alongside the existing `Jobs_CVs` query (which filters `contacted = 'Call Done'`), add another query filtered by `contacted = 'Pipeline'`. Both queries run against the same role-filtered `jobIds`.

```ts
// Existing query (Call Done) - unchanged
const { data, error: jobsCvsError } = await supabase
  .from('Jobs_CVs')
  .select('...')
  .eq('contacted', 'Call Done')
  .in('job_id', jobIds);

// New query (Pipeline)
const { data: pipelineData } = await supabase
  .from('Jobs_CVs')
  .select('recordid, candidate_name, candidate_email, candidate_phone_number, job_id, after_call_score, cv_score, linkedin_score, source, after_call_reason, contacted, after_call_pros, after_call_cons, notice_period, salary_expectations')
  .eq('contacted', 'Pipeline')
  .in('job_id', jobIds);
```

**B. Add state for pipeline candidates:**

```ts
const [pipelineCandidates, setPipelineCandidates] = useState<Candidate[]>([]);
```

Map `pipelineData` the same way `callDoneCandidates` are mapped and call `setPipelineCandidates(...)`.

**C. Add a new Pipeline section after the existing "Call Done Candidates" card** (after line 461, before the closing `</div>`):

- A new `<Card>` titled "Pipeline Candidates" with a purple `GitBranch` icon
- Renders the same candidate card layout already used for Call Done candidates
- Shows a count badge: `{pipelineCandidates.length} In Pipeline`
- Empty state message: "No pipeline candidates yet"
- The cards are NOT clickable to redirect (or redirect the same way to call-log-details)
- No action buttons inside these cards — just informational display

**D. Import `GitBranch`** from `lucide-react` in `LiveCandidateFeed.tsx` (currently not imported there).

---

### What will NOT change
- Submit button behavior — unchanged
- Reject button behavior — unchanged
- "Call Done Candidates" section in Live Feed — unchanged
- All other pages, components, hooks, and database tables — untouched
- No new database tables or migrations needed (`"Pipeline"` is just a new string value for the existing `contacted` text column)
