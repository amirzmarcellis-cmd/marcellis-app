

## Add "Submit CV" Option to AI Longlist and Similar Jobs Tabs

### Summary
Add a "Submit CV" button to candidate cards in both the **AI Longlist** and **Similar Jobs** tabs, allowing recruiters to submit any candidate's CV directly from these views without needing to first call them and move them to the shortlist.

---

### Current Behavior
- The "Submit CV" button only exists in the **AI Short List** tab
- It requires candidates to have a call record (`callid`) before submission
- Candidates in AI Longlist and Similar Jobs cannot be submitted without going through the call flow

### New Behavior
- Add "Submit CV" button to each candidate card in **AI Longlist** tab
- Add "Submit CV" button to each candidate card in **Similar Jobs** tab
- Use the candidate's `recordid` as the identifier (same pattern as call flow)
- Reuse the existing `openHireDialog` and `handleHireCandidate` functions

---

### Technical Changes

**File: `src/pages/JobDetails.tsx`**

#### 1. Modify the Handler for Longlist/Similar Jobs Submission
Create a simpler handler that uses `recordid` directly instead of requiring `callid`:

```typescript
// New handler for submitting candidates without a call record
const handleDirectCVSubmit = (jobId: string, candidateId: string, recordid: number) => {
  // recordid is the primary key in Jobs_CVs, same as callid for candidates with calls
  openHireDialog(jobId, candidateId, recordid);
};
```

#### 2. Add Submit CV Button to AI Longlist Candidate Cards (around line 4607)
After the existing action buttons section, add:

```tsx
{/* Submit CV Button */}
{mainCandidate["Contacted"] !== "Submitted" && mainCandidate["Contacted"] !== "Rejected" && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => handleDirectCVSubmit(id!, candidateId, mainCandidate.recordid)}
    className="w-full h-10 bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-50 hover:border-green-600 hover:text-green-700 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-950/30 dark:hover:border-green-500 dark:hover:text-green-300"
  >
    <FileCheck className="w-3 h-3 mr-1" />
    Submit CV
  </Button>
)}
{mainCandidate["Contacted"] === "Submitted" && (
  <Button
    variant="outline"
    size="sm"
    className="w-full h-10 bg-transparent border-2 border-blue-500 text-blue-600 cursor-default"
    disabled
  >
    <FileCheck className="w-3 h-3 mr-1" />
    CV Submitted
  </Button>
)}
```

#### 3. Add Submit CV Button to Similar Jobs Candidate Cards (around line 5771)
In the action buttons div, add after existing buttons:

```tsx
{/* Submit CV Button */}
{candidate.contacted !== "Submitted" && candidate.contacted !== "Rejected" && (
  <Button
    size="sm"
    variant="outline"
    className="h-8 text-xs border-green-600 text-green-600 hover:bg-green-50"
    onClick={() => handleDirectCVSubmit(job.job_id, candidateId, candidate.recordid)}
  >
    <FileCheck className="w-3 h-3 mr-1" />
    Submit CV
  </Button>
)}
{candidate.contacted === "Submitted" && (
  <Button
    size="sm"
    variant="outline"
    className="h-8 text-xs border-blue-500 text-blue-600 cursor-default"
    disabled
  >
    <FileCheck className="w-3 h-3 mr-1" />
    Submitted
  </Button>
)}
```

#### 4. Update Local State After Submission
Modify the `handleHireCandidate` function (around line 1684-1688) to also refresh similar jobs candidates:

```typescript
// Refresh candidates data
if (id) {
  fetchCandidates(id);
  fetchLonglistedCandidates(id);
  fetchSimilarJobsCandidates(id);  // Add this line
}
```

---

### UI Preview

**AI Longlist Card:**
```text
┌─────────────────────────────────────────┐
│ ☐ John Smith                            │
│   📧 john@example.com                   │
│   📱 +1234567890                         │
│   CV Score: 82                          │
├─────────────────────────────────────────┤
│ [Call Candidate] [Call Log]             │
│ [View Profile]   [View CV]              │
│ [Submit CV]                 ← NEW       │
└─────────────────────────────────────────┘
```

**Similar Jobs Card:**
```text
┌─────────────────────────────────────────┐
│ ☐ Jane Doe                  [LinkedIn]  │
│   📧 jane@example.com                   │
│   CV Score: 78                          │
│   [Shortlisted from Similar Jobs]       │
├─────────────────────────────────────────┤
│ [Call] [Call Log] [View Profile]        │
│ [Submit CV]                 ← NEW       │
└─────────────────────────────────────────┘
```

---

### Data Flow
1. User clicks "Submit CV" on a candidate card
2. `handleDirectCVSubmit` calls `openHireDialog` with `recordid`
3. User selects reason and adds additional info in dialog
4. `handleHireCandidate` updates `Jobs_CVs` record:
   - Sets `contacted` to "Submitted"
   - Sets `Reason_to_Hire` with reason + details
   - Sets `submitted_at` to current timestamp
5. UI refreshes all candidate lists

---

### Impact
- Recruiters can submit CVs directly from AI Longlist without calling first
- Recruiters can submit CVs from Similar Jobs candidates
- Uses existing dialog and database update logic (no new backend changes)
- Submitted candidates show visual indicator (disabled button with "CV Submitted")
- Existing shortlist submission flow remains unchanged

