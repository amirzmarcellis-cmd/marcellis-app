

## Interview Call Page - VAPI Browser Voice Integration

### Overview
Create a new public page at `/interview-call` that enables candidates to have real-time voice conversations with the VAPI AI assistant directly in their browser, eliminating the need for phone calls.

---

### Current State Analysis

| Component | Status |
|-----------|--------|
| `@vapi-ai/web` package | Not installed |
| `vapi_ai_assistant` column in Jobs table | Does not exist |
| VAPI Public Key | Available in `.env` as `VITE_VAPI_PUBLIC_KEY` |
| Similar page pattern | `CallCandidate.tsx` uses same data fetching approach |
| Background components | `MissionBackground`, `GlassCard` available |

---

### Implementation Steps

#### Step 1: Install VAPI Web SDK

Add the `@vapi-ai/web` package to project dependencies.

#### Step 2: Add Database Column

Create a migration to add `vapi_ai_assistant` column to the Jobs table:

```sql
ALTER TABLE "Jobs" ADD COLUMN vapi_ai_assistant text;
```

This column stores the VAPI Assistant ID for each job, allowing different AI assistants for different job types.

#### Step 3: Create Custom Hook - `src/hooks/useVapiCall.ts`

A custom hook to manage the VAPI call lifecycle:

```typescript
// Key functionality:
// - Initialize Vapi instance with public key
// - Start call with assistant ID and variable overrides
// - Handle call events (call-start, call-end, error, speech-start, speech-end)
// - Manage call state (idle, connecting, connected, ended)
// - Track speaking indicators (user vs assistant)
// - Provide call duration timer
// - Clean up on unmount
```

**Hook Interface:**
```typescript
interface UseVapiCallOptions {
  assistantId: string;
  variableValues?: Record<string, string>;
}

interface UseVapiCallReturn {
  status: 'idle' | 'connecting' | 'connected' | 'ended';
  isSpeaking: boolean;
  isUserSpeaking: boolean;
  duration: number;
  error: string | null;
  startCall: () => Promise<void>;
  endCall: () => void;
}
```

#### Step 4: Create Page - `src/pages/InterviewCall.tsx`

Main interview call page with the following functionality:

**Data Flow:**
1. Extract `callId` (recordid) from URL query parameters
2. Fetch candidate data from `Jobs_CVs` table using `recordid`
3. Fetch job data including `vapi_ai_assistant` from `Jobs` table
4. Pass candidate context to VAPI for personalized conversation

**UI States:**
1. **Loading**: Skeleton while fetching candidate data
2. **Error**: Error card if callId invalid or candidate not found
3. **Ready**: Display candidate info + "Start Interview" button
4. **Connecting**: Pulsing animation while establishing connection
5. **In Call**: Voice animation + duration timer + "End Call" button
6. **Call Ended**: Thank you message

**Page Layout:**
```text
┌────────────────────────────────────────────────────────────┐
│                     [Company Logo]                          │
├────────────────────────────────────────────────────────────┤
│                                                             │
│     ┌─────────────────────────────────────────────────┐    │
│     │  Welcome, [Candidate Name]                       │    │
│     │  Position: [Job Title]                           │    │
│     │  Interview with AI Recruiter                     │    │
│     └─────────────────────────────────────────────────┘    │
│                                                             │
│     ┌─────────────────────────────────────────────────┐    │
│     │              [Voice Animation]                    │    │
│     │         ○ ○ ○ ○ ○ (speaking indicator)          │    │
│     │                                                   │    │
│     │              Duration: 02:34                      │    │
│     └─────────────────────────────────────────────────┘    │
│                                                             │
│     [Start Interview Button] / [End Call Button]            │
│                                                             │
│     ⓘ Microphone access required for voice interview       │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

#### Step 5: Add Route to App.tsx

Add the new route as a public page (outside DashboardLayout):

```typescript
const InterviewCall = lazy(() => import("./pages/InterviewCall"));

// In Routes:
<Route path="/interview-call" element={<InterviewCall />} />
```

---

### Technical Details

#### VAPI Integration

```typescript
import Vapi from '@vapi-ai/web';

// Initialize with public key (safe for client-side)
const vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);

// Start call with assistant overrides
await vapi.start(assistantId, {
  variableValues: {
    candidateName: candidateData.candidate_name,
    jobTitle: jobData.job_title,
    candidateEmail: candidateData.candidate_email,
  },
});

// Event listeners
vapi.on('call-start', () => setStatus('connected'));
vapi.on('call-end', () => setStatus('ended'));
vapi.on('speech-start', () => setIsSpeaking(true));
vapi.on('speech-end', () => setIsSpeaking(false));
vapi.on('error', (error) => setError(error.message));

// End call
vapi.stop();
```

#### Voice Animation Component

Create a pulsing/waveform animation that responds to speaking state:

```typescript
// Simple pulsing circles that animate when assistant is speaking
const VoiceAnimation = ({ isSpeaking }: { isSpeaking: boolean }) => (
  <div className="flex items-center justify-center gap-2">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className={cn(
          "w-3 h-3 rounded-full bg-primary transition-transform duration-150",
          isSpeaking && "animate-pulse scale-125"
        )}
        style={{ animationDelay: `${i * 100}ms` }}
      />
    ))}
  </div>
);
```

#### Call Duration Timer

```typescript
useEffect(() => {
  if (status !== 'connected') return;
  
  const interval = setInterval(() => {
    setDuration(prev => prev + 1);
  }, 1000);
  
  return () => clearInterval(interval);
}, [status]);

// Format: MM:SS
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
```

---

### Error Handling

| Scenario | User Message |
|----------|--------------|
| Invalid callId | "Invalid interview link. Please check your email for the correct link." |
| Microphone denied | "Microphone access is required for the voice interview. Please enable it in your browser settings." |
| Connection failed | "Unable to connect. Please check your internet connection and try again." |
| Assistant not configured | "This interview is not available at the moment. Please contact the recruiter." |
| Call ended unexpectedly | "The call has ended. You can try starting again or contact the recruiter." |

---

### Files Changed

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Add `@vapi-ai/web` dependency |
| Database migration | Create | Add `vapi_ai_assistant` column to Jobs table |
| `src/hooks/useVapiCall.ts` | Create | Custom hook for VAPI call management |
| `src/pages/InterviewCall.tsx` | Create | Main interview call page component |
| `src/App.tsx` | Modify | Add `/interview-call` route |

---

### Security Considerations

- **Public Key Only**: Uses VAPI's public API key (already in `.env`), designed for client-side usage
- **No Sensitive Data Exposure**: Only displays candidate name, email, and job title
- **CallId Validation**: Invalid or non-existent callIds show error state
- **Rate Limiting**: VAPI handles rate limiting on their end

---

### User Experience Flow

1. Candidate receives link: `https://app.example.com/interview-call?callId=12345`
2. Page loads and shows candidate greeting with job details
3. Clear instructions about microphone requirement
4. Candidate clicks "Start Interview"
5. Browser requests microphone permission
6. Voice call begins with AI recruiter
7. Real-time voice activity indicators show who's speaking
8. Call timer shows duration
9. Candidate or AI can end the call
10. Thank you message displayed

---

### Future Enhancements (Not in Scope)

- Store call transcripts in database
- Trigger webhook on call end for processing
- Add visual feedback for user's voice activity
- Support for multiple languages

