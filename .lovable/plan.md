

## Make Live Candidate Feed Cards More Compact

This plan reduces the Live Candidate Feed card size further so the score and content are more visible without horizontal overflow.

---

### Summary of Changes

1. **Reduce card padding** - Make inner spacing tighter
2. **Reduce avatar size** - Smaller profile pictures
3. **Remove the description section** - Free up vertical space
4. **Simplify footer** - Combine or reduce footer elements
5. **Reduce score section width** - Make buttons more compact
6. **Reduce overall spacing** - Tighter gaps between elements

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Make Live Candidate Feed cards more compact by reducing padding, avatar size, removing description, and tightening all spacing |

---

### Detailed Changes

**File: `src/pages/Index.tsx` (Lines 824-900)**

1. **Reduce card container padding**:
   - From: `p-2 sm:p-3`
   - To: `p-1.5 sm:p-2`

2. **Reduce card item padding**:
   - From: `p-2`
   - To: `p-1.5`

3. **Reduce avatar size**:
   - From: `w-8 h-8 sm:w-10 sm:h-10`
   - To: `w-6 h-6 sm:w-8 sm:h-8`

4. **Remove the description section** (lines 877-880):
   - Remove the entire `<p className="text-xs text-gray-300 mt-2...">` block
   - This frees up significant vertical space per card

5. **Reduce score section minimum width**:
   - From: `min-w-[70px] sm:min-w-[90px]`
   - To: `min-w-[60px] sm:min-w-[80px]`

6. **Reduce score font size**:
   - From: `text-lg sm:text-xl`
   - To: `text-base sm:text-lg`

7. **Make buttons smaller**:
   - Height: from `h-6` to `h-5`
   - Padding: from `px-1.5 py-0.5` to `px-1 py-0`

8. **Reduce spacing between cards**:
   - From: `space-y-2`
   - To: `space-y-1.5`

9. **Reduce footer margin**:
   - From: `mt-2`
   - To: `mt-1`

10. **Reduce badge spacing in footer**:
    - Simplify and shrink badges

---

### Visual Impact

```text
Before (current):
┌─────────────────────────────────────────────────┐
│ (Avatar) Candidate Name              │  92    │
│         Job Title                    │ [Reject]│
│         [UserID] [JobID]             │ [Submit]│
│ ─────────────────────────────────────────────── │
│ "No after call reason available..."              │
│ Updated: 1/28/2026          [Call Done]         │
└─────────────────────────────────────────────────┘

After (more compact - no description):
┌─────────────────────────────────────────────────┐
│ (A) Candidate Name            │ 92 │
│     Job Title                 │[X][✓]│
│     [UserID] [JobID]   1/28   │ Done │
└─────────────────────────────────────────────────┘
```

---

### Safety Notes

- All changes are purely visual/CSS adjustments
- No business logic or data fetching is affected
- Changes are localized to the Live Candidate Feed section in Index.tsx
- No impact on other pages or the standalone LiveCandidateFeed page
- The description can still be viewed on the full Live Candidate Feed page

