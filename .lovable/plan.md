

## Add Shortlisted Boolean Check + Display Disqualification Reason

### Three changes needed:

#### 1. Update existing shortlisted records (SQL data update)
Run an UPDATE query to set `shortlisted = true` for all Jobs_CVs records that qualify as shortlisted (score >= 74 and not "Shortlisted from Similar jobs"):
```sql
UPDATE "Jobs_CVs" SET shortlisted = true 
WHERE after_call_score >= 74 
AND (contacted IS NULL OR contacted != 'Shortlisted from Similar jobs');
```

#### 2. Set `shortlisted = true` when submitting/shortlisting (`src/pages/JobDetails.tsx`)
- In `handleHireCandidate` (~line 1773): add `shortlisted: true` to the update payload alongside `contacted: "Submitted"`
- In `handleRejectCandidate` (~line 1600): no change needed (rejected candidates may have been shortlisted previously)
- Find any other place where a candidate's status changes to a shortlist-qualifying state and ensure `shortlisted: true` is set

Also, the `shortlisted` boolean should be set to `true` in the mapped candidate data when score >= 74 (in the `fetchCandidates` mapping ~line 801), so the UI can reference it.

#### 3. Display `disqualification_reason` in candidate cards (`src/pages/JobDetails.tsx`)
- In `renderCandidateCard` (~line 2706): after the rejected/submitted banners, add a disqualification reason display when `mainCandidate["disqualification_reason"]` exists
- Show it as a warning banner similar to the rejection reason pattern, with an amber/orange color scheme
- The data is already fetched since the query uses `select("*")`

### Files to modify:
- `src/pages/JobDetails.tsx` - Add `shortlisted: true` to submit update, map `disqualification_reason` in candidate data, display it in card UI
- SQL data update for existing records (using insert tool)

