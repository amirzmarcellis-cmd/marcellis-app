

## Implement Interview Call Page - VAPI Browser Voice Integration

### Overview
The `/interview-call` page doesn't exist yet - all components need to be created from scratch. This will enable candidates to have real-time voice conversations with the VAPI AI assistant directly in their browser.

---

### Current State

| Component | Status |
|-----------|--------|
| `/interview-call` route | Missing from App.tsx |
| `InterviewCall.tsx` page | Does not exist |
| `useVapiCall.ts` hook | Does not exist |
| `@vapi-ai/web` package | Not installed |
| `vapi_ai_assistant` column | Missing from Jobs table |
| `VAPI_PUBLIC_KEY` secret | Not configured |

---

### Implementation Steps

#### Step 1: Add VAPI Public Key Secret
You'll need to configure the VAPI public key as a secret. I'll prompt you to add `VAPI_PUBLIC_KEY` to your project secrets.

#### Step 2: Install VAPI Web SDK
Add `@vapi-ai/web` package to dependencies.

#### Step 3: Add Database Column
Create migration to add `vapi_ai_assistant` column to Jobs table:
```sql
ALTER TABLE "Jobs" ADD COLUMN vapi_ai_assistant text;
```

#### Step 4: Create Custom Hook - `src/hooks/useVapiCall.ts`

```typescript
import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

interface UseVapiCallReturn {
  status: 'idle' | 'connecting' | 'connected' | 'ended';
  isSpeaking: boolean;
  duration: number;
  error: string | null;
  startCall: (assistantId: string, variableValues?: Record<string, string>) => Promise<void>;
  endCall: () => void;
}

export function useVapiCall(): UseVapiCallReturn {
  // State management for call lifecycle
  // Event handlers for VAPI events
  // Duration timer
  // Cleanup on unmount
}
```

#### Step 5: Create Page - `src/pages/InterviewCall.tsx`

Based on the existing `CallCandidate.tsx` pattern:

**Data Flow:**
1. Extract `callId` (recordid) from URL query parameters
2. Fetch candidate from `Jobs_CVs` using `recordid`
3. Fetch job data including `vapi_ai_assistant` from `Jobs`
4. Initialize VAPI with candidate context

**UI States:**
- Loading: Skeleton with company logo
- Error: Error card for invalid/missing data
- Ready: Candidate info + "Start Interview" button
- Connecting: Pulsing animation
- In Call: Voice animation + duration + "End Call" button
- Ended: Thank you message

**Layout matching existing design:**
```text
┌────────────────────────────────────────────────────────────┐
│              [Company Logo - 32x32]                         │
├────────────────────────────────────────────────────────────┤
│                                                             │
│     ┌─────────────────GlassCard────────────────────────┐   │
│     │  Welcome, [Candidate Name]                        │   │
│     │  Position: [Job Title]                            │   │
│     │  Interview with AI Recruiter                      │   │
│     │                                                   │   │
│     │         ┌──────────────────────────┐             │   │
│     │         │    Voice Animation       │             │   │
│     │         │    ○ ○ ○ ○ ○             │             │   │
│     │         │    Duration: 02:34       │             │   │
│     │         └──────────────────────────┘             │   │
│     │                                                   │   │
│     │    [Start Interview] / [End Call]                │   │
│     │                                                   │   │
│     │    ⓘ Microphone access required                  │   │
│     └───────────────────────────────────────────────────┘   │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

#### Step 6: Add Route to App.tsx

Add lazy import and route (similar to other public pages):
```typescript
const InterviewCall = lazy(() => import("./pages/InterviewCall"));

// In Routes (grouped with other public pages):
<Route path="/interview-call" element={<InterviewCall />} />
```

---

### Files Changed

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Add `@vapi-ai/web` dependency |
| Database migration | Create | Add `vapi_ai_assistant` column to Jobs |
| `src/hooks/useVapiCall.ts` | Create | Custom hook for VAPI call management |
| `src/pages/InterviewCall.tsx` | Create | Main interview page (~250 lines) |
| `src/App.tsx` | Modify | Add route and lazy import |

---

### Error Handling

| Scenario | User Message |
|----------|--------------|
| Missing callId | "Invalid interview link. Please check your email for the correct link." |
| Candidate not found | "We couldn't find your interview details. Please contact the recruiter." |
| No assistant configured | "This interview is not available at the moment. Please contact the recruiter." |
| Microphone denied | "Microphone access is required for the voice interview. Please enable it in your browser settings." |
| Connection failed | "Unable to connect. Please check your internet connection and try again." |

---

### Technical Details

**VAPI Integration:**
```typescript
const vapi = new Vapi(VAPI_PUBLIC_KEY);

await vapi.start(assistantId, {
  variableValues: {
    candidateName: candidateData.candidate_name,
    jobTitle: jobData.job_title,
    candidateEmail: candidateData.candidate_email,
  },
});

vapi.on('call-start', () => setStatus('connected'));
vapi.on('call-end', () => setStatus('ended'));
vapi.on('speech-start', () => setIsSpeaking(true));
vapi.on('speech-end', () => setIsSpeaking(false));
vapi.on('error', (e) => setError(e.message));
```

**Voice Animation Component:**
```tsx
const VoiceAnimation = ({ isSpeaking }: { isSpeaking: boolean }) => (
  <div className="flex items-center justify-center gap-2">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className={cn(
          "w-3 h-3 rounded-full bg-primary transition-all duration-150",
          isSpeaking ? "animate-pulse scale-125" : "scale-100 opacity-50"
        )}
        style={{ animationDelay: `${i * 100}ms` }}
      />
    ))}
  </div>
);
```

---

### Security Considerations

- Uses VAPI public key (designed for client-side, limited permissions)
- Only displays candidate name, email, and job title
- CallId validation prevents unauthorized access
- Follows same public page pattern as `/call-candidate` and `/apply`

---

### User Flow

1. Candidate clicks link: `https://app.example.com/interview-call?callId=12345`
2. Page loads, fetches candidate data from `Jobs_CVs` using recordid
3. Displays welcome message with candidate name and job title
4. Candidate clicks "Start Interview"
5. Browser requests microphone permission
6. VAPI call connects with AI assistant
7. Voice indicators show speaking status
8. Timer shows call duration
9. Candidate or AI ends call
10. Thank you message displayed

