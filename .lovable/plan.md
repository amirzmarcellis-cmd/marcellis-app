

## Fix Phone Number Discrepancy + Always Prefer CV Profile Phone

### Problem
Nabeel Muhammad (user_id: 177444) has phone `00971567973036` in Jobs_CVs but `+971585034438` in the CVs table. The job details page shows the Jobs_CVs phone number, which is incorrect.

### Two changes:

#### 1. Update this record's phone number (data fix)
Run an UPDATE on Jobs_CVs to correct Nabeel's phone number:
```sql
UPDATE "Jobs_CVs" SET candidate_phone_number = '+971585034438' 
WHERE user_id = '177444' AND job_id = 'me-j-0346';
```

#### 2. Code change in `src/pages/JobDetails.tsx`
- **Line 756**: Add `phone_number` to the CVs select: `supabase.from("CVs").select("user_id, name, Firstname, Lastname, phone_number")`
- **Lines 791-799**: Update the `cvsMap` to also store `phone_number` alongside the name
- **Line 831**: Change phone number mapping to prefer CVs phone over Jobs_CVs:
  ```
  "Candidate Phone Number": cvsPhoneMap.get(row.user_id) || row.candidate_phone_number || ""
  ```
- **Line 1054** (similar jobs mapping): Same fallback pattern

This ensures the CV profile phone number is always preferred, with Jobs_CVs as fallback.

