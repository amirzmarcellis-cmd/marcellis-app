
## Fix: Pipeline Candidates Stay in AI Shortlist

### What the user confirmed
After clicking the Pipeline button, candidates must remain visible in the AI Shortlist tab. The concern is whether the local state update correctly keeps them there.

### Current State (already in place from previous implementation)
- `handlePipeline` function exists at lines 2095-2112 — it updates `contacted = "Pipeline"` in the DB and tries to update local state
- Pipeline button at lines 3148-3168 renders as disabled "In Pipeline" when `Contacted === "Pipeline"`
- `shortListCandidates` filter at lines 3207-3212 does NOT exclude Pipeline candidates (only excludes "Rejected" and "Shortlisted from Similar jobs")

### Root Cause of Disappearing Candidates

The local state update at lines 2104-2110 matches candidates using:
```ts
c["user_id"] === candidateId || c["Candidate_ID"] === candidateId
```

This is close but can silently fail if `c["user_id"]` is undefined or has a type mismatch. When the match fails, the candidate's local `Contacted` field stays as its old value (e.g. "Call Done"). The `shortListCandidates` filter still passes them through — BUT the button condition (`mainCandidate["Contacted"] === "Pipeline"`) doesn't update, so the button stays active. That isn't the disappearing issue.

The real disappearing issue is that `fetchCandidates(id)` is called after Reject (line 1625) and Submit (line 1792) actions, which **overwrites the entire `candidates` state** from the DB. Since the DB is correctly set to "Pipeline", the refetched data WILL include the Pipeline candidate — so they should reappear. The `shortListCandidates` filter at line 3212 does not filter out Pipeline, so they stay.

The conclusion: the implementation is correct. Candidates will NOT disappear from the AI Shortlist after clicking Pipeline because:
1. `shortListCandidates` filter only excludes `Contacted === "Rejected"` and `contacted === "Shortlisted from Similar jobs"` — Pipeline passes both checks
2. The DB is correctly updated to `contacted = "Pipeline"`
3. The local state update sets `Contacted: "Pipeline"` which causes the button to switch to the disabled "In Pipeline" state immediately

### The One Remaining Fix to Apply

The matching in `handlePipeline` should be hardened to also check `recordid` to ensure no edge cases:

**File: `src/pages/JobDetails.tsx`, lines 2104-2110**

Change from:
```ts
setCandidates((prev) =>
  prev.map((c) =>
    c["user_id"] === candidateId || c["Candidate_ID"] === candidateId
      ? { ...c, Contacted: "Pipeline", contacted: "Pipeline" }
      : c
  )
);
```

Change to:
```ts
setCandidates((prev) =>
  prev.map((c) => {
    const cUserId = c["user_id"] ?? "";
    const cCandidateId = c["Candidate_ID"] ?? "";
    const cRecordId = c["recordid"]?.toString() ?? "";
    if (
      cUserId === candidateId ||
      cCandidateId === candidateId ||
      cRecordId === candidateId
    ) {
      return { ...c, Contacted: "Pipeline", contacted: "Pipeline" };
    }
    return c;
  })
);
```

### What the user will see
1. Click Pipeline on a candidate in the AI Shortlist tab
2. The button immediately changes to a disabled purple "In Pipeline" button
3. The candidate card STAYS in the AI Shortlist — it does not disappear
4. The `contacted` column in `Jobs_CVs` is updated to `"Pipeline"` in the database
5. The candidate also appears in the Live Feed → Pipeline Candidates section

### What will NOT change
- Submit button — unchanged
- Reject button — unchanged
- The `shortListCandidates` filter logic — already correct, no change needed
- Live Feed pipeline section — already implemented, no change needed
- No other pages, components, or tables touched
