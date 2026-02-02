

## Goal
Add a new view/tab called "Shortlisted from Similar Jobs" on the Job Details page (`/job/{job_id}`) that displays candidates with `contacted` status equal to "Shortlisted from Similar Jobs" for the current job, with the ability to call candidates similar to the Longlist view.

## Current Tab Structure
The Job Details page currently has these tabs:
1. Overview
2. Description
3. AI Requirements
4. Applications
5. AI Longlist (boolean-search)
6. AI Short List (shortlist)
7. Job Analytics

## Implementation Plan

### 1. Add New Tab to TabsList (Lines ~3310-3353)

**Mobile Dropdown (Select):**
- Add a new `SelectItem` for "Similar Jobs" between "AI Short List" and "Job Analytics"

**Desktop Tabs (TabsList):**
- Add a new `TabsTrigger` with value "similar-jobs" for "Similar Jobs"
- Update the grid layout from `md:grid-cols-8` to `md:grid-cols-8` (or adjust as needed for 8 tabs)

### 2. Create State Variables for Similar Jobs Tab

Add new state variables around lines 100-125:
```tsx
const [similarJobsCandidates, setSimilarJobsCandidates] = useState<any[]>([]);
const [similarJobsLoading, setSimilarJobsLoading] = useState(false);

// Filters for Similar Jobs tab
const [similarJobsNameFilter, setSimilarJobsNameFilter] = useState("");
const [similarJobsEmailFilter, setSimilarJobsEmailFilter] = useState("");
const [similarJobsPhoneFilter, setSimilarJobsPhoneFilter] = useState("");
const [similarJobsUserIdFilter, setSimilarJobsUserIdFilter] = useState("");
```

### 3. Add Fetch Function for Similar Jobs Candidates

Create a new function similar to `fetchLonglistedCandidates` that fetches candidates with:
- Same `job_id` as current job
- `contacted` status equals "Shortlisted from Similar Jobs"

```tsx
const fetchSimilarJobsCandidates = async (jobId: string) => {
  setSimilarJobsLoading(true);
  try {
    const { data, error } = await supabase
      .from("Jobs_CVs")
      .select("*")
      .eq("job_id", jobId)
      .eq("contacted", "Shortlisted from Similar Jobs")
      .order("cv_score", { ascending: false });

    if (error) throw error;
    setSimilarJobsCandidates(data || []);
  } catch (error) {
    console.error("Error fetching similar jobs candidates:", error);
    toast({
      title: "Error",
      description: "Failed to load candidates from similar jobs",
      variant: "destructive",
    });
  } finally {
    setSimilarJobsLoading(false);
  }
};
```

### 4. Call Fetch Function on Tab Load

Add to the initial useEffect (around line 373-423):
```tsx
fetchSimilarJobsCandidates(id);
```

### 5. Create TabsContent for "Similar Jobs"

Add a new `TabsContent` with value="similar-jobs" that includes:
- Card with header showing count of candidates
- Filter section (Name, Email, Phone, User ID filters)
- Select All / Bulk Actions functionality (similar to Longlist)
- Candidate cards with:
  - Candidate name, email, phone
  - Source badge
  - CV Score / LinkedIn Score
  - Status badges
  - **Call Candidate button** (using existing `handleCallCandidate` function)
  - **Call Log button** (links to call log details)
  - **View Profile button** (links to candidate profile)
  - Remove from list option

### 6. UI Structure for Similar Jobs Tab

The tab content will follow the same pattern as the AI Longlist tab:

```text
+----------------------------------------------------------+
|  Shortlisted from Similar Jobs (X candidates)            |
|  Candidates shortlisted from similar job positions       |
+----------------------------------------------------------+
|  [Filters: Name, Email, Phone, User ID]                  |
|  [Select All]                                            |
+----------------------------------------------------------+
|  BULK ACTIONS (when selected):                           |
|  [Clear] [X candidates selected]    [Call Selected]      |
+----------------------------------------------------------+
|                                                          |
|  +-- Candidate Card ----------------------------------+  |
|  | [Checkbox] Name                      [Source Badge]|  |
|  | Email, Phone                                       |  |
|  | CV Score: XX   User ID: XXX                        |  |
|  | [Status Badge]                                     |  |
|  | [Call Candidate] [Call Log] [View Profile]         |  |
|  +----------------------------------------------------+  |
|                                                          |
+----------------------------------------------------------+
```

### 7. Filter Function for Similar Jobs

Create a filter function:
```tsx
const filteredSimilarJobsCandidates = similarJobsCandidates.filter((candidate) => {
  const nameMatch = !similarJobsNameFilter || 
    (candidate["candidate_name"] || "").toLowerCase().includes(similarJobsNameFilter.toLowerCase());
  const emailMatch = !similarJobsEmailFilter || 
    (candidate["candidate_email"] || "").toLowerCase().includes(similarJobsEmailFilter.toLowerCase());
  const phoneMatch = !similarJobsPhoneFilter || 
    (candidate["candidate_phone_number"] || "").includes(similarJobsPhoneFilter);
  const userIdMatch = !similarJobsUserIdFilter || 
    (candidate.user_id || "").toString().includes(similarJobsUserIdFilter);
  return nameMatch && emailMatch && phoneMatch && userIdMatch;
});
```

---

## Files to Modify

**`src/pages/JobDetails.tsx`**
1. Add state variables for similar jobs data and filters (~line 100-125)
2. Create `fetchSimilarJobsCandidates` function (~after line 600)
3. Call fetch function in initial useEffect (~line 380)
4. Add "Similar Jobs" option to mobile dropdown (~line 3318)
5. Add "Similar Jobs" TabsTrigger to desktop tabs (~line 3350)
6. Add TabsContent for "similar-jobs" (~after line 5100, after the Job Analytics tab)

---

## Call Candidate Functionality
The existing `handleCallCandidate` function (lines 1828-1867) will be reused. It:
1. Finds the candidate record
2. Sends a POST request to the Make.com webhook with user_id, jobID, job_itris_id, and recordid
3. Shows success/error toast

---

## Testing Checklist
1. Verify the new "Similar Jobs" tab appears in both mobile dropdown and desktop tabs
2. Test with candidates that have "Shortlisted from Similar Jobs" status
3. Verify filters work correctly (Name, Email, Phone, User ID)
4. Test Call Candidate button triggers the webhook
5. Test Call Log button navigates to correct page
6. Test View Profile button navigates to candidate profile
7. Test bulk selection and "Call Selected" functionality
8. Verify mobile responsive layout

