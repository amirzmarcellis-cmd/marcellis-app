

## Handle Array Format for Recording and Duration Fields

### Summary
The `recording` and `duration` columns in the `Jobs_CVs` table now store JSON array strings (e.g., `["https://...url.wav"]` and `[1.1185]`) instead of plain text values. The app currently treats them as plain strings, so recordings don't play and durations display as raw array text like `[1.1185]`.

### Solution
Create a small utility to safely extract the first value from these array-formatted strings, and update all files that read `recording` or `duration`.

---

### Technical Changes

#### 1. Add helper functions in `src/lib/utils.ts`

```typescript
/** Extract the first non-empty string from a JSON-array-formatted text field. */
export function extractFirstFromArray(value: string | null | undefined): string | null {
  if (!value) return null;
  const str = String(value).trim();
  // If it looks like a JSON array, parse it
  if (str.startsWith('[')) {
    try {
      const arr = JSON.parse(str);
      if (Array.isArray(arr)) {
        const first = arr.find((item: unknown) => item !== null && item !== undefined && String(item).trim() !== '');
        return first != null ? String(first) : null;
      }
    } catch {
      // Not valid JSON, fall through
    }
  }
  // Already a plain value
  return str || null;
}

/** Format a duration value (possibly array-formatted) into a readable string like "1m 7s". */
export function formatCallDuration(value: string | null | undefined): string {
  const raw = extractFirstFromArray(value);
  if (!raw) return 'N/A';
  const num = parseFloat(raw);
  if (isNaN(num)) return raw; // Return as-is if not a number
  const totalSeconds = Math.round(num * 60); // value is in minutes
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}
```

#### 2. Update `src/pages/CallLogDetails.tsx`

**Data mapping (~line 278-279):** Extract first values when mapping from raw DB data:
```typescript
duration: extractFirstFromArray(data.duration),
recording: extractFirstFromArray(data.recording),
```

**Duration display (~line 669):** Use `formatCallDuration` or display the extracted plain value:
```tsx
<p>{formatCallDuration(callLog.duration) || 'N/A'}</p>
```

**Recording playback (~line 680-684):** The `extractFirstFromArray` at mapping time means `callLog.recording` will already be a plain URL string, so `WaveformPlayer` will work as before.

#### 3. Update `src/pages/CallLogDetailPage.tsx`

**Duration display (~line 359):**
```tsx
<p>{formatCallDuration(record.duration) || 'N/A'}</p>
```

**Recording display (~line 367):**
```tsx
<p>{extractFirstFromArray(record.recording) ? 'Available' : 'N/A'}</p>
```

#### 4. Update `src/pages/JobDetails.tsx` (~lines 835, 1054)

When mapping `duration` and `recording` into call log objects:
```typescript
duration: extractFirstFromArray(row.duration),
recording: extractFirstFromArray(row.recording),
```

#### 5. Update `src/hooks/useReportsData.ts` (~line 131)

Fix the "calls with recordings" count to handle array format:
```typescript
callsWithRecordings: calledRecords.filter(r => {
  const rec = extractFirstFromArray(r.recording);
  return rec && rec.length > 0;
}).length,
```

---

### Files Modified

| File | Change |
|------|--------|
| `src/lib/utils.ts` | Add `extractFirstFromArray` and `formatCallDuration` helpers |
| `src/pages/CallLogDetails.tsx` | Parse array values at data mapping; format duration display |
| `src/pages/CallLogDetailPage.tsx` | Format duration and recording display |
| `src/pages/JobDetails.tsx` | Extract first values when building call log objects |
| `src/hooks/useReportsData.ts` | Fix recording count filter |

### Behavior After Fix

- **Duration**: `[1.1185]` displays as `1m 7s` instead of raw array text
- **Recording**: `["https://...wav"]` extracts the URL so `WaveformPlayer` receives a valid URL
- **Empty arrays**: `[]` or `[""]` gracefully show `N/A`
- **Legacy plain values**: Still work correctly (backward compatible)
