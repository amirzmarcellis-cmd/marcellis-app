

## Expand VAPI Variable Values for Interview Calls

### Overview
Update the interview call page to fetch and pass all available data from `Jobs` and `Jobs_CVs` tables to the VAPI assistant, with the clarified variable mappings.

---

### Variable Mappings (Updated)

| VAPI Variable | Source Table | Database Column |
|---------------|--------------|-----------------|
| `Job_id` | Jobs | `job_id` |
| `recordid` | Jobs_CVs | `recordid` |
| `job_title` | Jobs | `job_title` |
| `client_name` | Jobs | `client_name` |
| `candidate_id` | Jobs_CVs | `user_id` |
| `candidate_name` | Jobs_CVs | `candidate_name` |
| `candidate_name_ipa` | Jobs_CVs | `candidate_name` (same value) |
| `job_salary_range` | Jobs | `job_salary_range` |
| `job_location` | Jobs | `job_location` |
| `client_description` | Jobs | `client_description` |
| `contract_perm_type` | Jobs | `Type` |
| `callcount` | Jobs_CVs | `callcount` |
| `job_itris_id` | Jobs | `itris_job_id` |
| `things_to_look_for_in_candidate` | Jobs | `things_to_look_for` |
| `list_of_3_specific_questions` | Jobs_CVs | `two_questions_of_interview` |

**Removed (per your request):**
- `Scenario_id` - Not needed
- `company_name` - Not needed

---

### Files to Modify

#### 1. `src/hooks/useVapiCall.ts`
Update type signature to accept mixed value types:

```typescript
// Change from:
Record<string, string>

// To:
Record<string, string | number>
```

#### 2. `src/pages/InterviewCall.tsx`

**Expand the data interface:**
```typescript
interface InterviewData {
  // From Jobs_CVs
  recordid: number;
  candidate_name: string | null;
  candidate_email: string | null;
  candidate_id: string;
  job_id: string;
  callcount: number | null;
  two_questions_of_interview: string | null;
  
  // From Jobs
  job_title: string | null;
  job_location: string | null;
  job_salary_range: number | null;
  client_name: string | null;
  client_description: string | null;
  contract_perm_type: string | null;
  job_itris_id: string | null;
  things_to_look_for: string | null;
  vapi_ai_assistant: string | null;
}
```

**Update Supabase queries:**
```typescript
// Jobs_CVs query - add two_questions_of_interview
.select('recordid, candidate_name, candidate_email, job_id, user_id, callcount, two_questions_of_interview')

// Jobs query
.select('job_title, job_location, job_salary_range, client_name, client_description, Type, itris_job_id, things_to_look_for, vapi_ai_assistant')
```

**Pass all variables to VAPI:**
```typescript
await startCall(interviewData.vapi_ai_assistant, {
  // IDs
  Job_id: interviewData.job_id,
  recordid: interviewData.recordid,
  candidate_id: interviewData.candidate_id,
  job_itris_id: interviewData.job_itris_id || '',
  
  // Candidate info
  candidate_name: interviewData.candidate_name || 'Candidate',
  candidate_name_ipa: interviewData.candidate_name || 'Candidate',
  callcount: interviewData.callcount || 0,
  
  // Job info  
  job_title: interviewData.job_title || 'Position',
  job_location: interviewData.job_location || '',
  job_salary_range: interviewData.job_salary_range || 0,
  contract_perm_type: interviewData.contract_perm_type || '',
  
  // Client info
  client_name: interviewData.client_name || '',
  client_description: interviewData.client_description || '',
  
  // Interview context
  things_to_look_for_in_candidate: interviewData.things_to_look_for || '',
  list_of_3_specific_questions: interviewData.two_questions_of_interview || '',
});
```

---

### Summary

| File | Change |
|------|--------|
| `src/hooks/useVapiCall.ts` | Update type to accept `string \| number` values |
| `src/pages/InterviewCall.tsx` | Expand queries and pass 15 variables to VAPI |

This will pass **15 variables** to the VAPI assistant, providing full context for personalized interviews.

