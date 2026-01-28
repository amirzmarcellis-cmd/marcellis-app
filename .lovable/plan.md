
## Reduce Live Candidate Feed Card Width

This plan specifically reduces the width of the Live Candidate Feed cards on the dashboard while keeping their height unchanged.

---

### Summary of Changes

1. **Add max-width constraint** to the Live Candidate Feed card container
2. **Center the card** within its grid column so it doesn't look misaligned
3. **Keep all heights unchanged** - ScrollArea, card items, buttons remain the same

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Add max-width to Live Candidate Feed Card and center it within its container |

---

### Detailed Changes

**File: `src/pages/Index.tsx` (Line 802)**

Add a max-width to the Live Candidate Feed Card component:

```tsx
// From:
<Card className="bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-lg border-cyan-400/30 shadow-2xl shadow-cyan-500/20">

// To:
<Card className="bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-lg border-cyan-400/30 shadow-2xl shadow-cyan-500/20 max-w-2xl mx-auto w-full">
```

This adds:
- `max-w-2xl` (672px) - constrains the card width
- `mx-auto` - centers the card horizontally within its container
- `w-full` - ensures the card uses full available width up to the max-width

---

### Visual Impact

```text
Before (full width of lg:col-span-2):
┌──────────────────────────────────────────────────────────────┐
│                     Live Candidate Feed                       │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Candidate Card (stretches full width)                     ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘

After (max-w-2xl = 672px, centered):
┌──────────────────────────────────────────────────────────────┐
│         ┌────────────────────────────────────┐               │
│         │     Live Candidate Feed            │               │
│         │  ┌──────────────────────────────┐  │               │
│         │  │ Candidate Card (narrower)    │  │               │
│         │  └──────────────────────────────┘  │               │
│         └────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────────┘
```

---

### What Stays Unchanged

- **ScrollArea height**: `h-[200px] sm:h-[240px] lg:h-[280px]`
- **Individual card item heights and padding**
- **Button sizes and colors**
- **Score display dimensions**
- **All other dashboard sections**

---

### Alternative Option

If `max-w-2xl` (672px) is too narrow, we can use:
- `max-w-3xl` (768px) for a slightly wider card
- `max-w-xl` (576px) for an even narrower card

---

### Safety Notes

- This is a CSS-only change affecting only the Live Candidate Feed card width
- No business logic or data fetching is affected
- Card content automatically adapts to narrower width (text truncates as needed)
- Mobile responsive behavior is preserved (cards will still go full-width on mobile)
- No impact on other dashboard sections
