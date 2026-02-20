
## Add Notes Pen Icon to AI Shortlist Candidate Cards

### Overview
A pen (pencil) icon will be added to each candidate card in the AI Shortlist tab. Clicking it opens a popup (Dialog) where the user can read and edit notes. Saving updates the `Jobs_CVs.notes` column for that candidate row. The notes will also display on the card itself and remain visible in the Call Details Notes section.

### How Notes Work (existing system)
- Notes are stored in `Jobs_CVs.notes`
- The `recordid` column is the row identifier (same value as `callid` in the candidate object)
- `notes_updated_by` (UUID) and `notes_updated_at` (ISO string) are also stored
- `CallLogDetails.tsx` already reads/writes notes this way — we mirror that pattern exactly

### Data already available in the card
In `renderCandidateCard`, `mainCandidate` already has:
- `mainCandidate["Notes"]` — the current notes value (mapped from `row.notes` at line 835)
- `mainCandidate["recordid"]` — the row's primary key for the update query
- `mainCandidate["user_id"]` and `mainCandidate["Job ID"]` — fallback identifiers

### Changes — `src/pages/JobDetails.tsx` ONLY

#### 1. Add new state variables (alongside existing state declarations, around line 360)

```ts
const [notesDialogOpen, setNotesDialogOpen] = useState(false);
const [notesDialogCandidate, setNotesDialogCandidate] = useState<any>(null);
const [notesDialogValue, setNotesDialogValue] = useState("");
const [notesSaving, setNotesSaving] = useState(false);
```

#### 2. Add `Pencil` to lucide-react imports (line 57)

Add `Pencil` to the existing import list from `lucide-react`.

#### 3. Add `saveCardNotes` handler function (after handlePipeline, around line 2115)

```ts
const saveCardNotes = async () => {
  if (!notesDialogCandidate) return;
  setNotesSaving(true);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const recordid = notesDialogCandidate["recordid"];
    const userId = notesDialogCandidate["user_id"];
    const jobId = notesDialogCandidate["Job ID"];

    let updateQuery: any = supabase.from("Jobs_CVs").update({
      notes: notesDialogValue,
      notes_updated_by: user?.id,
      notes_updated_at: new Date().toISOString(),
    });

    if (recordid) {
      updateQuery = updateQuery.eq("recordid", recordid);
    } else if (userId && jobId) {
      updateQuery = updateQuery.eq("user_id", userId).eq("job_id", jobId);
    }

    const { error } = await updateQuery;
    if (error) throw error;

    // Update local state so the card shows the new notes immediately
    setCandidates((prev) =>
      prev.map((c) =>
        c["recordid"] === recordid ? { ...c, Notes: notesDialogValue, notes: notesDialogValue } : c
      )
    );
    setNotesDialogOpen(false);
    toast({ title: "Notes saved successfully" });
  } catch (err) {
    console.error("Error saving notes:", err);
    toast({ title: "Failed to save notes", variant: "destructive" });
  } finally {
    setNotesSaving(false);
  }
};
```

#### 4. Add the Notes Dialog JSX (near the other Dialogs, before the return's main content, around line 450)

```tsx
{/* Notes Dialog for AI Shortlist Cards */}
<Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Notes — {notesDialogCandidate?.["Candidate Name"] || "Candidate"}</DialogTitle>
      <DialogDescription>
        Add or edit notes for this candidate. Notes will also appear in the Call Details page.
      </DialogDescription>
    </DialogHeader>
    <Textarea
      placeholder="Add your notes..."
      value={notesDialogValue}
      onChange={(e) => setNotesDialogValue(e.target.value)}
      className="min-h-[150px]"
    />
    <DialogFooter>
      <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
        Cancel
      </Button>
      <Button onClick={saveCardNotes} disabled={notesSaving}>
        {notesSaving ? "Saving..." : "Save Notes"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### 5. Add pen icon button inside `renderCandidateCard` (in the top-right area of the card header, around line 2721)

In the `<div className="flex items-start justify-between">` block, add a small pen icon button to the right of the name/score area:

```tsx
<Button
  variant="ghost"
  size="icon"
  className="h-7 w-7 text-muted-foreground hover:text-primary shrink-0"
  title="Add/Edit Notes"
  onClick={() => {
    setNotesDialogCandidate(mainCandidate);
    setNotesDialogValue(mainCandidate["Notes"] || mainCandidate["notes"] || "");
    setNotesDialogOpen(true);
  }}
>
  <Pencil className="w-3.5 h-3.5" />
</Button>
```

This button sits alongside the existing timestamp block in the top-right of the card.

#### 6. Show existing notes preview on the card (after the CV Reason block, around line 2772)

Below the existing cv_score_reason / linkedin_score_reason display, add a small notes preview:

```tsx
{(mainCandidate["Notes"] || mainCandidate["notes"]) && (
  <div className="mt-2 p-2 bg-blue-50/50 dark:bg-blue-950/20 rounded-sm border-l-2 border-blue-400/50">
    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
      <Pencil className="w-3 h-3" />
      Notes
    </div>
    <p className="text-xs text-muted-foreground line-clamp-2">
      {mainCandidate["Notes"] || mainCandidate["notes"]}
    </p>
  </div>
)}
```

### What will NOT change
- The `CallLogDetails.tsx` Notes section — untouched
- All existing buttons (Submit, Reject, Pipeline, Call Log, View Profile) — untouched
- The `shortListCandidates`, `pipelineShortListCandidates`, `rejectedShortListCandidates` filters — untouched
- All other tabs and pages — untouched
- Database schema — no migration needed (notes column already exists in `Jobs_CVs`)

### User Experience Flow
1. User sees a small pen icon (top-right of card) on any AI Shortlist candidate card
2. Clicking it opens a clean Dialog with the candidate's name in the title and current notes pre-filled
3. User types/edits notes and clicks "Save Notes"
4. The Dialog closes, the card immediately shows a blue-tinted notes preview below the CV reason
5. The same notes are visible in Call Details → Notes section (already saved to DB)
