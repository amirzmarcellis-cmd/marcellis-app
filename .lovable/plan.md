

## Fix: `cvsPhoneMap` Not Defined in `fetchLonglistedCandidates`

### Problem
The console error `ReferenceError: cvsPhoneMap is not defined` crashes the AI Longlist tab. The variable `cvsPhoneMap` is created inside `fetchCandidates()` (line ~793) but referenced in the separate `fetchLonglistedCandidates()` function (line ~1058), where it's out of scope.

### Solution
In `fetchLonglistedCandidates`, add a CVs data fetch and build a local `cvsPhoneMap`, mirroring what `fetchCandidates` does:

1. **In `fetchLonglistedCandidates`** (~after line 924, before the mapping at line 1022):
   - Collect all `user_id` values from `longlistedData`
   - Query the `CVs` table for those user IDs, selecting `user_id` and `phone_number`
   - Build a local `cvsPhoneMap` Map from the results

This is a small, self-contained fix — just ~10 lines of code added to the existing function.

