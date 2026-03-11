

## Fix: Show Candidate Name Instead of ID in Longlist

### Problem
In `fetchLonglistedCandidates`, the candidate name is set as `row.candidate_name ?? ""` (line 1071) with no fallback. In contrast, `fetchCandidates` (line 818-822) has a 3-level fallback: Jobs_CVs → profiles → CVs table. When `candidate_name` is null, the UI falls back to showing the candidate ID.

### Solution
Add the same name fallback logic to `fetchLonglistedCandidates`:

1. **Extend the CVs query** (line 932) to also fetch `name, Firstname, Lastname` alongside `phone_number`
2. **Build a `cvsNameMap`** from that data (same pattern as line 792-803)
3. **Fetch profiles** for longlisted user IDs to get names as a secondary fallback
4. **Update line 1071** to use: `row.candidate_name || profilesMap.get(row.user_id) || cvsNameMap.get(row.user_id) || ""`

This mirrors the existing pattern in `fetchCandidates` and is ~15 lines of additional code.

