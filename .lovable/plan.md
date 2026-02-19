
## Plan: Two UI Improvements

### 1. Show Rejection Reason on Hover (AI Shortlist tab)

Currently, when a candidate is rejected in the AI Shortlist, the card shows a red banner with "Rejected on [date]" but the rejection reason is only visible in the call log. 

**Change:** Add a tooltip (using the existing HoverCard component) to the rejected banner so hovering over it shows the rejection reason.

**File:** `src/pages/JobDetails.tsx`
- On the rejected banner (lines 2655-2659), wrap it with a `HoverCard` + `HoverCardTrigger` + `HoverCardContent`
- On hover, display `mainCandidate["Reason_to_reject"]` (already available via the `...row` spread on line 812)
- Also add the reason to the disabled "Rejected" button area (lines 3070-3079) as a tooltip
- Import `HoverCard, HoverCardTrigger, HoverCardContent` from the existing hover-card component

### 2. Shortlisted Box Click Navigates to AI Shortlist (Jobs page)

Currently, the candidate count boxes (Longlisted, Shortlisted, Rejected, Submitted) on each job card in the Jobs page are static displays.

**Change:** Make the "Shortlisted" count box clickable so it navigates to `/job/{job_id}` with the AI Shortlist tab active.

**File:** `src/components/jobs/JobManagementPanel.tsx`
- On the Shortlisted count box (lines 879-885), wrap it with a clickable element or add an `onClick` handler
- Navigate to `/job/${job.job_id}` with `state: { tab: "shortlist" }` (the JobDetails page already supports `location.state?.tab` on line 411)
- Add cursor-pointer styling to indicate it's clickable

### Technical Details

**Imports needed in JobDetails.tsx:**
```
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
```

**Rejected banner with hover (JobDetails.tsx ~line 2655):**
- Wrap the existing red banner div in HoverCard/HoverCardTrigger
- Show HoverCardContent with the rejection reason text
- Only show HoverCardContent if `Reason_to_reject` exists

**Shortlisted box click (JobManagementPanel.tsx ~line 879):**
- Add `onClick={() => navigate(`/job/${job.job_id}`, { state: { tab: "shortlist" } })}` to the shortlisted count div
- Add `cursor-pointer` class for visual feedback
