// @ts-nocheck
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Banknote,
  Users,
  FileText,
  Clock,
  Target,
  Phone,
  Mail,
  Star,
  Search,
  Filter,
  Upload,
  Zap,
  X,
  UserCheck,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Hourglass,
  User,
  FileCheck,
  Building,
  Pause,
  Play,
  Download,
  GitBranch,
  Pencil,
} from "lucide-react";
import { FuturisticActionButton } from "@/components/ui/FuturisticActionButton";
import { ActionButton } from "@/components/ui/ActionButton";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { JobFunnel } from "@/components/jobs/JobFunnel";
import { JobDialog } from "@/components/jobs/JobDialog";
import { StatusDropdown } from "@/components/candidates/StatusDropdown";
import { useToast } from "@/components/ui/use-toast";
import { formatDate, extractFirstFromArray } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { useButtonCooldown } from "@/hooks/useButtonCooldown";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { ProcessingAnimation } from "@/components/jobs/ProcessingAnimation";
import { AppleLoadingBar } from "@/components/ui/AppleLoadingBar";
import { ProgressiveStatusBar } from "@/components/ui/ProgressiveStatusBar";
import { ExpandableSearchButton } from "@/components/ui/ExpandableSearchButton";

// Using any type to avoid TypeScript complexity with quoted property names

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("overview");
  const [isShaking, setIsShaking] = useState(false);
  const { profile } = useProfile();
  const { toast } = useToast();
  const generateCooldown = useButtonCooldown(`generate-ai-cooldown-${id}`);
  const regenerateCooldown = useButtonCooldown(`regenerate-ai-cooldown-${id}`);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [automaticDialSaving, setAutomaticDialSaving] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [longlistedCandidates, setLonglistedCandidates] = useState<any[]>([]);
  const [longlistedLoading, setLonglistedLoading] = useState(true);
  const [cvData, setCvData] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [taskCandidates, setTaskCandidates] = useState<any[]>([]);
  const [jobGroup, setJobGroup] = useState<any>(null);
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [contactedFilter, setContactedFilter] = useState("all");
  // Application filters
  const [appNameFilter, setAppNameFilter] = useState("");
  const [appEmailFilter, setAppEmailFilter] = useState("");
  const [appPhoneFilter, setAppPhoneFilter] = useState("");
  // AI Short List filters
  const [shortListNameFilter, setShortListNameFilter] = useState("");
  const [shortListEmailFilter, setShortListEmailFilter] = useState("");
  const [shortListPhoneFilter, setShortListPhoneFilter] = useState("");
  const [shortListUserIdFilter, setShortListUserIdFilter] = useState("");
  const [shortListScoreFilter, setShortListScoreFilter] = useState("all");
  const [shortListSourceFilter, setShortListSourceFilter] = useState("all");

  // AI Long List filters
  const [longListSourceFilter, setLongListSourceFilter] = useState("all");
  
  // Similar Jobs tab state
  const [similarJobsCandidates, setSimilarJobsCandidates] = useState<any[]>([]);
  const [similarJobsLoading, setSimilarJobsLoading] = useState(false);
  const [similarJobsNameFilter, setSimilarJobsNameFilter] = useState("");
  const [similarJobsEmailFilter, setSimilarJobsEmailFilter] = useState("");
  const [similarJobsPhoneFilter, setSimilarJobsPhoneFilter] = useState("");
  const [similarJobsUserIdFilter, setSimilarJobsUserIdFilter] = useState("");
  const [similarJobsSelectedCandidates, setSimilarJobsSelectedCandidates] = useState<Set<string>>(new Set());
  
  // Analytics data
  const [analyticsData, setAnalyticsData] = useState<{
    jobAddedDate: string | null;
    firstLonglistedDate: string | null;
    firstShortlistedDate: string | null;
    timeToLonglist: number | null;
    timeToShortlist: number | null;
    averageTimeToShortlist: number | null;
    sourceCounts: Record<string, number>;
    totalCandidates: number;
    shortlistedCandidates: Array<{
      candidate_name: string | null;
      shortlisted_at: string;
      timeFromLonglist: number;
    }>;
    rejectedCandidates: Array<{
      candidate_name: string | null;
      rejected_at: string | null;
      reason: string | null;
      shortlisted_at: string | null;
      timeToReject: number | null;
    }>;
    submittedCandidates: Array<{
      candidate_name: string | null;
      submitted_at: string | null;
      reason: string | null;
      shortlisted_at: string | null;
      timeToSubmit: number | null;
    }>;
  }>({
    jobAddedDate: null,
    firstLonglistedDate: null,
    firstShortlistedDate: null,
    timeToLonglist: null,
    timeToShortlist: null,
    averageTimeToShortlist: null,
    sourceCounts: {},
    totalCandidates: 0,
    shortlistedCandidates: [],
    rejectedCandidates: [],
    submittedCandidates: [],
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isGeneratingShortList, setIsGeneratingShortList] = useState(false);
  const [shortListButtonDisabled, setShortListButtonDisabled] = useState(false);
  const [shortListTimeRemaining, setShortListTimeRemaining] = useState(0);
  const [candidateToRemove, setCandidateToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectAdditionalInfo, setRejectAdditionalInfo] = useState("");
  const [rejectCandidateData, setRejectCandidateData] = useState<{
    jobId: string;
    candidateId: string;
    callid: number;
  } | null>(null);
  const [showHireDialog, setShowHireDialog] = useState(false);
  const [hireReason, setHireReason] = useState("");
  const [hireAdditionalInfo, setHireAdditionalInfo] = useState("");
  const [hireCandidateData, setHireCandidateData] = useState<{
    jobId: string;
    candidateId: string;
    callid: number;
  } | null>(null);

  // Function to fetch LinkedIn ID and redirect to profile
  const handleViewLinkedInProfile = async (
    candidateId: string,
    candidateName: string,
    jobId: string,
    source: string,
  ) => {
    if (!source || !source.toLowerCase().includes("linkedin")) return;

    // Open a blank tab immediately on user click to avoid iframe/X-Frame-Options issues and popup blockers
    const preOpened = window.open("", "_blank");
    try {
      preOpened?.document.write('<p style="font-family:sans-serif; color:#444;">Opening LinkedIn…</p>');
      preOpened?.document.close();
    } catch {}
    try {
      console.log("Searching for LinkedIn profile:", {
        candidateId,
        candidateName,
        jobId,
      });

      // Try searching by user_id first (Jobs_CVs.user_id like "Lin-319")
      let { data, error } = await supabase
        .from("linkedin_boolean_search")
        .select("linkedin_id, user_id")
        .eq("user_id", candidateId)
        .maybeSingle();
      console.log("LinkedIn search by user_id result:", {
        data,
        error,
      });

      // If not found by user_id, try searching by job_id
      if (!data && jobId) {
        const { data: allProfiles, error: jobError } = await supabase
          .from("linkedin_boolean_search")
          .select("linkedin_id, user_id")
          .eq("job_id", jobId);
        console.log("LinkedIn profiles for job:", {
          allProfiles,
          jobError,
        });
        if (allProfiles && allProfiles.length > 0) {
          data = allProfiles[0];
        }
      }
      if (error && (error as any).code !== "PGRST116") {
        console.error("Error fetching LinkedIn ID:", error);
        preOpened?.close();
        toast({
          title: "Error",
          description: "Could not fetch LinkedIn profile: " + (error as any).message,
          variant: "destructive",
        });
        return;
      }
      if (data && data.linkedin_id) {
        const linkedInUrl = `https://www.linkedin.com/in/${data.linkedin_id}/`;
        console.log("Opening LinkedIn URL:", linkedInUrl);
        if (preOpened) {
          preOpened.location.href = linkedInUrl;
        } else {
          window.open(linkedInUrl, "_blank", "noopener,noreferrer");
        }
      } else {
        console.log("No LinkedIn ID found for candidate:", {
          candidateId,
          candidateName,
        });
        preOpened?.close();
        toast({
          title: "Not Found",
          description:
            "LinkedIn profile ID not found. The candidate may not have been sourced from LinkedIn boolean search.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error:", err);
      preOpened?.close();
      toast({
        title: "Error",
        description: "An error occurred while fetching the profile",
        variant: "destructive",
      });
    }
  };
  // Helper to derive a robust LinkedIn profile URL for a candidate
  const getLinkedInUrl = (c: any): string | null => {
    if (!c) return null;
    const fields: {
      v: any;
      treatAsId: boolean;
    }[] = [
      {
        v: c.linkedin_id ?? c["linkedin_id"],
        treatAsId: true,
      },
      {
        v: c["LinkedIn ID"],
        treatAsId: true,
      },
      {
        v: c.linkedin_url ?? c["linkedin_url"],
        treatAsId: false,
      },
      {
        v: c["LinkedIn URL"],
        treatAsId: false,
      },
      {
        v: c["Source URL"],
        treatAsId: false,
      },
      {
        v: c["Source"],
        treatAsId: false,
      },
    ];
    for (const f of fields) {
      const raw = f.v;
      if (!raw) continue;
      const s = String(raw).trim();
      if (!s) continue;
      if (/^https?:\/\//i.test(s)) {
        if (/linkedin\.com/i.test(s)) return s;
        continue;
      }
      if (!f.treatAsId) {
        if (/linkedin\.com/i.test(s)) return `https://${s.replace(/^\/+/, "")}`;
        continue;
      }
      return `https://www.linkedin.com/in/${s.replace(/^\/+/, "").replace(/\/+$/, "")}/`;
    }
    return null;
  };
  const [callingCandidateId, setCallingCandidateId] = useState<string | null>(null);
  const [newApplicationsCount, setNewApplicationsCount] = useState(0);
  const [addedToLongList, setAddedToLongList] = useState<Set<string>>(new Set());
  const [lastViewedApplications, setLastViewedApplications] = useState<string | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [selectedCandidateRecord, setSelectedCandidateRecord] = useState<any>(null);
  const [isActionMenuExpanded, setIsActionMenuExpanded] = useState(false);
  const [recruiterName, setRecruiterName] = useState<string | null>(null);

  // Interview scheduling state variables
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<{
    candidateId: string;
    jobId: string;
    callid: number;
  } | null>(null);
  const [interviewSlots, setInterviewSlots] = useState<
    {
      date: Date | undefined;
      time: string;
    }[]
  >([
    {
      date: undefined,
      time: "",
    },
    {
      date: undefined,
      time: "",
    },
    {
      date: undefined,
      time: "",
    },
  ]);
  const [interviewType, setInterviewType] = useState<"Phone" | "Online Meeting">("Phone");
  const [interviewLink, setInterviewLink] = useState("");

  // Notes dialog state for AI Shortlist cards
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notesDialogCandidate, setNotesDialogCandidate] = useState<any>(null);
  const [notesDialogValue, setNotesDialogValue] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  useEffect(() => {
    if (id) {
      // Load job data first to show page immediately
      fetchJob(id);

      // Load other data in background (non-blocking)
      fetchCandidates(id);
      fetchLonglistedCandidates(id);
      fetchApplications(id);
      fetchTaskCandidates(id);
      fetchSimilarJobsCandidates(id);

      // Check for shortlist disabled status
      const storageKey = `shortlist_${id}_disabled`;
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        const { disabledUntil } = JSON.parse(storedData);
        const now = Date.now();
        if (disabledUntil > now) {
          setShortListButtonDisabled(true);
          setShortListTimeRemaining(Math.ceil((disabledUntil - now) / 1000));
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    }

    // Check for tab in location state (from navigation)
    if (location.state?.tab) {
      setActiveTab(location.state.tab);

      // Restore filter if provided
      if (location.state?.longListSourceFilter) {
        setLongListSourceFilter(location.state.longListSourceFilter);
      }

      // Only clear state if there's no focus candidate to process
      if (!location.state?.focusCandidateId) {
        window.history.replaceState({}, document.title);
      }
    } else {
      // Check for tab in URL hash
      const hash = window.location.hash;
      if (hash.startsWith("#tab=")) {
        const tab = hash.substring(5);
        setActiveTab(tab);
      } else {
        // No tab specified - set default based on device
        setActiveTab(isMobile ? "shortlist" : "overview");
      }
    }
  }, [id, location.state, isMobile]);


  // Scroll to focused candidate when returning from profile
  useEffect(() => {
    const focusId = location.state?.focusCandidateId;
    if ((activeTab === "boolean-search" || activeTab === "shortlist") && focusId) {
      const el = document.getElementById(`candidate-card-${focusId}`);
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        el.classList.add("ring-2", "ring-primary", "animate-pulse");
        setTimeout(() => {
          el.classList.remove("animate-pulse", "ring-2", "ring-primary");
          // Clear the focus state after highlighting
          window.history.replaceState({}, document.title);
        }, 1500);
      }
    }
  }, [activeTab, candidates, longlistedCandidates, location.state]);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (shortListButtonDisabled && shortListTimeRemaining > 0) {
      interval = setInterval(() => {
        setShortListTimeRemaining((prev) => {
          if (prev <= 1) {
            setShortListButtonDisabled(false);
            const storageKey = `shortlist_${id}_disabled`;
            localStorage.removeItem(storageKey);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [shortListButtonDisabled, shortListTimeRemaining, id]);

  // Calculate new applications count
  useEffect(() => {
    if (applications.length > 0 && lastViewedApplications) {
      const lastViewedTimestamp = new Date(lastViewedApplications);
      const newApps = applications.filter((app) => {
        const appTimestamp = new Date(app.Timestamp);
        return appTimestamp > lastViewedTimestamp;
      });
      setNewApplicationsCount(newApps.length);
    } else if (applications.length > 0 && !lastViewedApplications) {
      // If never viewed, all applications are new
      setNewApplicationsCount(applications.length);
    } else {
      setNewApplicationsCount(0);
    }
  }, [applications, lastViewedApplications]);
  const checkShortListButtonStatus = () => {
    if (!id) return;
    const storageKey = `shortlist_${id}_disabled`;
    const disabledUntil = localStorage.getItem(storageKey);
    if (disabledUntil) {
      const now = Date.now();
      const disabledTime = parseInt(disabledUntil);
      if (now < disabledTime) {
        setShortListButtonDisabled(true);
        setShortListTimeRemaining(Math.ceil((disabledTime - now) / 1000));
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  };
  const fetchJob = async (jobId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("Jobs").select("*").eq("job_id", jobId).maybeSingle();
      if (error) {
        console.error("Error fetching job:", error);
        setJob(null);
        return;
      }
      if (!data) {
        console.log("Job not found with ID:", jobId);
        setJob(null);
        return;
      }
      setJob(data);

      // Fetch recruiter name if recruiter_id exists
      if (data.recruiter_id) {
        const { data: recruiterData } = await supabase
          .from("profiles")
          .select("name")
          .eq("user_id", data.recruiter_id)
          .maybeSingle();
        if (recruiterData?.name) {
          setRecruiterName(recruiterData.name);
        }
      }

      // Fetch group data if group_id exists
      if (data.group_id) {
        const { data: groupData } = await supabase
          .from("groups")
          .select("*")
          .eq("id", data.group_id)
          .maybeSingle();
        if (groupData) {
          setJobGroup(groupData);
        }
      }
    } catch (error) {
      console.error("Error fetching job:", error);
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  // Monitor AI requirements and update status from Active to Processing
  useEffect(() => {
    if (!job || !job.job_id) return;
    
    const hasAIRequirements = job.things_to_look_for || job.musttohave || job.nicetohave;
    
    if (hasAIRequirements && job.status === 'Active' && job.Processed === 'Yes') {
      // Automatically transition to Processing
      const updateStatus = async () => {
        try {
          const { error } = await supabase
            .from('Jobs')
            .update({ status: 'Processing' })
            .eq('job_id', job.job_id);
          
          if (!error) {
            setJob({ ...job, status: 'Processing' });
          }
        } catch (error) {
          console.error('Error updating job status:', error);
        }
      };
      updateStatus();
    }
  }, [job?.things_to_look_for, job?.musttohave, job?.nicetohave, job?.status, job?.job_id, job?.Processed]);

  // Monitor for first candidate added and update status from Processing to Recruiting
  useEffect(() => {
    if (!job || !job.job_id) return;
    
    const channel = supabase
      .channel('job-candidates-monitor')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'Jobs_CVs',
        filter: `job_id=eq.${job.job_id}`
      }, async (payload) => {
        console.log('New candidate detected:', payload);
        
        // First candidate added, transition to Recruiting if Processing
        if (job.status === 'Processing' && job.Processed === 'Yes') {
          try {
            const { error } = await supabase
              .from('Jobs')
              .update({ status: 'Recruiting' })
              .eq('job_id', job.job_id);
            
            if (!error) {
              setJob({ ...job, status: 'Recruiting' });
              toast({
                title: "Status Updated",
                description: "Job is now actively recruiting candidates",
              });
            }
          } catch (error) {
            console.error('Error updating job status:', error);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [job?.job_id, job?.status, job?.Processed]);

  // Auto-correct status based on existing candidates on page load
  useEffect(() => {
    if (!job || !job.job_id) return;
    
    // If status is Processing but Processed is Yes and we have candidates, 
    // it should be Recruiting
    if (job.status === 'Processing' && job.Processed === 'Yes' && candidates.length > 0) {
      const updateStatus = async () => {
        try {
          const { error } = await supabase
            .from('Jobs')
            .update({ status: 'Recruiting' })
            .eq('job_id', job.job_id);
          
          if (!error) {
            setJob((prev: any) => ({ ...prev, status: 'Recruiting' }));
          }
        } catch (error) {
          console.error('Error auto-correcting job status:', error);
        }
      };
      updateStatus();
    }
  }, [job?.job_id, job?.status, job?.Processed, candidates.length]);

  const handleAutomaticDialToggle = async (checked: boolean) => {
    if (!job?.job_id) return;

    // Optimistic update for immediate feedback
    setJob((prev) => ({
      ...prev,
      automatic_dial: checked,
      auto_dial_enabled_at: checked ? new Date().toISOString() : null,
    }));
    setAutomaticDialSaving(true);
    try {
      const { error } = await supabase
        .from("Jobs")
        .update({
          automatic_dial: checked,
          auto_dial_enabled_at: checked ? new Date().toISOString() : null,
        })
        .eq("job_id", job.job_id);
      if (error) throw error;
      toast({
        title: "Success",
        description: `Automatic dial ${checked ? "enabled" : "disabled"} for this job`,
      });
    } catch (error) {
      console.error("Error updating automatic dial:", error);
      // Revert on error
      setJob((prev) => ({
        ...prev,
        automatic_dial: !checked,
      }));
      toast({
        title: "Error",
        description: "Failed to update automatic dial setting",
        variant: "destructive",
      });
    } finally {
      setAutomaticDialSaving(false);
    }
  };
  const handlePauseJob = async () => {
    if (!job?.job_id) return;
    const isCurrentlyActive = job?.Processed === "Yes";

    // Optimistic update for immediate feedback
    setJob((prev) => ({
      ...prev,
      automatic_dial: isCurrentlyActive ? false : prev?.automatic_dial,
      Processed: isCurrentlyActive ? "No" : "Yes",
    }));
    setAutomaticDialSaving(true);
    try {
      const { error } = await supabase
        .from("Jobs")
        .update({
          automatic_dial: isCurrentlyActive ? false : job?.automatic_dial,
          Processed: isCurrentlyActive ? "No" : "Yes",
          status: isCurrentlyActive ? "paused" : "active",
        })
        .eq("job_id", job.job_id);
      if (error) throw error;
      toast({
        title: "Success",
        description: isCurrentlyActive ? "Job paused successfully" : "Job activated successfully",
      });
      // Navigate back to jobs page to see it in the correct section
      setTimeout(() => navigate("/jobs"), 1000);
    } catch (error) {
      console.error("Error toggling job status:", error);
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    } finally {
      setAutomaticDialSaving(false);
    }
  };
  const fetchJobGroup = async (groupId: string) => {
    try {
      const { data, error } = await supabase.from("groups").select("*").eq("id", groupId).maybeSingle();
      if (error) {
        console.error("Error fetching group:", error);
        return;
      }
      setJobGroup(data);
    } catch (error) {
      console.error("Error fetching group:", error);
      setJobGroup(null);
    }
  };
  const fetchCandidates = async (jobId: string) => {
    try {
      setCandidatesLoading(true);
      // Optimize: Fetch candidates, LinkedIn data, CVs, and profiles in parallel for name fallback
      const [candidatesResult, linkedinResult, cvsResult, profilesResult] = await Promise.all([
        supabase.from("Jobs_CVs").select("*").eq("job_id", jobId).order("cv_score", {
          ascending: false,
          nullsFirst: false,
        }),
        supabase
          .from("linkedin_boolean_search")
          .select("user_id, linkedin_id")
          .eq("job_id", jobId),
        supabase.from("CVs").select("user_id, name, Firstname, Lastname"),
        supabase.from("profiles").select("user_id, name"),
      ]);
      const candidatesData = candidatesResult.data;
      const candidatesError = candidatesResult.error;
      const linkedinData = linkedinResult.data;
      const linkedinError = linkedinResult.error;
      const cvsData = cvsResult.data;
      const cvsError = cvsResult.error;
      const profilesData = profilesResult.data;
      const profilesError = profilesResult.error;
      
      if (candidatesError) throw candidatesError;
      if (linkedinError) console.warn("Error fetching LinkedIn data:", linkedinError);
      if (cvsError) console.warn("Error fetching CVs data:", cvsError);
      if (profilesError) console.warn("Error fetching profiles data:", profilesError);

      // Create a map of LinkedIn data by user_id for quick lookup
      const linkedinMap = new Map();
      (linkedinData || []).forEach((item) => {
        if (item.user_id) {
          linkedinMap.set(item.user_id, {
            linkedin_id: item.linkedin_id,
          });
        }
      });

      // Create a map of profiles data by user_id for name fallback (highest priority)
      const profilesMap = new Map();
      (profilesData || []).forEach((item) => {
        if (item.user_id && item.name) {
          profilesMap.set(item.user_id, item.name);
        }
      });

      // Create a map of CVs data by user_id for name fallback (secondary priority)
      const cvsMap = new Map();
      (cvsData || []).forEach((item) => {
        if (item.user_id) {
          const fullName = item.name || 
            (item.Firstname && item.Lastname ? `${item.Firstname} ${item.Lastname}` : 
             item.Firstname || item.Lastname || "");
          cvsMap.set(item.user_id, fullName);
        }
      });
      const mapped = (candidatesData || []).map((row: any) => {
        // Determine effective CV score (prioritize LinkedIn score for LinkedIn-sourced candidates)
        const sourceLower = (row.source || "").toLowerCase();
        const effectiveCvScore = sourceLower.includes("linkedin")
          ? (row.linkedin_score ?? row.cv_score ?? null)
          : (row.cv_score ?? row.linkedin_score ?? null);

        // Get LinkedIn data for this candidate by user_id (if available from map)
        const linkedinInfo = linkedinMap.get(row.user_id) || {};
        const linkedinId = linkedinInfo.linkedin_id ?? row.linkedin_id ?? "";
        const linkedinScore = row.linkedin_score ?? null;
        const linkedinReason = row.linkedin_score_reason ?? "";
        
        // Get candidate name with fallback: Jobs_CVs -> profiles -> CVs
        const candidateName = row.candidate_name || 
                             profilesMap.get(row.user_id) || 
                             cvsMap.get(row.user_id) || 
                             "";
        
        return {
          ...row,
          "Job ID": jobId,
          Candidate_ID: row.recordid?.toString() || "",
          Contacted: row.contacted ?? "",
          Transcript: row.transcript ?? "",
          Summary: row.cv_score_reason ?? "",
          "Success Score": row.after_call_score?.toString() ?? "",
          "Score and Reason": row.cv_score_reason ?? "",
          "Candidate Name": candidateName,
          "Candidate Email": row.candidate_email ?? "",
          "Candidate Phone Number": row.candidate_phone_number ?? "",
          Source: row.source ?? "",
          // Keep LinkedIn fields for UI/debug
          linkedin_id: linkedinId ?? "",
          linkedin_score: linkedinScore ?? "",
          linkedin_score_reason: linkedinReason ?? "",
          pros: row.after_call_pros,
          cons: row.after_call_cons,
          "Notice Period": row.notice_period ?? "",
          "Salary Expectations": row.salary_expectations ?? "",
          current_salary: row.current_salary ?? "",
          Notes: row.notes ?? "",
          callid: row.recordid ?? Math.random() * 1000000,
          duration: extractFirstFromArray(row.duration),
          recording: extractFirstFromArray(row.recording),
          first_name: candidateName?.split(" ")[0] || "",
          last_name: candidateName?.split(" ").slice(1).join(" ") || "",
          // Normalize CV score fields so the UI picks them up everywhere
          cv_score: effectiveCvScore ?? 0,
          "CV Score": effectiveCvScore != null ? String(effectiveCvScore) : "",
          // Keep legacy "Score" alias used elsewhere for sorting/analytics
          Score: effectiveCvScore != null ? String(effectiveCvScore) : "0",
          lastcalltime: row.lastcalltime,
          // Add timestamp fields for status highlighting
          rejected_at: row.rejected_at,
          submitted_at: row.submitted_at,
        };
      });
      setCandidates(mapped);
      console.log("Total candidates from Jobs_CVs:", mapped?.length || 0);

      // Calculate candidate scores for analytics
      const allScores = mapped?.map((c) => parseFloat(c.Score) || 0).filter((score) => !isNaN(score)) || [];
      console.log("All candidate scores:", allScores);

      // Debug LinkedIn data visibility
      const linkedinCandidates = mapped.filter(
        (c) => typeof c["Source"] === "string" && c["Source"].toLowerCase().includes("linkedin"),
      );
      console.log(
        "LinkedIn source candidates:",
        linkedinCandidates.length,
        "Sample:",
        linkedinCandidates.slice(0, 3).map((c) => ({
          name: c["Candidate Name"],
          overall: c["linkedin_score"],
          reason: c["linkedin_score_reason"],
        })),
      );

      // Calculate low scored candidates (score < 70)
      const lowScoredCandidates =
        mapped?.filter((c) => {
          const score = parseFloat(c.Score) || 0;
          return !isNaN(score) && score < 70;
        }) || [];
      console.log(
        "Low scored candidates:",
        lowScoredCandidates.length,
        "Sample:",
        lowScoredCandidates.slice(0, 3).map((c) => ({
          name: c.candidate_name,
          score: c.Score,
        })),
      );
    } catch (error) {
      console.error("Error fetching candidates from Jobs_CVs:", error);
      setCandidates([]);
    } finally {
      setCandidatesLoading(false);
    }
  };
  const fetchLonglistedCandidates = async (jobId: string) => {
    try {
      setLonglistedLoading(true);

      // Fetch all Itris and LinkedIn candidates from Jobs_CVs
      const { data: longlistedData, error: longlistedError } = await supabase
        .from("Jobs_CVs")
        .select("*")
        .eq("job_id", jobId)
        .neq("contacted", "Shortlisted from Similar jobs")
        .limit(10000)
        .order("cv_score", {
          ascending: false,
          nullsLast: true,
        });
      if (longlistedError) throw longlistedError;

      // Fetch any existing scores for this job (regardless of longlisted status)
      const { data: scoreRows, error: scoreErr } = await supabase
        .from("Jobs_CVs")
        .select("user_id, candidate_email, candidate_phone_number, cv_score, cv_score_reason")
        .eq("job_id", jobId);
      if (scoreErr) console.warn("Error fetching score map:", scoreErr);
      const scoreMap = new Map<
        string,
        {
          score: number | null;
          reason: string | null;
        }
      >();
      const emailScoreMap = new Map<
        string,
        {
          score: number | null;
          reason: string | null;
        }
      >();
      const phoneScoreMap = new Map<
        string,
        {
          score: number | null;
          reason: string | null;
        }
      >();
      (scoreRows || []).forEach((r: any) => {
        const nextScore = r?.cv_score ?? null;
        const nextReason = r?.cv_score_reason ?? null;

        // by user_id
        if (r?.user_id) {
          const prev = scoreMap.get(String(r.user_id));
          if (!prev)
            scoreMap.set(String(r.user_id), {
              score: nextScore,
              reason: nextReason,
            });
          else
            scoreMap.set(String(r.user_id), {
              score: prev.score ?? nextScore,
              reason: prev.reason ?? nextReason,
            });
        }

        // by email
        const email = (r?.candidate_email || "").toString().trim().toLowerCase();
        if (email) {
          const prevE = emailScoreMap.get(email);
          if (!prevE)
            emailScoreMap.set(email, {
              score: nextScore,
              reason: nextReason,
            });
          else
            emailScoreMap.set(email, {
              score: prevE.score ?? nextScore,
              reason: prevE.reason ?? nextReason,
            });
        }

        // by phone (digits only)
        const phone = (r?.candidate_phone_number || "").toString().replace(/[^0-9]/g, "");
        if (phone) {
          const prevP = phoneScoreMap.get(phone);
          if (!prevP)
            phoneScoreMap.set(phone, {
              score: nextScore,
              reason: nextReason,
            });
          else
            phoneScoreMap.set(phone, {
              score: prevP.score ?? nextScore,
              reason: prevP.reason ?? nextReason,
            });
        }
      });
      // Also fetch LinkedIn profile IDs for this job to enrich candidates
      const { data: liRows, error: liErr } = await supabase
        .from("linkedin_boolean_search")
        .select("user_id, linkedin_id")
        .eq("job_id", jobId);
      if (liErr) console.warn("Error fetching LinkedIn IDs:", liErr);
      const liMap = new Map<
        string,
        {
          linkedin_id: string | null;
        }
      >();
      (liRows || []).forEach((r: any) => {
        if (r?.user_id)
          liMap.set(String(r.user_id), {
            linkedin_id: r.linkedin_id ?? null,
          });
      });
      const mappedLonglisted = (longlistedData || []).map((row: any) => {
        const sourceLower = (row.source || "").toLowerCase();
        const hasLinkedIn = sourceLower.includes("linkedin");

        // Prefer stored cv_score on the row; if missing, fall back to any score we have for the same user_id/email/phone in this job
        const fromUser = scoreMap.get(String(row.user_id));
        const emailKey = (row.candidate_email || "").toString().trim().toLowerCase();
        const phoneKey = (row.candidate_phone_number || "").toString().replace(/[^0-9]/g, "");
        const fromEmail = emailKey ? emailScoreMap.get(emailKey) : undefined;
        const fromPhone = phoneKey ? phoneScoreMap.get(phoneKey) : undefined;
        const mergedScore =
          row.cv_score ??
          fromUser?.score ??
          fromEmail?.score ??
          fromPhone?.score ??
          (hasLinkedIn ? (row.linkedin_score ?? null) : null);
        const mergedReason =
          row.cv_score_reason ??
          fromUser?.reason ??
          fromEmail?.reason ??
          fromPhone?.reason ??
          (hasLinkedIn ? (row.linkedin_score_reason ?? "") : "");

        // Prefer linkedin_id from Jobs_CVs row, else fall back to linkedin_boolean_search mapping
        const mappedLinkedInId = row.linkedin_id ?? liMap.get(String(row.user_id))?.linkedin_id ?? "";
        return {
          ...row,
          "Job ID": jobId,
          Candidate_ID: row.recordid?.toString() || "",
          Contacted: row.contacted ?? "",
          Transcript: row.transcript ?? "",
          Summary: mergedReason || "",
          "Success Score": row.after_call_score?.toString() ?? "",
          "Score and Reason": mergedReason || "",
          "Candidate Name": row.candidate_name ?? "",
          "Candidate Email": row.candidate_email ?? "",
          "Candidate Phone Number": row.candidate_phone_number ?? "",
          Source: row.source ?? "",
          linkedin_score: row.linkedin_score ?? "",
          linkedin_score_reason: row.linkedin_score_reason ?? "",
          pros: row.after_call_pros,
          cons: row.after_call_cons,
          "Notice Period": row.notice_period ?? "",
          "Salary Expectations": row.salary_expectations ?? "",
          current_salary: row.current_salary ?? "",
          Notes: row.notes ?? "",
          callid: row.recordid ?? Math.random() * 1000000,
          duration: extractFirstFromArray(row.duration),
          recording: extractFirstFromArray(row.recording),
          first_name: row.candidate_name?.split(" ")[0] || "",
          last_name: row.candidate_name?.split(" ").slice(1).join(" ") || "",
          cv_score: mergedScore ?? 0,
          "CV Score": mergedScore != null ? String(mergedScore) : "",
          success_score: row.after_call_score ?? 0,
          linkedin_id: mappedLinkedInId,
          longlisted_at: row.longlisted_at,
          cv_score_reason: mergedReason || "",
          // Add timestamp fields for status highlighting
          rejected_at: row.rejected_at,
          submitted_at: row.submitted_at,
        };
      });
      setLonglistedCandidates(mappedLonglisted);
    } catch (error) {
      console.error("Error fetching longlisted candidates:", error);
      setLonglistedCandidates([]);
    } finally {
      setLonglistedLoading(false);
    }
  };
  const fetchCvData = async () => {
    if (!profile?.slug) return;
    try {
      const { data, error } = await supabase.from("CVs").select("*");
      if (error) throw error;
      setCvData(data || []);
    } catch (error) {
      console.error("Error fetching CV data:", error);
      setCvData([]);
    }
  };
  const fetchApplications = async (jobId: string) => {
    setApplicationsLoading(true);
    try {
      // Fetch both CVs and profiles in parallel
      const [cvsResult, profilesResult] = await Promise.all([
        supabase.from("CVs").select("*").eq("job_id", jobId).like("user_id", "App%").order("updated_time", {
          ascending: false,
        }),
        supabase.from("profiles").select("user_id, name"),
      ]);

      if (cvsResult.error) throw cvsResult.error;

      // Create a map of profiles by user_id
      const profilesMap = new Map();
      (profilesResult.data || []).forEach((profile) => {
        if (profile.user_id && profile.name) {
          profilesMap.set(profile.user_id, profile.name);
        }
      });

      // Map the data to match the expected structure in the UI
      const mappedApplications = (cvsResult.data || []).map((cv) => {
        // Get name with priority: CVs.name -> Firstname + Lastname -> profiles.name
        let firstName = cv.Firstname || "";
        let lastName = cv.Lastname || "";
        
        // Treat "Not found" or "not found" as empty
        if (lastName && lastName.toLowerCase() === "not found") {
          lastName = "";
        }
        
        // If we have a name field in CVs, use that
        if (cv.name && cv.name.trim() && !cv.name.toLowerCase().includes("not found")) {
          const nameParts = cv.name.trim().split(" ");
          firstName = nameParts[0] || "";
          lastName = nameParts.slice(1).join(" ") || "";
        }
        // If still no name, check profiles
        else if (!firstName && !lastName) {
          const profileName = profilesMap.get(cv.user_id);
          if (profileName) {
            const nameParts = profileName.trim().split(" ");
            firstName = nameParts[0] || "";
            lastName = nameParts.slice(1).join(" ") || "";
          }
        }

        return {
          candidate_id: cv.user_id,
          first_name: firstName,
          last_name: lastName,
          Email: cv.email,
          phone_number: cv.phone_number,
          CV_Link: cv.cv_link,
          cv_summary: cv.cv_text ? cv.cv_text.substring(0, 200) + "..." : "",
          Timestamp: cv.updated_time,
        };
      });
      setApplications(mappedApplications);

      // Fetch longlisted status for all candidates
      await fetchLonglistedStatus(jobId);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };
  const fetchLonglistedStatus = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from("Jobs_CVs")
        .select("user_id")
        .eq("job_id", jobId);
      if (error) throw error;
      const longlistedIds = new Set(data?.map((item) => item.user_id) || []);
      setAddedToLongList(longlistedIds);
    } catch (error) {
      console.error("Error fetching longlisted status:", error);
    }
  };

  const fetchSimilarJobsCandidates = async (jobId: string) => {
    setSimilarJobsLoading(true);
    try {
      const { data, error } = await supabase
        .from("Jobs_CVs")
        .select("*")
        .eq("job_id", jobId)
        .eq("contacted", "Shortlisted from Similar jobs")
        .order("cv_score", { ascending: false });

      if (error) throw error;
      setSimilarJobsCandidates(data || []);
    } catch (error) {
      console.error("Error fetching similar jobs candidates:", error);
      toast({
        title: "Error",
        description: "Failed to load candidates from similar jobs",
        variant: "destructive",
      });
    } finally {
      setSimilarJobsLoading(false);
    }
  };

  const fetchTaskCandidates = async (jobId: string) => {
    if (!profile?.slug) return;
    try {
      // For now, we'll use the same CVs table data since task_candidates table doesn't exist
      const { data, error } = await supabase
        .from("CVs")
        .select("*")
        .filter("applied_for", "cs", `{${jobId}}`)
        .not("CandidateStatus", "is", null);
      if (error) throw error;
      setTaskCandidates(data || []);
      const taskedCandidates = data?.filter((c) => c.CandidateStatus === "Tasked") || [];
      console.log("Tasked calculation:", {
        tasked: taskedCandidates.length,
        total: data?.length || 0,
        taskedCandidates: taskedCandidates.slice(0, 3).map((c) => ({
          name: c.first_name,
          status: c.CandidateStatus,
        })),
      });
    } catch (error) {
      console.error("Error fetching task candidates:", error);
      setTaskCandidates([]);
    }
  };
  const updateTaskStatus = async (taskId: number, newStatus: "Pending" | "Received" | "Reviewed") => {
    try {
      const { error } = await supabase
        .from("task_candidates")
        .update({
          status: newStatus,
        })
        .eq("taskid", taskId);
      if (error) throw error;
      setTaskCandidates((prev) =>
        prev.map((task) =>
          task.taskid === taskId
            ? {
                ...task,
                status: newStatus,
              }
            : task,
        ),
      );
      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };
  const handleCallSelectedCandidates = async () => {
    if (selectedCandidates.size === 0) {
      toast({
        title: "Error",
        description: "Please select candidates to call",
        variant: "destructive",
      });
      return;
    }
    if (!job?.job_id) {
      toast({
        title: "Error",
        description: "Job ID not found",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingShortList(true);
    try {
      // Get selected candidate data
      const selectedCandidateData = candidates.filter((candidate) => selectedCandidates.has(candidate["Candidate_ID"]));

      // Process each selected candidate with their recordid
      for (const candidate of selectedCandidateData) {
        const payload = {
          user_id: candidate.user_id,
          jobID: job.job_id,
          job_itris_id: job.itris_job_id,
          recordid: candidate.recordid,
        };

        // Make HTTP request to the webhook for each candidate
        const response = await fetch("https://hook.eu2.make.com/o9mt66urjw5a6sxfog71945s3ubghukw", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      toast({
        title: "Success",
        description: `Calling ${selectedCandidates.size} selected candidates initiated successfully`,
      });

      // Clear selection after successful call
      setSelectedCandidates(new Set());
    } catch (error) {
      console.error("Error calling selected candidates:", error);
      toast({
        title: "Error",
        description: "Failed to call selected candidates",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingShortList(false);
    }
  };
  const handleRemoveSelectedCandidates = async () => {
    if (selectedCandidates.size === 0) {
      toast({
        title: "Error",
        description: "Please select candidates to remove",
        variant: "destructive",
      });
      return;
    }
    if (!id) {
      toast({
        title: "Error",
        description: "Missing job ID",
        variant: "destructive",
      });
      return;
    }
    try {
      console.log("=== BULK REMOVE START ===");
      const selectedIds = Array.from(selectedCandidates);
      const selectedSet = new Set(selectedIds);

      // Collect ALL recordids for the selected candidates (some candidates may have multiple rows)
      const recordIdsToDelete = new Set<any>();
      const collectFrom = (list: any[]) => {
        for (const c of list) {
          const cid = c["Candidate_ID"] ? String(c["Candidate_ID"]) : "";
          const uid = c.user_id ? String(c.user_id) : "";
          if ((cid && selectedSet.has(cid)) || (uid && selectedSet.has(uid))) {
            if (c.recordid !== undefined && c.recordid !== null) {
              recordIdsToDelete.add(c.recordid);
            }
          }
        }
      };
      collectFrom(candidates);
      collectFrom(longlistedCandidates);
      if (recordIdsToDelete.size === 0) {
        console.warn("No recordids found for selected candidates");
        toast({
          title: "Nothing to delete",
          description: "Selected candidates have no associated records",
        });
        return;
      }
      console.log("Deleting from Jobs_CVs for job:", id, "recordids:", Array.from(recordIdsToDelete));
      const { data, error } = await supabase
        .from("Jobs_CVs")
        .delete()
        .in("recordid", Array.from(recordIdsToDelete))
        .eq("job_id", id)
        .select();
      console.log("Bulk delete response:", {
        success: !error,
        deletedRows: data?.length || 0,
        data,
        error,
      });
      if (error) throw error;
      if (!data || data.length === 0) {
        console.warn("No rows deleted in bulk remove - they may have been already removed");
      }

      // Update UI state: remove all selected candidates from both lists
      setCandidates((prev) =>
        prev.filter((c) => {
          const cid = c["Candidate_ID"] ? String(c["Candidate_ID"]) : "";
          const uid = c.user_id ? String(c.user_id) : "";
          return !(cid && selectedSet.has(cid)) && !(uid && selectedSet.has(uid));
        }),
      );
      setLonglistedCandidates((prev) =>
        prev.filter((c) => {
          const cid = c["Candidate_ID"] ? String(c["Candidate_ID"]) : "";
          const uid = c.user_id ? String(c.user_id) : "";
          return !(cid && selectedSet.has(cid)) && !(uid && selectedSet.has(uid));
        }),
      );

      // Clear selection
      setSelectedCandidates(new Set());
      toast({
        title: "Removed",
        description: `${selectedIds.length} candidate${selectedIds.length > 1 ? "s" : ""} removed from long list`,
      });
      console.log("=== BULK REMOVE SUCCESS ===");
    } catch (error) {
      console.error("=== BULK REMOVE ERROR ===", error);
      toast({
        title: "Error",
        description: "Failed to remove selected candidates",
        variant: "destructive",
      });
    }
  };
  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(candidateId)) {
        newSelection.delete(candidateId);
      } else {
        newSelection.add(candidateId);
      }
      return newSelection;
    });
  };
  const selectAllCandidates = () => {
    const allCandidateIds = new Set(
      Object.keys(
        filteredCandidates.reduce(
          (acc, candidate) => {
            acc[candidate["Candidate_ID"]] = true;
            return acc;
          },
          {} as Record<string, boolean>,
        ),
      ),
    );
    setSelectedCandidates(allCandidateIds);
  };
  const clearAllSelection = () => {
    setSelectedCandidates(new Set());
  };
  const handleButtonClick = () => {
    if (job?.longlist && job.longlist > 0) {
      setShowConfirmDialog(true);
    } else {
      handleGenerateLongList();
    }
  };
  const handleSearchMoreCandidates = async (searchType: "linkedin" | "database" | "both" = "both") => {
    if (regenerateCooldown.isDisabled) {
      console.log("Regenerate button is on cooldown, ignoring click");
      return;
    }
    
    try {
      // Start cooldown immediately
      console.log("Starting regenerate cooldown...");
      regenerateCooldown.startCooldown();
      
      // Get user_ids from AI Boolean Search candidates (filteredCandidates) as comma-separated string
      const booleanSearchUserIds = filteredCandidates
        .map((candidate) => candidate.user_id)
        .filter(Boolean)
        .join(",");
      
      // Map search type to title
      const searchTitles = {
        linkedin: "LinkedIn",
        database: "Database",
        both: "Search Both"
      };
      
      const payload = {
        job_id: job?.job_id || "",
        itris_job_id: job?.itris_job_id || "",
        user_ids: booleanSearchUserIds,
        profile_id: job?.recruiter_id || "",
        title: searchTitles[searchType],
      };
      console.log("Regenerate AI webhook payload:", payload);
      console.log("Job recruiter_id:", job?.recruiter_id);
      console.log("User profile ID:", profile?.user_id);
      const response = await fetch("https://n8n.srv1158803.hstgr.cloud/webhook/ecb9d9ed-1f43-4f15-b4fc-5dd5ef0a455c", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      toast({
        title: "Success",
        description: "AI is searching for more candidates. Next search available in 30 minutes.",
      });
    } catch (error) {
      console.error("Error searching for more candidates:", error);
      toast({
        title: "Error",
        description: "Failed to search for more candidates",
        variant: "destructive",
      });
    }
  };
  const handleGenerateLongList = async () => {
    if (generateCooldown.isDisabled) {
      console.log("Generate button is on cooldown, ignoring click");
      return;
    }
    
    try {
      // Start cooldown immediately
      console.log("Starting generate cooldown...");
      generateCooldown.startCooldown();
      
      console.log("Starting Generate Long List process...");
      console.log("Current job:", job);
      console.log("Current profile:", profile);

      // First, increment the longlist count in the database
      const { error: updateError } = await supabase
        .from("Jobs")
        .update({
          longlist: (job?.longlist || 0) + 1,
        })
        .eq("job_id", job?.job_id);
      if (updateError) {
        console.error("Database update error:", updateError);
        throw updateError;
      }

      // Update local state
      setJob((prev) => ({
        ...prev,
        longlist: (prev?.longlist || 0) + 1,
      }));

      // Prepare payload for webhook
      const payload = {
        job_id: job?.job_id || "",
        itris_job_id: job?.itris_job_id || "",
        profile_id: job?.recruiter_id || "",
      };
      console.log("Webhook payload:", payload);

      // Call the automation endpoint
      console.log("Calling webhook at:", "https://hook.eu2.make.com/yiz4ustkcgxgji2sv6fwcs99jdr3674m");
      const response = await fetch("https://hook.eu2.make.com/yiz4ustkcgxgji2sv6fwcs99jdr3674m", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log("Webhook response status:", response.status);
      console.log("Webhook response ok:", response.ok);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Webhook error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }
      const responseData = await response.text();
      console.log("Webhook success response:", responseData);
      toast({
        title: "Success",
        description: "Long list generated successfully. Next generation available in 30 minutes.",
      });
    } catch (error) {
      console.error("Error generating long list:", error);
      toast({
        title: "Error",
        description: `Failed to generate long list: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  const handleRejectCandidate = async (reason: string) => {
    if (!rejectCandidateData) return;
    const { jobId, candidateId, callid } = rejectCandidateData;
    try {
      // Find the candidate data from the candidates array
      const candidate = candidates.find((c) => c["Candidate_ID"] === candidateId || c["user_id"] === candidateId);
      if (!candidate) {
        toast({
          title: "Error",
          description: "Candidate data not found",
          variant: "destructive",
        });
        return;
      }

      // Update the database with the rejection reason and timestamp
      const { error: updateError } = await supabase
        .from("Jobs_CVs")
        .update({
          contacted: "Rejected",
          Reason_to_reject: `${reason}: ${rejectAdditionalInfo}`,
          rejected_at: new Date().toISOString(),
        })
        .eq("recordid", candidate.recordid);
      if (updateError) {
        throw updateError;
      }
      const response = await fetch("https://hook.eu2.make.com/mk46k4ibvs5n5nk1lto9csljygesv75f", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_id: jobId,
          user_id: candidate.user_id?.toString() || "",
          recordid: candidate.recordid?.toString() || "",
          itris_job_id: job?.itris_job_id || "",
        }),
      });
      if (response.ok) {
        toast({
          title: "Candidate Rejected",
          description: "The candidate has been successfully rejected.",
        });
        setShowRejectDialog(false);
        setRejectReason("");
        setRejectAdditionalInfo("");
        setRejectCandidateData(null);
        // Refresh data
        if (id) {
          fetchCandidates(id);
          fetchLonglistedCandidates(id);
        }
      } else {
        throw new Error("Failed to reject candidate");
      }
    } catch (error) {
      console.error("Error rejecting candidate:", error);
      toast({
        title: "Error",
        description: "Failed to reject candidate. Please try again.",
        variant: "destructive",
      });
    }
  };
  const openRejectDialog = (jobId: string, candidateId: string, callid: number) => {
    setRejectCandidateData({
      jobId,
      candidateId,
      callid,
    });
    setShowRejectDialog(true);
  };
  const openHireDialog = (jobId: string, candidateId: string, callid: number) => {
    setHireCandidateData({
      jobId,
      candidateId,
      callid,
    });
    setHireReason("");
    setShowHireDialog(true);
  };
  // Export AI Longlist to CSV
  const exportLonglistToCSV = () => {
    // Apply same filters as the display
    const filteredCandidates = longlistedCandidates.filter((candidate) => {
      const nameMatch = !nameFilter || 
        (candidate["Candidate Name"] || "").toLowerCase().includes(nameFilter.toLowerCase());
      const emailMatch = !emailFilter || 
        (candidate["Candidate Email"] || "").toLowerCase().includes(emailFilter.toLowerCase());
      const phoneMatch = !phoneFilter || 
        (candidate["Candidate Phone Number"] || "").includes(phoneFilter);
      const userIdMatch = !userIdFilter || 
        (candidate.user_id || candidate["Candidate_ID"] || "").toString().includes(userIdFilter);
      const source = (candidate["Source"] || candidate.source || "").toLowerCase();
      const sourceFilterMatch = !longListSourceFilter || 
        longListSourceFilter === "all" || 
        (longListSourceFilter.toLowerCase() === "itris"
          ? source.includes("itris") || source.includes("internal database")
          : source.includes(longListSourceFilter.toLowerCase()));
      let scoreMatch = true;
      if (scoreFilter !== "all") {
        const score = parseInt(candidate["cv_score"] || "0");
        switch (scoreFilter) {
          case "high": scoreMatch = score >= 75; break;
          case "moderate": scoreMatch = score >= 50 && score < 75; break;
          case "poor": scoreMatch = score >= 1 && score < 50; break;
          case "none": scoreMatch = score === 0 || isNaN(score); break;
        }
      }
      let contactedMatch = true;
      if (contactedFilter !== "all") {
        const contacted = candidate["Contacted"] || "";
        contactedMatch = contacted === contactedFilter || 
          (contactedFilter === "Ready to Call" && contacted === "Ready to Contact");
      }
      return nameMatch && emailMatch && phoneMatch && userIdMatch && 
             sourceFilterMatch && scoreMatch && contactedMatch;
    });

    // Sort by score descending
    const sortedCandidates = [...filteredCandidates].sort((a, b) => {
      const scoreA = Math.max(
        parseInt(a["cv_score"] || "0"), 
        parseInt(a["linkedin_score"] || "0")
      );
      const scoreB = Math.max(
        parseInt(b["cv_score"] || "0"), 
        parseInt(b["linkedin_score"] || "0")
      );
      return scoreB - scoreA;
    });

    if (sortedCandidates.length === 0) {
      toast({ title: "No candidates to export", variant: "destructive" });
      return;
    }

    // Define headers
    const headers = [
      'Name',
      'Email', 
      'Phone',
      'Source',
      'CV Score',
      'LinkedIn Score',
      'Status',
      'User ID',
      'Score Reason',
      'Created At'
    ];

    // Build rows
    const rows = sortedCandidates.map((c) => [
      c["Candidate Name"] || '',
      c["Candidate Email"] || '',
      c["Candidate Phone Number"] || '',
      c["Source"] || '',
      c["cv_score"]?.toString() || '',
      c["linkedin_score"]?.toString() || '',
      c["Contacted"] || '',
      c["user_id"] || c["Candidate_ID"] || '',
      c["cv_score_reason"] || c["linkedin_score_reason"] || '',
      c["longlisted_at"] ? format(new Date(c["longlisted_at"]), 'yyyy-MM-dd HH:mm') : ''
    ]);

    // Create CSV with BOM for Excel compatibility
    const BOM = '\uFEFF';
    const csvContent = BOM + [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const jobTitle = job?.job_title?.replace(/[^a-zA-Z0-9]/g, '_') || 'longlist';
    const timestamp = format(new Date(), 'yyyy-MM-dd');
    link.href = URL.createObjectURL(blob);
    link.download = `AI_Longlist_${jobTitle}_${timestamp}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast({ title: `Exported ${sortedCandidates.length} candidates` });
  };

  const handleHireCandidate = async () => {
    if (!hireCandidateData) return;
    try {
      // Use callid to update the correct record (recordid in Jobs_CVs equals the callid)
      const { error } = await supabase
        .from("Jobs_CVs")
        .update({
          Reason_to_Hire: `${hireReason}: ${hireAdditionalInfo}`,
          contacted: "Submitted",
          submitted_at: new Date().toISOString(),
        })
        .eq("recordid", hireCandidateData.callid)
        .eq("job_id", hireCandidateData.jobId);

      if (error) throw error;

      // Update local state using both user_id and Candidate_ID
      setCandidates((prev) =>
        prev.map((c) =>
          c["user_id"] === hireCandidateData.candidateId || c["Candidate_ID"] === hireCandidateData.candidateId
            ? { ...c, Contacted: "Submitted" }
            : c,
        ),
      );

      toast({
        title: "CV Submitted",
        description: "Candidate's CV has been submitted with hiring reason",
      });

      // Refresh candidates data
      if (id) {
        fetchCandidates(id);
        fetchLonglistedCandidates(id);
        fetchSimilarJobsCandidates(id);
      }

      setShowHireDialog(false);
      setHireReason("");
      setHireAdditionalInfo("");
      setHireCandidateData(null);
    } catch (error) {
      console.error("Error saving hire reason:", error);
      toast({
        title: "Error",
        description: "Failed to submit CV. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleGenerateShortList = async () => {
    if (!job?.job_id || candidates.length === 0) {
      toast({
        title: "Error",
        description: "No candidates available to process",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingShortList(true);

    // Set button disabled for 30 minutes (1800 seconds)
    const disabledUntil = Date.now() + 30 * 60 * 1000;
    const storageKey = `shortlist_${id}_disabled`;
    localStorage.setItem(storageKey, disabledUntil.toString());
    setShortListButtonDisabled(true);
    setShortListTimeRemaining(30 * 60); // 30 minutes in seconds

    try {
      // Process each candidate individually with their recordid
      for (const candidate of candidates) {
        const payload = {
          user_id: candidate.user_id,
          jobID: job.job_id,
          job_itris_id: job.itris_job_id,
          recordid: candidate.recordid,
        };

        // Make HTTP request to the webhook for each candidate
        const response = await fetch("https://hook.eu2.make.com/o9mt66urjw5a6sxfog71945s3ubghukw", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      toast({
        title: "Success",
        description: "Short list generation initiated successfully",
      });
    } catch (error) {
      console.error("Error generating short list:", error);
      toast({
        title: "Error",
        description: "Failed to generate short list",
        variant: "destructive",
      });
      // Remove the disabled state if there was an error
      localStorage.removeItem(storageKey);
      setShortListButtonDisabled(false);
      setShortListTimeRemaining(0);
    } finally {
      setIsGeneratingShortList(false);
    }
  };
  const handleRemoveFromLongList = async (candidateId: string) => {
    try {
      console.log("=== REMOVE CANDIDATE START ===");
      console.log("Attempting to remove candidate:", candidateId);
      console.log("Job ID:", id);
      console.log(
        "Available candidates:",
        candidates.map((c) => ({
          id: c["Candidate_ID"],
          recordid: c.recordid,
          user_id: c.user_id,
          name: c["Candidate Name"],
        })),
      );

      // Find the candidate record - try multiple approaches
      let candidate = candidates.find((c) => c["Candidate_ID"] === candidateId);

      // If not found by Candidate_ID, try by recordid directly
      if (!candidate) {
        candidate = candidates.find((c) => c.recordid?.toString() === candidateId);
      }

      // If still not found, try by user_id
      if (!candidate) {
        candidate = candidates.find((c) => c.user_id === candidateId);
      }
      if (!candidate) {
        console.error("Candidate not found. Searched for:", candidateId);
        console.error(
          "Available candidate IDs:",
          candidates.map((c) => c["Candidate_ID"]),
        );
        throw new Error("Candidate not found in local data");
      }
      console.log("Found candidate to remove:", {
        recordid: candidate.recordid,
        user_id: candidate.user_id,
        name: candidate["Candidate Name"],
        email: candidate["Candidate Email"],
      });

      // Use the actual recordid from the database for deletion
      const recordIdToDelete = candidate.recordid;
      if (!recordIdToDelete) {
        console.error("No recordid found for candidate:", candidate);
        throw new Error("Cannot delete candidate: missing recordid");
      }
      console.log("Deleting from Jobs_CVs table...");
      console.log("Parameters:", {
        recordid: recordIdToDelete,
        job_id: id,
      });

      // Delete the candidate from the Jobs_CVs table permanently
      const { data, error } = await supabase
        .from("Jobs_CVs")
        .delete()
        .eq("recordid", recordIdToDelete)
        .eq("job_id", id)
        .select();
      console.log("Delete response:", {
        success: !error,
        deletedRows: data?.length || 0,
        data,
        error,
      });
      if (error) {
        console.error("Supabase delete error:", error);
        throw error;
      }
      if (!data || data.length === 0) {
        console.warn("No rows were deleted - candidate may not exist in database");
        throw new Error("Candidate not found in database or already deleted");
      }
      console.log("Successfully deleted candidate from Jobs_CVs table");
      console.log("Deleted record:", data[0]);

      // Update the local state to remove the candidate
      setCandidates((prev) => {
        const updated = prev.filter((c) => {
          const cid = c["Candidate_ID"] ? String(c["Candidate_ID"]) : "";
          const uid = c.user_id ? String(c.user_id) : "";
          return cid !== String(candidateId) && uid !== String(candidateId);
        });
        console.log("Updated candidates count:", updated.length);
        return updated;
      });
      setLonglistedCandidates((prev) => {
        const updated = prev.filter((c) => {
          const cid = c["Candidate_ID"] ? String(c["Candidate_ID"]) : "";
          const uid = c.user_id ? String(c.user_id) : "";
          return cid !== String(candidateId) && uid !== String(candidateId);
        });
        console.log("Updated longlisted candidates count:", updated.length);
        return updated;
      });

      // Refresh the data to ensure UI is in sync with database
      console.log("Refreshing longlisted candidates...");
      await fetchLonglistedCandidates(String(id));
      console.log("=== REMOVE CANDIDATE SUCCESS ===");
      toast({
        title: "Success",
        description: `Candidate "${candidate["Candidate Name"]}" has been permanently removed from the database`,
      });
    } catch (error) {
      console.error("=== REMOVE CANDIDATE ERROR ===");
      console.error("Error details:", error);
      toast({
        title: "Error",
        description: `Failed to remove candidate: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };
  const showRemoveConfirmation = (candidateId: string, candidateName: string) => {
    setCandidateToRemove({
      id: candidateId,
      name: candidateName,
    });
  };
  const confirmRemoveFromLongList = async () => {
    if (candidateToRemove) {
      await handleRemoveFromLongList(candidateToRemove.id);
      setCandidateToRemove(null);
    }
  };
  const handleCallCandidate = async (candidateId: string, jobId: string, callid: number | null | undefined) => {
    try {
      setCallingCandidateId(candidateId);

      // Find the candidate record to get required data
      const candidate = candidates.find((c) => c["Candidate_ID"] === candidateId);
      if (!candidate) {
        throw new Error("Candidate not found");
      }
      const payload = {
        user_id: candidate.user_id,
        jobID: job.job_id,
        job_itris_id: job.itris_job_id,
        recordid: candidate.recordid,
      };
      const response = await fetch("https://hook.eu2.make.com/o9mt66urjw5a6sxfog71945s3ubghukw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      toast({
        title: "Success",
        description: "Call initiated successfully",
      });
    } catch (error) {
      console.error("Error calling candidate:", error);
      toast({
        title: "Error",
        description: "Failed to initiate call",
        variant: "destructive",
      });
    } finally {
      setCallingCandidateId(null);
    }
  };
  const handleArrangeInterview = (candidateId: string) => {
    // Find the candidate object
    const candidate = candidates.find(
      (c) => c["Candidate_ID"] === candidateId || c.candidate_id === candidateId || c.Candidate_ID === candidateId,
    );
    setSelectedCandidate({
      candidateId: candidateId,
      jobId: job?.job_id || id || "",
      callid: candidate?.callid || candidate?.Callid || 0,
    });
    setInterviewDialogOpen(true);

    // Reset slots and type
    setInterviewSlots([
      {
        date: undefined,
        time: "",
      },
      {
        date: undefined,
        time: "",
      },
      {
        date: undefined,
        time: "",
      },
    ]);
    setInterviewType("Phone");
    setInterviewLink("");
    console.log("Dialog should now be open. interviewDialogOpen state set to true");
  };
  const handleCVSubmitted = async (candidateId: string, callid?: number) => {
    // Find candidate by either user_id or Candidate_ID
    const candidateContact = candidates.find((c) => c["user_id"] === candidateId || c["Candidate_ID"] === candidateId);

    if (candidateContact) {
      // Use provided callid or fall back to candidate's callid
      const finalCallId = callid || candidateContact.callid;

      if (!finalCallId) {
        toast({
          title: "Error",
          description: "Cannot submit CV: No call record found for this candidate",
          variant: "destructive",
        });
        return;
      }

      openHireDialog(id!, candidateId, finalCallId);
    } else {
      toast({
        title: "Error",
        description: "Candidate not found",
        variant: "destructive",
      });
    }
  };

  const handlePipeline = async (candidateId: string) => {
    const { error } = await supabase
      .from("Jobs_CVs")
      .update({ contacted: "Pipeline" })
      .eq("user_id", candidateId)
      .eq("job_id", id!);

    if (!error) {
      toast({ title: "Pipeline", description: "Candidate added to pipeline." });
      setCandidates((prev) =>
        prev.map((c) => {
          const cUserId = c["user_id"] ?? "";
          const cCandidateId = c["Candidate_ID"] ?? "";
          const cRecordId = c["recordid"]?.toString() ?? "";
          if (
            cUserId === candidateId ||
            cCandidateId === candidateId ||
            cRecordId === candidateId
          ) {
            return { ...c, Contacted: "Pipeline", contacted: "Pipeline" };
          }
          return c;
        })
      );
    }
  };

  const saveCardNotes = async () => {
    if (!notesDialogCandidate) return;
    setNotesSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const recordid = notesDialogCandidate["recordid"];
      const userId = notesDialogCandidate["user_id"];
      const jobId = notesDialogCandidate["Job ID"];

      let updateQuery: any = supabase.from("Jobs_CVs").update({
        notes: notesDialogValue,
        notes_updated_by: user?.id,
        notes_updated_at: new Date().toISOString(),
      });

      if (recordid) {
        updateQuery = updateQuery.eq("recordid", recordid);
      } else if (userId && jobId) {
        updateQuery = updateQuery.eq("user_id", userId).eq("job_id", jobId);
      }

      const { error } = await updateQuery;
      if (error) throw error;

      setCandidates((prev) =>
        prev.map((c) =>
          c["recordid"] === recordid ? { ...c, Notes: notesDialogValue, notes: notesDialogValue } : c
        )
      );
      setNotesDialogOpen(false);
      toast({ title: "Notes saved successfully" });
    } catch (err) {
      console.error("Error saving notes:", err);
      toast({ title: "Failed to save notes", variant: "destructive" });
    } finally {
      setNotesSaving(false);
    }
  };

  const handleClientStatusChange = async (candidateId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("Jobs_CVs")
        .update({ client_status: newStatus })
        .eq("user_id", candidateId)
        .eq("job_id", id!);

      if (error) throw error;

      // Update local state
      setCandidates((prev) =>
        prev.map((c) =>
          c["user_id"] === candidateId || c["Candidate_ID"] === candidateId ? { ...c, client_status: newStatus } : c,
        ),
      );

      toast({
        title: "Client Status Updated",
        description: `Client status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating client status:", error);
      toast({
        title: "Error",
        description: "Failed to update client status",
        variant: "destructive",
      });
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedCandidate) return;

    // Validate that all slots are filled
    const validSlots = interviewSlots.filter((slot) => slot.date && slot.time);
    if (validSlots.length !== 3) {
      alert("Please fill in all 3 interview slots");
      return;
    }

    // Validate that times are not in the past for today's date
    const now = new Date();
    const currentDate = format(now, "yyyy-MM-dd");
    const currentTime = format(now, "HH:mm");
    for (const slot of validSlots) {
      const slotDate = format(slot.date!, "yyyy-MM-dd");
      if (slotDate === currentDate && slot.time <= currentTime) {
        alert("Cannot schedule interview times in the past for today. Please select a future time.");
        return;
      }
    }

    // Validate interview link for online meetings
    if (interviewType === "Online Meeting" && !interviewLink.trim()) {
      alert("Please provide an interview link for online meetings");
      return;
    }
    try {
      // Update candidate status
      await supabase
        .from("CVs")
        .update({
          CandidateStatus: "Interview",
        })
        .eq("candidate_id", selectedCandidate.candidateId);

      // Format appointments for webhook (same as Dashboard)
      const appointments = interviewSlots.map((slot) => {
        if (slot.date && slot.time) {
          return `${format(slot.date, "yyyy-MM-dd")} ${slot.time}`;
        }
        return "";
      });

      // Save interview to database and get the generated intid (same as Dashboard)
      const { data: interviewData, error: insertError } = await supabase
        .from("interview")
        .insert({
          candidate_id: selectedCandidate.candidateId,
          job_id: selectedCandidate.jobId,
          callid: selectedCandidate.callid,
          appoint1: appointments[0],
          appoint2: appointments[1],
          appoint3: appointments[2],
          inttype: interviewType,
          intlink: interviewType === "Online Meeting" ? interviewLink : null,
          company_id: null,
        })
        .select("intid")
        .single();
      if (insertError) throw insertError;

      // Send webhook to Make.com (exact same as Dashboard)
      await fetch("https://hook.eu2.make.com/3t88lby79dnf6x6hgm1i828yhen75omb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_id: selectedCandidate.jobId,
          candidate_id: selectedCandidate.candidateId,
          callid: selectedCandidate.callid,
          intid: interviewData?.intid,
          appoint1: appointments[0],
          appoint2: appointments[1],
          appoint3: appointments[2],
          inttype: interviewType,
          intlink: interviewType === "Online Meeting" ? interviewLink : null,
        }),
      });

      // Update local state
      setCvData((prev) =>
        prev.map((cv) =>
          cv.candidate_id === selectedCandidate.candidateId
            ? {
                ...cv,
                CandidateStatus: "Interview",
              }
            : cv,
        ),
      );

      // Close dialog and show success message
      setInterviewDialogOpen(false);
      setSelectedCandidate(null);
      setInterviewType("Phone");
      setInterviewLink("");
      toast({
        title: "Interview Scheduled",
        description: "The candidate has been scheduled for an interview.",
      });
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast({
        title: "Error",
        description: "Failed to schedule interview. Please try again.",
        variant: "destructive",
      });
    }
  };
  const updateInterviewSlot = (index: number, field: "date" | "time", value: Date | string) => {
    setInterviewSlots((prev) => {
      const newSlots = [...prev];
      if (field === "date") {
        newSlots[index] = {
          ...newSlots[index],
          date: value as Date,
        };
      } else {
        newSlots[index] = {
          ...newSlots[index],
          time: value as string,
        };
      }
      return newSlots;
    });
  };
  const timeOptions = ["00", "15", "30", "45"];
  
  // Fetch analytics data when analytics tab is selected
  useEffect(() => {
    if (activeTab === "analytics" && id) {
      fetchAnalyticsData(id);
    }
  }, [activeTab, id]);

  const fetchAnalyticsData = async (jobId: string) => {
    setAnalyticsLoading(true);
    try {
      // Fetch job data for job added date
      const { data: jobData, error: jobError } = await supabase
        .from("Jobs")
        .select("Timestamp")
        .eq("job_id", jobId)
        .single();

      if (jobError) throw jobError;

      // Fetch all candidates for this job including rejected/submitted data
      const { data: candidatesData, error: candidatesError } = await supabase
        .from("Jobs_CVs")
        .select("longlisted_at, shortlisted_at, source, candidate_name, contacted, rejected_at, submitted_at, Reason_to_reject, Reason_to_Hire")
        .eq("job_id", jobId)
        .order("longlisted_at", { ascending: true, nullsLast: true });

      if (candidatesError) throw candidatesError;

      // Calculate first longlisted and first shortlisted
      const longlistedCandidates = candidatesData?.filter(c => c.longlisted_at) || [];
      const shortlistedCandidates = candidatesData?.filter(c => c.shortlisted_at) || [];

      const firstLonglistedDate = longlistedCandidates.length > 0 ? longlistedCandidates[0].longlisted_at : null;
      const firstShortlistedDate = shortlistedCandidates.length > 0 
        ? shortlistedCandidates.sort((a, b) => 
            new Date(a.shortlisted_at!).getTime() - new Date(b.shortlisted_at!).getTime()
          )[0].shortlisted_at 
        : null;

      // Calculate time differences in hours
      let timeToLonglist = null;
      let timeToShortlist = null;

      if (jobData?.Timestamp && firstLonglistedDate) {
        const jobDate = new Date(jobData.Timestamp);
        const longlistDate = new Date(firstLonglistedDate);
        timeToLonglist = (longlistDate.getTime() - jobDate.getTime()) / (1000 * 60 * 60); // hours
      }

      if (firstLonglistedDate && firstShortlistedDate) {
        const longlistDate = new Date(firstLonglistedDate);
        const shortlistDate = new Date(firstShortlistedDate);
        timeToShortlist = (shortlistDate.getTime() - longlistDate.getTime()) / (1000 * 60 * 60); // hours
      }

      // Count candidates by source
      const sourceCounts: Record<string, number> = {};
      candidatesData?.forEach(candidate => {
        const source = candidate.source || "Unknown";
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });

      // Get first 6 shortlisted candidates with their time from longlist
      const shortlistedWithTimes = shortlistedCandidates
        .sort((a, b) => 
          new Date(a.shortlisted_at!).getTime() - new Date(b.shortlisted_at!).getTime()
        )
        .slice(0, 6)
        .map(candidate => {
          let timeFromLonglist = 0;
          if (firstLonglistedDate && candidate.shortlisted_at) {
            const longlistDate = new Date(firstLonglistedDate);
            const shortlistDate = new Date(candidate.shortlisted_at);
            timeFromLonglist = (shortlistDate.getTime() - longlistDate.getTime()) / (1000 * 60 * 60); // hours
          }
          return {
            candidate_name: candidate.candidate_name,
            shortlisted_at: candidate.shortlisted_at!,
            timeFromLonglist,
          };
        });

      // Calculate average time to shortlist across all shortlisted candidates
      let averageTimeToShortlist = null;
      if (firstLonglistedDate && shortlistedCandidates.length > 0) {
        const longlistDate = new Date(firstLonglistedDate);
        const totalTime = shortlistedCandidates.reduce((sum, candidate) => {
          if (candidate.shortlisted_at) {
            const shortlistDate = new Date(candidate.shortlisted_at);
            return sum + (shortlistDate.getTime() - longlistDate.getTime()) / (1000 * 60 * 60);
          }
          return sum;
        }, 0);
        averageTimeToShortlist = totalTime / shortlistedCandidates.length;
      }

      // Filter rejected and submitted candidates with duration calculations
      const rejectedCandidates = (candidatesData || [])
        .filter(c => c.contacted === "Rejected")
        .map(c => {
          let timeToReject = null;
          if (c.shortlisted_at && c.rejected_at) {
            const shortlistDate = new Date(c.shortlisted_at);
            const rejectDate = new Date(c.rejected_at);
            timeToReject = (rejectDate.getTime() - shortlistDate.getTime()) / (1000 * 60 * 60);
          }
          return {
            candidate_name: c.candidate_name,
            rejected_at: c.rejected_at,
            reason: c.Reason_to_reject,
            shortlisted_at: c.shortlisted_at,
            timeToReject,
          };
        });

      const submittedCandidates = (candidatesData || [])
        .filter(c => c.contacted === "Submitted")
        .map(c => {
          let timeToSubmit = null;
          if (c.shortlisted_at && c.submitted_at) {
            const shortlistDate = new Date(c.shortlisted_at);
            const submitDate = new Date(c.submitted_at);
            timeToSubmit = (submitDate.getTime() - shortlistDate.getTime()) / (1000 * 60 * 60);
          }
          return {
            candidate_name: c.candidate_name,
            submitted_at: c.submitted_at,
            reason: c.Reason_to_Hire,
            shortlisted_at: c.shortlisted_at,
            timeToSubmit,
          };
        });

      setAnalyticsData({
        jobAddedDate: jobData?.Timestamp || null,
        firstLonglistedDate,
        firstShortlistedDate,
        timeToLonglist,
        timeToShortlist,
        averageTimeToShortlist,
        sourceCounts,
        totalCandidates: candidatesData?.length || 0,
        shortlistedCandidates: shortlistedWithTimes,
        rejectedCandidates,
        submittedCandidates,
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Helper function to format duration in hours to human-readable format
  const formatDuration = (hours: number | null): string => {
    if (hours === null) return "N/A";
    
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (hours < 24) {
      return `${Math.round(hours)} hour${Math.round(hours) !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      if (remainingHours === 0) {
        return `${days} day${days !== 1 ? 's' : ''}`;
      }
      return `${days} day${days !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
    }
  };
  
  const handleApplicationsTabClick = () => {
    // Reset notification count and update last viewed timestamp
    if (id) {
      const now = new Date().toISOString();
      localStorage.setItem(`lastViewedApplications_${id}`, now);
      setLastViewedApplications(now);
      setNewApplicationsCount(0);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-2xl font-bold text-muted-foreground">Job not found</h2>
        <Button onClick={() => navigate("/jobs")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
      </div>
    );
  }
  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "default";
      case "closed":
        return "destructive";
      case "draft":
        return "secondary";
      default:
        return "outline";
    }
  };
  const getScoreBadge = (score: string | null) => {
    if (!score || score === "0" || score === "") return null;
    const numScore = parseInt(score);
    if (numScore >= 75) {
      return;
    } else if (numScore >= 50) {
      return;
    } else if (numScore >= 1) {
      return <Badge className="bg-red-600 text-foreground border-0">{score} - Low</Badge>;
    }
    return null;
  };
  const calculateOverallScore = (candidate: any) => {
    const afterCallScore = parseFloat(candidate.after_call_score) || 0;
    const cvScore = parseFloat(candidate.cv_score) || 0;
    const linkedInScore = parseFloat(candidate.linkedin_score) || 0;
    
    // Determine which score to use based on source
    const source = (candidate.source || candidate.Source || "").toLowerCase();
    const isLinkedInSource = source.includes('linkedin');
    
    const secondScore = isLinkedInSource ? linkedInScore : cvScore;
    
    if (afterCallScore > 0 && secondScore > 0) {
      return Math.round((afterCallScore + secondScore) / 2);
    } else if (secondScore > 0) {
      return secondScore;
    } else if (afterCallScore > 0) {
      return afterCallScore;
    }
    return 0;
  };
  const getOverallScoreBadge = (candidate: any) => {
    const overallScore = calculateOverallScore(candidate);
    if (overallScore === 0) return null;
    const cvScore = parseFloat(candidate.cv_score) || 0;
    const afterCallScore = parseFloat(candidate.after_call_score) || 0;
    let variant = "";
    if (overallScore >= 8) {
      variant = "bg-emerald-500 text-white border-0";
    } else if (overallScore >= 6) {
      variant = "bg-amber-500 text-white border-0";
    } else {
      variant = "bg-red-500 text-white border-0";
    }
    const hasIcon = cvScore > 0 && afterCallScore > 0;

    // Determine source type for display
    let sourceType = "";
    if (candidate["Source"] && typeof candidate["Source"] === "string") {
      if (candidate["Source"].toLowerCase().includes("linkedin")) {
        sourceType = " (linkedin)";
      } else if (candidate["Source"].toLowerCase().includes("itris") || candidate["Source"].toLowerCase().includes("internal database")) {
        sourceType = " (cv)";
      }
    }
    return (
      <div className="flex items-center gap-1">
        <Badge className={`${variant} flex items-center gap-1 font-semibold`}>
          {hasIcon && <Star className="w-3 h-3" />}
          Overall: {overallScore}
          {sourceType}
        </Badge>
      </div>
    );
  };
  const formatCurrency = (amountStr: string | null | undefined, currency?: string | null) => {
    if (!amountStr) return "N/A";
    const raw = String(amountStr);
    // Extract numeric parts (handles ranges like "35000 aed to 40000 aed" or "35,000 - 40,000")
    const nums = (raw.match(/\d+(?:[.,]\d+)?/g) || []).map((s) => parseFloat(s.replace(/,/g, "")));

    // If we have a range (2+ numbers), format as "AED 35,000 - 40,000"
    if (nums.length >= 2) {
      const [a, b] = nums;
      const min = Math.min(a, b);
      const max = Math.max(a, b);
      const nf = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
      const cur = currency || "AED";
      return `${cur} ${nf.format(min)} - ${nf.format(max)}`;
    }

    // Single value fallback
    const amount = nums[0];
    if (amount === undefined || amount === null || isNaN(amount) || !currency) return amountStr || "N/A";
    try {
      return new Intl.NumberFormat("en", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      const nf = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
      return `${currency} ${nf.format(amount)}`;
    }
  };

  // Filtered candidates based on all filters
  const filteredCandidates = candidates
    .filter((candidate) => {
      const nameMatch =
        !nameFilter || (candidate["Candidate Name"] || "").toLowerCase().includes(nameFilter.toLowerCase());
      const emailMatch =
        !emailFilter || (candidate["Candidate Email"] || "").toLowerCase().includes(emailFilter.toLowerCase());
      const phoneMatch = !phoneFilter || (candidate["Candidate Phone Number"] || "").includes(phoneFilter);
      const userIdMatch = !userIdFilter || (candidate.user_id || candidate["Candidate_ID"] || "").toString().includes(userIdFilter);
      const source = (candidate["Source"] || "").toLowerCase();
      const sourceMatch =
        !longListSourceFilter ||
        longListSourceFilter === "all" ||
        (longListSourceFilter.toLowerCase() === "itris"
          ? source.includes("itris") || source.includes("internal database")
          : source.includes(longListSourceFilter.toLowerCase()));
      let scoreMatch = true;
      if (scoreFilter !== "all") {
        // Try multiple possible field names for CV score
        const score = parseInt(candidate["Success Score"] || candidate["cv_score"] || candidate["CV Score"] || "0");
        switch (scoreFilter) {
          case "high":
            scoreMatch = score >= 75;
            break;
          case "moderate":
            scoreMatch = score >= 50 && score < 75;
            break;
          case "poor":
            scoreMatch = score > 0 && score < 50;
            break;
          case "none":
            scoreMatch =
              score === 0 || (!candidate["Success Score"] && !candidate["cv_score"] && !candidate["CV Score"]);
            break;
        }
      }
      let contactedMatch = true;
      if (contactedFilter !== "all") {
        const raw = (candidate["Contacted"] || "").toString().trim();
        const norm = raw.toLowerCase();
        if (contactedFilter === "Not Contacted") {
          // Treat empty/undefined and case variations as "Not Contacted"
          contactedMatch = raw === "" || norm === "not contacted";
        } else if (contactedFilter === "Ready to Call") {
          // For "Ready to Contact", match both "Ready to Contact" and "Ready to Contact contacted"
          contactedMatch = norm.includes("ready to contact") || norm.includes("ready to call");
        } else {
          contactedMatch = norm === contactedFilter.toLowerCase();
        }
      }
      return nameMatch && emailMatch && phoneMatch && userIdMatch && sourceMatch && scoreMatch && contactedMatch;
    })
    .sort((a, b) => {
      // Sort by highest score descending (CV Score or LinkedIn Score, whichever is higher)
      const cvScoreA = parseFloat(a["cv_score"] || a["CV Score"] || "0");
      const linkedinScoreA = parseFloat(a["linkedin_score"] || "0");
      const maxScoreA = Math.max(cvScoreA, linkedinScoreA);
      const cvScoreB = parseFloat(b["cv_score"] || b["CV Score"] || "0");
      const linkedinScoreB = parseFloat(b["linkedin_score"] || "0");
      const maxScoreB = Math.max(cvScoreB, linkedinScoreB);
      return maxScoreB - maxScoreA;
    });
  // Helper function to render candidate cards
  const renderCandidateCard = (
    candidateId: string,
    candidateContacts: any[],
    mainCandidate: any,
    isTopCandidate: boolean = false,
  ) => {
    // Determine status-based styling
    const isRejected = mainCandidate["Contacted"] === "Rejected";
    const isSubmitted = mainCandidate["Contacted"] === "Submitted";
    
    let cardClassName = isTopCandidate
      ? "relative border-2 border-yellow-400 hover:border-yellow-500 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950/50 dark:via-amber-950/50 dark:to-orange-950/50 shadow-xl shadow-yellow-200/50 dark:shadow-yellow-900/30 ring-2 ring-yellow-300/60 dark:ring-yellow-600/40 before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-300/10 before:via-amber-300/10 before:to-orange-300/10 before:rounded-lg before:animate-pulse"
      : "border border-border/50 hover:border-primary/50 transition-colors hover:shadow-lg bg-green-50/50 dark:bg-green-950/20";
    
    // Override with status styling if rejected or submitted
    if (isRejected) {
      cardClassName = "border-2 border-red-500/50 hover:border-red-500 transition-colors hover:shadow-lg bg-red-50/50 dark:bg-red-950/20";
    } else if (isSubmitted) {
      cardClassName = "border-2 border-emerald-500/50 hover:border-emerald-500 transition-colors hover:shadow-lg bg-emerald-50/50 dark:bg-emerald-950/20";
    }
    
    return (
      <Card key={candidateId} id={`candidate-card-${candidateId}`} className={cardClassName}>
        {/* Status timestamp banner for Rejected/Submitted */}
          {isRejected && mainCandidate["rejected_at"] && (
          <>
            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <div className="bg-red-500/20 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 border-b border-red-500/30 rounded-t-lg cursor-help">
                  <X className="w-3 h-3" />
                  Rejected on {format(new Date(mainCandidate["rejected_at"]), "dd MMM yyyy, HH:mm")}
                </div>
              </HoverCardTrigger>
              {mainCandidate["Reason_to_reject"] && (
                <HoverCardContent className="w-80 text-sm">
                  <p className="font-semibold text-red-600 dark:text-red-400 mb-1">Rejection Reason</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">{mainCandidate["Reason_to_reject"]}</p>
                </HoverCardContent>
              )}
            </HoverCard>
            {isMobile && mainCandidate["Reason_to_reject"] && (
              <div className="bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400 border-b border-red-500/20">
                <span className="font-semibold">Rejection Reason: </span>
                {mainCandidate["Reason_to_reject"]}
              </div>
            )}
          </>
        )}
        {isSubmitted && mainCandidate["submitted_at"] && (
          <div className="bg-emerald-500/20 px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 border-b border-emerald-500/30 rounded-t-lg">
            <CheckCircle className="w-3 h-3" />
            Submitted on {format(new Date(mainCandidate["submitted_at"]), "dd MMM yyyy, HH:mm")}
          </div>
        )}
        <CardContent className="p-4 relative">
          {isTopCandidate && (
            <Badge className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-amber-300 via-yellow-300 to-amber-400 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-500 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-200 w-8 h-8 rounded-full p-0 flex items-center justify-center group z-10">
              <Star className="w-4 h-4 fill-amber-800 text-amber-800 group-hover:scale-110 transition-transform duration-200" />
            </Badge>
          )}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-1">
                  <h4 className="font-semibold">{mainCandidate["Candidate Name"] || "Unknown"}</h4>
                </div>
                <p className="text-sm text-muted-foreground">User ID: {mainCandidate["user_id"] || "N/A"}</p>
                <div className="flex items-center gap-4 text-sm mt-1">
                  <span className="text-muted-foreground">
                    CV Score: {mainCandidate["cv_score"] !== null && mainCandidate["cv_score"] !== undefined ? mainCandidate["cv_score"] : (mainCandidate["CV Score"] || "N/A")}
                  </span>
                  {mainCandidate["after_call_score"] && (
                    <span className="text-muted-foreground">After Call Score: {mainCandidate["after_call_score"]}</span>
                  )}
                  {mainCandidate["Source"] &&
                    typeof mainCandidate["Source"] === "string" &&
                    mainCandidate["Source"].toLowerCase().includes("linkedin") &&
                    mainCandidate["linkedin_score"] !== undefined &&
                    mainCandidate["linkedin_score"] !== null &&
                    mainCandidate["linkedin_score"] !== "" &&
                    ![
                      "ready to contact",
                      "not contacted",
                      "1st no answer",
                      "2nd no answer",
                      "3rd no answer",
                      "1st no anwser",
                      "2nd no anwser",
                      "3rd no anwser",
                    ].includes(mainCandidate["Contacted"]?.toLowerCase() || "") && (
                      <span className="text-muted-foreground">Overall: {mainCandidate["linkedin_score"]}</span>
                    )}
                </div>
{mainCandidate["Source"] &&
typeof mainCandidate["Source"] === "string" &&
mainCandidate["Source"].toLowerCase().includes("linkedin") &&
mainCandidate["linkedin_score_reason"] ? (
  <div className="pt-1">
    <span className="text-muted-foreground text-xs font-work">Reason:</span>
    <p className="text-xs font-work text-muted-foreground mt-1 line-clamp-3">
      {mainCandidate["linkedin_score_reason"]}
    </p>
  </div>
) : (
  mainCandidate["cv_score_reason"] && (
    <div className="pt-1">
      <span className="text-muted-foreground text-xs font-work">CV Reason:</span>
      <p className="text-xs font-work text-muted-foreground mt-1 line-clamp-3">
        {mainCandidate["cv_score_reason"]}
      </p>
    </div>
  )
)}
{(mainCandidate["Notes"] || mainCandidate["notes"]) && (
  <div className="mt-2 p-2 bg-blue-50/50 dark:bg-blue-950/20 rounded-sm border-l-2 border-blue-400/50">
    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
      <Pencil className="w-3 h-3" />
      Notes
    </div>
    <p className="text-xs text-muted-foreground line-clamp-2">
      {mainCandidate["Notes"] || mainCandidate["notes"]}
    </p>
  </div>
)}
{mainCandidate["Salary Expectations"] && (
  <div className="flex items-center gap-2 text-sm mt-1">
    <Banknote className="w-3 h-3 text-muted-foreground" />
    <span className="text-muted-foreground">
      Expected: {formatCurrency(mainCandidate["Salary Expectations"], job?.Currency)}
    </span>
  </div>
)}
              </div>
              <div className="flex flex-col items-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-primary shrink-0"
                  title="Add/Edit Notes"
                  onClick={() => {
                    setNotesDialogCandidate(mainCandidate);
                    setNotesDialogValue(mainCandidate["Notes"] || mainCandidate["notes"] || "");
                    setNotesDialogOpen(true);
                  }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                {(mainCandidate["Contacted"]?.toLowerCase() === "call done" ||
                  mainCandidate["Contacted"]?.toLowerCase() === "contacted" ||
                  mainCandidate["Contacted"]?.toLowerCase() === "low scored" ||
                  mainCandidate["Contacted"]?.toLowerCase() === "tasked") &&
                  mainCandidate["lastcalltime"] && (
                    <div className="text-xs text-muted-foreground text-right">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(mainCandidate["lastcalltime"]).toLocaleDateString()}
                      </div>
                      <div className="text-xs">
                        {new Date(mainCandidate["lastcalltime"]).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {mainCandidate["Candidate Email"] && (
                <div className="flex items-center text-muted-foreground">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="truncate">{mainCandidate["Candidate Email"]}</span>
                </div>
              )}

              {mainCandidate["Candidate Phone Number"] && (
                <div className="flex items-center text-muted-foreground">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{mainCandidate["Candidate Phone Number"]}</span>
                </div>
              )}

              {mainCandidate["Source"] && (
                <div className="flex items-center text-muted-foreground">
                  <Building className="w-4 h-4 mr-2" />
                  <span className="truncate">{mainCandidate["Source"]}</span>
                </div>
              )}
            </div>

            {mainCandidate["Summary"] && (
              <p className="text-sm text-muted-foreground line-clamp-3">{mainCandidate["Summary"]}</p>
            )}

            {/* Qualifications Section - only show when call log is available and qualifications exist */}
            {(mainCandidate["Contacted"]?.toLowerCase() === "call done" ||
              mainCandidate["Contacted"]?.toLowerCase() === "contacted" ||
              mainCandidate["Contacted"]?.toLowerCase() === "low scored" ||
              mainCandidate["Contacted"]?.toLowerCase() === "tasked") &&
              mainCandidate["qualifications"] && (
                <div className="mt-2 p-2 bg-muted/30 rounded-sm border-l-2 border-primary/30">
                  <div className="text-xs font-work font-medium text-foreground mb-1 flex items-center">
                    <FileText className="w-3 h-3 mr-1" />
                    Qualifications
                  </div>
                  <p className="text-xs font-work text-muted-foreground line-clamp-3">
                    {mainCandidate["qualifications"]}
                  </p>
                </div>
              )}

            {/* Task Status and Links Section */}
            {(() => {
              const candidateTasks = taskCandidates.filter((task) => task.candidate_id === candidateId);
              const candidateStatus = mainCandidate["Contacted"]?.toLowerCase();

              // Only show tasks if candidate status is "tasked" and not "rejected"
              if (candidateTasks.length === 0 || candidateStatus !== "tasked" || candidateStatus === "rejected")
                return null;
              return (
                <div className="space-y-2 pt-2 border-t">
                  <h5 className="text-sm font-medium text-foreground flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Tasks ({candidateTasks.length})
                  </h5>
                  <div className="space-y-2">
                    {candidateTasks.map((task) => (
                      <div
                        key={task.taskid}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-md",
                          task.status === "Received"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700"
                            : "bg-muted/50",
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {task.status === "Pending" && <Hourglass className="w-3 h-3 text-orange-500" />}
                            {task.status === "Received" && <AlertCircle className="w-3 h-3 text-blue-500" />}
                            {task.status === "Reviewed" && <CheckCircle className="w-3 h-3 text-green-500" />}
                            <Select
                              value={task.status}
                              onValueChange={(value) => updateTaskStatus(task.taskid, value as any)}
                            >
                              <SelectTrigger className="w-24 h-6 text-xs bg-background/50 border-border/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-background border border-border shadow-lg z-50">
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Received">Received</SelectItem>
                                <SelectItem value="Reviewed">Reviewed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {task.tasklink &&
                            (task.tasklink.includes(",") ? (
                              // Multiple links
                              <div className="flex items-center space-x-1">
                                {task.tasklink.split(",").map((link: string, index: number) => (
                                  <Button
                                    key={index}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(link.trim(), "_blank")}
                                    className="p-1 h-6 w-6 hover:bg-primary/10"
                                    title={`Task Link ${index + 1}`}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                ))}
                                <span className="text-xs text-muted-foreground">
                                  ({task.tasklink.split(",").length} links)
                                </span>
                              </div>
                            ) : (
                              // Single link
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(task.tasklink, "_blank")}
                                className="p-1 h-6 w-6 hover:bg-primary/10"
                                title="Task Link"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <StatusDropdown
                  currentStatus={mainCandidate["Contacted"]}
                  candidateId={mainCandidate["Candidate_ID"]}
                  jobId={id!}
                  onStatusChange={(newStatus) => {
                    setCandidates((prev) =>
                      prev.map((c) =>
                        c["Candidate_ID"] === mainCandidate["Candidate_ID"]
                          ? {
                              ...c,
                              Contacted: newStatus,
                            }
                          : c,
                      ),
                    );
                  }}
                  variant="badge"
                />
                {getCandidateStatus(mainCandidate["Candidate_ID"]) && (
                  <StatusDropdown
                    currentStatus={getCandidateStatus(mainCandidate["Candidate_ID"])}
                    candidateId={mainCandidate["Candidate_ID"]}
                    jobId={null}
                    onStatusChange={(newStatus) => {
                      setCvData((prev) =>
                        prev.map((cv) =>
                          cv["Cadndidate_ID"] === mainCandidate["Candidate_ID"]
                            ? {
                                ...cv,
                                CandidateStatus: newStatus,
                              }
                            : cv,
                        ),
                      );
                    }}
                    variant="badge"
                  />
                )}
                {/* Qualification Status Badge */}
                {mainCandidate["qualifications"] !== null &&
                mainCandidate["qualifications"] !== undefined &&
                mainCandidate["qualifications"] !== "" ? (
                  <Badge className="border-2 border-green-600 text-green-600 bg-green-100 shadow-md">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Qualification Received
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-2 border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-all duration-200"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Qualification Sent
                  </Badge>
                )}
              </div>
              <div className="flex flex-col gap-1 items-end">
                {/* Only show overall score when status is Call Done */}
                {mainCandidate["Contacted"]?.toLowerCase() === "call done" && getOverallScoreBadge(mainCandidate)}
                {![
                  "ready to contact",
                  "not contacted",
                  "1st no answer",
                  "2nd no answer",
                  "3rd no answer",
                  "1st no anwser",
                  "2nd no anwser",
                  "3rd no anwser",
                ].includes(mainCandidate["Contacted"]?.toLowerCase() || "") &&
                  getScoreBadge(
                    mainCandidate["Success Score"] || mainCandidate["cv_score"] || mainCandidate["CV Score"],
                  )}
              </div>
            </div>

            {/* Call Log Buttons */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex flex-wrap gap-2 sm:gap-2">
                {(() => {
                  const isLinkedInCandidate =
                    typeof mainCandidate["Source"] === "string" &&
                    mainCandidate["Source"].toLowerCase().includes("linkedin");
                  const contactsWithCalls = candidateContacts.filter((contact) => contact.callcount > 0);

                  // For LinkedIn candidates, always show Call Log button
                  if (isLinkedInCandidate) {
                    const latestContact =
                      contactsWithCalls.length > 0
                        ? contactsWithCalls.reduce((latest, current) =>
                            current.callid > latest.callid ? current : latest,
                          )
                        : mainCandidate;
                    return (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1 min-w-0 sm:min-w-[120px] h-10"
                      >
                        <Link
                          to={`/call-log-details?candidate=${candidateId}&job=${id}&callid=${latestContact.callid || latestContact.recordid || candidateId}&fromTab=shortlist`}
                        >
                          <FileText className="w-4 h-4 mr-1.5" />
                          Call Log
                        </Link>
                      </Button>
                    );
                  }

                  // For non-LinkedIn candidates, only show if they have call logs
                  if (contactsWithCalls.length === 0) return null;

                  // Get the latest call log (highest callid)
                  const latestContact = contactsWithCalls.reduce((latest, current) =>
                    current.callid > latest.callid ? current : latest,
                  );
                  return (
                    <Button
                      key={latestContact.callid}
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1 min-w-0 sm:min-w-[120px] h-10"
                    >
                      <Link
                        to={`/call-log-details?candidate=${candidateId}&job=${id}&callid=${latestContact.callid}&fromTab=shortlist`}
                      >
                        <FileText className="w-4 h-4 mr-1.5" />
                        Call Log
                      </Link>
                    </Button>
                  );
                })()}
                <Button variant="ghost" size="sm" asChild className="flex-1 min-w-0 sm:min-w-[120px] h-10">
                  <Link
                    to={`/candidate/${mainCandidate["user_id"] || candidateId}`}
                    state={{
                      fromJob: id,
                      tab: "shortlist",
                      focusCandidateId: mainCandidate["user_id"] || candidateId,
                      linkedInUrl: typeof mainCandidate["Source"] === "string" &&
                        mainCandidate["Source"].toLowerCase().includes("linkedin")
                        ? getLinkedInUrl(mainCandidate)
                        : undefined,
                    }}
                  >
                    <Users className="w-4 h-4 mr-1.5" />
                    View Profile
                  </Link>
                </Button>
              </div>
              {/* Action Buttons - CV Submitted and Reject */}
              <div className="flex flex-col sm:flex-row gap-2">
                {mainCandidate["Contacted"] === "Submitted" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:flex-1 min-w-0 sm:min-w-[120px] h-10 bg-transparent border-2 border-blue-500 text-blue-600 cursor-default"
                    disabled
                  >
                    <FileCheck className="w-4 h-4 mr-1.5" />
                    CV Submitted
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const contactsWithCalls = candidateContacts.filter((contact) => contact.callcount > 0);
                      const latestContact =
                        contactsWithCalls.length > 0
                          ? contactsWithCalls.reduce((latest, current) =>
                              current.callid > latest.callid ? current : latest,
                            )
                          : null;
                      handleCVSubmitted(candidateId, latestContact?.callid);
                    }}
                    className="w-full sm:flex-1 min-w-0 sm:min-w-[120px] h-10 bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-50 hover:border-green-600 hover:text-green-700 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-950/30 dark:hover:border-green-500 dark:hover:text-green-300 transition-all duration-200"
                  >
                    <FileCheck className="w-4 h-4 mr-1.5" />
                    Submit
                  </Button>
                )}
                {mainCandidate["Contacted"] === "Rejected" ? (
                  <>
                    <HoverCard openDelay={200}>
                      <HoverCardTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:flex-1 min-w-0 sm:min-w-[120px] h-10 bg-transparent border-2 border-gray-400 text-gray-500 cursor-help"
                          disabled
                        >
                          <X className="w-4 h-4 mr-1.5" />
                          Rejected
                        </Button>
                      </HoverCardTrigger>
                      {mainCandidate["Reason_to_reject"] && (
                        <HoverCardContent className="w-80 text-sm">
                          <p className="font-semibold text-red-600 dark:text-red-400 mb-1">Rejection Reason</p>
                          <p className="text-muted-foreground whitespace-pre-wrap">{mainCandidate["Reason_to_reject"]}</p>
                        </HoverCardContent>
                      )}
                    </HoverCard>
                    {isMobile && mainCandidate["Reason_to_reject"] && (
                      <div className="w-full text-xs text-red-500 dark:text-red-400 px-1 mt-1">
                        <span className="font-semibold">Reason: </span>
                        {mainCandidate["Reason_to_reject"]}
                      </div>
                    )}
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:flex-1 min-w-0 sm:min-w-[120px] h-10 bg-transparent border-2 border-red-500 text-red-600 hover:bg-red-100 hover:border-red-600 hover:text-red-700 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:border-red-300 dark:hover:text-red-300 transition-all duration-200"
                    onClick={() => openRejectDialog(id!, candidateId, candidateContacts[0].callid)}
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Reject
                  </Button>
                )}
                {mainCandidate["Contacted"] === "Pipeline" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="w-full sm:flex-1 min-w-0 sm:min-w-[120px] h-10 bg-transparent border-2 border-purple-400 text-purple-400 cursor-default opacity-60"
                  >
                    <GitBranch className="w-4 h-4 mr-1.5" />
                    In Pipeline
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePipeline(candidateId)}
                    className="w-full sm:flex-1 min-w-0 sm:min-w-[120px] h-10 bg-transparent border-2 border-purple-500 text-purple-600 hover:bg-purple-50 hover:border-purple-600 hover:text-purple-700 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-950/30 transition-all duration-200"
                  >
                    <GitBranch className="w-4 h-4 mr-1.5" />
                    Pipeline
                  </Button>
                )}
              </div>

              {/* Client Status Dropdown - Shows when CV is Submitted */}
              {mainCandidate["Contacted"] === "Submitted" && (
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Client Status:</span>
                    <Select
                      value={mainCandidate["client_status"] || "Interview Requested"}
                      onValueChange={(value) => handleClientStatusChange(candidateId, value)}
                    >
                      <SelectTrigger className="h-9 flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-lg z-50">
                        <SelectItem value="Interview Requested">Interview Requested</SelectItem>
                        <SelectItem value="Rejected From Client">Rejected From Client</SelectItem>
                        <SelectItem value="Selected">Selected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Get CV status for a candidate
  const getCandidateStatus = (candidateId: string) => {
    const cvRecord = cvData.find((cv) => cv["candidate_id"] === candidateId);
    return cvRecord?.["CandidateStatus"] || null;
  };

  // Short list candidates (after_call_score >= 74) sorted by Overall Score descending
  // Exclude rejected candidates and "Shortlisted from Similar jobs" candidates from the main list
  const shortListCandidates = candidates
    .filter((candidate) => {
      const score = parseFloat(candidate.after_call_score || "0");
      const isRejected = candidate["Contacted"] === "Rejected";
      const isFromSimilarJobs = candidate["contacted"] === "Shortlisted from Similar jobs";
      const isPipeline = candidate["Contacted"] === "Pipeline" || candidate["contacted"] === "Pipeline";
      return score >= 74 && !isRejected && !isFromSimilarJobs && !isPipeline;
    })
    .sort((a, b) => {
      const overallScoreA = calculateOverallScore(a);
      const overallScoreB = calculateOverallScore(b);
      return overallScoreB - overallScoreA; // Sort highest score first
    });

  // Rejected candidates (after_call_score >= 74 AND Contacted === "Rejected")
  // Exclude "Shortlisted from Similar jobs" candidates
  const rejectedShortListCandidates = candidates
    .filter((candidate) => {
      const score = parseFloat(candidate.after_call_score || "0");
      const isRejected = candidate["Contacted"] === "Rejected";
      const isFromSimilarJobs = candidate["contacted"] === "Shortlisted from Similar jobs";
      return score >= 74 && isRejected && !isFromSimilarJobs;
    })
    .sort((a, b) => {
      const overallScoreA = calculateOverallScore(a);
      const overallScoreB = calculateOverallScore(b);
      return overallScoreB - overallScoreA;
    });

  // Pipeline candidates (after_call_score >= 74 AND contacted === "Pipeline")
  const pipelineShortListCandidates = candidates
    .filter((candidate) => {
      const score = parseFloat(candidate.after_call_score || "0");
      const isPipeline = candidate["Contacted"] === "Pipeline" || candidate["contacted"] === "Pipeline";
      const isFromSimilarJobs = candidate["contacted"] === "Shortlisted from Similar jobs";
      return score >= 74 && isPipeline && !isFromSimilarJobs;
    })
    .sort((a, b) => calculateOverallScore(b) - calculateOverallScore(a));

  // Helper function to parse salary as number (handles ranges like "10000-12000")
  const parseSalary = (salary: string | null | undefined): number => {
    if (!salary) return 0;
    const salaryStr = salary.toString();
    
    // Extract all numbers from the string
    const numbers = salaryStr.match(/[\d.]+/g);
    if (!numbers || numbers.length === 0) return 0;
    
    // Parse all numbers and return the maximum (highest expectation in a range)
    const parsedNumbers = numbers
      .map(n => parseFloat(n))
      .filter(n => !isNaN(n) && n > 0);
    
    if (parsedNumbers.length === 0) return 0;
    
    // Return the maximum value (for ranges like "10000-12000", returns 12000)
    return Math.max(...parsedNumbers);
  };

  // Get job budget for comparison
  const jobBudget = parseSalary(job?.job_salary_range?.toString() || job?.["Job Salary Range (ex: 15000 AED)"]);
  const budgetThreshold = jobBudget * 1.2; // 20% above budget

  // Function to filter short list candidates
  const filterShortListCandidates = (candidates: any[]) => {
    return candidates.filter((candidate) => {
      const nameMatch =
        !shortListNameFilter ||
        (candidate["Candidate Name"] || "").toLowerCase().includes(shortListNameFilter.toLowerCase());
      const emailMatch =
        !shortListEmailFilter ||
        (candidate["Candidate Email"] || "").toLowerCase().includes(shortListEmailFilter.toLowerCase());
      const phoneMatch =
        !shortListPhoneFilter || (candidate["Candidate Phone Number"] || "").includes(shortListPhoneFilter);
      const userIdMatch =
        !shortListUserIdFilter ||
        (candidate.user_id || candidate["user_id"] || "").toString().includes(shortListUserIdFilter);
      const shortSource = (candidate["Source"] || "").toLowerCase();
      const sourceMatch =
        !shortListSourceFilter ||
        shortListSourceFilter === "all" ||
        (shortListSourceFilter.toLowerCase() === "itris"
          ? shortSource.includes("itris") || shortSource.includes("internal database")
          : shortSource.includes(shortListSourceFilter.toLowerCase()));
      let scoreMatch = true;
      if (shortListScoreFilter !== "all") {
        const score = parseInt(candidate["Success Score"] || candidate["cv_score"] || candidate["CV Score"] || "0");
        switch (shortListScoreFilter) {
          case "90+":
            scoreMatch = score >= 90;
            break;
          case "85+":
            scoreMatch = score >= 85;
            break;
          case "80+":
            scoreMatch = score >= 80;
            break;
          case "75+":
            scoreMatch = score >= 75;
            break;
          case "70+":
            scoreMatch = score >= 70;
            break;
          case "high":
            scoreMatch = score >= 85;
            break;
          case "medium":
            scoreMatch = score >= 70 && score < 85;
            break;
          case "low":
            scoreMatch = score < 70;
            break;
          default:
            scoreMatch = true;
        }
      }
      return nameMatch && emailMatch && phoneMatch && userIdMatch && sourceMatch && scoreMatch;
    });
  };

  // Helper function to check if candidate nationality matches any preferred nationality
  const matchesPreferredNationality = (candidateNationality: string, preferredNationalities: string): boolean => {
    // Mapping between country names and nationality adjectives
    const nationalityMap: Record<string, string[]> = {
      'egypt': ['egyptian', 'egypt'],
      'saudi arabia': ['saudi', 'saudi arabian', 'saudi arabia'],
      'united arab emirates': ['emirati', 'uae', 'united arab emirates'],
      'jordan': ['jordanian', 'jordan'],
      'lebanon': ['lebanese', 'lebanon'],
      'syria': ['syrian', 'syria'],
      'iraq': ['iraqi', 'iraq'],
      'kuwait': ['kuwaiti', 'kuwait'],
      'bahrain': ['bahraini', 'bahrain'],
      'oman': ['omani', 'oman'],
      'qatar': ['qatari', 'qatar'],
      'yemen': ['yemeni', 'yemen'],
      'palestine': ['palestinian', 'palestine'],
      'morocco': ['moroccan', 'morocco'],
      'tunisia': ['tunisian', 'tunisia'],
      'algeria': ['algerian', 'algeria'],
      'libya': ['libyan', 'libya'],
      'sudan': ['sudanese', 'sudan'],
      'pakistan': ['pakistani', 'pakistan'],
      'india': ['indian', 'india'],
      'bangladesh': ['bangladeshi', 'bangladesh'],
      'philippines': ['filipino', 'philippine', 'philippines'],
      'indonesia': ['indonesian', 'indonesia'],
      'malaysia': ['malaysian', 'malaysia'],
      'singapore': ['singaporean', 'singapore'],
      'united kingdom': ['british', 'uk', 'united kingdom'],
      'united states': ['american', 'us', 'usa', 'united states'],
      'canada': ['canadian', 'canada'],
      'australia': ['australian', 'australia'],
      'new zealand': ['new zealander', 'kiwi', 'new zealand'],
      'south africa': ['south african', 'south africa'],
      'portugal': ['portuguese', 'portugal'],
      'spain': ['spanish', 'spain'],
      'france': ['french', 'france'],
      'germany': ['german', 'germany'],
      'italy': ['italian', 'italy'],
      'netherlands': ['dutch', 'netherlands', 'holland'],
      'belgium': ['belgian', 'belgium'],
      'switzerland': ['swiss', 'switzerland'],
      'austria': ['austrian', 'austria'],
      'greece': ['greek', 'greece'],
      'ireland': ['irish', 'ireland'],
      'sweden': ['swedish', 'sweden'],
      'norway': ['norwegian', 'norway'],
      'denmark': ['danish', 'denmark'],
      'finland': ['finnish', 'finland'],
      'poland': ['polish', 'poland'],
      'czech republic': ['czech', 'czech republic', 'czechia'],
      'romania': ['romanian', 'romania'],
      'hungary': ['hungarian', 'hungary'],
      'turkey': ['turkish', 'turkey'],
      'brazil': ['brazilian', 'brazil'],
      'mexico': ['mexican', 'mexico'],
      'colombia': ['colombian', 'colombia'],
      'argentina': ['argentinian', 'argentine', 'argentina'],
      'nigeria': ['nigerian', 'nigeria'],
      'kenya': ['kenyan', 'kenya'],
      'ghana': ['ghanaian', 'ghana'],
      'ethiopia': ['ethiopian', 'ethiopia'],
      'china': ['chinese', 'china'],
      'japan': ['japanese', 'japan'],
      'south korea': ['south korean', 'korean', 'south korea'],
      'thailand': ['thai', 'thailand'],
      'vietnam': ['vietnamese', 'vietnam'],
      'sri lanka': ['sri lankan', 'sri lanka'],
      'nepal': ['nepalese', 'nepali', 'nepal'],
      'iran': ['iranian', 'persian', 'iran'],
      'russia': ['russian', 'russia'],
      'ukraine': ['ukrainian', 'ukraine'],
    };

    const candidateNat = candidateNationality.toLowerCase().trim();
    const preferredList = preferredNationalities.split(',').map(n => n.toLowerCase().trim());

    return preferredList.some(preferred => {
      // Direct match
      if (candidateNat === preferred) return true;

      // Check if either matches through mapping
      for (const [country, variations] of Object.entries(nationalityMap)) {
        if (variations.includes(preferred) && variations.includes(candidateNat)) {
          return true;
        }
      }

      return false;
    });
  };

  // First, separate candidates by nationality match
  const candidatesMatchingNationality = shortListCandidates.filter((candidate) => {
    const candidateNationality = candidate["nationality"];
    const preferredNationality = job?.prefered_nationality;

    // If no preferred nationality is set, include all candidates in budget sections
    if (!preferredNationality || !candidateNationality) return true;

    // Include only if nationalities match (with mapping support)
    return matchesPreferredNationality(candidateNationality, preferredNationality);
  });

  // Filter candidates with nationality mismatch - these will NOT appear in budget sections
  const notInPreferredNationalityCandidates = filterShortListCandidates(
    shortListCandidates.filter((candidate) => {
      const candidateNationality = candidate["nationality"];
      const preferredNationality = job?.prefered_nationality;

      // Only include if both nationalities exist and don't match
      if (!candidateNationality || !preferredNationality) return false;

      return !matchesPreferredNationality(candidateNationality, preferredNationality);
    }),
  );

  // Filter out rejected candidates and apply filters for rejected section
  const filteredRejectedCandidates = filterShortListCandidates(rejectedShortListCandidates);

  // Filter candidates into budget categories with applied filters (only from matching nationality)
  const withinBudgetCandidates = filterShortListCandidates(
    candidatesMatchingNationality.filter((candidate) => {
      const expectedSalary = parseSalary(candidate["Salary Expectations"]);
      return expectedSalary === 0 || expectedSalary <= budgetThreshold;
    }),
  );
  const aboveBudgetCandidates = filterShortListCandidates(
    candidatesMatchingNationality.filter((candidate) => {
      const expectedSalary = parseSalary(candidate["Salary Expectations"]);
      return expectedSalary > 0 && expectedSalary > budgetThreshold;
    }),
  );
  return (
    <div className={cn("min-w-0 w-full space-y-2 sm:space-y-4 md:space-y-6 p-2 sm:p-4 md:p-6 overflow-x-hidden max-w-full", isShaking && "animate-shake")}>
      {/* Processing Animation - controlled by local state during AI generation, not database fields */}
      
      {/* Apple Loading Bar */}
      <AppleLoadingBar isLoading={loading} className="absolute top-0 left-0 right-0 z-50" />
      
      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-4 min-w-0 w-full max-w-full">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 sm:gap-4 items-start min-w-0 w-full">
        <div className="flex items-center space-x-2 md:space-x-4 min-w-0 w-full lg:w-auto">
            <Button variant="ghost" size="sm" onClick={() => navigate("/jobs")} className="h-11 sm:h-10 px-3 sm:px-4 text-sm sm:text-sm flex-shrink-0 min-h-[44px]">
              <ArrowLeft className="w-4 h-4 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Back to Jobs</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div className="h-6 w-px bg-border hidden sm:block flex-shrink-0" />
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate min-w-0">Job Details</h3>
          </div>
          {/* Futuristic 3D Action Menu */}
          <FuturisticActionButton
            isExpanded={isActionMenuExpanded}
            onToggle={() => setIsActionMenuExpanded(!isActionMenuExpanded)}
          >
            <ActionButton
              onClick={handlePauseJob}
              disabled={automaticDialSaving}
              icon={job?.Processed === "Yes" ? Pause : Play}
              label={job?.Processed === "Yes" ? "Pause Job" : "Run Job"}
              variant="danger"
            />
          </FuturisticActionButton>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto items-stretch sm:items-center justify-center lg:justify-end min-w-0">
            <div className="flex items-center gap-2 sm:gap-2 justify-center sm:justify-start flex-shrink-0 min-h-[44px]">
              <span className="text-xs sm:text-xs md:text-sm font-medium whitespace-nowrap">Auto Dial</span>
              <ToggleSwitch
                checked={job?.automatic_dial || false}
                onChange={handleAutomaticDialToggle}
                disabled={automaticDialSaving}
                size="sm"
                onLabel="ON"
                offLabel="OFF"
              />
            </div>
            <Button onClick={() => navigate(`/jobs/edit/${job.job_id}`)} size="sm" className="w-full sm:w-auto h-11 sm:h-10 text-sm sm:text-sm min-w-0 px-4 sm:px-4 min-h-[44px]">
              <FileText className="w-4 h-4 sm:w-4 sm:h-4 mr-2 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Edit Job</span>
              <span className="sm:hidden">Edit</span>
            </Button>
            <Button variant="outline" asChild size="sm" className="w-full sm:w-auto h-11 sm:h-10 text-sm sm:text-sm min-w-0 px-4 sm:px-4 min-h-[44px]">
              <Link to={`/job/${job.job_id}/apply`}>
                <span className="hidden sm:inline">Apply Link</span>
                <span className="sm:hidden">Apply</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Job Header Card */}
      <Card className="min-w-0 w-full max-w-full overflow-hidden">
        <CardContent className="p-2 sm:p-4 md:p-6 min-w-0">
          <div className="space-y-2 sm:space-y-4 min-w-0">
            <div className="flex flex-col gap-2 sm:gap-4 min-w-0">
              <div className="space-y-1 sm:space-y-2 w-full min-w-0">
                <h2 className="text-xs sm:text-xl md:text-2xl font-bold break-words leading-tight min-w-0">{job.job_title}</h2>
                <p className="text-[10px] sm:text-base md:text-lg text-muted-foreground break-words leading-snug min-w-0">
                  {job.client_description || "Client Description"}
                </p>
              </div>
              <Badge
                variant={
                  job.Processed === "No"
                    ? "outline"
                    : job.Processed === true || job.Processed === "true" || job.Processed === "Yes"
                    ? "default"
                    : "destructive"
                }
                className={`text-[9px] sm:text-xs md:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 whitespace-nowrap w-fit ${
                  job.Processed === "No"
                    ? "bg-purple-600 text-white border-0"
                    : job.Processed === true || job.Processed === "true" || job.Processed === "Yes"
                    ? "bg-green-600 text-white border-0"
                    : "bg-red-600 text-white border-0"
                }`}
              >
                {job.Processed === "No"
                  ? "Complete"
                  : job.Processed === true || job.Processed === "true" || job.Processed === "Yes"
                  ? "Active"
                  : "Not Active"}
              </Badge>
            </div>

            {/* Progressive Status Bar */}
            <div className="pt-2 sm:pt-6 pb-1 sm:pb-2">
              <ProgressiveStatusBar 
                status={
                  job.Processed === "No" 
                    ? "Complete" 
                    : job.status === "Processing" 
                    ? "Sourcing"
                    : job.status === "Recruiting"
                    ? "Making Calls"
                    : "Active"
                } 
              />
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:gap-3 md:gap-4 pt-2 sm:pt-4 border-t min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs md:text-sm min-w-0">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate min-w-0">{job.job_location}</span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs md:text-sm min-w-0">
                <Banknote className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate min-w-0">{formatCurrency(job.job_salary_range?.toString(), job.Currency)}</span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs md:text-sm min-w-0">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate min-w-0">Posted: {formatDate(job.Timestamp)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Funnel */}
      <div className="w-full min-w-0 overflow-x-auto">
        <JobFunnel candidates={candidates} jobAssignment={job?.assignment} />
      </div>

      {/* Detailed Information Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4 min-w-0 w-full">
        <div className="w-full min-w-0 px-0 md:px-0 max-w-full overflow-x-auto">
          {isMobile ? (
            <Select 
              value={activeTab} 
              onValueChange={(value) => {
                if (value === "applications") {
                  handleApplicationsTabClick();
                }
                setActiveTab(value);
              }}
            >
              <SelectTrigger className="w-full h-12 bg-background/95 backdrop-blur border-2">
                <SelectValue placeholder="Select a tab" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="description">Description</SelectItem>
                <SelectItem value="requirements">AI Requirements</SelectItem>
                <SelectItem value="applications">
                  Applications {newApplicationsCount > 0 && `(${newApplicationsCount})`}
                </SelectItem>
                <SelectItem value="boolean-search">AI Longlist</SelectItem>
                <SelectItem value="shortlist">AI Short List</SelectItem>
                <SelectItem value="similar-jobs">Similar Jobs</SelectItem>
                <SelectItem value="analytics">Job Analytics</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <TabsList className="w-full min-w-0 flex flex-col gap-1 md:grid md:grid-cols-8 h-auto p-1 md:p-1">
              <TabsTrigger value="overview" className="w-full justify-start text-left text-xs sm:text-sm md:text-base px-3 sm:px-3 md:px-4 py-2.5 sm:py-2.5 h-11 md:h-auto whitespace-normal leading-tight md:whitespace-nowrap">
                Overview
              </TabsTrigger>
              <TabsTrigger value="description" className="w-full justify-start text-left text-xs sm:text-sm md:text-base px-3 sm:px-3 md:px-4 py-2.5 sm:py-2.5 h-11 md:h-auto whitespace-normal leading-tight md:whitespace-nowrap">
                Description
              </TabsTrigger>
              <TabsTrigger value="requirements" className="w-full justify-start text-left text-xs sm:text-sm md:text-base px-3 sm:px-3 md:px-4 py-2.5 sm:py-2.5 h-11 md:h-auto whitespace-normal leading-tight md:whitespace-nowrap">
                AI Requirements
              </TabsTrigger>
              <TabsTrigger
                value="applications"
                className="w-full justify-start text-left text-xs sm:text-sm md:text-sm px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 h-auto whitespace-normal leading-tight relative md:whitespace-nowrap"
                onClick={handleApplicationsTabClick}
              >
                Applications
                {newApplicationsCount > 0 && (
                  <span className="absolute right-1.5 md:right-3 top-1/2 -translate-y-1/2 md:static md:translate-y-0 md:ml-2 bg-red-500 text-white text-[9px] sm:text-[10px] rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 flex items-center justify-center min-w-[14px] sm:min-w-[16px] md:min-w-[20px] z-10">
                    {newApplicationsCount > 99 ? "99+" : newApplicationsCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="boolean-search" className="w-full justify-start text-left text-xs sm:text-sm md:text-base px-3 sm:px-3 md:px-4 py-2.5 sm:py-2.5 h-11 md:h-auto whitespace-normal leading-tight md:whitespace-nowrap">
                AI Longlist
              </TabsTrigger>
              <TabsTrigger value="shortlist" className="w-full justify-start text-left text-xs sm:text-sm md:text-base px-3 sm:px-3 md:px-4 py-2.5 sm:py-2.5 h-11 md:h-auto whitespace-normal leading-tight md:whitespace-nowrap">
                AI Short List
              </TabsTrigger>
              <TabsTrigger value="similar-jobs" className="w-full justify-start text-left text-xs sm:text-sm md:text-base px-3 sm:px-3 md:px-4 py-2.5 sm:py-2.5 h-11 md:h-auto whitespace-normal leading-tight md:whitespace-nowrap">
                Similar Jobs
              </TabsTrigger>
              <TabsTrigger value="analytics" className="w-full justify-start text-left text-xs sm:text-sm md:text-base px-3 sm:px-3 md:px-4 py-2.5 sm:py-2.5 h-11 md:h-auto whitespace-normal leading-tight md:whitespace-nowrap">
                Job Analytics
              </TabsTrigger>
            </TabsList>
          )}
        </div>

        <TabsContent value="overview" className="space-y-2 sm:space-y-3 md:space-y-4 pb-20 sm:pb-24 md:pb-32 max-w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-6 max-w-full">
            <Card className="max-w-full overflow-hidden">
              <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-2 md:space-y-3 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6 text-xs sm:text-sm [&>div]:flex [&>div]:flex-col sm:[&>div]:flex-row sm:[&>div]:items-start sm:[&>div]:justify-between [&>div]:gap-1 sm:[&>div]:gap-2 [&>div>span:last-child]:break-words [&>div>span:last-child]:text-left sm:[&>div>span:last-child]:text-right [&>div>span:last-child]:max-w-full sm:[&>div>span:last-child]:max-w-[60%]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job ID:</span>
                  <span className="font-mono text-sm">{job.job_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Itris ID:</span>
                  <span className="font-mono text-sm">{job.itris_job_id || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client Name:</span>
                  <span>{job.client_name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client Description:</span>
                  <span>{job.client_description || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span>{job.job_location || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Salary Range:</span>
                  <span className="font-medium">{formatCurrency(job.job_salary_range?.toString(), job.Currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned Recruiter:</span>
                  <span>{recruiterName || job.recruiter_id || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notice Period:</span>
                  <span>{job.notice_period || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preferred Nationality:</span>
                  <span>{job.prefered_nationality || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Not Preferred Nationality:</span>
                  <span className="text-destructive">{job.not_prefered_nationality || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Group:</span>
                  <span className="flex items-center gap-2">
                    {jobGroup ? (
                      <>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: jobGroup.color,
                          }}
                        />
                        {jobGroup.name}
                      </>
                    ) : (
                      "No Group"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Industry:</span>
                  <span>{job.industry || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Headhunting Companies:</span>
                  <div className="flex flex-col gap-1 items-end">
                    {job.headhunting_companies ? (
                      job.headhunting_companies.split(",").map((url: string, index: number) => (
                        <a
                          key={index}
                          href={url.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 break-all"
                        >
                          {url.trim()}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))
                    ) : (
                      <span>N/A</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Automatic Dial:</span>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={job.automatic_dial || false}
                      onCheckedChange={handleAutomaticDialToggle}
                      disabled={automaticDialSaving}
                    />
                    <span className="text-sm text-muted-foreground">{job.automatic_dial ? "ON" : "OFF"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Requirements & Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 [&>div]:flex [&>div]:flex-col sm:[&>div]:flex-row sm:[&>div]:items-start sm:[&>div]:justify-between [&>div]:gap-1 sm:[&>div]:gap-2 [&>div>span:last-child]:break-words [&>div>span:last-child]:text-left sm:[&>div>span:last-child]:text-right [&>div>span:last-child]:max-w-full sm:[&>div>span:last-child]:max-w-[60%]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Countries to include:</span>
                  <span>{job.nationality_to_include || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Countries to exclude:</span>
                  <span>{job.nationality_to_exclude || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job Type:</span>
                  <span>{job["Type"] || "N/A"}</span>
                </div>
                {(job["Type"] === "Contract" || job["Type"]?.toLowerCase().includes("contract")) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contract Length:</span>
                    <span className="font-medium">
                      {job.contract_length || job["Contract Length"] || "Not specified"}
                    </span>
                  </div>
                )}
                {job["assignment"] && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assignment Link:</span>
                    <a
                      href={job["assignment"]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      View Assignment
                    </a>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted Date:</span>
                  <span>{job.Timestamp ? formatDate(job.Timestamp) : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">JD Summary:</span>
                  <span>{job.jd_summary || "N/A"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="description" className="space-y-3 sm:space-y-4 pb-20 sm:pb-32 max-w-full">
          <Card className="max-w-full overflow-hidden">
            <CardHeader className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                    Job Description
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">Detailed overview of the role and responsibilities</CardDescription>
                </div>
                <div className="flex items-center gap-2 sm:gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto h-11 sm:h-9 text-sm min-h-[44px] sm:min-h-0">
                    <Upload className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">Upload File</span>
                    <span className="sm:hidden">Upload</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/jobs/edit/${job.job_id}`)} className="w-full sm:w-auto h-11 sm:h-9 text-sm min-h-[44px] sm:min-h-0">
                    <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">Edit Job</span>
                    <span className="sm:hidden">Edit</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="prose prose-sm max-w-none">
                <p className="leading-relaxed whitespace-pre-wrap text-sm sm:text-base break-words">
                  {job.job_description || "No description available for this position."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Job Documents Section */}
          <Card className="max-w-full overflow-hidden">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                Job Documents
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">Uploaded job description files and related documents</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="text-center py-6 sm:py-8">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No documents uploaded</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 px-4">Upload job description files when creating or editing this job</p>
                <Button variant="outline" className="w-full sm:w-auto h-11 sm:h-auto min-h-[44px] sm:min-h-0" onClick={() => setIsEditDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-3 sm:space-y-4 pb-20 sm:pb-32 max-w-full">
          <Card className="max-w-full overflow-hidden">
            <CardHeader className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                    AI Requirements
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">Skills, experience, and qualifications needed for this role</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate(`/jobs/edit/${job.job_id}`)} className="w-full sm:w-auto h-11 sm:h-9 text-sm min-h-[44px] sm:min-h-0 flex-shrink-0">
                  <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                  Amend
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="prose prose-sm max-w-none space-y-3 sm:space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">Things to look for:</h4>
                  <p className="leading-relaxed whitespace-pre-wrap text-sm sm:text-base break-words">
                    {job.things_to_look_for || "No specific criteria listed."}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">Must have:</h4>
                  <p className="leading-relaxed whitespace-pre-wrap text-sm sm:text-base break-words">
                    {job.musttohave || "No must-have requirements specified."}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">Nice to Have:</h4>
                  <p className="leading-relaxed whitespace-pre-wrap text-sm sm:text-base break-words">
                    {job.nicetohave || "No nice-to-have requirements specified."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-3 sm:space-y-4 pb-20 sm:pb-32 max-w-full">
          <Card className="max-w-full overflow-hidden">
            <CardHeader className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                    Applications ({applications.length})
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">Candidates who have applied for this position</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {/* Application Filters */}
              <Card className="mb-3 sm:mb-4 max-w-full overflow-hidden">
                <CardContent className="pt-3 sm:pt-4 p-3 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full max-w-full">
                    <div className="space-y-2 min-w-0">
                      <label className="text-xs sm:text-sm font-medium">Name</label>
                      <Input
                        placeholder="Filter by name..."
                        value={appNameFilter}
                        onChange={(e) => setAppNameFilter(e.target.value)}
                        className="h-11 sm:h-9 text-sm min-w-0 w-full"
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <label className="text-xs sm:text-sm font-medium">Email</label>
                      <Input
                        placeholder="Filter by email..."
                        value={appEmailFilter}
                        onChange={(e) => setAppEmailFilter(e.target.value)}
                        className="h-11 sm:h-9 text-sm min-w-0 w-full"
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <label className="text-xs sm:text-sm font-medium">Phone</label>
                      <Input
                        placeholder="Filter by phone..."
                        value={appPhoneFilter}
                        onChange={(e) => setAppPhoneFilter(e.target.value)}
                        className="h-11 sm:h-9 text-sm min-w-0 w-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {applicationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No applications found for this job.</div>
              ) : (
                (() => {
                  // Filter applications based on name, email, and phone
                  const filteredApplications = applications.filter((application) => {
                    const first = application.first_name || "";
                    const last = application.last_name || "";
                    // Filter out "Not found" values
                    const cleanFirst = first.toLowerCase() === "not found" ? "" : first;
                    const cleanLast = last.toLowerCase() === "not found" ? "" : last;
                    const fullName = [cleanFirst, cleanLast].filter(Boolean).join(" ");
                    
                    const email = application.Email || "";
                    const phone = application.phone_number || "";
                    const nameMatch = !appNameFilter || fullName.toLowerCase().includes(appNameFilter.toLowerCase());
                    const emailMatch = !appEmailFilter || email.toLowerCase().includes(appEmailFilter.toLowerCase());
                    const phoneMatch = !appPhoneFilter || phone.includes(appPhoneFilter);
                    return nameMatch && emailMatch && phoneMatch;
                  });
                  return (
                    <div>
                      <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground">
                        Showing {filteredApplications.length} of {applications.length} applications
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full max-w-full">
                        {filteredApplications.map((application) => (
                          <Card
                            key={application.candidate_id}
                            className="border border-border/50 hover:border-primary/50 transition-colors hover:shadow-lg max-w-full overflow-hidden"
                          >
                            <CardContent className="p-3 sm:p-4">
                              <div className="space-y-3">
                                 <div className="flex items-start justify-between min-w-0">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-semibold text-sm sm:text-base truncate">
                                      {(() => {
                                        const first = application.first_name || "";
                                        const last = application.last_name || "";
                                        // Filter out "Not found" values
                                        const cleanFirst = first.toLowerCase() === "not found" ? "" : first;
                                        const cleanLast = last.toLowerCase() === "not found" ? "" : last;
                                        
                                        if (cleanFirst && cleanLast) {
                                          return `${cleanFirst} ${cleanLast}`;
                                        } else if (cleanFirst) {
                                          return cleanFirst;
                                        } else if (cleanLast) {
                                          return cleanLast;
                                        } else {
                                          return application.candidate_id || "Applicant";
                                        }
                                      })()}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                      {application.candidate_id}
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-2 text-xs sm:text-sm">
                                  {application.Email && (
                                    <div className="flex items-center text-muted-foreground min-w-0">
                                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                                      <span className="truncate">{application.Email}</span>
                                    </div>
                                  )}

                                  {application.phone_number && (
                                    <div className="flex items-center text-muted-foreground min-w-0">
                                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                                      <span className="truncate">{application.phone_number}</span>
                                    </div>
                                  )}
                                </div>

                                {application.cv_summary && (
                                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                                    {application.cv_summary}
                                  </p>
                                )}

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between pt-2 border-t gap-2">
                                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                    {application.CV_Link && (
                                      <Button variant="outline" size="sm" asChild className="w-full sm:w-auto h-11 sm:h-9 text-sm min-h-[44px] sm:min-h-0">
                                        <a href={application.CV_Link} target="_blank" rel="noopener noreferrer">
                                          <FileText className="w-4 h-4 mr-1 flex-shrink-0" />
                                          CV
                                        </a>
                                      </Button>
                                    )}
                                    <Button variant="outline" size="sm" asChild className="w-full sm:w-auto h-11 sm:h-9 text-sm min-h-[44px] sm:min-h-0">
                                      <Link
                                        to={`/candidate/${application.candidate_id}`}
                                        state={{
                                          fromJob: id,
                                          tab: "applications",
                                          focusCandidateId: application.candidate_id,
                                        }}
                                      >
                                        View Profile
                                      </Link>
                                    </Button>
                                  </div>
                                  {!addedToLongList.has(application.candidate_id) && (
                                    <Button
                                      size="sm"
                                      className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto h-11 sm:h-9 text-sm min-h-[44px] sm:min-h-0"
                                      onClick={async () => {
                                        try {
                                          // Disable the button immediately
                                          setAddedToLongList((prev) => new Set([...prev, application.candidate_id]));

                                          const webhookUrl =
                                            "https://hook.eu2.make.com/tv58ofd5rftm64t677f65phmbwrnq24e";
                                          const payload = {
                                            user_id: String(application.candidate_id),
                                            job_id: String(job?.job_id || id || ""),
                                          };
                                          console.log(
                                            "Triggering webhook with payload:",
                                            JSON.stringify(payload, null, 2),
                                          );

                                          const response = await fetch(webhookUrl, {
                                            method: "POST",
                                            headers: {
                                              "Content-Type": "application/json",
                                            },
                                            body: JSON.stringify(payload),
                                          });
                                          
                                          if (response.ok) {
                                            try {
                                              const responseText = await response.text();
                                              console.log("Webhook response:", responseText);

                                              // Try to parse as JSON if possible, otherwise use as text
                                              let responseData;
                                              try {
                                                responseData = JSON.parse(responseText);
                                              } catch {
                                                responseData = responseText;
                                              }
                                              console.log("Processed webhook response:", responseData);
                                            } catch (error) {
                                              console.error("Error processing webhook response:", error);
                                            }
                                          }

                                          console.log("Webhook triggered successfully");
                                        } catch (error) {
                                          console.error("Error triggering webhook:", error);
                                        }
                                      }}
                                    >
                                      Add to Long List
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })()
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boolean-search" className="space-y-3 sm:space-y-4 pb-20 sm:pb-32 max-w-full">
          <Card className="max-w-full overflow-hidden">
            <CardHeader className="p-3 sm:p-6">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                      AI Longlist (
                      {
                        longlistedCandidates.filter((c) => {
                          const source = (c["Source"] || c.source || "").toLowerCase();
                          return source.includes("itris") || source.includes("internal database") || source.includes("linkedin");
                        }).length
                      }{" "}
                      candidates)
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-1">Candidates added to the longlist for this position</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportLonglistToCSV}
                      disabled={longlistedLoading || longlistedCandidates.length === 0}
                      className="w-full sm:w-auto h-11 sm:h-9 text-sm min-h-[44px] sm:min-h-0"
                    >
                      <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                      Export CSV
                    </Button>
                    {job?.longlist && job.longlist > 0 ? (
                      <ExpandableSearchButton
                        onSearchLinkedIn={() => handleSearchMoreCandidates("linkedin")}
                        onSearchDatabase={() => handleSearchMoreCandidates("database")}
                        onSearchBoth={() => handleSearchMoreCandidates("both")}
                        disabled={regenerateCooldown.isDisabled}
                        cooldownText={regenerateCooldown.isDisabled ? regenerateCooldown.formatTime() : undefined}
                      />
                    ) : (
                      <Button 
                        onClick={handleGenerateLongList} 
                        disabled={job?.longlist === 3 || generateCooldown.isDisabled} 
                        size="sm"
                        className="w-full sm:w-auto h-11 sm:h-9 text-sm min-h-[44px] sm:min-h-0"
                      >
                        <Zap className="w-4 h-4 mr-2 flex-shrink-0" />
                        {generateCooldown.isDisabled 
                          ? `Wait ${generateCooldown.formatTime()}` 
                          : "Generate AI"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {(() => {
                const readyToContactCount = longlistedCandidates.filter(
                  (candidate) => candidate["Contacted"] === "Ready to Contact",
                ).length;
                if (readyToContactCount > 0) {
                  return (
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-2 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          {readyToContactCount} {readyToContactCount === 1 ? "candidate" : "candidates"} ready to be
                          contacted
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              {longlistedLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : longlistedCandidates.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No candidates in longlist yet</h3>
                  <p className="text-muted-foreground">Add candidates to the longlist from the Applications tab</p>
                </div>
              ) : (
                <>
                  {/* Bulk Actions */}
                  {selectedCandidates.size > 0 && (
                    <Card className="p-3 sm:p-4 mb-3 sm:mb-4 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 max-w-full overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-medium">
                            {selectedCandidates.size} candidate{selectedCandidates.size > 1 ? "s" : ""} selected
                          </span>
                          <Button variant="ghost" size="sm" onClick={clearAllSelection} className="h-8 sm:h-6 text-xs px-2">
                            Clear
                          </Button>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveSelectedCandidates}
                            className="text-destructive hover:text-destructive border-destructive/50 hover:border-destructive w-full sm:w-auto h-11 sm:h-9 text-sm min-h-[44px] sm:min-h-0"
                          >
                            <X className="w-4 h-4 mr-1 flex-shrink-0" />
                            Remove Selected
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleCallSelectedCandidates}
                            disabled={isGeneratingShortList}
                            className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-green-500 dark:hover:bg-green-600 w-full sm:w-auto h-11 sm:h-9 text-sm min-h-[44px] sm:min-h-0"
                          >
                            <Phone className="w-4 h-4 mr-1 flex-shrink-0" />
                            {isGeneratingShortList ? "Calling..." : "Call Selected"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Filters */}
                  <Card className="p-3 sm:p-4 mb-3 sm:mb-4 bg-muted/50 min-w-0 w-full max-w-full overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-2 mb-3 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <Filter className="w-4 h-4 flex-shrink-0" />
                        <h4 className="font-medium text-xs sm:text-sm md:text-base">Filters</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={selectAllCandidates} className="h-8 sm:h-6 text-xs px-2 whitespace-nowrap">
                          Select All
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 min-w-0 w-full">
                      <div className="relative min-w-0">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 flex-shrink-0" />
                        <Input
                          placeholder="Name..."
                          value={nameFilter}
                          onChange={(e) => setNameFilter(e.target.value)}
                          className="pl-10 h-11 text-sm min-w-0 w-full"
                        />
                      </div>
                      <Input
                        placeholder="Email..."
                        value={emailFilter}
                        onChange={(e) => setEmailFilter(e.target.value)}
                        className="h-11 text-sm min-w-0 w-full"
                      />
                      <Input
                        placeholder="Phone..."
                        value={phoneFilter}
                        onChange={(e) => setPhoneFilter(e.target.value)}
                        className="h-11 text-sm min-w-0 w-full"
                      />
                      <Input
                        placeholder="User ID..."
                        value={userIdFilter}
                        onChange={(e) => setUserIdFilter(e.target.value)}
                        className="h-11 text-sm min-w-0 w-full"
                      />
                      {isMobile ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="h-11 text-sm justify-between w-full">
                              <span className="truncate">Source & Score Filters</span>
                              <Filter className="h-4 w-4 ml-2 flex-shrink-0" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-3 bg-background z-[70]" align="start">
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium mb-1.5 block">Source</label>
                                <Select value={longListSourceFilter} onValueChange={setLongListSourceFilter}>
                                  <SelectTrigger className="h-9 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="z-[80] bg-background">
                                    <SelectItem value="all">All Sources</SelectItem>
                                    <SelectItem value="Itris">Itris</SelectItem>
                                    <SelectItem value="Linkedin">LinkedIn</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-xs font-medium mb-1.5 block">Score</label>
                                <Select value={scoreFilter} onValueChange={setScoreFilter}>
                                  <SelectTrigger className="h-9 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="z-[80] bg-background">
                                    <SelectItem value="all">All Scores</SelectItem>
                                    <SelectItem value="high">High (75+)</SelectItem>
                                    <SelectItem value="moderate">Moderate (50-74)</SelectItem>
                                    <SelectItem value="poor">Poor (1-49)</SelectItem>
                                    <SelectItem value="none">No Score</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-xs font-medium mb-1.5 block">Status</label>
                                <Select value={contactedFilter} onValueChange={setContactedFilter}>
                                  <SelectTrigger className="h-9 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="z-[80] bg-background">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Not Contacted">Not Contacted</SelectItem>
                                    <SelectItem value="Ready to Call">Ready to Contact</SelectItem>
                                    <SelectItem value="Contacted">Contacted</SelectItem>
                                    <SelectItem value="Call Done">Call Done</SelectItem>
                                    <SelectItem value="1st No Answer">1st No Answer</SelectItem>
                                    <SelectItem value="2nd No Answer">2nd No Answer</SelectItem>
                                    <SelectItem value="3rd No Answer">3rd No Answer</SelectItem>
                                    <SelectItem value="Low Scored">Low Scored</SelectItem>
                                    <SelectItem value="Tasked">Tasked</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <>
                          <Select value={longListSourceFilter} onValueChange={setLongListSourceFilter}>
                            <SelectTrigger className="h-11 text-sm min-w-0">
                              <SelectValue placeholder="Source" className="truncate" />
                            </SelectTrigger>
                            <SelectContent className="z-[60] bg-popover">
                              <SelectItem value="all">All Sources</SelectItem>
                              <SelectItem value="Itris">Itris</SelectItem>
                              <SelectItem value="Linkedin">LinkedIn</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={scoreFilter} onValueChange={setScoreFilter}>
                            <SelectTrigger className="h-11 text-sm min-w-0">
                              <SelectValue placeholder="Score" className="truncate" />
                            </SelectTrigger>
                            <SelectContent className="z-[60] bg-popover">
                              <SelectItem value="all">All Scores</SelectItem>
                              <SelectItem value="high">High (75+)</SelectItem>
                              <SelectItem value="moderate">Moderate (50-74)</SelectItem>
                              <SelectItem value="poor">Poor (1-49)</SelectItem>
                              <SelectItem value="none">No Score</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={contactedFilter} onValueChange={setContactedFilter}>
                            <SelectTrigger className="h-11 text-sm min-w-0">
                              <SelectValue placeholder="Status" className="truncate" />
                            </SelectTrigger>
                            <SelectContent className="z-[60] bg-popover">
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="Not Contacted">Not Contacted</SelectItem>
                              <SelectItem value="Ready to Call">Ready to Contact</SelectItem>
                              <SelectItem value="Contacted">Contacted</SelectItem>
                              <SelectItem value="Call Done">Call Done</SelectItem>
                              <SelectItem value="1st No Answer">1st No Answer</SelectItem>
                              <SelectItem value="2nd No Answer">2nd No Answer</SelectItem>
                              <SelectItem value="3rd No Answer">3rd No Answer</SelectItem>
                              <SelectItem value="Low Scored">Low Scored</SelectItem>
                              <SelectItem value="Tasked">Tasked</SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </>
                      )}
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full max-w-full">
                    {(() => {
                      // Filter longlisted candidates based on filters (show all candidates in Jobs_CVs)
                      const filteredLonglistedCandidates = longlistedCandidates.filter((candidate) => {
                        const nameMatch =
                          !nameFilter ||
                          (candidate["Candidate Name"] || "").toLowerCase().includes(nameFilter.toLowerCase());
                        const emailMatch =
                          !emailFilter ||
                          (candidate["Candidate Email"] || "").toLowerCase().includes(emailFilter.toLowerCase());
                        const phoneMatch =
                          !phoneFilter || (candidate["Candidate Phone Number"] || "").includes(phoneFilter);
                        const userIdMatch =
                          !userIdFilter || (candidate.user_id || candidate["Candidate_ID"] || "").toString().includes(userIdFilter);
                        const source = (candidate["Source"] || candidate.source || "").toLowerCase();
                        const sourceFilterMatch =
                          !longListSourceFilter ||
                          longListSourceFilter === "all" ||
                          (longListSourceFilter.toLowerCase() === "itris"
                            ? source.includes("itris") || source.includes("internal database")
                            : source.includes(longListSourceFilter.toLowerCase()));
                        let scoreMatch = true;
                        if (scoreFilter !== "all") {
                          const score = parseInt(
                            candidate["Success Score"] || candidate["cv_score"] || candidate["CV Score"] || "0",
                          );
                          switch (scoreFilter) {
                            case "high":
                              scoreMatch = score >= 75;
                              break;
                            case "moderate":
                              scoreMatch = score >= 50 && score < 75;
                              break;
                            case "poor":
                              scoreMatch = score >= 1 && score < 50;
                              break;
                            case "none":
                              scoreMatch = score === 0 || isNaN(score);
                              break;
                          }
                        }
                        let contactedMatch = true;
                        if (contactedFilter !== "all") {
                          const contacted = candidate["Contacted"] || "";
                          contactedMatch =
                            contacted === contactedFilter ||
                            (contactedFilter === "Ready to Call" && contacted === "Ready to Contact");
                        }
                        return (
                          nameMatch &&
                          emailMatch &&
                          phoneMatch &&
                          userIdMatch &&
                          sourceFilterMatch &&
                          scoreMatch &&
                          contactedMatch
                        );
                      });

                      // Group candidates by user_id (for LinkedIn) or Candidate_ID (for others) to handle multiple contacts
                      const groupedCandidates = filteredLonglistedCandidates.reduce(
                        (acc, candidate) => {
                          // Use user_id for grouping as it's unique for each candidate
                          const candidateId = candidate["user_id"] || candidate["Candidate_ID"];
                          if (!acc[candidateId]) {
                            acc[candidateId] = [];
                          }
                          acc[candidateId].push(candidate);
                          return acc;
                        },
                        {} as Record<string, any[]>,
                      );

                      // Sort grouped candidates by highest score (CV or LinkedIn) first
                      const sortedGroupedCandidates = Object.entries(groupedCandidates).sort(
                        ([, contactsA], [, contactsB]) => {
                          // Get max score from any contact in the group
                          const getMaxScore = (contacts: any[]) => {
                            return Math.max(
                              ...contacts.map((c) =>
                                Math.max(
                                  parseInt(c["cv_score"] || c["CV Score"] || "0"),
                                  parseInt(c["linkedin_score"] || c["LinkedIn Score"] || "0"),
                                ),
                              ),
                            );
                          };
                          return getMaxScore(contactsB) - getMaxScore(contactsA); // Descending order (highest first)
                        },
                      );
                      return sortedGroupedCandidates.map(([candidateId, candidateContacts]: [string, any[]]) => {
                        // Use the first contact for display info
                        const mainCandidate = candidateContacts[0];
                        return (
                           <Card
                            key={candidateId}
                            id={`candidate-card-${candidateId}`}
                            className={cn(
                              "border border-border/50 hover:border-primary/50 transition-colors hover:shadow-lg max-w-full overflow-hidden",
                              selectedCandidates.has(candidateId) && "border-primary bg-primary/5",
                              mainCandidate["Contacted"] === "Rejected" && "border-red-500/50 bg-red-500/5",
                              mainCandidate["Contacted"] === "Submitted" && "border-emerald-500/50 bg-emerald-500/5",
                            )}
                          >
                            {/* Status timestamp banner for Rejected/Submitted */}
                            {mainCandidate["Contacted"] === "Rejected" && mainCandidate["rejected_at"] && (
                              <div className="bg-red-500/20 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 border-b border-red-500/30">
                                <X className="w-3 h-3" />
                                Rejected on {format(new Date(mainCandidate["rejected_at"]), "dd MMM yyyy, HH:mm")}
                              </div>
                            )}
                            {mainCandidate["Contacted"] === "Submitted" && mainCandidate["submitted_at"] && (
                              <div className="bg-emerald-500/20 px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 border-b border-emerald-500/30">
                                <CheckCircle className="w-3 h-3" />
                                Submitted on {format(new Date(mainCandidate["submitted_at"]), "dd MMM yyyy, HH:mm")}
                              </div>
                            )}
                            <CardContent className="p-2 sm:p-3 md:p-4">
                              <div className="space-y-2 sm:space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                                    <input
                                      type="checkbox"
                                      checked={selectedCandidates.has(candidateId)}
                                      onChange={() => toggleCandidateSelection(candidateId)}
                                      className="mt-1 h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary focus:ring-primary border-gray-300 rounded flex-shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-semibold text-xs sm:text-sm md:text-base font-work line-clamp-2">
                                        {mainCandidate["Candidate Name"] &&
                                        !/undefined/i.test(String(mainCandidate["Candidate Name"]))
                                          ? mainCandidate["Candidate Name"]
                                          : mainCandidate["Candidate Email"]
                                            ? String(mainCandidate["Candidate Email"]).split("@")[0]
                                            : `Candidate ${candidateId}`}
                                      </h4>
                                      <div className="space-y-1">
                                        {(mainCandidate["Contacted"]?.toLowerCase() === "call done" ||
                                          mainCandidate["Contacted"]?.toLowerCase() === "contacted" ||
                                          mainCandidate["Contacted"]?.toLowerCase() === "low scored" ||
                                          mainCandidate["Contacted"]?.toLowerCase() === "tasked") &&
                                          mainCandidate["lastcalltime"] && (
                                            <div className="text-xs font-work text-muted-foreground flex items-center">
                                              <Clock className="w-3 h-3 mr-1" />
                                              {new Date(mainCandidate["lastcalltime"]).toLocaleDateString()}
                                              <span className="ml-2">
                                                {new Date(mainCandidate["lastcalltime"]).toLocaleTimeString([], {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })}
                                              </span>
                                            </div>
                                          )}

                                        {/* Qualifications Section - only show when call log is available and qualifications exist */}
                                        {(mainCandidate["Contacted"]?.toLowerCase() === "call done" ||
                                          mainCandidate["Contacted"]?.toLowerCase() === "contacted" ||
                                          mainCandidate["Contacted"]?.toLowerCase() === "low scored" ||
                                          mainCandidate["Contacted"]?.toLowerCase() === "tasked") &&
                                          mainCandidate["qualifications"] && (
                                            <div className="mt-2 p-2 bg-muted/30 rounded-sm border-l-2 border-primary/30">
                                              <div className="text-xs font-work font-medium text-foreground mb-1 flex items-center">
                                                <FileText className="w-3 h-3 mr-1" />
                                                Qualifications
                                              </div>
                                              <p className="text-xs font-work text-muted-foreground line-clamp-3">
                                                {mainCandidate["qualifications"]}
                                              </p>
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      showRemoveConfirmation(candidateId, mainCandidate["Candidate Name"] || "Unknown")
                                    }
                                    className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                                    title="Remove from Long List"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>

                                <div className="space-y-2 text-xs md:text-sm font-work">
                                  {mainCandidate["Candidate Email"] && (
                                    <div className="flex items-center text-muted-foreground min-w-0">
                                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                                      <span className="truncate">{mainCandidate["Candidate Email"]}</span>
                                    </div>
                                  )}

                                  {mainCandidate["Candidate Phone Number"] && (
                                    <div className="flex items-center text-muted-foreground min-w-0">
                                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                                      <span className="truncate">{mainCandidate["Candidate Phone Number"]}</span>
                                    </div>
                                  )}

                                  {mainCandidate["Job ID"] && (
                                    <div className="flex items-center text-muted-foreground min-w-0">
                                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                      <span className="truncate">{mainCandidate["Job ID"]}</span>
                                    </div>
                                  )}

                                  {mainCandidate["Source"] && (
                                    <div className="flex items-center text-muted-foreground min-w-0">
                                      <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                                      <span className="truncate">{mainCandidate["Source"]}</span>
                                    </div>
                                  )}
                                </div>

                                {/* CV Score and Reason Section */}
                                <div className="space-y-2 pt-2 border-t">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-work">
                                    <div className="space-y-1">
                                      {
                                        <div className="flex items-center justify-between">
                                          <span className="text-muted-foreground">
                                            {typeof mainCandidate["Source"] === "string" &&
                                            mainCandidate["Source"].toLowerCase().includes("linkedin")
                                              ? "LinkedIn Score:"
                                              : "CV Score:"}
                                          </span>
                                          {(() => {
                                            const score =
                                              typeof mainCandidate["Source"] === "string" &&
                                              mainCandidate["Source"].toLowerCase().includes("linkedin")
                                                ? (mainCandidate["linkedin_score"] !== null && mainCandidate["linkedin_score"] !== undefined ? mainCandidate["linkedin_score"] : (mainCandidate["cv_score"] !== null && mainCandidate["cv_score"] !== undefined ? mainCandidate["cv_score"] : "N/A"))
                                                : (mainCandidate["cv_score"] !== null && mainCandidate["cv_score"] !== undefined ? mainCandidate["cv_score"] : "N/A");
                                            const numScore = parseInt(score);
                                            let scoreClass = "font-medium";
                                            if (!isNaN(numScore)) {
                                              if (numScore < 50) {
                                                scoreClass = "font-bold text-red-600 dark:text-red-400";
                                              } else if (numScore < 75) {
                                                scoreClass = "font-medium text-amber-600 dark:text-amber-400";
                                              } else {
                                                scoreClass = "font-medium text-green-600 dark:text-green-400";
                                              }
                                            }
                                            return <span className={scoreClass}>{score}</span>;
                                          })()}
                                        </div>
                                      }
                                      {mainCandidate["after_call_score"] && mainCandidate["after_call_score"] !== 0 && (
                                        <div className="flex items-center justify-between">
                                          <span className="text-muted-foreground">After Call Score:</span>
                                          <span className="font-medium">{mainCandidate["after_call_score"]}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">User ID:</span>
                                        <span className="font-mono text-xs">{mainCandidate["user_id"] || "N/A"}</span>
                                      </div>
                                    </div>
                                    <div className="space-y-1"></div>
                                  </div>
                                  {mainCandidate["Source"] &&
                                  typeof mainCandidate["Source"] === "string" &&
                                  mainCandidate["Source"].toLowerCase().includes("linkedin") &&
                                  mainCandidate["linkedin_score_reason"] ? (
                                    <div className="pt-1">
                                      <span className="text-muted-foreground text-xs font-work">Reason:</span>
                                      <p className="text-xs font-work text-muted-foreground mt-1 line-clamp-3">
                                        {mainCandidate["linkedin_score_reason"]}
                                      </p>
                                    </div>
                                  ) : (
                                    mainCandidate["cv_score_reason"] && (
                                      <div className="pt-1">
                                        <span className="text-muted-foreground text-xs font-work">CV Reason:</span>
                                        <p className="text-xs font-work text-muted-foreground mt-1 line-clamp-3">
                                          {mainCandidate["cv_score_reason"]}
                                        </p>
                                      </div>
                                    )
                                  )}

                                  {/* Highlight Low Scores */}
                                  {(() => {
                                    const score =
                                      typeof mainCandidate["Source"] === "string" &&
                                      mainCandidate["Source"].toLowerCase().includes("linkedin")
                                        ? parseInt(mainCandidate["linkedin_score"] || mainCandidate["cv_score"] || "0")
                                        : parseInt(mainCandidate["cv_score"] || "0");
                                    if (score > 0 && score < 50) {
                                      return (
                                        <div className="pt-2">
                                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800">
                                            ⚠️ Low Score: {score}
                                          </Badge>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t gap-2">
                                  <div className="flex flex-wrap items-center gap-1">
                                    <StatusDropdown
                                      currentStatus={mainCandidate["Contacted"]}
                                      candidateId={mainCandidate["Candidate_ID"]}
                                      jobId={id!}
                                      onStatusChange={(newStatus) => {
                                        setCandidates((prev) =>
                                          prev.map((c) =>
                                            c["Candidate_ID"] === mainCandidate["Candidate_ID"]
                                              ? {
                                                  ...c,
                                                  Contacted: newStatus,
                                                }
                                              : c,
                                          ),
                                        );
                                      }}
                                      variant="badge"
                                    />
                                    {getCandidateStatus(mainCandidate["Candidate_ID"]) && (
                                      <StatusDropdown
                                        currentStatus={getCandidateStatus(mainCandidate["Candidate_ID"])}
                                        candidateId={mainCandidate["Candidate_ID"]}
                                        jobId={null}
                                        onStatusChange={(newStatus) => {
                                          setCvData((prev) =>
                                            prev.map((cv) =>
                                              cv["Cadndidate_ID"] === mainCandidate["Candidate_ID"]
                                                ? {
                                                    ...cv,
                                                    CandidateStatus: newStatus,
                                                  }
                                                : cv,
                                            ),
                                          );
                                        }}
                                        variant="badge"
                                      />
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-1 items-end">
                                    {/* Only show overall score when status is Call Done */}
                                    {mainCandidate["Contacted"]?.toLowerCase() === "call done" &&
                                      getOverallScoreBadge(mainCandidate)}
                                    {![
                                      "ready to contact",
                                      "not contacted",
                                      "1st no answer",
                                      "2nd no answer",
                                      "3rd no answer",
                                      "1st no anwser",
                                      "2nd no anwser",
                                      "3rd no anwser",
                                    ].includes(mainCandidate["Contacted"]?.toLowerCase() || "") &&
                                      getScoreBadge(
                                        mainCandidate["Success Score"] ||
                                          mainCandidate["cv_score"] ||
                                          mainCandidate["CV Score"],
                                      )}
                                  </div>
                                </div>

                                {/* Call Log Buttons */}
                                <div className="pt-2 border-t">
                                  <div className="grid grid-cols-2 gap-2">
                                    {/* Row 1: Call Candidate | Call Log */}
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() =>
                                        handleCallCandidate(mainCandidate["Candidate_ID"], id!, mainCandidate["callid"])
                                      }
                                      disabled={callingCandidateId === candidateId}
                                      className="bg-foreground hover:bg-foreground/90 text-background disabled:opacity-50 text-xs"
                                    >
                                      <Phone className="w-3 h-3 mr-1" />
                                      {callingCandidateId === candidateId ? "Calling..." : "Call Candidate"}
                                    </Button>
                                    {(() => {
                                      const isLinkedInCandidate =
                                        typeof mainCandidate["Source"] === "string" &&
                                        mainCandidate["Source"].toLowerCase().includes("linkedin");
                                      const contactsWithCalls = candidateContacts.filter(
                                        (contact) => contact.callcount > 0,
                                      );

                                      // For LinkedIn candidates, always show Call Log button
                                      if (isLinkedInCandidate) {
                                        const latestContact =
                                          contactsWithCalls.length > 0
                                            ? contactsWithCalls.reduce((latest, current) =>
                                                current.callid > latest.callid ? current : latest,
                                              )
                                            : mainCandidate;
                                        return (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="text-xs"
                                          >
                                            <Link
                                              to={`/call-log-details?candidate=${candidateId}&job=${id}&callid=${latestContact.callid || latestContact.recordid || candidateId}&longListSourceFilter=${encodeURIComponent(longListSourceFilter)}&fromTab=boolean-search`}
                                              className="truncate"
                                            >
                                              <FileText className="w-3 h-3 mr-1 flex-shrink-0" />
                                              <span className="truncate">Call Log</span>
                                            </Link>
                                          </Button>
                                        );
                                      }

                                      // For non-LinkedIn candidates, only show if they have call logs
                                      if (contactsWithCalls.length === 0) {
                                        return (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                            className="text-xs opacity-50"
                                          >
                                            <FileText className="w-3 h-3 mr-1" />
                                            Call Log
                                          </Button>
                                        );
                                      }

                                      // Get the latest call log (highest callid)
                                      const latestContact = contactsWithCalls.reduce((latest, current) =>
                                        current.callid > latest.callid ? current : latest,
                                      );
                                      return (
                                        <Button
                                          key={latestContact.callid}
                                          variant="outline"
                                          size="sm"
                                          asChild
                                          className="text-xs"
                                        >
                                          <Link
                                            to={`/call-log-details?candidate=${candidateId}&job=${id}&callid=${latestContact.callid}&longListSourceFilter=${encodeURIComponent(longListSourceFilter)}&fromTab=boolean-search`}
                                            className="truncate"
                                          >
                                            <FileText className="w-3 h-3 mr-1 flex-shrink-0" />
                                            <span className="truncate">Call Log</span>
                                          </Link>
                                        </Button>
                                      );
                                    })()}

                                    {/* Row 2: View Profile | Submit CV */}
                                    <Button variant="ghost" size="sm" asChild className="text-xs">
                                      <Link
                                        to={`/candidate/${candidateId}`}
                                        state={{
                                          fromJob: id,
                                          tab: "boolean-search",
                                          focusCandidateId: candidateId,
                                          longListSourceFilter,
                                          linkedInUrl: typeof mainCandidate["Source"] === "string" &&
                                            mainCandidate["Source"].toLowerCase().includes("linkedin")
                                            ? getLinkedInUrl(mainCandidate)
                                            : undefined,
                                        }}
                                      >
                                        <Users className="w-3 h-3 mr-1" />
                                        View Profile
                                      </Link>
                                    </Button>
                                    {mainCandidate["Contacted"] !== "Submitted" && mainCandidate["Contacted"] !== "Rejected" ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openHireDialog(id!, candidateId, mainCandidate.recordid)}
                                        className="text-xs bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-50 hover:border-green-600 hover:text-green-700 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-950/30 dark:hover:border-green-500 dark:hover:text-green-300"
                                      >
                                        <FileCheck className="w-3 h-3 mr-1" />
                                        Submit CV
                                      </Button>
                                    ) : mainCandidate["Contacted"] === "Submitted" ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs bg-transparent border-2 border-blue-500 text-blue-600 cursor-default"
                                        disabled
                                      >
                                        <FileCheck className="w-3 h-3 mr-1" />
                                        CV Submitted
                                      </Button>
                                    ) : (
                                      <div></div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      });
                    })()}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shortlist" className="space-y-3 sm:space-y-6 pb-20 sm:pb-32 max-w-full">
          <div className="space-y-4 sm:space-y-6">
            {/* Within Budget Section */}
            <Card className="max-w-full overflow-hidden">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  Within Budget ({withinBudgetCandidates.length} candidates)
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  High-scoring candidates with salary expectations within 20% of budget (
                  {formatCurrency(jobBudget.toString(), job?.Currency)} + 20%)
                </CardDescription>

                {/* AI Short List Filters - Single Line */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t min-w-0">
                  <div className="relative min-w-0">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 flex-shrink-0" />
                    <Input
                      placeholder="Name..."
                      value={shortListNameFilter}
                      onChange={(e) => setShortListNameFilter(e.target.value)}
                      className="pl-10 h-11 sm:h-9 text-sm min-w-0 w-full"
                    />
                  </div>
                  <Input
                    placeholder="Email..."
                    value={shortListEmailFilter}
                    onChange={(e) => setShortListEmailFilter(e.target.value)}
                    className="h-11 sm:h-9 text-sm min-w-0 w-full"
                  />
                  <Input
                    placeholder="Phone..."
                    value={shortListPhoneFilter}
                    onChange={(e) => setShortListPhoneFilter(e.target.value)}
                    className="h-11 sm:h-9 text-sm min-w-0 w-full"
                  />
                  <Input
                    placeholder="User ID..."
                    value={shortListUserIdFilter}
                    onChange={(e) => setShortListUserIdFilter(e.target.value)}
                    className="h-11 sm:h-9 text-sm min-w-0 w-full"
                  />
                  {isMobile ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-11 text-sm justify-between w-full">
                          <span className="truncate">Source & Score Filters</span>
                          <Filter className="h-4 w-4 ml-2 flex-shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-3 bg-background z-[70]" align="start">
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium mb-1.5 block">Source</label>
                            <Select value={shortListSourceFilter} onValueChange={setShortListSourceFilter}>
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-[80] bg-background">
                                <SelectItem value="all">All Sources</SelectItem>
                                <SelectItem value="Itris">Itris</SelectItem>
                                <SelectItem value="Linkedin">LinkedIn</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-xs font-medium mb-1.5 block">Score</label>
                            <Select value={shortListScoreFilter} onValueChange={setShortListScoreFilter}>
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-[80] bg-background">
                                <SelectItem value="all">All Scores</SelectItem>
                                <SelectItem value="90+">90+</SelectItem>
                                <SelectItem value="85+">85+</SelectItem>
                                <SelectItem value="80+">80+</SelectItem>
                                <SelectItem value="75+">75+</SelectItem>
                                <SelectItem value="70+">70+</SelectItem>
                                <SelectItem value="high">High (85+)</SelectItem>
                                <SelectItem value="medium">Medium (70-84)</SelectItem>
                                <SelectItem value="low">Low (&lt;70)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <>
                      <Select value={shortListSourceFilter} onValueChange={setShortListSourceFilter}>
                        <SelectTrigger className="h-11 sm:h-9 text-sm min-w-0 w-full">
                          <SelectValue placeholder="Source" className="truncate" />
                        </SelectTrigger>
                        <SelectContent className="z-[60] bg-popover">
                          <SelectItem value="all">All Sources</SelectItem>
                          <SelectItem value="Itris">Itris</SelectItem>
                          <SelectItem value="Linkedin">LinkedIn</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={shortListScoreFilter} onValueChange={setShortListScoreFilter}>
                        <SelectTrigger className="h-11 sm:h-9 text-sm min-w-0 w-full">
                          <SelectValue placeholder="Score" className="truncate" />
                        </SelectTrigger>
                        <SelectContent className="z-[60] bg-popover">
                          <SelectItem value="all">All Scores</SelectItem>
                          <SelectItem value="90+">90+</SelectItem>
                          <SelectItem value="85+">85+</SelectItem>
                          <SelectItem value="80+">80+</SelectItem>
                          <SelectItem value="75+">75+</SelectItem>
                          <SelectItem value="70+">70+</SelectItem>
                          <SelectItem value="high">High (85+)</SelectItem>
                          <SelectItem value="medium">Medium (70-84)</SelectItem>
                          <SelectItem value="low">Low (&lt;70)</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {withinBudgetCandidates.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <Star className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2">No within-budget candidates yet</h3>
                    <p className="text-sm sm:text-base text-muted-foreground px-4">High-scoring candidates within budget will appear here</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px] w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 pr-2 sm:pr-4 w-full max-w-full">
                      {(() => {
                        // Group within budget candidates by user_id and sort by score
                        const groupedWithinBudget = withinBudgetCandidates.reduce(
                          (acc, candidate) => {
                            const candidateId = candidate["user_id"] || candidate["Candidate_ID"];
                            if (!acc[candidateId]) {
                              acc[candidateId] = [];
                            }
                            acc[candidateId].push(candidate);
                            return acc;
                          },
                          {} as Record<string, any[]>,
                        );

                        // Convert to array and sort by highest Overall Score first
                        const sortedCandidateEntries = Object.entries(groupedWithinBudget).sort(
                          ([, candidateContactsA], [, candidateContactsB]) => {
                            const candidateA = candidateContactsA[0];
                            const candidateB = candidateContactsB[0];

                            // Use the calculateOverallScore function for consistent scoring
                            const overallScoreA = calculateOverallScore(candidateA);
                            const overallScoreB = calculateOverallScore(candidateB);
                            return overallScoreB - overallScoreA; // Sort in descending order (highest Overall Score first)
                          },
                        );
                        return sortedCandidateEntries.map(
                          ([candidateId, candidateContacts]: [string, any[]], index: number) => {
                            const mainCandidate = candidateContacts[0];
                            const isTopCandidate = index < 3; // Top 3 candidates get golden effect
                            return renderCandidateCard(candidateId, candidateContacts, mainCandidate, isTopCandidate);
                          },
                        );
                      })()}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Above Budget Section */}
            <Card className="max-w-full overflow-hidden">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  Above Budget ({aboveBudgetCandidates.length} candidates)
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  High-scoring candidates with salary expectations more than 20% above budget (
                  {formatCurrency(budgetThreshold.toString(), job?.Currency)}+)
                </CardDescription>

                {/* AI Short List Filters - Single Line */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t min-w-0">
                  <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Name..."
                      value={shortListNameFilter}
                      onChange={(e) => setShortListNameFilter(e.target.value)}
                      className="pl-10 h-9 text-sm"
                    />
                  </div>
                  <Input
                    placeholder="Email..."
                    value={shortListEmailFilter}
                    onChange={(e) => setShortListEmailFilter(e.target.value)}
                    className="h-9 text-sm min-w-0 flex-1"
                  />
                  <Input
                    placeholder="Phone..."
                    value={shortListPhoneFilter}
                    onChange={(e) => setShortListPhoneFilter(e.target.value)}
                    className="h-9 text-sm min-w-0 flex-1"
                  />
                  <Input
                    placeholder="User ID..."
                    value={shortListUserIdFilter}
                    onChange={(e) => setShortListUserIdFilter(e.target.value)}
                    className="h-9 text-sm min-w-0 flex-1"
                  />
                  <Input
                    placeholder="Source..."
                    value={shortListSourceFilter}
                    onChange={(e) => setShortListSourceFilter(e.target.value)}
                    className="h-9 text-sm min-w-0 flex-1"
                  />
                  <Select value={shortListSourceFilter} onValueChange={setShortListSourceFilter}>
                    <SelectTrigger className="h-9 text-sm w-32">
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent className="z-[70] bg-background">
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="Itris">Itris</SelectItem>
                      <SelectItem value="Linkedin">LinkedIn</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={shortListScoreFilter} onValueChange={setShortListScoreFilter}>
                    <SelectTrigger className="h-9 text-sm w-32">
                      <SelectValue placeholder="Score" />
                    </SelectTrigger>
                    <SelectContent className="z-[70] bg-background">
                      <SelectItem value="all">All Scores</SelectItem>
                      <SelectItem value="90+">90+</SelectItem>
                      <SelectItem value="85+">85+</SelectItem>
                      <SelectItem value="80+">80+</SelectItem>
                      <SelectItem value="75+">75+</SelectItem>
                      <SelectItem value="70+">70+</SelectItem>
                      <SelectItem value="high">High (85+)</SelectItem>
                      <SelectItem value="medium">Medium (70-84)</SelectItem>
                      <SelectItem value="low">Low (&lt;70)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {aboveBudgetCandidates.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No above-budget candidates</h3>
                    <p className="text-muted-foreground">High-scoring candidates above budget will appear here</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px] w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 pr-2 sm:pr-4 w-full max-w-full">
                      {(() => {
                        // Group above budget candidates by user_id and sort by Overall Score
                        const groupedAboveBudget = aboveBudgetCandidates.reduce(
                          (acc, candidate) => {
                            const candidateId = candidate["user_id"] || candidate["Candidate_ID"];
                            if (!acc[candidateId]) {
                              acc[candidateId] = [];
                            }
                            acc[candidateId].push(candidate);
                            return acc;
                          },
                          {} as Record<string, any[]>,
                        );

                        // Sort by Overall Score descending (highest first)
                        const sortedAboveBudgetEntries = Object.entries(groupedAboveBudget).sort(
                          ([, candidateContactsA], [, candidateContactsB]) => {
                            const candidateA = candidateContactsA[0];
                            const candidateB = candidateContactsB[0];

                            // Use the calculateOverallScore function for consistent scoring
                            const overallScoreA = calculateOverallScore(candidateA);
                            const overallScoreB = calculateOverallScore(candidateB);
                            return overallScoreB - overallScoreA; // Sort in descending order (highest Overall Score first)
                          },
                        );
                        return sortedAboveBudgetEntries.map(([candidateId, candidateContacts]: [string, any[]]) => {
                          const mainCandidate = candidateContacts[0];
                          return renderCandidateCard(candidateId, candidateContacts, mainCandidate);
                        });
                      })()}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Not in Preferred Nationality Section */}
            <Card className="max-w-full overflow-hidden">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  Not in Preferred Nationality ({notInPreferredNationalityCandidates.length} candidates)
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  High-scoring candidates whose nationality doesn't match the preferred nationality:{" "}
                  {job?.prefered_nationality || "N/A"}
                </CardDescription>

                {/* AI Short List Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t min-w-0">
                  <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Name..."
                      value={shortListNameFilter}
                      onChange={(e) => setShortListNameFilter(e.target.value)}
                      className="pl-10 h-9 text-sm"
                    />
                  </div>
                  <Input
                    placeholder="Email..."
                    value={shortListEmailFilter}
                    onChange={(e) => setShortListEmailFilter(e.target.value)}
                    className="h-9 text-sm min-w-0 flex-1"
                  />
                  <Input
                    placeholder="Phone..."
                    value={shortListPhoneFilter}
                    onChange={(e) => setShortListPhoneFilter(e.target.value)}
                    className="h-9 text-sm min-w-0 flex-1"
                  />
                  <Input
                    placeholder="User ID..."
                    value={shortListUserIdFilter}
                    onChange={(e) => setShortListUserIdFilter(e.target.value)}
                    className="h-9 text-sm min-w-0 flex-1"
                  />
                  <Input
                    placeholder="Source..."
                    value={shortListSourceFilter}
                    onChange={(e) => setShortListSourceFilter(e.target.value)}
                    className="h-9 text-sm min-w-0 flex-1"
                  />
                  <Select value={shortListSourceFilter} onValueChange={setShortListSourceFilter}>
                    <SelectTrigger className="h-9 text-sm w-32">
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent className="z-[70] bg-background">
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="Itris">Itris</SelectItem>
                      <SelectItem value="Linkedin">LinkedIn</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={shortListScoreFilter} onValueChange={setShortListScoreFilter}>
                    <SelectTrigger className="h-9 text-sm w-32">
                      <SelectValue placeholder="Score" />
                    </SelectTrigger>
                    <SelectContent className="z-[70] bg-background">
                      <SelectItem value="all">All Scores</SelectItem>
                      <SelectItem value="90+">90+</SelectItem>
                      <SelectItem value="85+">85+</SelectItem>
                      <SelectItem value="80+">80+</SelectItem>
                      <SelectItem value="75+">75+</SelectItem>
                      <SelectItem value="70+">70+</SelectItem>
                      <SelectItem value="high">High (85+)</SelectItem>
                      <SelectItem value="medium">Medium (70-84)</SelectItem>
                      <SelectItem value="low">Low (&lt;70)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {notInPreferredNationalityCandidates.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No nationality mismatch candidates</h3>
                    <p className="text-muted-foreground">
                      Candidates not matching preferred nationality will appear here
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px] w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 pr-2 sm:pr-4 w-full max-w-full">
                      {(() => {
                        // Group nationality mismatch candidates by user_id and sort by Overall Score
                        const groupedNationalityMismatch = notInPreferredNationalityCandidates.reduce(
                          (acc, candidate) => {
                            const candidateId = candidate["user_id"] || candidate["Candidate_ID"];
                            if (!acc[candidateId]) {
                              acc[candidateId] = [];
                            }
                            acc[candidateId].push(candidate);
                            return acc;
                          },
                          {} as Record<string, any[]>,
                        );

                        // Sort by Overall Score descending (highest first)
                        const sortedNationalityMismatchEntries = Object.entries(groupedNationalityMismatch).sort(
                          ([, candidateContactsA], [, candidateContactsB]) => {
                            const candidateA = candidateContactsA[0];
                            const candidateB = candidateContactsB[0];

                            // Use the calculateOverallScore function for consistent scoring
                            const overallScoreA = calculateOverallScore(candidateA);
                            const overallScoreB = calculateOverallScore(candidateB);
                            return overallScoreB - overallScoreA; // Sort in descending order (highest Overall Score first)
                          },
                        );
                        return sortedNationalityMismatchEntries.map(
                          ([candidateId, candidateContacts]: [string, any[]]) => {
                            const mainCandidate = candidateContacts[0];
                            return renderCandidateCard(candidateId, candidateContacts, mainCandidate);
                          },
                        );
                      })()}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Rejected Candidates Section */}
            <Card className="max-w-full overflow-hidden">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
                  <X className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  Rejected Candidates ({filteredRejectedCandidates.length} candidates)
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  High-scoring candidates who have been rejected from the shortlist
                </CardDescription>

                {/* AI Short List Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t min-w-0">
                  <div className="relative min-w-0">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 flex-shrink-0" />
                    <Input
                      placeholder="Name..."
                      value={shortListNameFilter}
                      onChange={(e) => setShortListNameFilter(e.target.value)}
                      className="pl-10 h-11 sm:h-9 text-sm min-w-0 w-full"
                    />
                  </div>
                  <Input
                    placeholder="Email..."
                    value={shortListEmailFilter}
                    onChange={(e) => setShortListEmailFilter(e.target.value)}
                    className="h-11 sm:h-9 text-sm min-w-0 w-full"
                  />
                  <Input
                    placeholder="Phone..."
                    value={shortListPhoneFilter}
                    onChange={(e) => setShortListPhoneFilter(e.target.value)}
                    className="h-11 sm:h-9 text-sm min-w-0 w-full"
                  />
                  <Input
                    placeholder="User ID..."
                    value={shortListUserIdFilter}
                    onChange={(e) => setShortListUserIdFilter(e.target.value)}
                    className="h-11 sm:h-9 text-sm min-w-0 w-full"
                  />
                  {isMobile ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-11 text-sm justify-between w-full">
                          <span className="truncate">Source & Score Filters</span>
                          <Filter className="h-4 w-4 ml-2 flex-shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-3 bg-background z-[70]" align="start">
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium mb-1.5 block">Source</label>
                            <Select value={shortListSourceFilter} onValueChange={setShortListSourceFilter}>
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-[80] bg-background">
                                <SelectItem value="all">All Sources</SelectItem>
                                <SelectItem value="Itris">Itris</SelectItem>
                                <SelectItem value="Linkedin">LinkedIn</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-xs font-medium mb-1.5 block">Score</label>
                            <Select value={shortListScoreFilter} onValueChange={setShortListScoreFilter}>
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-[80] bg-background">
                                <SelectItem value="all">All Scores</SelectItem>
                                <SelectItem value="90+">90+</SelectItem>
                                <SelectItem value="85+">85+</SelectItem>
                                <SelectItem value="80+">80+</SelectItem>
                                <SelectItem value="75+">75+</SelectItem>
                                <SelectItem value="70+">70+</SelectItem>
                                <SelectItem value="high">High (85+)</SelectItem>
                                <SelectItem value="medium">Medium (70-84)</SelectItem>
                                <SelectItem value="low">Low (&lt;70)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <>
                      <Select value={shortListSourceFilter} onValueChange={setShortListSourceFilter}>
                        <SelectTrigger className="h-11 sm:h-9 text-sm min-w-0 w-full">
                          <SelectValue placeholder="Source" className="truncate" />
                        </SelectTrigger>
                        <SelectContent className="z-[60] bg-popover">
                          <SelectItem value="all">All Sources</SelectItem>
                          <SelectItem value="Itris">Itris</SelectItem>
                          <SelectItem value="Linkedin">LinkedIn</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={shortListScoreFilter} onValueChange={setShortListScoreFilter}>
                        <SelectTrigger className="h-11 sm:h-9 text-sm min-w-0 w-full">
                          <SelectValue placeholder="Score" className="truncate" />
                        </SelectTrigger>
                        <SelectContent className="z-[60] bg-popover">
                          <SelectItem value="all">All Scores</SelectItem>
                          <SelectItem value="90+">90+</SelectItem>
                          <SelectItem value="85+">85+</SelectItem>
                          <SelectItem value="80+">80+</SelectItem>
                          <SelectItem value="75+">75+</SelectItem>
                          <SelectItem value="70+">70+</SelectItem>
                          <SelectItem value="high">High (85+)</SelectItem>
                          <SelectItem value="medium">Medium (70-84)</SelectItem>
                          <SelectItem value="low">Low (&lt;70)</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {filteredRejectedCandidates.length === 0 ? (
                  <div className="text-center py-8">
                    <X className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No rejected candidates</h3>
                    <p className="text-muted-foreground">
                      Rejected candidates from the shortlist will appear here
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px] w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 pr-2 sm:pr-4 w-full max-w-full">
                      {(() => {
                        // Group rejected candidates by user_id and sort by Overall Score
                        const groupedRejected = filteredRejectedCandidates.reduce(
                          (acc, candidate) => {
                            const candidateId = candidate["user_id"] || candidate["Candidate_ID"];
                            if (!acc[candidateId]) {
                              acc[candidateId] = [];
                            }
                            acc[candidateId].push(candidate);
                            return acc;
                          },
                          {} as Record<string, any[]>,
                        );

                        // Sort by Overall Score descending (highest first)
                        const sortedRejectedEntries = Object.entries(groupedRejected).sort(
                          ([, candidateContactsA], [, candidateContactsB]) => {
                            const candidateA = candidateContactsA[0];
                            const candidateB = candidateContactsB[0];

                            // Use the calculateOverallScore function for consistent scoring
                            const overallScoreA = calculateOverallScore(candidateA);
                            const overallScoreB = calculateOverallScore(candidateB);
                            return overallScoreB - overallScoreA; // Sort in descending order (highest Overall Score first)
                          },
                        );
                        return sortedRejectedEntries.map(
                          ([candidateId, candidateContacts]: [string, any[]]) => {
                            const mainCandidate = candidateContacts[0];
                            return renderCandidateCard(candidateId, candidateContacts, mainCandidate);
                          },
                        );
                      })()}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Pipeline Section */}
            <Card className="max-w-full overflow-hidden">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
                  <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 text-purple-500" />
                  Pipeline ({pipelineShortListCandidates.length} candidates)
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  Candidates who have been moved to the pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pipelineShortListCandidates.length === 0 ? (
                  <div className="text-center py-8">
                    <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No pipeline candidates</h3>
                    <p className="text-muted-foreground">
                      Candidates added to the pipeline will appear here
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px] w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 pr-2 sm:pr-4 w-full max-w-full">
                      {(() => {
                        const grouped = pipelineShortListCandidates.reduce((acc, candidate) => {
                          const cId = candidate["user_id"] || candidate["Candidate_ID"];
                          if (!acc[cId]) acc[cId] = [];
                          acc[cId].push(candidate);
                          return acc;
                        }, {} as Record<string, any[]>);

                        return Object.entries(grouped)
                          .sort(([, a], [, b]) => calculateOverallScore(b[0]) - calculateOverallScore(a[0]))
                          .map(([candidateId, candidateContacts]) => {
                            const mainCandidate = candidateContacts[0];
                            return renderCandidateCard(candidateId, candidateContacts, mainCandidate);
                          });
                      })()}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-3 sm:space-y-6 pb-20 sm:pb-32 max-w-full">
          <div className="space-y-4 sm:space-y-6">
            {analyticsLoading ? (
              <Card className="max-w-full overflow-hidden">
                <CardContent className="p-6 text-center">
                  <p>Loading analytics...</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Job Timeline Card */}
                <Card className="max-w-full overflow-hidden">
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                      Job Timeline
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-1">
                      Key milestones and time taken for recruitment stages
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center mb-2">
                          <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span className="text-sm font-medium">Job Added</span>
                        </div>
                        <p className="text-lg font-semibold">
                          {analyticsData.jobAddedDate
                            ? format(new Date(analyticsData.jobAddedDate), "dd MMM yyyy, HH:mm")
                            : "N/A"}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center mb-2">
                          <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span className="text-sm font-medium">Time to Longlist</span>
                        </div>
                        {analyticsData.timeToLonglist !== null ? (
                          <div className="mt-2 p-2 rounded-md bg-primary/10 border border-primary/20">
                            <p className="text-lg font-semibold text-primary">
                              {formatDuration(analyticsData.timeToLonglist)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              From job creation to first longlist
                            </p>
                          </div>
                        ) : (
                          <p className="text-lg font-semibold">
                            No longlisted candidates yet
                          </p>
                        )}
                      </div>

                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center mb-2">
                          <Star className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span className="text-sm font-medium">Average Time to Shortlist</span>
                        </div>
                        {analyticsData.averageTimeToShortlist !== null ? (
                          <div className="mt-2 p-2 rounded-md bg-primary/10 border border-primary/20">
                            <p className="text-lg font-semibold text-primary">
                              {formatDuration(analyticsData.averageTimeToShortlist)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              From first longlist to shortlist
                            </p>
                          </div>
                        ) : (
                          <p className="text-lg font-semibold">
                            No shortlisted candidates yet
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Time to Shortlist First 6 Candidates Card */}
                {analyticsData.shortlistedCandidates.length > 0 && (
                  <Card className="max-w-full overflow-hidden">
                    <CardHeader className="p-3 sm:p-6">
                      <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                        Time to Shortlist (First 6 Candidates)
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm mt-1">
                        Time taken to shortlist each of the first 6 candidates from first longlist
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {analyticsData.shortlistedCandidates.map((candidate, index) => (
                          <div key={index} className="p-4 rounded-lg bg-muted/50 border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="text-xs">
                                #{index + 1}
                              </Badge>
                              <UserCheck className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium mb-1 truncate" title={candidate.candidate_name || "Unknown"}>
                              {candidate.candidate_name || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground mb-2">
                              {format(new Date(candidate.shortlisted_at), "dd MMM, HH:mm")}
                            </p>
                            <div className="p-2 rounded-md bg-primary/10 border border-primary/20">
                              <p className="text-xs font-semibold text-primary">
                                {formatDuration(candidate.timeFromLonglist)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}


                {/* Source Statistics Card */}
                <Card className="max-w-full overflow-hidden">
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                      Source Statistics
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-1">
                      Breakdown of candidates by source ({analyticsData.totalCandidates} total candidates)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6">
                    {Object.keys(analyticsData.sourceCounts).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(analyticsData.sourceCounts)
                          .sort(([, a], [, b]) => b - a)
                          .map(([source, count]) => (
                            <div key={source} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="font-medium">{source || "Unknown"}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="w-32 sm:w-48 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{
                                      width: `${(count / analyticsData.totalCandidates) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-lg font-semibold w-12 text-right">{count}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No candidate data available yet
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Submitted Candidates Card */}
                {analyticsData.submittedCandidates.length > 0 && (
                  <Card className="max-w-full overflow-hidden border-emerald-500/30">
                    <CardHeader className="p-3 sm:p-6 bg-emerald-500/10">
                      <CardTitle className="flex items-center text-base sm:text-lg md:text-xl text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Submitted Candidates ({analyticsData.submittedCandidates.length})
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm mt-1">
                        Candidates whose CVs have been submitted to the client
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {analyticsData.submittedCandidates.map((candidate, index) => (
                          <div key={index} className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                            <Badge className="text-xs mb-2 bg-emerald-600 text-white">Submitted</Badge>
                            <p className="text-sm font-medium truncate">{candidate.candidate_name || "Unknown"}</p>
                            {candidate.submitted_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(candidate.submitted_at), "dd MMM yyyy, HH:mm")}
                              </p>
                            )}
                            <div className="mt-2 p-2 rounded-md bg-emerald-500/20 border border-emerald-500/30">
                              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                {candidate.timeToSubmit !== null 
                                  ? `⏱️ ${formatDuration(candidate.timeToSubmit)} from shortlist`
                                  : "⏱️ Duration unavailable"}
                              </p>
                            </div>
                            {candidate.reason && (
                              <p className="text-xs mt-2 text-emerald-600 dark:text-emerald-400 line-clamp-2">{candidate.reason}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Rejected Candidates Card */}
                {analyticsData.rejectedCandidates.length > 0 && (
                  <Card className="max-w-full overflow-hidden border-red-500/30">
                    <CardHeader className="p-3 sm:p-6 bg-red-500/10">
                      <CardTitle className="flex items-center text-base sm:text-lg md:text-xl text-red-600 dark:text-red-400">
                        <X className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Rejected Candidates ({analyticsData.rejectedCandidates.length})
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm mt-1">
                        Candidates who have been rejected from this job
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {analyticsData.rejectedCandidates.map((candidate, index) => (
                          <div key={index} className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                            <Badge variant="destructive" className="text-xs mb-2">Rejected</Badge>
                            <p className="text-sm font-medium truncate">{candidate.candidate_name || "Unknown"}</p>
                            {candidate.rejected_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(candidate.rejected_at), "dd MMM yyyy, HH:mm")}
                              </p>
                            )}
                            <div className="mt-2 p-2 rounded-md bg-red-500/20 border border-red-500/30">
                              <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                                {candidate.timeToReject !== null 
                                  ? `⏱️ ${formatDuration(candidate.timeToReject)} from shortlist`
                                  : "⏱️ Duration unavailable"}
                              </p>
                            </div>
                            {candidate.reason && (
                              <p className="text-xs mt-2 text-red-600 dark:text-red-400 line-clamp-2">{candidate.reason}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </TabsContent>

        {/* Similar Jobs Tab Content */}
        <TabsContent value="similar-jobs" className="space-y-3 sm:space-y-6 pb-20 sm:pb-32 max-w-full">
          <Card className="max-w-full overflow-hidden">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Shortlisted from Similar Jobs
                    <Badge variant="secondary" className="ml-2">
                      {similarJobsCandidates.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    Candidates shortlisted from similar job positions
                  </CardDescription>
                </div>
                {similarJobsSelectedCandidates.size > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSimilarJobsSelectedCandidates(new Set())}
                      className="h-8"
                    >
                      Clear
                    </Button>
                    <Badge variant="outline" className="h-8 px-3 flex items-center">
                      {similarJobsSelectedCandidates.size} selected
                    </Badge>
                    <Button
                      size="sm"
                      className="h-8 bg-primary hover:bg-primary/90"
                      onClick={() => {
                        similarJobsSelectedCandidates.forEach((candidateId) => {
                          const candidate = similarJobsCandidates.find(
                            (c) => (c.user_id || c.recordid?.toString()) === candidateId
                          );
                          if (candidate) {
                            handleCallCandidate(
                              candidate.recordid?.toString() || candidateId,
                              job.job_id,
                              candidate.recordid
                            );
                          }
                        });
                      }}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call Selected
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              {/* Filters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                <Input
                  placeholder="Filter by name..."
                  value={similarJobsNameFilter}
                  onChange={(e) => setSimilarJobsNameFilter(e.target.value)}
                  className="h-9"
                />
                <Input
                  placeholder="Filter by email..."
                  value={similarJobsEmailFilter}
                  onChange={(e) => setSimilarJobsEmailFilter(e.target.value)}
                  className="h-9"
                />
                <Input
                  placeholder="Filter by phone..."
                  value={similarJobsPhoneFilter}
                  onChange={(e) => setSimilarJobsPhoneFilter(e.target.value)}
                  className="h-9"
                />
                <Input
                  placeholder="Filter by user ID..."
                  value={similarJobsUserIdFilter}
                  onChange={(e) => setSimilarJobsUserIdFilter(e.target.value)}
                  className="h-9"
                />
              </div>

              {/* Select All */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                <Checkbox
                  checked={
                    similarJobsCandidates.length > 0 &&
                    similarJobsSelectedCandidates.size === similarJobsCandidates.length
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const allIds = new Set(
                        similarJobsCandidates.map((c) => c.user_id || c.recordid?.toString())
                      );
                      setSimilarJobsSelectedCandidates(allIds);
                    } else {
                      setSimilarJobsSelectedCandidates(new Set());
                    }
                  }}
                />
                <span className="text-sm text-muted-foreground">Select All</span>
              </div>

              {similarJobsLoading ? (
                <div className="text-center py-8">
                  <p>Loading candidates...</p>
                </div>
              ) : (() => {
                const filteredCandidates = similarJobsCandidates.filter((candidate) => {
                  const nameMatch =
                    !similarJobsNameFilter ||
                    (candidate.candidate_name || "").toLowerCase().includes(similarJobsNameFilter.toLowerCase());
                  const emailMatch =
                    !similarJobsEmailFilter ||
                    (candidate.candidate_email || "").toLowerCase().includes(similarJobsEmailFilter.toLowerCase());
                  const phoneMatch =
                    !similarJobsPhoneFilter ||
                    (candidate.candidate_phone_number || "").includes(similarJobsPhoneFilter);
                  const userIdMatch =
                    !similarJobsUserIdFilter ||
                    (candidate.user_id || "").toString().includes(similarJobsUserIdFilter);
                  return nameMatch && emailMatch && phoneMatch && userIdMatch;
                });

                return filteredCandidates.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No candidates from similar jobs</h3>
                    <p className="text-muted-foreground">
                      Candidates shortlisted from similar job positions will appear here
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px] w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 pr-2 sm:pr-4 w-full max-w-full">
                      {filteredCandidates.map((candidate) => {
                        const candidateId = candidate.user_id || candidate.recordid?.toString();
                        const isSelected = similarJobsSelectedCandidates.has(candidateId);
                        
                        return (
                          <Card
                            key={candidateId}
                            id={`similar-candidate-card-${candidateId}`}
                            className={cn(
                              "border border-border/50 hover:border-primary/50 transition-colors hover:shadow-lg max-w-full overflow-hidden",
                              isSelected && "border-primary bg-primary/5"
                            )}
                          >
                            <CardContent className="p-3 sm:p-4">
                              <div className="space-y-2 sm:space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() => {
                                        const newSelected = new Set(similarJobsSelectedCandidates);
                                        if (isSelected) {
                                          newSelected.delete(candidateId);
                                        } else {
                                          newSelected.add(candidateId);
                                        }
                                        setSimilarJobsSelectedCandidates(newSelected);
                                      }}
                                      className="mt-1"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-semibold text-xs sm:text-sm md:text-base line-clamp-2">
                                        {candidate.candidate_name || candidate.candidate_email?.split("@")[0] || `Candidate ${candidateId}`}
                                      </h4>
                                    </div>
                                  </div>
                                  {candidate.source && (
                                    <Badge variant="outline" className="text-xs shrink-0">
                                      {candidate.source}
                                    </Badge>
                                  )}
                                </div>

                                <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                                  {candidate.candidate_email && (
                                    <div className="flex items-center">
                                      <Mail className="w-4 h-4 mr-2" />
                                      <span className="truncate">{candidate.candidate_email}</span>
                                    </div>
                                  )}
                                  {candidate.candidate_phone_number && (
                                    <div className="flex items-center">
                                      <Phone className="w-4 h-4 mr-2" />
                                      <span className="truncate">{candidate.candidate_phone_number}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Scores Section */}
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                      {(candidate.source || "").toLowerCase().includes("linkedin") ? "LinkedIn Score:" : "CV Score:"}
                                    </span>
                                    {(() => {
                                      const score = (candidate.source || "").toLowerCase().includes("linkedin")
                                        ? (candidate.linkedin_score ?? candidate.cv_score ?? "N/A")
                                        : (candidate.cv_score ?? "N/A");
                                      const numScore = parseInt(score);
                                      let scoreClass = "font-medium";
                                      if (!isNaN(numScore)) {
                                        if (numScore < 50) {
                                          scoreClass = "font-bold text-red-600 dark:text-red-400";
                                        } else if (numScore < 75) {
                                          scoreClass = "font-medium text-amber-600 dark:text-amber-400";
                                        } else {
                                          scoreClass = "font-medium text-green-600 dark:text-green-400";
                                        }
                                      }
                                      return <span className={scoreClass}>{score}</span>;
                                    })()}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">User ID:</span>
                                    <span className="font-mono text-xs">{candidate.user_id || "N/A"}</span>
                                  </div>
                                </div>

                                {/* Status Badge */}
                                <div className="pt-2 border-t">
                                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                                    Shortlisted from Similar Jobs
                                  </Badge>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="h-8 text-xs w-full"
                                    disabled={callingCandidateId === candidateId}
                                    onClick={() =>
                                      handleCallCandidate(
                                        candidate.recordid?.toString() || candidateId,
                                        job.job_id,
                                        candidate.recordid
                                      )
                                    }
                                  >
                                    <Phone className="w-3 h-3 mr-1" />
                                    {callingCandidateId === candidateId ? "Calling..." : "Call"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs w-full"
                                    onClick={() =>
                                      navigate(`/call-log-details?recordId=${candidate.recordid}&jobId=${job.job_id}&fromTab=similar-jobs`)
                                    }
                                  >
                                    <FileText className="w-3 h-3 mr-1" />
                                    Call Log
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs w-full"
                                    onClick={() =>
                                      navigate(`/candidate/${candidate.user_id}`, {
                                        state: {
                                          fromJob: id,
                                          tab: "similar-jobs",
                                          focusCandidateId: candidateId,
                                        },
                                      })
                                    }
                                  >
                                    <User className="w-3 h-3 mr-1" />
                                    View Profile
                                  </Button>
                                  {/* Submit CV Button */}
                                  {candidate.contacted !== "Submitted" && candidate.contacted !== "Rejected" ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 text-xs w-full border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                                      onClick={() => openHireDialog(job.job_id, candidateId, candidate.recordid)}
                                    >
                                      <FileCheck className="w-3 h-3 mr-1" />
                                      Submit CV
                                    </Button>
                                  ) : candidate.contacted === "Submitted" ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 text-xs w-full border-blue-500 text-blue-600 cursor-default"
                                      disabled
                                    >
                                      <FileCheck className="w-3 h-3 mr-1" />
                                      Submitted
                                    </Button>
                                  ) : (
                                    <div />
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <JobDialog
        job={job}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={() => {
          fetchJob(id!);
          setIsEditDialogOpen(false);
        }}
      />

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Long List</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to regenerate Long List?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirmDialog(false);
                handleGenerateLongList();
              }}
            >
              Yes, Regenerate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Interview Scheduling Dialog */}
      <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Interview Slots</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 overflow-y-auto max-h-[70vh] px-1">
            <p className="text-sm text-muted-foreground">
              Please select 3 preferred interview slots and interview type. Only future dates are allowed, and times
              must be in 15-minute intervals.
            </p>

            {/* Interview Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Interview Type</label>
              <Select value={interviewType} onValueChange={setInterviewType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select interview type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Online Meeting">Online Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Interview Link Input */}
            {interviewType === "Online Meeting" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Interview Link</label>
                <Input
                  type="url"
                  placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                  value={interviewLink}
                  onChange={(e) => setInterviewLink(e.target.value)}
                  className="w-full"
                />
              </div>
            )}

            {interviewSlots.map((slot, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Slot {index + 1}</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  {/* Date Picker */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !slot.date && "text-muted-foreground",
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {slot.date ? format(slot.date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={slot.date}
                          onSelect={(date) => updateInterviewSlot(index, "date", date!)}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time Picker */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time</label>
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      {/* Hours */}
                      <Select
                        value={slot.time.split(":")[0] || ""}
                        onValueChange={(hour) => {
                          const minute = slot.time.split(":")[1] || "00";
                          const newTime = `${hour}:${minute}`;

                          // Validate time is not in the past for today
                          if (slot.date) {
                            const today = new Date();
                            const slotDate = format(slot.date, "yyyy-MM-dd");
                            const currentDate = format(today, "yyyy-MM-dd");
                            const currentTime = format(today, "HH:mm");
                            if (slotDate === currentDate && newTime <= currentTime) {
                              alert("Cannot select a time in the past for today");
                              return;
                            }
                          }
                          updateInterviewSlot(index, "time", newTime);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Hour" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            {
                              length: 24,
                            },
                            (_, i) => (
                              <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                                {i.toString().padStart(2, "0")}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>

                      {/* Minutes */}
                      <Select
                        value={slot.time.split(":")[1] || ""}
                        onValueChange={(minute) => {
                          const hour = slot.time.split(":")[0] || "09";
                          const newTime = `${hour}:${minute}`;

                          // Validate time is not in the past for today
                          if (slot.date) {
                            const today = new Date();
                            const slotDate = format(slot.date, "yyyy-MM-dd");
                            const currentDate = format(today, "yyyy-MM-dd");
                            const currentTime = format(today, "HH:mm");
                            if (slotDate === currentDate && newTime <= currentTime) {
                              alert("Cannot select a time in the past for today");
                              return;
                            }
                          }
                          updateInterviewSlot(index, "time", newTime);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Min" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((minute) => (
                            <SelectItem key={minute} value={minute}>
                              {minute}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end space-x-2 pt-4 sticky bottom-0 bg-background border-t">
              <Button variant="outline" onClick={() => setInterviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleInterview} className="bg-emerald-600 hover:bg-emerald-700">
                Schedule Interview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Candidate Confirmation Dialog */}
      <AlertDialog open={!!candidateToRemove} onOpenChange={() => setCandidateToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Candidate</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to remove {candidateToRemove?.name}?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveFromLongList}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Notes Dialog for AI Shortlist Cards */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notes — {notesDialogCandidate?.["Candidate Name"] || "Candidate"}</DialogTitle>
            <DialogDescription>
              Add or edit notes for this candidate. Notes will also appear in the Call Details page.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Add your notes..."
            value={notesDialogValue}
            onChange={(e) => setNotesDialogValue(e.target.value)}
            className="min-h-[150px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCardNotes} disabled={notesSaving}>
              {notesSaving ? "Saving..." : "Save Notes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Candidate Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Candidate</DialogTitle>
            <DialogDescription>Please select a reason for rejecting this candidate.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason *</label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select rejection reason..." />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="Overbudget">Overbudget</SelectItem>
                  <SelectItem value="Notice Period">Notice Period</SelectItem>
                  <SelectItem value="Lack Mandatory Skills">Lack Mandatory Skills</SelectItem>
                  <SelectItem value="Not Cultural Fit">Not Cultural Fit</SelectItem>
                  <SelectItem value="Communication Skills">Communication Skills</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Information *</label>
              <Textarea
                placeholder="Please provide additional details about this rejection..."
                value={rejectAdditionalInfo}
                onChange={(e) => setRejectAdditionalInfo(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
                setRejectAdditionalInfo("");
                setRejectCandidateData(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleRejectCandidate(rejectReason)}
              disabled={!rejectReason || !rejectAdditionalInfo.trim()}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hire Candidate Dialog */}
      <Dialog
        open={showHireDialog}
        onOpenChange={(open) => {
          if (!open) {
            // If closing, reset state
            setShowHireDialog(false);
            setHireReason("");
            setHireAdditionalInfo("");
            setHireCandidateData(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit CV - Select Reason</DialogTitle>
            <DialogDescription>
              Please select a reason for submitting this candidate. The CV will be marked as "Submitted" once you save.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Submit Reason *</label>
              <Select value={hireReason} onValueChange={setHireReason}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select submit reason..." />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="Perfect Fit">Perfect Fit</SelectItem>
                  <SelectItem value="Backup Option">Backup Option</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Information *</label>
              <Textarea
                placeholder="Please provide additional details about this submission..."
                value={hireAdditionalInfo}
                onChange={(e) => setHireAdditionalInfo(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowHireDialog(false);
                setHireReason("");
                setHireAdditionalInfo("");
                setHireCandidateData(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleHireCandidate}
              disabled={!hireReason || !hireAdditionalInfo.trim()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Save & Submit CV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
