

## Add Export to CSV for AI Longlist Tab

### Summary
Add an "Export CSV" button to the AI Longlist tab that exports the currently filtered candidates to a nicely formatted CSV file that opens correctly in Excel with proper encoding and column formatting.

---

### Technical Changes

**File: `src/pages/JobDetails.tsx`**

#### 1. Add Download Icon Import (line ~27-54)
Add `Download` to the existing lucide-react import:

```typescript
import {
  ArrowLeft,
  MapPin,
  Calendar,
  // ... existing imports
  Download,  // Add this
} from "lucide-react";
```

#### 2. Create Export Function (after other handlers, around line 1700)
Add a new export function that creates a well-formatted CSV:

```typescript
const exportLonglistToCSV = () => {
  // Apply same filters as the display
  const filteredCandidates = longlistedCandidates.filter((candidate) => {
    const nameMatch = !nameFilter || 
      (candidate["Candidate Name"] || "").toLowerCase().includes(nameFilter.toLowerCase());
    const emailMatch = !emailFilter || 
      (candidate["Candidate Email"] || "").toLowerCase().includes(emailFilter.toLowerCase());
    const phoneMatch = !phoneFilter || 
      (candidate["Candidate Phone Number"] || "").includes(phoneFilter);
    const userIdMatch = !userIdFilter || 
      (candidate.user_id || candidate["Candidate_ID"] || "").toString().includes(userIdFilter);
    const source = (candidate["Source"] || candidate.source || "").toLowerCase();
    const sourceFilterMatch = !longListSourceFilter || 
      longListSourceFilter === "all" || 
      source.includes(longListSourceFilter.toLowerCase());
    let scoreMatch = true;
    if (scoreFilter !== "all") {
      const score = parseInt(candidate["cv_score"] || "0");
      switch (scoreFilter) {
        case "high": scoreMatch = score >= 75; break;
        case "moderate": scoreMatch = score >= 50 && score < 75; break;
        case "poor": scoreMatch = score >= 1 && score < 50; break;
        case "none": scoreMatch = score === 0 || isNaN(score); break;
      }
    }
    let contactedMatch = true;
    if (contactedFilter !== "all") {
      const contacted = candidate["Contacted"] || "";
      contactedMatch = contacted === contactedFilter || 
        (contactedFilter === "Ready to Call" && contacted === "Ready to Contact");
    }
    return nameMatch && emailMatch && phoneMatch && userIdMatch && 
           sourceFilterMatch && scoreMatch && contactedMatch;
  });

  // Sort by score descending
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    const scoreA = Math.max(
      parseInt(a["cv_score"] || "0"), 
      parseInt(a["linkedin_score"] || "0")
    );
    const scoreB = Math.max(
      parseInt(b["cv_score"] || "0"), 
      parseInt(b["linkedin_score"] || "0")
    );
    return scoreB - scoreA;
  });

  if (sortedCandidates.length === 0) {
    toast({ title: "No candidates to export", variant: "destructive" });
    return;
  }

  // Define headers
  const headers = [
    'Name',
    'Email', 
    'Phone',
    'Source',
    'CV Score',
    'LinkedIn Score',
    'Status',
    'User ID',
    'Score Reason',
    'Created At'
  ];

  // Build rows
  const rows = sortedCandidates.map((c) => [
    c["Candidate Name"] || '',
    c["Candidate Email"] || '',
    c["Candidate Phone Number"] || '',
    c["Source"] || '',
    c["cv_score"]?.toString() || '',
    c["linkedin_score"]?.toString() || '',
    c["Contacted"] || '',
    c["user_id"] || c["Candidate_ID"] || '',
    c["cv_score_reason"] || c["linkedin_score_reason"] || '',
    c["created_at"] ? format(new Date(c["created_at"]), 'yyyy-MM-dd HH:mm') : ''
  ]);

  // Create CSV with BOM for Excel compatibility
  const BOM = '\uFEFF';
  const csvContent = BOM + [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const jobTitle = job?.job_title?.replace(/[^a-zA-Z0-9]/g, '_') || 'longlist';
  const timestamp = format(new Date(), 'yyyy-MM-dd');
  link.href = URL.createObjectURL(blob);
  link.download = `AI_Longlist_${jobTitle}_${timestamp}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);

  toast({ title: `Exported ${sortedCandidates.length} candidates` });
};
```

#### 3. Add Export Button to Header (around line 3925)
Add the Export CSV button next to the existing action buttons in the CardHeader:

```tsx
<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
  {/* Export Button */}
  <Button
    variant="outline"
    size="sm"
    onClick={exportLonglistToCSV}
    disabled={longlistedLoading || longlistedCandidates.length === 0}
    className="w-full sm:w-auto h-11 sm:h-9 text-sm min-h-[44px] sm:min-h-0"
  >
    <Download className="w-4 h-4 mr-2 flex-shrink-0" />
    Export CSV
  </Button>
  
  {/* Existing Generate/Search buttons */}
  {job?.longlist && job.longlist > 0 ? (
    <ExpandableSearchButton ... />
  ) : (
    <Button onClick={handleGenerateLongList} ... />
  )}
</div>
```

---

### CSV Output Format

The exported file will include:

| Column | Description |
|--------|-------------|
| Name | Candidate full name |
| Email | Candidate email address |
| Phone | Phone number |
| Source | Where candidate came from (Itris, LinkedIn) |
| CV Score | AI-generated CV match score |
| LinkedIn Score | AI-generated LinkedIn profile score |
| Status | Current status (Ready to Contact, Call Done, etc.) |
| User ID | Unique candidate identifier |
| Score Reason | AI explanation for the score |
| Created At | When candidate was added |

---

### Excel Compatibility
- UTF-8 BOM character added for proper Excel encoding
- All cell values wrapped in quotes to handle commas/special characters
- Double-quotes escaped properly
- Sorted by score (highest first) matching the UI display
- Respects all current filter selections

---

### UI Preview

```text
┌─────────────────────────────────────────────────────────────┐
│ AI Longlist (156 candidates)                                │
│ Candidates added to the longlist for this position          │
│                                                             │
│                    [Export CSV] [Search More ▾]             │
└─────────────────────────────────────────────────────────────┘
```

