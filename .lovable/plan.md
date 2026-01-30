

## Goal
Add a "Longlist Only" toggle option to the job creation form. When enabled, this will set `automatic_dial` to `false` in the database, meaning candidates for this job will only be longlisted (collected) without automatic calling.

## Current Behavior
- Jobs are created with `automatic_dial: true` by default (line 625 of AddJob.tsx)
- Auto-dial enables automatic calling of candidates

## New Feature
A toggle switch in the Mandatory Information section that allows recruiters to choose "Longlist Only" mode:
- **OFF (default)**: Job is created with `automatic_dial: true` (normal behavior - candidates will be called)
- **ON**: Job is created with `automatic_dial: false` (longlist only - no automatic calling)

---

## Implementation Details

### File to Modify
**`src/pages/AddJob.tsx`**

### Changes

1. **Add State for Longlist Only** (around line 275)
   - Add new state: `const [longlistOnly, setLonglistOnly] = useState(false);`

2. **Add Toggle UI in Mandatory Section** (after Job Difficulty field, around line 781)
   - Add a styled toggle section similar to the LinkedIn Search feature
   - Include clear label and description explaining the feature

3. **Update Database Insert** (line 625)
   - Change from: `automatic_dial: true`
   - To: `automatic_dial: !longlistOnly`

---

## UI Design

```text
┌─────────────────────────────────────────────────────────────┐
│ * Mandatory Information                                      │
├─────────────────────────────────────────────────────────────┤
│ Job Title *          │ Itris ID *         │ Group           │
├─────────────────────────────────────────────────────────────┤
│ Assigned Recruiter *                                        │
├─────────────────────────────────────────────────────────────┤
│ Job Difficulty                                              │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📋 Longlist Only                              [Toggle]  │ │ ← NEW
│ │ Collect candidates without automatic calling.           │ │
│ │ Candidates will be longlisted for manual review.        │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ 🔍 LinkedIn Search                                [Toggle]  │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Details

### State Addition
```tsx
const [longlistOnly, setLonglistOnly] = useState(false);
```

### UI Component (styled similarly to LinkedIn Search toggle)
```tsx
<div className="space-y-3 p-5 border-2 border-amber-500/30 rounded-xl bg-gradient-to-br from-amber-500/5 to-amber-500/10 shadow-sm">
  <div className="flex items-center justify-between">
    <div className="space-y-1.5 flex-1">
      <div className="flex items-center gap-2">
        <Label className="font-semibold text-base">📋 Longlist Only</Label>
        {longlistOnly && (
          <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full border border-amber-500/30">
            Active
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Collect candidates without automatic calling. Candidates will be longlisted for manual review only.
      </p>
    </div>
    <Switch
      checked={longlistOnly}
      onCheckedChange={setLonglistOnly}
      className="ml-4"
    />
  </div>
</div>
```

### Database Insert Update
```tsx
// Before
automatic_dial: true,

// After
automatic_dial: !longlistOnly,
```

---

## Testing Checklist
1. Create a new job with "Longlist Only" OFF - verify `automatic_dial` is `true` in database
2. Create a new job with "Longlist Only" ON - verify `automatic_dial` is `false` in database
3. Verify desktop layout looks correct with new toggle
4. Verify mobile layout displays properly
5. Confirm existing job creation flow still works normally

## No Impact on Desktop
This is an additive change - the toggle is OFF by default, maintaining the current behavior for all existing workflows.

