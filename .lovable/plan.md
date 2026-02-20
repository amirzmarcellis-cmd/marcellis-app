
## Add Job Title Search Bar to Jobs Page

### What's being added
A search input field on the Jobs page that filters job cards in real-time by job title as the user types.

### Where the changes go
**File:** `src/components/jobs/JobManagementPanel.tsx`

### Technical Details

**1. Add search state variable** (after the existing filter states around line 55):
```ts
const [searchQuery, setSearchQuery] = useState<string>("");
```

**2. Add search input UI** in the Filters section (around line 579), before the Group Filter — a styled text input with a Search icon:
```tsx
<div className="flex items-center gap-2 w-full sm:w-auto">
  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
  <input
    type="text"
    placeholder="Search by job title..."
    value={searchQuery}
    onChange={e => setSearchQuery(e.target.value)}
    className="h-10 px-3 py-2 rounded-md border border-border bg-background text-sm font-light font-inter w-full sm:w-[240px]"
  />
  {searchQuery && (
    <button onClick={() => setSearchQuery("")}>
      <X className="h-4 w-4 text-muted-foreground" />
    </button>
  )}
</div>
```

**3. Add search filtering to the `filteredJobs` useMemo** (around line 520 in `applyFilters`):
```ts
const filterJobsByTitle = (jobList: Job[]) => {
  if (!searchQuery.trim()) return jobList;
  const q = searchQuery.toLowerCase();
  return jobList.filter(job => job.job_title?.toLowerCase().includes(q));
};

const applyFilters = (jobList: Job[]) => {
  let filtered = filterJobsByGroup(jobList);
  filtered = filterJobsByDate(filtered);
  filtered = filterJobsByRecruiter(filtered);
  filtered = filterJobsByTitle(filtered);
  return filtered;
};
```
Also add `searchQuery` to the `useMemo` dependency array.

**4. Import `Search` icon** — add `Search` to the existing `lucide-react` import on line 9 (it's already destructured from there alongside other icons).

### What users will see
- A search box appears at the top of the filters row, before the Group and Recruiter filters
- Typing in it instantly filters the Active, Paused, and All Jobs tabs simultaneously
- A small ✕ clear button appears when there's text in the search box, making it easy to reset
- The job count in each tab updates live to reflect the search results
