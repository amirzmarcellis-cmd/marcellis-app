

## Goal
Exclude candidates with `contacted` status of "Shortlisted from Similar jobs" from shortlist counts across all relevant pages.

## Current Shortlist Counting Logic
Currently, shortlisted candidates are defined as those with `after_call_score >= 75` (or `>= 74` in some cases). The exclusion of "Shortlisted from Similar jobs" status is not currently applied.

## Files and Locations to Update

### 1. Job Details Page (`src/pages/JobDetails.tsx`)

**Location: Lines ~2994-2998**
```tsx
// Current: Short list candidates (after_call_score >= 74)
const shortListCandidates = candidates
  .filter((candidate) => {
    const score = parseFloat(candidate.after_call_score || "0");
    const isRejected = candidate["Contacted"] === "Rejected";
    return score >= 74 && !isRejected;
  })
```

**Change**: Add exclusion for "Shortlisted from Similar jobs":
```tsx
const shortListCandidates = candidates
  .filter((candidate) => {
    const score = parseFloat(candidate.after_call_score || "0");
    const isRejected = candidate["Contacted"] === "Rejected";
    const isFromSimilarJobs = candidate["contacted"] === "Shortlisted from Similar jobs";
    return score >= 74 && !isRejected && !isFromSimilarJobs;
  })
```

**Location: Lines ~3006-3012** (rejected short list)
```tsx
const rejectedShortListCandidates = candidates
  .filter((candidate) => {
    const score = parseFloat(candidate.after_call_score || "0");
    const isRejected = candidate["Contacted"] === "Rejected";
    return score >= 74 && isRejected;
  })
```

**Change**: Add exclusion for "Shortlisted from Similar jobs":
```tsx
const rejectedShortListCandidates = candidates
  .filter((candidate) => {
    const score = parseFloat(candidate.after_call_score || "0");
    const isRejected = candidate["Contacted"] === "Rejected";
    const isFromSimilarJobs = candidate["contacted"] === "Shortlisted from Similar jobs";
    return score >= 74 && isRejected && !isFromSimilarJobs;
  })
```

---

### 2. Job Funnel Component (`src/components/jobs/JobFunnel.tsx`)

**Location: Lines ~52-55**
```tsx
// Count shortlist candidates (score >= 75) - unified definition
if (score >= 75) {
  acc.shortlist++;
}
```

**Change**: Add exclusion for "Shortlisted from Similar jobs":
```tsx
// Count shortlist candidates (score >= 75) - unified definition
// Exclude candidates with "Shortlisted from Similar jobs" status
if (score >= 75 && contacted !== "Shortlisted from Similar jobs") {
  acc.shortlist++;
}
```

---

### 3. Job Management Panel (`src/components/jobs/JobManagementPanel.tsx`)

**Location: Lines ~208-212**
```tsx
// Shortlisted: candidates with score >= 75 (unified definition)
const shortlisted_count = longlistedCandidates.filter(c => {
  const score = parseInt(c.after_call_score || "0");
  return score >= 75;
}).length;
```

**Change**: Add exclusion for "Shortlisted from Similar jobs":
```tsx
// Shortlisted: candidates with score >= 75 (unified definition)
// Exclude candidates with "Shortlisted from Similar jobs" status
const shortlisted_count = longlistedCandidates.filter(c => {
  const score = parseInt(c.after_call_score || "0");
  const contacted = c.contacted || "";
  return score >= 75 && contacted !== "Shortlisted from Similar jobs";
}).length;
```

---

### 4. Active Jobs Analytics Page (`src/pages/ActiveJobsAnalytics.tsx`)

**Location: Lines ~203-207 (summary counts)**
```tsx
// Shortlisted (after_call_score >= 74)
supabase
  .from('Jobs_CVs')
  .select('*', { count: 'exact', head: true })
  .in('job_id', jobIds)
  .gte('after_call_score', 74),
```

**Change**: Add filter to exclude "Shortlisted from Similar jobs":
```tsx
// Shortlisted (after_call_score >= 74), excluding "Shortlisted from Similar jobs"
supabase
  .from('Jobs_CVs')
  .select('*', { count: 'exact', head: true })
  .in('job_id', jobIds)
  .gte('after_call_score', 74)
  .neq('contacted', 'Shortlisted from Similar jobs'),
```

**Location: Lines ~276-278 (per-job metrics)**
```tsx
supabase.from('Jobs_CVs').select('*', { count: 'exact', head: true }).eq('job_id', job.job_id).gte('after_call_score', 74),
```

**Change**: Add filter to exclude "Shortlisted from Similar jobs":
```tsx
supabase.from('Jobs_CVs').select('*', { count: 'exact', head: true }).eq('job_id', job.job_id).gte('after_call_score', 74).neq('contacted', 'Shortlisted from Similar jobs'),
```

---

### 5. Reports Data Hook (`src/hooks/useReportsData.ts`)

**Location: Line ~70**
```tsx
const shortlisted = records.filter(r => r.shortlisted_at).length;
```

**Change**: Add exclusion for "Shortlisted from Similar jobs":
```tsx
const shortlisted = records.filter(r => r.shortlisted_at && r.contacted !== 'Shortlisted from Similar jobs').length;
```

---

### 6. Dashboard/Index Page (`src/pages/Index.tsx`)

**Location: Lines ~292-296**
```tsx
const totalShortlisted = links.filter((jc: any) => 
  jc.contacted?.toLowerCase() === 'call done' && 
  jc.after_call_score !== null && 
  parseInt(jc.after_call_score?.toString() || '0') >= 75
).length;
```

**Change**: Add exclusion for "Shortlisted from Similar jobs":
```tsx
const totalShortlisted = links.filter((jc: any) => 
  jc.contacted?.toLowerCase() === 'call done' && 
  jc.after_call_score !== null && 
  parseInt(jc.after_call_score?.toString() || '0') >= 75 &&
  jc.contacted !== 'Shortlisted from Similar jobs'
).length;
```

---

## Summary of Changes

| File | Location | Change |
|------|----------|--------|
| `JobDetails.tsx` | Lines ~2994-2998 | Add `!isFromSimilarJobs` filter |
| `JobDetails.tsx` | Lines ~3006-3012 | Add `!isFromSimilarJobs` filter |
| `JobFunnel.tsx` | Lines ~52-55 | Add `contacted !== "Shortlisted from Similar jobs"` check |
| `JobManagementPanel.tsx` | Lines ~208-212 | Add exclusion filter for contacted status |
| `ActiveJobsAnalytics.tsx` | Lines ~203-207 | Add `.neq('contacted', 'Shortlisted from Similar jobs')` |
| `ActiveJobsAnalytics.tsx` | Lines ~276-278 | Add `.neq('contacted', 'Shortlisted from Similar jobs')` |
| `useReportsData.ts` | Line ~70 | Add `r.contacted !== 'Shortlisted from Similar jobs'` |
| `Index.tsx` | Lines ~292-296 | Add exclusion for "Shortlisted from Similar jobs" |

---

## Testing Checklist
1. Verify Job Details page AI Shortlist count excludes "Shortlisted from Similar jobs" candidates
2. Verify Job Funnel shows updated shortlist count
3. Verify Jobs page job cards show correct shortlist count
4. Verify Active Jobs Analytics summary counts are accurate
5. Verify Reports pipeline metrics reflect the exclusion
6. Verify Dashboard shortlisted count is accurate
7. Confirm "Shortlisted from Similar Jobs" tab still shows these candidates correctly

