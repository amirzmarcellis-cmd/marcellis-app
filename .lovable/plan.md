

## Issue Analysis

Found **two bugs** in the "Shortlisted from Similar Jobs" tab:

### Bug 1: View Call Logs Not Working
- **Problem**: The code navigates to `/call-log/${candidate.recordid}` which is not a valid route
- **Valid Routes**:
  - `/call-log` - Main call log list
  - `/call-log-details` - Call log details page
  - `/call-log-details/:recordid` - Call log details with recordid param
- **Fix**: Change to use `/call-log-details?recordId=${candidate.recordid}&jobId=${job.job_id}&fromTab=similar-jobs`

### Bug 2: View Profile Not Working
- **Problem**: The code navigates to `/candidates/${candidate.user_id}` (plural "candidates")
- **Valid Route**: `/candidate/:id` (singular "candidate")
- **Fix**: Change from `/candidates/` to `/candidate/`

---

## Implementation Details

### File to Modify
**`src/pages/JobDetails.tsx`**

### Change 1: Fix Call Log Navigation (Line ~5721)

**Current (broken):**
```tsx
onClick={() =>
  navigate(`/call-log/${candidate.recordid}`, {
    state: {
      from: location.pathname,
      tab: activeTab,
      focusCandidateId: candidateId,
    },
  })
}
```

**Fixed:**
```tsx
onClick={() =>
  navigate(`/call-log-details?recordId=${candidate.recordid}&jobId=${job.job_id}&fromTab=similar-jobs`)
}
```

### Change 2: Fix View Profile Navigation (Line ~5739)

**Current (broken):**
```tsx
onClick={() =>
  navigate(`/candidates/${candidate.user_id}`, {
    state: {
      from: location.pathname,
      tab: activeTab,
      focusCandidateId: candidateId,
    },
  })
}
```

**Fixed:**
```tsx
onClick={() =>
  navigate(`/candidate/${candidate.user_id}`, {
    state: {
      fromJob: id,
      tab: "similar-jobs",
      focusCandidateId: candidateId,
    },
  })
}
```

### Additional Improvement: Always Show Call Log Button

Currently, the Call Log button is only shown when `candidate.recording` exists. We should always show it (like other tabs do) so users can view any call history:

**Current:**
```tsx
{candidate.recording && (
  <Button ...>Call Log</Button>
)}
```

**Fixed:**
```tsx
<Button ...>Call Log</Button>
// Remove the conditional wrapper
```

---

## Testing Checklist
1. Click "View Profile" on a candidate in Similar Jobs tab - should navigate to `/candidate/{user_id}`
2. Click "Call Log" on a candidate in Similar Jobs tab - should navigate to call log details page
3. Verify back navigation works correctly from both pages
4. Confirm no impact on other tabs (AI Longlist, Shortlist, etc.)

