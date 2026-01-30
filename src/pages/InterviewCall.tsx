import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MissionBackground } from '@/components/layout/MissionBackground';
import { useVapiCall } from '@/hooks/useVapiCall';
import { cn } from '@/lib/utils';
import { Phone, PhoneOff, Mic, AlertCircle, CheckCircle2, Lock, Smartphone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import companyLogo from '@/assets/me-logo-white.png';

interface InterviewData {
  // From Jobs_CVs
  recordid: number;
  candidate_name: string | null;
  candidate_email: string | null;
  candidate_phone_number: string | null;
  candidate_id: string;
  job_id: string;
  callcount: number | null;
  two_questions_of_interview: string | null;
  contacted_status: string | null;
  
  // From Jobs
  job_title: string | null;
  job_location: string | null;
  job_salary_range: number | null;
  client_name: string | null;
  client_description: string | null;
  contract_perm_type: string | null;
  job_itris_id: string | null;
  things_to_look_for: string | null;
  vapi_ai_assistant: string | null;
}

// Phone normalization helper
const normalizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

// Statuses that allow interview access
const ALLOWED_STATUSES = [
  'Ready to Call',
  'Ready to Contact',
  'Contacted',
  '1st No Answer',
  '2nd No Answer',
  '3rd No Answer',
];

// Voice animation component
const VoiceAnimation = ({ isSpeaking, isConnected }: { isSpeaking: boolean; isConnected: boolean }) => (
  <div className="flex items-center justify-center gap-2 py-8">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className={cn(
          "w-3 h-12 rounded-full transition-all duration-150",
          isConnected
            ? isSpeaking
              ? "bg-primary animate-pulse"
              : "bg-primary/30"
            : "bg-muted"
        )}
        style={{
          animationDelay: `${i * 100}ms`,
          height: isSpeaking ? `${Math.random() * 32 + 16}px` : '12px',
          transition: 'height 0.15s ease-out',
        }}
      />
    ))}
  </div>
);

// Format duration as MM:SS
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const InterviewCall: React.FC = () => {
  const [searchParams] = useSearchParams();
  const callId = searchParams.get('callId');
  const verificationType = searchParams.get('type'); // 'phone' or 'email'
  
  const [loading, setLoading] = useState(true);
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationInput, setVerificationInput] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  
  const { status, isSpeaking, duration, error, startCall, endCall } = useVapiCall();

  // Fetch candidate and job data
  useEffect(() => {
    const fetchData = async () => {
      if (!callId) {
        setFetchError('Invalid interview link. Please check your email for the correct link.');
        setLoading(false);
        return;
      }

      try {
        // Fetch candidate data from Jobs_CVs using recordid
        const { data: candidateRecord, error: candidateError } = await supabase
          .from('Jobs_CVs')
          .select('recordid, candidate_name, candidate_email, candidate_phone_number, job_id, user_id, callcount, two_questions_of_interview, contacted')
          .eq('recordid', parseInt(callId))
          .single();

        if (candidateError || !candidateRecord) {
          console.error('Error fetching candidate:', candidateError);
          setFetchError("We couldn't find your interview details. Please contact the recruiter.");
          setLoading(false);
          return;
        }

        // Fetch job data including vapi_ai_assistant
        const { data: jobRecord, error: jobError } = await supabase
          .from('Jobs')
          .select('job_title, job_location, job_salary_range, client_name, client_description, Type, itris_job_id, things_to_look_for, vapi_ai_assistant')
          .eq('job_id', candidateRecord.job_id)
          .single();

        if (jobError) {
          console.error('Error fetching job:', jobError);
        }

        setInterviewData({
          // From Jobs_CVs
          recordid: candidateRecord.recordid,
          candidate_name: candidateRecord.candidate_name,
          candidate_email: candidateRecord.candidate_email,
          candidate_phone_number: candidateRecord.candidate_phone_number,
          candidate_id: candidateRecord.user_id,
          job_id: candidateRecord.job_id,
          callcount: candidateRecord.callcount,
          two_questions_of_interview: candidateRecord.two_questions_of_interview,
          contacted_status: candidateRecord.contacted,
          // From Jobs
          job_title: jobRecord?.job_title || null,
          job_location: jobRecord?.job_location || null,
          job_salary_range: jobRecord?.job_salary_range || null,
          client_name: jobRecord?.client_name || null,
          client_description: jobRecord?.client_description || null,
          contract_perm_type: jobRecord?.Type || null,
          job_itris_id: jobRecord?.itris_job_id || null,
          things_to_look_for: jobRecord?.things_to_look_for || null,
          vapi_ai_assistant: jobRecord?.vapi_ai_assistant || null,
        });
      } catch (err) {
        console.error('Unexpected error:', err);
        setFetchError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [callId]);

  // Verification handler
  const handleVerification = () => {
    if (!interviewData) return;
    
    const inputValue = verificationInput.trim();
    
    if (verificationType === 'phone') {
      const storedPhone = normalizePhone(interviewData.candidate_phone_number || '');
      const enteredPhone = normalizePhone(inputValue);
      
      // Check if entered phone ends with or matches stored phone (flexible matching)
      if (storedPhone && enteredPhone.length >= 6 && 
          (storedPhone.endsWith(enteredPhone) || enteredPhone.endsWith(storedPhone) || storedPhone === enteredPhone)) {
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

  const handleStartInterview = async () => {
    if (!interviewData?.vapi_ai_assistant) {
      return;
    }

    await startCall(interviewData.vapi_ai_assistant, {
      // IDs
      Job_id: interviewData.job_id,
      recordid: interviewData.recordid,
      candidate_id: interviewData.candidate_id || '',
      job_itris_id: interviewData.job_itris_id || '',
      
      // Candidate info
      candidate_name: interviewData.candidate_name || 'Candidate',
      candidate_name_ipa: interviewData.candidate_name || 'Candidate',
      callcount: interviewData.callcount || 0,
      
      // Job info
      job_title: interviewData.job_title || 'Position',
      job_location: interviewData.job_location || '',
      job_salary_range: interviewData.job_salary_range || 0,
      contract_perm_type: interviewData.contract_perm_type || '',
      
      // Client info
      client_name: interviewData.client_name || '',
      client_description: interviewData.client_description || '',
      
      // Interview context
      things_to_look_for_in_candidate: interviewData.things_to_look_for || '',
      list_of_3_specific_questions: interviewData.two_questions_of_interview || '',
    });
  };

  // Loading state
  if (loading) {
    return (
      <MissionBackground>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="mb-8">
            <img src={companyLogo} alt="Company Logo" className="h-16 w-auto" />
          </div>
          <GlassCard className="w-full max-w-md p-8">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-32 w-full mb-6" />
            <Skeleton className="h-12 w-full" />
          </GlassCard>
        </div>
      </MissionBackground>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <MissionBackground>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="mb-8">
            <img src={companyLogo} alt="Company Logo" className="h-16 w-auto" />
          </div>
          <GlassCard className="w-full max-w-md p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Interview Not Available</h2>
            <p className="text-muted-foreground">{fetchError}</p>
          </GlassCard>
        </div>
      </MissionBackground>
    );
  }

  // Invalid or missing type parameter
  if (!verificationType || !['phone', 'email'].includes(verificationType)) {
    return (
      <MissionBackground>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="mb-8">
            <img src={companyLogo} alt="Company Logo" className="h-16 w-auto" />
          </div>
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

  // Check if candidate status allows interview access
  const isStatusAllowed = interviewData?.contacted_status && ALLOWED_STATUSES.includes(interviewData.contacted_status);
  
  if (interviewData && !isStatusAllowed) {
    const isCallDone = interviewData.contacted_status === 'Call Done';
    return (
      <MissionBackground>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="mb-8">
            <img src={companyLogo} alt="Company Logo" className="h-16 w-auto" />
          </div>
          <GlassCard className="w-full max-w-md p-8 text-center">
            {isCallDone ? (
              <>
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Interview Already Completed</h2>
                <p className="text-muted-foreground">
                  Your interview has already been completed. Our team will review it and be in touch soon.
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="h-12 w-12 text-amber-500/80 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Interview Not Available</h2>
                <p className="text-muted-foreground">
                  This interview is no longer available. Please contact the recruiter for assistance.
                </p>
              </>
            )}
          </GlassCard>
        </div>
      </MissionBackground>
    );
  }

  // No assistant configured
  if (!interviewData?.vapi_ai_assistant) {
    return (
      <MissionBackground>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="mb-8">
            <img src={companyLogo} alt="Company Logo" className="h-16 w-auto" />
          </div>
          <GlassCard className="w-full max-w-md p-8 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500/80 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Interview Not Ready</h2>
            <p className="text-muted-foreground">
              This interview is not available at the moment. Please contact the recruiter.
            </p>
          </GlassCard>
        </div>
      </MissionBackground>
    );
  }

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

  // Call ended state
  if (status === 'ended') {
    return (
      <MissionBackground>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="mb-8">
            <img src={companyLogo} alt="Company Logo" className="h-16 w-auto" />
          </div>
          <GlassCard className="w-full max-w-md p-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-4">
              Your interview has been completed successfully.
            </p>
            <p className="text-sm text-muted-foreground">
              Duration: {formatDuration(duration)}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Our team will review your interview and get back to you soon.
            </p>
          </GlassCard>
        </div>
      </MissionBackground>
    );
  }

  // Main interview UI
  return (
    <MissionBackground>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="mb-8">
          <img src={companyLogo} alt="Company Logo" className="h-16 w-auto" />
        </div>
        
        <GlassCard className="w-full max-w-md p-8">
          {/* Candidate Info */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold mb-1">
              Welcome, {interviewData.candidate_name || 'Candidate'}
            </h1>
            <p className="text-muted-foreground">
              Position: {interviewData.job_title || 'Open Position'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Interview with AI Recruiter
            </p>
          </div>

          {/* Screen On Warning - Only show before call starts */}
          {status === 'idle' && (
            <Alert className="mb-6 bg-amber-500/10 border-amber-500/30">
              <Smartphone className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-500">Keep Your Screen On</AlertTitle>
              <AlertDescription className="text-amber-500/80">
                Please keep your screen on during the interview. If your screen turns off, it may cancel the interview.
              </AlertDescription>
            </Alert>
          )}

          {/* Voice Animation */}
          <div className="bg-background/50 rounded-xl p-4 mb-6">
            <VoiceAnimation 
              isSpeaking={isSpeaking} 
              isConnected={status === 'connected'} 
            />
            
            {/* Duration Timer */}
            {status === 'connected' && (
              <div className="text-center">
                <span className="text-lg font-mono text-muted-foreground">
                  {formatDuration(duration)}
                </span>
              </div>
            )}

            {/* Status Indicator */}
            {status === 'connecting' && (
              <div className="text-center">
                <span className="text-sm text-muted-foreground animate-pulse">
                  Connecting...
                </span>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <p className="text-destructive text-sm text-center">{error}</p>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center">
            {status === 'idle' && (
              <Button
                size="lg"
                onClick={handleStartInterview}
                className="w-full gap-2"
              >
                <Phone className="h-5 w-5" />
                Start Interview
              </Button>
            )}

            {status === 'connecting' && (
              <Button
                size="lg"
                disabled
                className="w-full gap-2"
              >
                <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Connecting...
              </Button>
            )}

            {status === 'connected' && (
              <Button
                size="lg"
                variant="destructive"
                onClick={endCall}
                className="w-full gap-2"
              >
                <PhoneOff className="h-5 w-5" />
                End Call
              </Button>
            )}
          </div>

          {/* Microphone Notice */}
          {status === 'idle' && (
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <Mic className="h-4 w-4" />
              <span>Microphone access required</span>
            </div>
          )}
        </GlassCard>
      </div>
    </MissionBackground>
  );
};

export default InterviewCall;
