
## AI Shortlist: Rename Buttons & Add "Pipeline" Button (UI Only)

### What's changing
Three button changes in the AI Shortlist section of `src/pages/JobDetails.tsx`, around lines 3058–3128:

1. **"Submit CV" → "Submit"** — same click action, shorter label
2. **"Reject Candidate" → "Reject"** — same click action, shorter label
3. **New "Pipeline" button** — UI only, no database changes, no status updates

---

### File: `src/pages/JobDetails.tsx`

---

### Change 1 — Rename "Submit CV" → "Submit" (line 3086)

```tsx
// Before
<FileCheck className="w-4 h-4 mr-1.5" />
Submit CV

// After
<FileCheck className="w-4 h-4 mr-1.5" />
Submit
```

---

### Change 2 — Rename "Reject Candidate" → "Reject" (line 3125)

```tsx
// Before
<X className="w-4 h-4 mr-1.5" />
Reject Candidate

// After
<X className="w-4 h-4 mr-1.5" />
Reject
```

---

### Change 3 — Add "Pipeline" button (line 3128, inside the same `flex flex-col sm:flex-row gap-2` div)

The Pipeline button is a **UI-only button** — clicking it will show a toast notification (e.g. "Added to Pipeline") but will **not update any database field or candidate status**. It appears in the same button row as Submit and Reject.

Button styled in purple/indigo to visually distinguish it:

```tsx
<Button
  variant="outline"
  size="sm"
  onClick={() => toast({ title: "Pipeline", description: "Candidate added to pipeline." })}
  className="w-full sm:flex-1 min-w-0 sm:min-w-[120px] h-10 bg-transparent border-2 border-purple-500 text-purple-600 hover:bg-purple-50 hover:border-purple-600 hover:text-purple-700 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-950/30 transition-all duration-200"
>
  <GitBranch className="w-4 h-4 mr-1.5" />
  Pipeline
</Button>
```

Add `GitBranch` to the existing `lucide-react` import.

---

### Final button layout

```text
[ Submit ]  [ Pipeline ]  [ Reject ]
```

All three stack vertically on mobile and sit side by side on desktop (existing `flex-col sm:flex-row` layout handles this automatically).

---

### What will NOT change
- No database writes
- No status field updates
- No logic changes to the existing Submit or Reject handlers
- The "CV Submitted" and "Rejected" disabled states remain exactly as they are
