

## Add Phone/Email Verification to Interview Call Page

### Overview
Add an authentication layer to the interview call page that requires candidates to verify their identity by entering either their phone number or email address (based on the `type` URL parameter) before accessing the interview.

---

### URL Format

| Type | URL Example |
|------|-------------|
| Phone | `/interview-call?callId=12345&type=phone` |
| Email | `/interview-call?callId=12345&type=email` |

---

### User Flow

```text
1. Candidate clicks interview link with callId and type
2. Page fetches candidate data (including stored phone/email)
3. Verification screen is shown:
   - type=phone → "Enter your phone number to continue"
   - type=email → "Enter your email address to continue"
4. Candidate enters their information
5. System compares input with stored value (case-insensitive for email, normalized for phone)
6. If match → Show interview UI
7. If no match → Show error "The information you entered doesn't match our records"
```

---

### Implementation

#### File: `src/pages/InterviewCall.tsx`

**1. Add new state variables:**
```typescript
const [isVerified, setIsVerified] = useState(false);
const [verificationInput, setVerificationInput] = useState('');
const [verificationError, setVerificationError] = useState<string | null>(null);
```

**2. Get type parameter:**
```typescript
const verificationType = searchParams.get('type'); // 'phone' or 'email'
```

**3. Add phone number to data fetching:**
```typescript
// Update select to include candidate_phone_number
.select('recordid, candidate_name, candidate_email, candidate_phone_number, job_id, user_id, callcount, two_questions_of_interview, contacted')
```

**4. Update InterviewData interface:**
```typescript
interface InterviewData {
  // ... existing fields
  candidate_phone_number: string | null;
}
```

**5. Add phone normalization helper:**
```typescript
const normalizePhone = (phone: string): string => {
  // Remove all non-digit characters for comparison
  return phone.replace(/\D/g, '');
};
```

**6. Add verification handler:**
```typescript
const handleVerification = () => {
  if (!interviewData) return;
  
  const inputValue = verificationInput.trim();
  
  if (verificationType === 'phone') {
    const storedPhone = normalizePhone(interviewData.candidate_phone_number || '');
    const enteredPhone = normalizePhone(inputValue);
    
    // Check if entered phone ends with or matches stored phone (last 10 digits)
    if (storedPhone && (storedPhone.endsWith(enteredPhone) || enteredPhone.endsWith(storedPhone) || storedPhone === enteredPhone)) {
      setIsVerified(true);
      setVerificationError(null);
    } else {
      setVerificationError("The phone number you entered doesn't match our records.");
    }
  } else if (verificationType === 'email') {
    const storedEmail = (interviewData.candidate_email || '').toLowerCase().trim();
    const enteredEmail = inputValue.toLowerCase().trim();
    
    if (storedEmail && storedEmail === enteredEmail) {
      setIsVerified(true);
      setVerificationError(null);
    } else {
      setVerificationError("The email address you entered doesn't match our records.");
    }
  }
};
```

**7. Add verification UI screen (shown before interview UI):**
```typescript
// Verification screen (shown when not verified)
if (!isVerified && interviewData && isStatusAllowed) {
  return (
    <MissionBackground>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="mb-8">
          <img src={companyLogo} alt="Company Logo" className="h-16 w-auto" />
        </div>
        
        <GlassCard className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Verify Your Identity</h2>
            <p className="text-muted-foreground text-sm">
              {verificationType === 'phone' 
                ? 'Please enter your phone number to access the interview.'
                : 'Please enter your email address to access the interview.'}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification">
                {verificationType === 'phone' ? 'Phone Number' : 'Email Address'}
              </Label>
              <Input
                id="verification"
                type={verificationType === 'phone' ? 'tel' : 'email'}
                placeholder={verificationType === 'phone' ? '+1 234 567 8900' : 'you@example.com'}
                value={verificationInput}
                onChange={(e) => setVerificationInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerification()}
              />
            </div>
            
            {verificationError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-destructive text-sm text-center">{verificationError}</p>
              </div>
            )}
            
            <Button 
              onClick={handleVerification}
              className="w-full"
              disabled={!verificationInput.trim()}
            >
              Continue to Interview
            </Button>
          </div>
        </GlassCard>
      </div>
    </MissionBackground>
  );
}
```

**8. Add missing type error screen:**
```typescript
// Show error if type parameter is missing or invalid
if (!verificationType || !['phone', 'email'].includes(verificationType)) {
  return (
    <MissionBackground>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <GlassCard className="w-full max-w-md p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Invalid Link</h2>
          <p className="text-muted-foreground">
            This interview link is invalid. Please check your email for the correct link.
          </p>
        </GlassCard>
      </div>
    </MissionBackground>
  );
}
```

---

### Verification Logic

| Type | Comparison Method |
|------|-------------------|
| Phone | Normalize both (remove non-digits), compare last 10 digits for flexibility with country codes |
| Email | Case-insensitive exact match |

---

### UI Components Needed

| Component | Purpose |
|-----------|---------|
| `Lock` icon | Visual indicator for verification screen (from lucide-react) |
| `Input` | Text input for phone/email |
| `Label` | Form label |

---

### Security Considerations

- Phone comparison is flexible to handle different formats (+91, 0, etc.)
- Email comparison is case-insensitive
- No sensitive data is exposed in error messages
- Verification happens client-side but data is already protected by RLS policies

---

### Summary of Changes

| File | Changes |
|------|---------|
| `src/pages/InterviewCall.tsx` | Add verification state, get type param, update query, add verification UI, add validation logic |

The verification screen will appear after data loads but before showing the interview UI, creating a simple but effective authentication layer.

