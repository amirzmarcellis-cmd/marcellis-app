
## Fix: Rejection Reason Visible on Mobile (AI Shortlist Tab)

### Root Cause
`HoverCard` relies on mouse hover events (`mouseenter`/`mouseleave`). On touch devices (mobile), these events don't fire reliably — tapping doesn't trigger a hover, so the rejection reason tooltip never appears.

### Solution
Use the already-imported `isMobile` flag (from `useIsMobile`, already in `JobDetails.tsx`) to render two different experiences:

- **Desktop**: Keep the existing `HoverCard` hover tooltip (no change for desktop users)
- **Mobile**: Show the rejection reason as **always-visible inline text** directly below the red "Rejected on..." banner and below the disabled "Rejected" button — no interaction needed

### File to Change: `src/pages/JobDetails.tsx`

**Change 1 — Red banner area (line ~2656)**

Current: `HoverCard` wraps the banner, reason only shows on hover.

New on mobile: After the banner div, add a visible block:
```
{isMobile && mainCandidate["Reason_to_reject"] && (
  <div className="bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400 border-b border-red-500/20">
    <span className="font-semibold">Rejection Reason: </span>
    {mainCandidate["Reason_to_reject"]}
  </div>
)}
```

The HoverCard banner itself stays for desktop. On mobile, `HoverCard` is rendered but effectively non-interactive — the inline block beneath replaces it.

**Change 2 — Disabled "Rejected" button area (line ~3082)**

Same approach: after the HoverCard button, add a mobile-only visible reason block:
```
{isMobile && mainCandidate["Reason_to_reject"] && (
  <div className="w-full text-xs text-red-500 dark:text-red-400 px-1 mt-1">
    <span className="font-semibold">Reason: </span>
    {mainCandidate["Reason_to_reject"]}
  </div>
)}
```

### No New Imports Needed
- `isMobile` is already declared (`const isMobile = useIsMobile()` on line 91)
- No additional packages required

### What Users Will See on Mobile
When a candidate is rejected on mobile:
1. The red "Rejected on [date]" banner shows at the top of the card
2. Directly below it, a light red box shows: **"Rejection Reason: [the full reason text]"** — always visible, no tap needed
3. The disabled grey "Rejected" button has the reason text displayed beneath it as small red text
