

## Restrict Interview Access by Candidate Status

### Overview
Add status validation to the interview call page so only candidates with specific statuses can access the interview. This prevents candidates who have already completed calls or been rejected from accessing the interview link.

---

### Allowed Statuses

| Status | Access |
|--------|--------|
| `Ready to Call` / `Ready to Contact` | Allowed |
| `Contacted` | Allowed |
| `1st No Answer` | Allowed |
| `2nd No Answer` | Allowed |
| `3rd No Answer` | Allowed |
| `Call Done` | Blocked |
| `Rejected` | Blocked |
| `Not Contacted` | Blocked |
| `Low Scored` | Blocked |
| `Tasked` | Blocked |

---

### Implementation

#### File: `src/pages/InterviewCall.tsx`

**1. Add status to data fetching:**
```typescript
// Add 'contacted' to the select query
.select('recordid, candidate_name, candidate_email, job_id, user_id, callcount, two_questions_of_interview, contacted')
```

**2. Add status to interface:**
```typescript
interface InterviewData {
  // ... existing fields
  contacted_status: string | null;
}
```

**3. Add status validation constant:**
```typescript
const ALLOWED_STATUSES = [
  'Ready to Call',
  'Ready to Contact',
  'Contacted',
  '1st No Answer',
  '2nd No Answer',
  '3rd No Answer',
];
```

**4. Add status check after fetching data:**
- Check if `contacted_status` is in the allowed list
- If not, show a "Interview Not Available" message with appropriate text

**5. Add new blocked status UI state:**
A new screen will display when the candidate's status doesn't allow interview access:
- For `Call Done`: "Your interview has already been completed"
- For `Rejected` / other: "This interview is no longer available"

---

### User Experience

| Scenario | Message Shown |
|----------|--------------|
| Status = `Ready to Call` | Normal interview UI |
| Status = `Contacted` | Normal interview UI |
| Status = `1st/2nd/3rd No Answer` | Normal interview UI |
| Status = `Call Done` | "Your interview has already been completed. Our team will be in touch soon." |
| Status = `Rejected` | "This interview is no longer available. Please contact the recruiter." |
| Status = other blocked | "This interview is not available at the moment. Please contact the recruiter." |

---

### Technical Summary

| Change | Description |
|--------|-------------|
| Add `contacted` to query | Fetch status from `Jobs_CVs` table |
| Add status validation | Check against allowed statuses list |
| Add blocked UI states | Show appropriate message based on status |

