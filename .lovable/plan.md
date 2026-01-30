

## Goal
Add a prominent warning message on the Interview Call page that appears after the user verifies their identity, reminding them to keep their screen on during the interview to prevent it from being cancelled.

## Current Flow
1. User lands on `/interview-call` page with callId and type parameters
2. User verifies identity via phone or email
3. After verification, user sees the main interview UI with "Start Interview" button
4. User starts and conducts the interview

## Proposed Change
Add an alert/warning banner in the main interview UI (shown after verification) that displays a message about keeping the screen on.

## Implementation Details

### File to Modify
**`src/pages/InterviewCall.tsx`**

### Changes

1. **Import Alert components** (Line 1-13)
   - Add import for `Alert`, `AlertTitle`, `AlertDescription` from `@/components/ui/alert`
   - Add import for `Smartphone` icon from `lucide-react`

2. **Add Screen Warning Alert** (After line 444, inside main interview UI)
   - Add an alert box between the candidate info section and the voice animation section
   - Show only when `status === 'idle'` (before the call starts)
   - Use amber/warning styling to draw attention
   - Include clear messaging about keeping screen on

### UI Preview
The alert will appear like this in the main interview card:

```
┌─────────────────────────────────────┐
│  Welcome, [Candidate Name]          │
│  Position: [Job Title]              │
│  Interview with AI Recruiter        │
├─────────────────────────────────────┤
│ ⚠️ Keep Your Screen On              │ ← NEW ALERT
│ Please keep your screen on during   │
│ the interview. If your screen turns │
│ off, it may cancel the interview.   │
├─────────────────────────────────────┤
│       [Voice Animation]             │
│                                     │
│     [ Start Interview ]             │
│     🎤 Microphone access required   │
└─────────────────────────────────────┘
```

### Styling
- Amber/warning color scheme (`bg-amber-500/10 border-amber-500/30`)
- Smartphone icon to reinforce the message
- Text explaining the importance of keeping screen active
- Only visible before interview starts (idle state)

## Testing Checklist
1. Navigate to interview call page with valid callId
2. Complete phone/email verification
3. Verify warning message appears before starting interview
4. Start interview and confirm warning disappears during active call
5. Check mobile view for proper display

## Desktop Impact
None - this is an additive change that doesn't affect any existing functionality.

