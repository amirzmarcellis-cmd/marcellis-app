

## Display Multiple Call Recordings and Durations

### Summary
The `recording` and `duration` fields now store arrays with multiple values (e.g., `[16.9323, 0.4295, null]`). Each element represents a separate call, with the latest call first. The UI should display all calls individually as "Call 1 (latest)", "Call 2", etc., with their respective duration and recording player.

---

### Technical Changes

#### 1. Add new helper in `src/lib/utils.ts`

Add a `parseCallArray` function that returns the full parsed array (not just the first element):

```typescript
export function parseCallArray(value: string | null | undefined): (string | null)[] {
  if (!value) return [];
  const str = String(value).trim();
  if (str.startsWith('[')) {
    try {
      const arr = JSON.parse(str);
      if (Array.isArray(arr)) return arr;
    } catch { /* fall through */ }
  }
  return str ? [str] : [];
}
```

Also add a single-duration formatter that takes a raw number (not array string):

```typescript
export function formatSingleDuration(val: number | string | null): string {
  if (val === null || val === undefined) return 'N/A';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return 'N/A';
  const totalSeconds = Math.round(num * 60);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}
```

The existing `extractFirstFromArray` and `formatCallDuration` remain unchanged for backward compatibility in other parts of the app.

---

#### 2. Update `src/pages/CallLogDetails.tsx` -- Call Information section

**Data mapping (lines 278-279):** Store the raw array strings instead of extracting only the first value:

```typescript
duration: data.duration,    // keep raw for multi-call display
recording: data.recording,  // keep raw for multi-call display
```

**Call Information card (lines 658-688):** Replace single duration/recording display with a loop over all calls:

- Parse `callLog.duration` and `callLog.recording` using `parseCallArray`
- Render each call as a labeled section: "Call 1 (latest)", "Call 2", etc.
- Each call shows its formatted duration and, if a recording URL exists, a `WaveformPlayer`
- Calls with `null` duration or recording are shown as "N/A" / no player
- The total duration line is replaced by per-call breakdowns

---

#### 3. Update `src/pages/CallLogDetailPage.tsx` -- Call Information section

**Duration display (line 359-361):** Replace single duration with a loop showing all call durations.

**Recording display (line 366-369):** Replace the simple "Available/N/A" text with individual call entries, each with its own recording status or waveform player (if recording URL exists).

The Transcript section remains as-is since it appears to be a single combined transcript.

---

#### 4. `src/pages/JobDetails.tsx` -- Keep as-is

The job details page candidate cards show summary info (first/latest duration and recording). This is correct behavior for a card view -- no change needed here. The `extractFirstFromArray` usage remains appropriate for showing the most recent call's data in summary cards.

---

#### 5. `src/hooks/useReportsData.ts` -- Update recording count

Update the recording count logic to count candidates that have **any** non-null recording in the array:

```typescript
callsWithRecordings: calledRecords.filter(r => {
  const recs = parseCallArray(r.recording);
  return recs.some(rec => rec !== null && String(rec).trim() !== '');
}).length,
```

---

### UI Layout for Multi-Call Display

In the Call Information card, the calls will be displayed as a vertical list:

```
Call Information
------------------------------
Call 1 (latest)
  Duration: 16m 56s
  [======= Waveform Player =======]

Call 2
  Duration: 26s
  [======= Waveform Player =======]

Call 3
  Duration: N/A
  No recording available
------------------------------
Call Count: 3
Last Call Time: 2026-02-09 14:30
```

---

### Files Modified

| File | Change |
|------|--------|
| `src/lib/utils.ts` | Add `parseCallArray` and `formatSingleDuration` helpers |
| `src/pages/CallLogDetails.tsx` | Store raw arrays; render per-call duration + recording players |
| `src/pages/CallLogDetailPage.tsx` | Render per-call duration + recording status/players |
| `src/hooks/useReportsData.ts` | Update recording count to check full array |

### No changes to
- `src/pages/JobDetails.tsx` (summary cards correctly use first/latest value)
- Database schema (no changes needed)
