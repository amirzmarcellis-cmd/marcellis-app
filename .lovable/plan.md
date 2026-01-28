

## Add Job Difficulty Dropdown to Job Forms

### Overview
Add a "Job Difficulty" dropdown field to both the Create New Job and Edit Job forms, positioned directly after the "Assigned Recruiter" field. The dropdown will offer three options: EASY, MEDIUM, and HARD.

---

### Database Confirmation

The `Job_difficulty` column already exists in the `Jobs` table:
- Column: `Job_difficulty`
- Type: `text`
- Default: `'HARD'::text`
- No schema changes needed

---

### Files to Modify

#### 1. `src/pages/AddJob.tsx`

**Add to formData state (around line 259):**
```typescript
recruiterId: "",
jobDifficulty: "HARD"  // Add new field with default value
```

**Add dropdown after Assigned Recruiter (after line 761):**
```typescript
{/* Job Difficulty */}
<div className="space-y-2">
  <Label htmlFor="jobDifficulty" className="font-medium">Job Difficulty</Label>
  <Select 
    value={formData.jobDifficulty} 
    onValueChange={(value) => handleInputChange("jobDifficulty", value)}
  >
    <SelectTrigger className="h-11">
      <SelectValue placeholder="Select difficulty" />
    </SelectTrigger>
    <SelectContent className="bg-popover">
      <SelectItem value="EASY">EASY</SelectItem>
      <SelectItem value="MEDIUM">MEDIUM</SelectItem>
      <SelectItem value="HARD">HARD</SelectItem>
    </SelectContent>
  </Select>
</div>
```

**Include in job submission (around line 601):**
```typescript
Job_difficulty: formData.jobDifficulty || "HARD",
```

---

#### 2. `src/pages/EditJob.tsx`

**Add Job_difficulty to JobData interface (around line 140):**
```typescript
recruiter_id?: string;
Job_difficulty?: string;  // Add to interface
```

**Add Job_difficulty to initial formData (around line 186):**
```typescript
recruiter_id: "",
Job_difficulty: "HARD"  // Add with default
```

**Add dropdown after Assigned Recruiter select (after line 517, before LinkedIn Search Toggle):**
```typescript
{/* Job Difficulty */}
<div className="space-y-1.5 sm:space-y-2 min-w-0">
  <Label htmlFor="jobDifficulty" className="text-xs sm:text-sm">Job Difficulty</Label>
  <Select 
    value={formData.Job_difficulty || "HARD"} 
    onValueChange={(value) => setFormData(prev => ({ ...prev, Job_difficulty: value }))}
  >
    <SelectTrigger className="h-11 sm:h-10 text-sm min-w-0 w-full">
      <SelectValue placeholder="Select difficulty" />
    </SelectTrigger>
    <SelectContent className="z-[60] bg-popover">
      <SelectItem value="EASY">EASY</SelectItem>
      <SelectItem value="MEDIUM">MEDIUM</SelectItem>
      <SelectItem value="HARD">HARD</SelectItem>
    </SelectContent>
  </Select>
</div>
```

**Include in update submission (around line 369):**
```typescript
linkedin_search_enabled: linkedInSearchEnabled,
Job_difficulty: formData.Job_difficulty || "HARD"
```

---

### Dropdown Options

| Value | Display |
|-------|---------|
| `EASY` | EASY |
| `MEDIUM` | MEDIUM |
| `HARD` | HARD |

All values stored in uppercase as requested.

---

### Summary

| File | Changes |
|------|---------|
| `src/pages/AddJob.tsx` | Add `jobDifficulty` to state, add dropdown UI, include in submission |
| `src/pages/EditJob.tsx` | Add to interface & state, add dropdown UI, include in update |

The field will appear directly below "Assigned Recruiter" on both forms, maintaining consistency with the existing layout and styling patterns.

