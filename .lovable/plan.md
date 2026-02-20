
## Fix: Show Job Date on Mobile (Jobs Page)

### Root Cause
The entire job details block — including the Created date, recruiter name, location, salary, and contract length — is wrapped in a `div` with `className="hidden sm:block"`. This hides all of it on mobile screens (below the `sm` breakpoint of 640px).

The relevant code is in `src/components/jobs/JobManagementPanel.tsx` around **line 863**:
```tsx
<div className="hidden sm:block space-y-1 sm:space-y-2 text-xs sm:text-sm">
  {job.recruiter_name && ...}
  {job.job_location && ...}
  {job.job_salary_range && ...}
  {job.contract_length && ...}
  {job.Timestamp && <div>Created: ...</div>}   ← hidden on mobile
</div>
```

### Solution
Show the **Created date** on mobile by pulling it out of the hidden block and making it always visible. The other details (recruiter, location, salary, contract length) can stay hidden on mobile to keep the card compact — but the date is a key piece of information that should always be shown.

**File:** `src/components/jobs/JobManagementPanel.tsx`

**Change 1 — Remove the date from the `hidden sm:block` div** and place it outside (below the block) so it renders on both mobile and desktop:

Before (inside the hidden block, lines ~883-886):
```tsx
{job.Timestamp && <div className="flex items-center text-muted-foreground min-w-0">
    <Calendar className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
    <span className="truncate">Created: {format(new Date(job.Timestamp), 'MMM dd, yyyy HH:mm')}</span>
  </div>}
```

After — remove it from the `hidden sm:block` div and add it just below that div, always visible:
```tsx
{job.Timestamp && (
  <div className="flex items-center text-muted-foreground text-xs sm:text-sm min-w-0">
    <Calendar className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
    <span className="truncate">Created: {format(new Date(job.Timestamp), 'MMM dd, yyyy HH:mm')}</span>
  </div>
)}
```

This way:
- **Mobile**: Shows the created date below the card header, before the candidate count boxes
- **Desktop**: Continues to show it in the same position as before (just outside the hidden block now, same visual area)
- All other details (recruiter, location, salary, contract) remain hidden on mobile to keep cards compact

### What Users Will See on Mobile
Each job card will now display the creation date (e.g., "Created: Feb 20, 2026 10:30") with a calendar icon — always visible on both mobile and desktop — without cluttering the mobile card with all other details.
