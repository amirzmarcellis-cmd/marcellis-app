import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/GlassCard";
import { MissionBackground } from "@/components/layout/MissionBackground";
import { Phone, Loader2, AlertCircle } from "lucide-react";
import { z } from "zod";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useTheme } from "next-themes";
import defaultLogo from "@/assets/default-logo.png";

const phoneSchema = z.string()
  .min(1, "Phone number is required")
  .regex(/^\+\d{1,3}\d{4,14}$/, "Phone must include country code (e.g., +971556288415)");

const emailSchema = z.string().email("Please enter a valid email address");

interface CandidateData {
  job_title: string;
  candidate_name: string;
  candidate_phone_number: string;
  candidate_email: string;
  user_id: string;
  job_id: string;
}

export default function CallCandidate() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { settings } = useAppSettings();
  const { theme } = useTheme();

  const userId = searchParams.get("user_id");
  const jobId = searchParams.get("job_id");

  useEffect(() => {
    const fetchCandidateData = async () => {
      if (!userId || !jobId) {
        setError("Missing user_id or job_id in URL parameters");
        setLoading(false);
        return;
      }

      try {
        // First, fetch candidate data from Jobs_CVs
        const { data: candidateData, error: candidateError } = await supabase
          .from("Jobs_CVs")
          .select("user_id, job_id, candidate_name, candidate_phone_number, candidate_email")
          .eq("user_id", userId)
          .eq("job_id", jobId)
          .maybeSingle();

        if (candidateError) {
          console.error("Error fetching candidate:", candidateError);
          setError("Failed to load candidate data");
          setLoading(false);
          return;
        }

        if (!candidateData) {
          setError("Candidate not found");
          setLoading(false);
          return;
        }

        // Then, fetch job title from Jobs table
        const { data: jobData, error: jobError } = await supabase
          .from("Jobs")
          .select("job_title")
          .eq("job_id", candidateData.job_id)
          .maybeSingle();

        if (jobError) {
          console.error("Error fetching job:", jobError);
          // Continue with default job title instead of failing
        }

        const candidateInfo: CandidateData = {
          job_title: jobData?.job_title || "Unknown Position",
          candidate_name: candidateData.candidate_name || "Unknown Candidate",
          candidate_phone_number: candidateData.candidate_phone_number || "",
          candidate_email: candidateData.candidate_email || "",
          user_id: candidateData.user_id,
          job_id: candidateData.job_id,
        };

        setCandidateData(candidateInfo);
        setPhone(candidateInfo.candidate_phone_number);
        setEmail(candidateInfo.candidate_email);
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, [userId, jobId]);

  const validatePhone = (value: string): boolean => {
    try {
      phoneSchema.parse(value);
      setPhoneError("");
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setPhoneError(err.errors[0].message);
      }
      return false;
    }
  };

  const validateEmail = (value: string): boolean => {
    try {
      emailSchema.parse(value);
      setEmailError("");
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setEmailError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleCallNow = async () => {
    // Validate both fields
    const isPhoneValid = validatePhone(phone);
    const isEmailValid = validateEmail(email);

    if (!isPhoneValid || !isEmailValid) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors before proceeding",
        variant: "destructive",
      });
      return;
    }

    setCalling(true);

    try {
      // Send to Make.com webhook
      const webhookUrl = "https://hook.eu2.make.com/nta7gsjxjiqsfxe6yyz2vv3ct9qchh4t";
      const payload = [{
        user_id: candidateData?.user_id,
        job_id: candidateData?.job_id,
        phone: phone,
        email: email,
        candidate_name: candidateData?.candidate_name,
        job_title: candidateData?.job_title,
      }];

      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      toast({
        title: "Call Initiated",
        description: "Redirecting you now...",
      });

      // Redirect after 1 second
      setTimeout(() => {
        window.location.href = "https://www.marc-ellis.com/";
      }, 1000);
    } catch (err) {
      console.error("Error calling webhook:", err);
      toast({
        title: "Error",
        description: "Failed to initiate call. Redirecting anyway...",
        variant: "destructive",
      });
      
      // Still redirect even on error
      setTimeout(() => {
        window.location.href = "https://www.marc-ellis.com/";
      }, 2000);
    }
  };

  if (loading) {
    return (
      <MissionBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-6">
            <div className="w-48 h-48 mx-auto">
              <img 
                src={theme === 'dark' 
                  ? (settings.logoLight || settings.logo || defaultLogo)
                  : (settings.logoDark || settings.logo || defaultLogo)} 
                alt="Company Logo" 
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading candidate details...</p>
          </div>
        </div>
      </MissionBackground>
    );
  }

  if (error || !candidateData) {
    return (
      <MissionBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <GlassCard className="max-w-md w-full p-8 text-center space-y-6">
            <div className="w-48 h-48 mx-auto">
              <img 
                src={theme === 'dark' 
                  ? (settings.logoLight || settings.logo || defaultLogo)
                  : (settings.logoDark || settings.logo || defaultLogo)} 
                alt="Company Logo" 
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Error</h1>
            <p className="text-muted-foreground mb-6">{error || "Failed to load candidate data"}</p>
            <Button onClick={() => navigate("/")}>Go to Home</Button>
          </GlassCard>
        </div>
      </MissionBackground>
    );
  }

  return (
    <MissionBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="max-w-xl w-full p-8">
          <div className="text-center mb-8 space-y-8">
            <div className="w-48 h-48 mx-auto">
              <img 
                src={theme === 'dark' 
                  ? (settings.logoLight || settings.logo || defaultLogo)
                  : (settings.logoDark || settings.logo || defaultLogo)} 
                alt="Company Logo" 
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <Phone className="w-10 h-10 mx-auto text-primary mb-4" />
              <h1 className="text-4xl font-light tracking-tight mb-2">Call Candidate</h1>
              <p className="text-muted-foreground">Review and confirm details before initiating the call</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Read-only fields */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Job Title</Label>
              <div className="mt-2 p-3 rounded-xl bg-muted/20 border border-border/30">
                <p className="text-foreground font-medium">{candidateData.job_title}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Candidate Name</Label>
              <div className="mt-2 p-3 rounded-xl bg-muted/20 border border-border/30">
                <p className="text-foreground font-medium">{candidateData.candidate_name}</p>
              </div>
            </div>

            {/* Editable fields */}
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (phoneError) validatePhone(e.target.value);
                }}
                onBlur={(e) => validatePhone(e.target.value)}
                placeholder="+971556288415"
                className={phoneError ? "border-destructive" : ""}
              />
              {phoneError ? (
                <p className="text-xs text-destructive mt-1">{phoneError}</p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">Include country code (e.g., +92, +971, +1)</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                onBlur={(e) => validateEmail(e.target.value)}
                placeholder="candidate@example.com"
                className={emailError ? "border-destructive" : ""}
              />
              {emailError && (
                <p className="text-xs text-destructive mt-1">{emailError}</p>
              )}
            </div>

            {/* Call Now Button */}
            <Button
              onClick={handleCallNow}
              disabled={calling}
              className="w-full h-14 text-lg"
              size="lg"
            >
              {calling ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Initiating Call...
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </>
              )}
            </Button>
          </div>
        </GlassCard>
      </div>
    </MissionBackground>
  );
}
