// @ts-nocheck
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ArrowLeft, MapPin, Calendar, Banknote, Users, FileText, Clock, Target, Phone, Mail, Star, Search, Filter, Upload, Zap, X, UserCheck, ExternalLink, CheckCircle, AlertCircle, AlertTriangle, Hourglass, User, FileCheck, Building } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { JobFunnel } from "@/components/jobs/JobFunnel";
import { JobDialog } from "@/components/jobs/JobDialog";
import { StatusDropdown } from "@/components/candidates/StatusDropdown";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Using any type to avoid TypeScript complexity with quoted property names

export default function JobDetails() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const {
    profile
  } = useProfile();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [automaticDialSaving, setAutomaticDialSaving] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isGeneratingShortList, setIsGeneratingShortList] = useState(false);
  const [shortListButtonDisabled, setShortListButtonDisabled] = useState(false);
  const [shortListTimeRemaining, setShortListTimeRemaining] = useState(0);
  const [candidateToRemove, setCandidateToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const {
    toast
  } = useToast();
  const [callingCandidateId, setCallingCandidateId] = useState<string | null>(null);
  const [newApplicationsCount, setNewApplicationsCount] = useState(0);
  const [addedToLongList, setAddedToLongList] = useState<Set<string>>(new Set());
  const [lastViewedApplications, setLastViewedApplications] = useState<string | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [selectedCandidateRecord, setSelectedCandidateRecord] = useState<any>(null);

  // Interview scheduling state variables
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<{
    candidateId: string;
    jobId: string;
    callid: number;
  } | null>(null);
  const [interviewSlots, setInterviewSlots] = useState<{
    date: Date | undefined;
    time: string;
  }[]>([{
    date: undefined,
    time: ''
  }, {
    date: undefined,
    time: ''
  }, {
    date: undefined,
    time: ''
  }]);
  const [interviewType, setInterviewType] = useState<'Phone' | 'Online Meeting'>('Phone');
  const [interviewLink, setInterviewLink] = useState('');
  useEffect(() => {
    if (id) {
      fetchJob(id);
      fetchCandidates(id);
      fetchCvData();
      fetchApplications(id);
      fetchTaskCandidates(id);
      checkShortListButtonStatus();
      // Load last viewed timestamp for applications
      const lastViewed = localStorage.getItem(`lastViewedApplications_${id}`);
      setLastViewedApplications(lastViewed);
    }

    // Check for tab in URL hash
    const hash = window.location.hash;
    if (hash.startsWith('#tab=')) {
      const tab = hash.substring(5);
      setActiveTab(tab);
    }
  }, [id]);

  // Fetch group data when job is loaded
  useEffect(() => {
    if (job?.group_id) {
      fetchJobGroup(job.group_id);
    }
  }, [job?.group_id]);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (shortListButtonDisabled && shortListTimeRemaining > 0) {
      interval = setInterval(() => {
        setShortListTimeRemaining(prev => {
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
      const newApps = applications.filter(app => {
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
      const {
        data,
        error
      } = await supabase.from('Jobs').select('*').eq('job_id', jobId).maybeSingle();
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
    } catch (error) {
      console.error("Error fetching job:", error);
      setJob(null);
    } finally {
      setLoading(false);
    }
  };
  const handleAutomaticDialToggle = async (checked: boolean) => {
    if (!job?.job_id) return;
    setAutomaticDialSaving(true);
    try {
      const {
        error
      } = await supabase.from('Jobs').update({
        automatic_dial: checked
      }).eq('job_id', job.job_id);
      if (error) throw error;
      setJob(prev => ({
        ...prev,
        automatic_dial: checked
      }));
      toast({
        title: "Success",
        description: `Automatic dial ${checked ? 'enabled' : 'disabled'} for this job`
      });
    } catch (error) {
      console.error('Error updating automatic dial:', error);
      toast({
        title: "Error",
        description: "Failed to update automatic dial setting",
        variant: "destructive"
      });
    } finally {
      setAutomaticDialSaving(false);
    }
  };
  const fetchJobGroup = async (groupId: string) => {
    try {
      const {
        data,
        error
      } = await supabase.from('groups').select('*').eq('id', groupId).maybeSingle();
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
      // Fetch candidates from Jobs_CVs
      const {
        data: candidatesData,
        error: candidatesError
      } = await supabase.from('Jobs_CVs').select('*').eq('job_id', jobId).order('cv_score', {
        ascending: false,
        nullsFirst: false
      });
      if (candidatesError) throw candidatesError;

      // Fetch LinkedIn boolean search data for this job
      const {
        data: linkedinData,
        error: linkedinError
      } = await supabase.from('linkedin_boolean_search').select('user_id, linkedin_id, linkedin_score, linkedin_score_reason').eq('job_id', jobId);
      if (linkedinError) console.warn('Error fetching LinkedIn data:', linkedinError);

      // Create a map of LinkedIn data by user_id for quick lookup
      const linkedinMap = new Map();
      (linkedinData || []).forEach(item => {
        if (item.user_id) {
          linkedinMap.set(item.user_id, {
            linkedin_score: item.linkedin_score,
            linkedin_score_reason: item.linkedin_score_reason
          });
        }
      });
      const mapped = (candidatesData || []).map((row: any) => {
        // Determine effective CV score (prioritize LinkedIn score for LinkedIn-sourced candidates)
        const sourceLower = (row.source || '').toLowerCase();
        const effectiveCvScore = sourceLower.includes('linkedin') ? row.linkedin_score ?? row.cv_score ?? null : row.cv_score ?? row.linkedin_score ?? null;

        // Get LinkedIn data for this candidate by user_id (if available from map)
        const linkedinInfo = linkedinMap.get(row.user_id) || {};
        const linkedinScore = linkedinInfo.linkedin_score ?? row.linkedin_score ?? null;
        const linkedinReason = linkedinInfo.linkedin_score_reason ?? row.linkedin_score_reason ?? '';
        return {
          ...row,
          "Job ID": jobId,
          "Candidate_ID": row.recordid?.toString() || '',
          "Contacted": row.contacted ?? '',
          "Transcript": row.transcript ?? '',
          "Summary": row.cv_score_reason ?? '',
          "Success Score": row.after_call_score?.toString() ?? '',
          "Score and Reason": row.cv_score_reason ?? '',
          "Candidate Name": row.candidate_name ?? '',
          "Candidate Email": row.candidate_email ?? '',
          "Candidate Phone Number": row.candidate_phone_number ?? '',
          "Source": row.source ?? '',
          // Keep LinkedIn fields for UI/debug
          "linkedin_score": linkedinScore ?? '',
          "linkedin_score_reason": linkedinReason ?? '',
          "pros": row.after_call_pros,
          "cons": row.after_call_cons,
          "Notice Period": row.notice_period ?? '',
          "Salary Expectations": row.salary_expectations ?? '',
          "current_salary": row.current_salary ?? '',
          "Notes": row.notes ?? '',
          "callid": row.recordid ?? Math.random() * 1000000,
          "duration": row.duration,
          "recording": row.recording,
          "first_name": row.candidate_name?.split(' ')[0] || '',
          "last_name": row.candidate_name?.split(' ').slice(1).join(' ') || '',
          // Normalize CV score fields so the UI picks them up everywhere
          cv_score: effectiveCvScore ?? 0,
          "CV Score": effectiveCvScore != null ? String(effectiveCvScore) : '',
          // Keep legacy "Score" alias used elsewhere for sorting/analytics
          "Score": effectiveCvScore != null ? String(effectiveCvScore) : '0',
          "lastcalltime": row.lastcalltime
        };
      });
      setCandidates(mapped);
      console.log('Total candidates from Jobs_CVs:', mapped?.length || 0);

      // Calculate candidate scores for analytics
      const allScores = mapped?.map(c => parseFloat(c.Score) || 0).filter(score => !isNaN(score)) || [];
      console.log('All candidate scores:', allScores);

      // Debug LinkedIn data visibility
      const linkedinCandidates = mapped.filter(c => typeof c["Source"] === 'string' && c["Source"].toLowerCase().includes('linkedin'));
      console.log('LinkedIn source candidates:', linkedinCandidates.length, 'Sample:', linkedinCandidates.slice(0, 3).map(c => ({
        name: c["Candidate Name"],
        overall: c["linkedin_score"],
        reason: c["linkedin_score_reason"]
      })));

      // Calculate low scored candidates (score < 70)
      const lowScoredCandidates = mapped?.filter(c => {
        const score = parseFloat(c.Score) || 0;
        return !isNaN(score) && score < 70;
      }) || [];
      console.log('Low scored candidates:', lowScoredCandidates.length, 'Sample:', lowScoredCandidates.slice(0, 3).map(c => ({
        name: c.candidate_name,
        score: c.Score
      })));
    } catch (error) {
      console.error('Error fetching candidates from Jobs_CVs:', error);
      setCandidates([]);
    } finally {
      setCandidatesLoading(false);
    }
  };
  const fetchCvData = async () => {
    if (!profile?.slug) return;
    try {
      const {
        data,
        error
      } = await supabase.from('CVs').select('*');
      if (error) throw error;
      setCvData(data || []);
    } catch (error) {
      console.error('Error fetching CV data:', error);
      setCvData([]);
    }
  };
  const fetchApplications = async (jobId: string) => {
    setApplicationsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase
        .from('CVs')
        .select('*')
        .eq('job_id', jobId)
        .order('updated_time', { ascending: false });
      
      if (error) throw error;
      
      // Map the data to match the expected structure in the UI
      const mappedApplications = (data || []).map(cv => ({
        candidate_id: cv.user_id,
        first_name: cv.Firstname,
        last_name: cv.Lastname,
        Email: cv.email,
        phone_number: cv.phone_number,
        CV_Link: cv.cv_link,
        cv_summary: cv.cv_text ? cv.cv_text.substring(0, 200) + '...' : '',
        Timestamp: cv.updated_time
      }));
      
      setApplications(mappedApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };
  const fetchTaskCandidates = async (jobId: string) => {
    if (!profile?.slug) return;
    try {
      // For now, we'll use the same CVs table data since task_candidates table doesn't exist
      const {
        data,
        error
      } = await supabase.from('CVs').select('*').filter('applied_for', 'cs', `{${jobId}}`).not('CandidateStatus', 'is', null);
      if (error) throw error;
      setTaskCandidates(data || []);
      const taskedCandidates = data?.filter(c => c.CandidateStatus === 'Tasked') || [];
      console.log('Tasked calculation:', {
        tasked: taskedCandidates.length,
        total: data?.length || 0,
        taskedCandidates: taskedCandidates.slice(0, 3).map(c => ({
          name: c.first_name,
          status: c.CandidateStatus
        }))
      });
    } catch (error) {
      console.error('Error fetching task candidates:', error);
      setTaskCandidates([]);
    }
  };
  const updateTaskStatus = async (taskId: number, newStatus: 'Pending' | 'Received' | 'Reviewed') => {
    try {
      const {
        error
      } = await supabase.from('task_candidates').update({
        status: newStatus
      }).eq('taskid', taskId);
      if (error) throw error;
      setTaskCandidates(prev => prev.map(task => task.taskid === taskId ? {
        ...task,
        status: newStatus
      } : task));
      toast({
        title: "Success",
        description: "Task status updated successfully"
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
  };
  const handleCallSelectedCandidates = async () => {
    if (selectedCandidates.size === 0) {
      toast({
        title: "Error",
        description: "Please select candidates to call",
        variant: "destructive"
      });
      return;
    }
    if (!job?.job_id) {
      toast({
        title: "Error",
        description: "Job ID not found",
        variant: "destructive"
      });
      return;
    }
    setIsGeneratingShortList(true);
    try {
      // Get selected candidate data
      const selectedCandidateData = candidates.filter(candidate => selectedCandidates.has(candidate["Candidate_ID"]));

      // Process each selected candidate with their recordid
      for (const candidate of selectedCandidateData) {
        const payload = {
          user_id: candidate.user_id,
          jobID: job.job_id,
          job_itris_id: job.itris_job_id,
          recordid: candidate.recordid
        };

        // Make HTTP request to the webhook for each candidate
        const response = await fetch('https://hook.eu2.make.com/o9mt66urjw5a6sxfog71945s3ubghukw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      toast({
        title: "Success",
        description: `Calling ${selectedCandidates.size} selected candidates initiated successfully`
      });

      // Clear selection after successful call
      setSelectedCandidates(new Set());
    } catch (error) {
      console.error('Error calling selected candidates:', error);
      toast({
        title: "Error",
        description: "Failed to call selected candidates",
        variant: "destructive"
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
        variant: "destructive"
      });
      return;
    }
    try {
      for (const candidateId of selectedCandidates) {
        const candidate = candidates.find(c => c["Candidate_ID"] === candidateId);
        if (candidate) {
          await handleRemoveFromLongList(candidateId);
        }
      }

      // Clear selection after successful removal
      setSelectedCandidates(new Set());
      toast({
        title: "Success",
        description: `${selectedCandidates.size} candidates removed from long list`
      });
    } catch (error) {
      console.error('Error removing selected candidates:', error);
      toast({
        title: "Error",
        description: "Failed to remove selected candidates",
        variant: "destructive"
      });
    }
  };
  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates(prev => {
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
    const allCandidateIds = new Set(Object.keys(filteredCandidates.reduce((acc, candidate) => {
      acc[candidate["Candidate_ID"]] = true;
      return acc;
    }, {} as Record<string, boolean>)));
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
  const handleSearchMoreCandidates = async () => {
    try {
      // Get user_ids from AI Boolean Search candidates (filteredCandidates) as comma-separated string
      const booleanSearchUserIds = filteredCandidates.map(candidate => candidate.user_id).filter(Boolean).join(',');
      const payload = {
        job_id: job?.job_id || '',
        itris_job_id: job?.itris_job_id || '',
        user_ids: booleanSearchUserIds,
        profile_id: profile?.user_id || ''
      };
      const response = await fetch('https://hook.eu2.make.com/w10612c8i0lg2em4p305sbhhnkj73auj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      toast({
        title: "Success",
        description: "Search for more candidates initiated successfully"
      });
    } catch (error) {
      console.error('Error searching for more candidates:', error);
      toast({
        title: "Error",
        description: "Failed to search for more candidates",
        variant: "destructive"
      });
    }
  };
  const handleGenerateLongList = async () => {
    try {
      console.log('Starting Generate Long List process...');
      console.log('Current job:', job);
      console.log('Current profile:', profile);

      // First, increment the longlist count in the database
      const {
        error: updateError
      } = await supabase.from('Jobs').update({
        longlist: (job?.longlist || 0) + 1
      }).eq('job_id', job?.job_id);
      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      // Update local state
      setJob(prev => ({
        ...prev,
        longlist: (prev?.longlist || 0) + 1
      }));

      // Prepare payload for webhook
      const payload = {
        job_id: job?.job_id || '',
        itris_job_id: job?.itris_job_id || '',
        profile_id: profile?.user_id || ''
      };
      console.log('Webhook payload:', payload);

      // Call the automation endpoint
      console.log('Calling webhook at:', 'https://hook.eu2.make.com/yiz4ustkcgxgji2sv6fwcs99jdr3674m');
      const response = await fetch('https://hook.eu2.make.com/yiz4ustkcgxgji2sv6fwcs99jdr3674m', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      console.log('Webhook response status:', response.status);
      console.log('Webhook response ok:', response.ok);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Webhook error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }
      const responseData = await response.text();
      console.log('Webhook success response:', responseData);
      toast({
        title: "Success",
        description: job?.longlist && job.longlist > 0 ? "Long list regenerated successfully" : "Long list generated successfully"
      });
    } catch (error) {
      console.error('Error generating long list:', error);
      toast({
        title: "Error",
        description: `Failed to generate long list: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  const handleRejectCandidate = async (jobId: string, candidateId: string, callid: number) => {
    try {
      // Find the candidate data from the candidates array
      const candidate = candidates.find(c => c["Candidate_ID"] === candidateId);
      if (!candidate) {
        toast({
          title: "Error",
          description: "Candidate data not found",
          variant: "destructive"
        });
        return;
      }
      const response = await fetch('https://hook.eu2.make.com/mk46k4ibvs5n5nk1lto9csljygesv75f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          job_id: jobId,
          user_id: candidate.user_id?.toString() || "",
          recordid: candidate.recordid?.toString() || "",
          itris_job_id: job?.itris_job_id || ""
        })
      });
      if (response.ok) {
        toast({
          title: "Candidate Rejected",
          description: "The candidate has been successfully rejected."
        });
      } else {
        throw new Error('Failed to reject candidate');
      }
    } catch (error) {
      console.error('Error rejecting candidate:', error);
      toast({
        title: "Error",
        description: "Failed to reject candidate. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleGenerateShortList = async () => {
    if (!job?.job_id || candidates.length === 0) {
      toast({
        title: "Error",
        description: "No candidates available to process",
        variant: "destructive"
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
          recordid: candidate.recordid
        };

        // Make HTTP request to the webhook for each candidate
        const response = await fetch('https://hook.eu2.make.com/o9mt66urjw5a6sxfog71945s3ubghukw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      toast({
        title: "Success",
        description: "Short list generation initiated successfully"
      });
    } catch (error) {
      console.error('Error generating short list:', error);
      toast({
        title: "Error",
        description: "Failed to generate short list",
        variant: "destructive"
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
      console.log('Attempting to remove candidate:', candidateId);

      // Find the candidate record to get the correct recordid
      const candidate = candidates.find(c => c["Candidate_ID"] === candidateId);
      if (!candidate) {
        throw new Error('Candidate not found in local data');
      }

      // Remove the candidate from the Jobs_CVs table using recordid (which maps to Candidate_ID in our data transformation)
      const {
        error
      } = await (supabase as any).from('Jobs_CVs').delete().eq('recordid', candidateId).eq('job_id', id);
      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      // Update the local state to remove the candidate
      setCandidates(prev => prev.filter(c => c["Candidate_ID"] !== candidateId));
      toast({
        title: "Success",
        description: "Candidate removed from long list"
      });
    } catch (error) {
      console.error('Error removing candidate from long list:', error);
      toast({
        title: "Error",
        description: "Failed to remove candidate from long list",
        variant: "destructive"
      });
    }
  };
  const showRemoveConfirmation = (candidateId: string, candidateName: string) => {
    setCandidateToRemove({
      id: candidateId,
      name: candidateName
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
      const candidate = candidates.find(c => c["Candidate_ID"] === candidateId);
      if (!candidate) {
        throw new Error('Candidate not found');
      }
      const payload = {
        user_id: candidate.user_id,
        jobID: job.job_id,
        job_itris_id: job.itris_job_id,
        recordid: candidate.recordid
      };
      const response = await fetch('https://hook.eu2.make.com/o9mt66urjw5a6sxfog71945s3ubghukw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      toast({
        title: 'Success',
        description: 'Call initiated successfully'
      });
    } catch (error) {
      console.error('Error calling candidate:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate call',
        variant: 'destructive'
      });
    } finally {
      setCallingCandidateId(null);
    }
  };
  const handleArrangeInterview = (candidateId: string) => {
    // Find the candidate object
    const candidate = candidates.find(c => c["Candidate_ID"] === candidateId || c.candidate_id === candidateId || c.Candidate_ID === candidateId);
    setSelectedCandidate({
      candidateId: candidateId,
      jobId: job?.job_id || id || '',
      callid: candidate?.callid || candidate?.Callid || 0
    });
    setInterviewDialogOpen(true);

    // Reset slots and type
    setInterviewSlots([{
      date: undefined,
      time: ''
    }, {
      date: undefined,
      time: ''
    }, {
      date: undefined,
      time: ''
    }]);
    setInterviewType('Phone');
    setInterviewLink('');
    console.log('Dialog should now be open. interviewDialogOpen state set to true');
  };
  const handleCVSubmitted = async (candidateId: string) => {
    try {
      const {
        error
      } = await supabase.from('Jobs_CVs').update({
        'contacted': 'Submitted'
      }).eq('recordid', parseInt(candidateId)).eq('job_id', id);
      if (error) throw error;

      // Update local state
      setCandidates(prev => prev.map(c => c["Candidate_ID"] === candidateId ? {
        ...c,
        Contacted: 'Submitted'
      } : c));
      toast({
        title: "CV Submitted",
        description: "Candidate's CV has been marked as submitted"
      });
    } catch (error) {
      console.error('Error submitting CV:', error);
      toast({
        title: "Error",
        description: "Failed to submit CV",
        variant: "destructive"
      });
    }
  };
  const handleScheduleInterview = async () => {
    if (!selectedCandidate) return;

    // Validate that all slots are filled
    const validSlots = interviewSlots.filter(slot => slot.date && slot.time);
    if (validSlots.length !== 3) {
      alert('Please fill in all 3 interview slots');
      return;
    }

    // Validate that times are not in the past for today's date
    const now = new Date();
    const currentDate = format(now, 'yyyy-MM-dd');
    const currentTime = format(now, 'HH:mm');
    for (const slot of validSlots) {
      const slotDate = format(slot.date!, 'yyyy-MM-dd');
      if (slotDate === currentDate && slot.time <= currentTime) {
        alert('Cannot schedule interview times in the past for today. Please select a future time.');
        return;
      }
    }

    // Validate interview link for online meetings
    if (interviewType === 'Online Meeting' && !interviewLink.trim()) {
      alert('Please provide an interview link for online meetings');
      return;
    }
    try {
      // Update candidate status
      await supabase.from('CVs').update({
        CandidateStatus: 'Interview'
      }).eq('candidate_id', selectedCandidate.candidateId);

      // Format appointments for webhook (same as Dashboard)
      const appointments = interviewSlots.map(slot => {
        if (slot.date && slot.time) {
          return `${format(slot.date, 'yyyy-MM-dd')} ${slot.time}`;
        }
        return '';
      });

      // Save interview to database and get the generated intid (same as Dashboard)
      const {
        data: interviewData,
        error: insertError
      } = await supabase.from('interview').insert({
        candidate_id: selectedCandidate.candidateId,
        job_id: selectedCandidate.jobId,
        callid: selectedCandidate.callid,
        appoint1: appointments[0],
        appoint2: appointments[1],
        appoint3: appointments[2],
        inttype: interviewType,
        intlink: interviewType === 'Online Meeting' ? interviewLink : null,
        company_id: null
      }).select('intid').single();
      if (insertError) throw insertError;

      // Send webhook to Make.com (exact same as Dashboard)
      await fetch('https://hook.eu2.make.com/3t88lby79dnf6x6hgm1i828yhen75omb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
          intlink: interviewType === 'Online Meeting' ? interviewLink : null
        })
      });

      // Update local state
      setCvData(prev => prev.map(cv => cv.candidate_id === selectedCandidate.candidateId ? {
        ...cv,
        CandidateStatus: 'Interview'
      } : cv));

      // Close dialog and show success message
      setInterviewDialogOpen(false);
      setSelectedCandidate(null);
      setInterviewType('Phone');
      setInterviewLink('');
      toast({
        title: "Interview Scheduled",
        description: "The candidate has been scheduled for an interview."
      });
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast({
        title: "Error",
        description: "Failed to schedule interview. Please try again.",
        variant: "destructive"
      });
    }
  };
  const updateInterviewSlot = (index: number, field: 'date' | 'time', value: Date | string) => {
    setInterviewSlots(prev => {
      const newSlots = [...prev];
      if (field === 'date') {
        newSlots[index] = {
          ...newSlots[index],
          date: value as Date
        };
      } else {
        newSlots[index] = {
          ...newSlots[index],
          time: value as string
        };
      }
      return newSlots;
    });
  };
  const timeOptions = ['00', '15', '30', '45'];
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
    return <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  if (!job) {
    return <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-2xl font-bold text-muted-foreground">Job not found</h2>
        <Button onClick={() => navigate('/jobs')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
      </div>;
  }
  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default';
      case 'closed':
        return 'destructive';
      case 'draft':
        return 'secondary';
      default:
        return 'outline';
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
    const cvScore = parseFloat(candidate.cv_score) || 0;
    const afterCallScore = parseFloat(candidate.after_call_score) || 0;
    if (cvScore > 0 && afterCallScore > 0) {
      return Math.round((cvScore + afterCallScore) / 2);
    } else if (cvScore > 0) {
      return cvScore; // Return CV score if only it's available
    } else if (afterCallScore > 0) {
      return afterCallScore; // Return after call score if only it's available
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
    if (candidate["Source"] && typeof candidate["Source"] === 'string') {
      if (candidate["Source"].toLowerCase().includes('linkedin')) {
        sourceType = " (linkedin)";
      } else if (candidate["Source"].toLowerCase().includes('itris')) {
        sourceType = " (cv)";
      }
    }
    return <div className="flex items-center gap-1">
        <Badge className={`${variant} flex items-center gap-1 font-semibold`}>
          {hasIcon && <Star className="w-3 h-3" />}
          Overall: {overallScore}{sourceType}
        </Badge>
      </div>;
  };
  const formatCurrency = (amountStr: string | null | undefined, currency?: string | null) => {
    const amount = parseFloat((amountStr || "").toString().replace(/[^0-9.]/g, ""));
    if (!amount || !currency) return amountStr || "N/A";
    try {
      return new Intl.NumberFormat("en", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    } catch {
      return `${currency} ${isNaN(amount) ? amountStr : amount.toLocaleString()}`;
    }
  };

  // Filtered candidates based on all filters
  const filteredCandidates = candidates.filter(candidate => {
    const nameMatch = !nameFilter || (candidate["Candidate Name"] || "").toLowerCase().includes(nameFilter.toLowerCase());
    const emailMatch = !emailFilter || (candidate["Candidate Email"] || "").toLowerCase().includes(emailFilter.toLowerCase());
    const phoneMatch = !phoneFilter || (candidate["Candidate Phone Number"] || "").includes(phoneFilter);
    const userIdMatch = !userIdFilter || (candidate["Candidate_ID"] || "").toString().includes(userIdFilter);
    const sourceMatch = !longListSourceFilter || longListSourceFilter === "all" || (candidate["Source"] || "").toLowerCase().includes(longListSourceFilter.toLowerCase());
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
          scoreMatch = score === 0 || !candidate["Success Score"] && !candidate["cv_score"] && !candidate["CV Score"];
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
  }).sort((a, b) => {
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
  const renderCandidateCard = (candidateId: string, candidateContacts: any[], mainCandidate: any, isTopCandidate: boolean = false) => {
    const cardClassName = isTopCandidate ? "relative border-2 border-yellow-400 hover:border-yellow-500 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950/50 dark:via-amber-950/50 dark:to-orange-950/50 shadow-xl shadow-yellow-200/50 dark:shadow-yellow-900/30 ring-2 ring-yellow-300/60 dark:ring-yellow-600/40 before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-300/10 before:via-amber-300/10 before:to-orange-300/10 before:rounded-lg before:animate-pulse" : "border border-border/50 hover:border-primary/50 transition-colors hover:shadow-lg bg-green-50/50 dark:bg-green-950/20";
    return <Card key={candidateId} className={cardClassName}>
        <CardContent className="p-4 relative">
          {isTopCandidate && <Badge className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-amber-300 via-yellow-300 to-amber-400 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-500 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-200 w-8 h-8 rounded-full p-0 flex items-center justify-center group z-10">
              <Star className="w-4 h-4 fill-amber-800 text-amber-800 group-hover:scale-110 transition-transform duration-200" />
            </Badge>}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-1">
                  <h4 className="font-semibold">{mainCandidate["Candidate Name"] || "Unknown"}</h4>
                </div>
                <p className="text-sm text-muted-foreground">User ID: {mainCandidate["user_id"] || "N/A"}</p>
                <div className="flex items-center gap-4 text-sm mt-1">
                  {!["ready to contact", "not contacted", "1st no answer", "2nd no answer", "3rd no answer", "1st no anwser", "2nd no anwser", "3rd no anwser"].includes(mainCandidate["Contacted"]?.toLowerCase() || "") && <span className="text-muted-foreground">CV Score: {mainCandidate["cv_score"] || mainCandidate["CV Score"] || "N/A"}</span>}
                  {mainCandidate["after_call_score"] && <span className="text-muted-foreground">After Call Score: {mainCandidate["after_call_score"]}</span>}
                  {mainCandidate["Source"] && typeof mainCandidate["Source"] === 'string' && mainCandidate["Source"].toLowerCase().includes("linkedin") && mainCandidate["linkedin_score"] !== undefined && mainCandidate["linkedin_score"] !== null && mainCandidate["linkedin_score"] !== "" && !["ready to contact", "not contacted", "1st no answer", "2nd no answer", "3rd no answer", "1st no anwser", "2nd no anwser", "3rd no anwser"].includes(mainCandidate["Contacted"]?.toLowerCase() || "") && <span className="text-muted-foreground">Overall: {mainCandidate["linkedin_score"]}</span>}
                </div>
                {mainCandidate["Source"] && typeof mainCandidate["Source"] === 'string' && mainCandidate["Source"].toLowerCase().includes("linkedin") && mainCandidate["linkedin_score_reason"] !== undefined && mainCandidate["linkedin_score_reason"] !== null && mainCandidate["linkedin_score_reason"] !== "" && <div className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium">Reason:</span> {mainCandidate["linkedin_score_reason"]}
                  </div>}
                {mainCandidate["Salary Expectations"] && <div className="flex items-center gap-2 text-sm mt-1">
                    <Banknote className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Expected: {formatCurrency(mainCandidate["Salary Expectations"], job?.Currency)}</span>
                  </div>}
              </div>
              {(mainCandidate["Contacted"]?.toLowerCase() === "call done" || mainCandidate["Contacted"]?.toLowerCase() === "contacted" || mainCandidate["Contacted"]?.toLowerCase() === "low scored" || mainCandidate["Contacted"]?.toLowerCase() === "tasked") && mainCandidate["lastcalltime"] && <div className="text-xs text-muted-foreground text-right">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(mainCandidate["lastcalltime"]).toLocaleDateString()}
                  </div>
                  <div className="text-xs">
                    {new Date(mainCandidate["lastcalltime"]).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                  </div>
                </div>}
            </div>
            
            <div className="space-y-2 text-sm">
              {mainCandidate["Candidate Email"] && <div className="flex items-center text-muted-foreground">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="truncate">{mainCandidate["Candidate Email"]}</span>
                </div>}
              
              {mainCandidate["Candidate Phone Number"] && <div className="flex items-center text-muted-foreground">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{mainCandidate["Candidate Phone Number"]}</span>
                </div>}
                
              {mainCandidate["Source"] && <div className="flex items-center text-muted-foreground">
                  <Building className="w-4 h-4 mr-2" />
                  <span className="truncate">{mainCandidate["Source"]}</span>
                </div>}
            </div>

            {mainCandidate["Summary"] && <p className="text-sm text-muted-foreground line-clamp-3">
                {mainCandidate["Summary"]}
              </p>}

            {/* Task Status and Links Section */}
            {(() => {
            const candidateTasks = taskCandidates.filter(task => task.candidate_id === candidateId);
            const candidateStatus = mainCandidate["Contacted"]?.toLowerCase();

            // Only show tasks if candidate status is "tasked" and not "rejected"
            if (candidateTasks.length === 0 || candidateStatus !== "tasked" || candidateStatus === "rejected") return null;
            return <div className="space-y-2 pt-2 border-t">
                  <h5 className="text-sm font-medium text-foreground flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Tasks ({candidateTasks.length})
                  </h5>
                  <div className="space-y-2">
                    {candidateTasks.map(task => <div key={task.taskid} className={cn("flex items-center justify-between p-2 rounded-md", task.status === 'Received' ? "bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700" : "bg-muted/50")}>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {task.status === 'Pending' && <Hourglass className="w-3 h-3 text-orange-500" />}
                            {task.status === 'Received' && <AlertCircle className="w-3 h-3 text-blue-500" />}
                            {task.status === 'Reviewed' && <CheckCircle className="w-3 h-3 text-green-500" />}
                            <Select value={task.status} onValueChange={value => updateTaskStatus(task.taskid, value as any)}>
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
                          {task.tasklink && (task.tasklink.includes(',') ?
                    // Multiple links
                    <div className="flex items-center space-x-1">
                              {task.tasklink.split(',').map((link: string, index: number) => <Button key={index} variant="ghost" size="sm" onClick={() => window.open(link.trim(), '_blank')} className="p-1 h-6 w-6 hover:bg-primary/10" title={`Task Link ${index + 1}`}>
                                  <ExternalLink className="h-3 w-3" />
                                </Button>)}
                              <span className="text-xs text-muted-foreground">
                                ({task.tasklink.split(',').length} links)
                              </span>
                            </div> :
                    // Single link
                    <Button variant="ghost" size="sm" onClick={() => window.open(task.tasklink, '_blank')} className="p-1 h-6 w-6 hover:bg-primary/10" title="Task Link">
                              <ExternalLink className="h-3 w-3" />
                            </Button>)}
                        </div>
                      </div>)}
                  </div>
                </div>;
          })()}

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-2">
                <StatusDropdown currentStatus={mainCandidate["Contacted"]} candidateId={mainCandidate["Candidate_ID"]} jobId={id!} onStatusChange={newStatus => {
                setCandidates(prev => prev.map(c => c["Candidate_ID"] === mainCandidate["Candidate_ID"] ? {
                  ...c,
                  Contacted: newStatus
                } : c));
              }} variant="badge" />
                {getCandidateStatus(mainCandidate["Candidate_ID"]) && <StatusDropdown currentStatus={getCandidateStatus(mainCandidate["Candidate_ID"])} candidateId={mainCandidate["Candidate_ID"]} jobId={null} onStatusChange={newStatus => {
                setCvData(prev => prev.map(cv => cv['Cadndidate_ID'] === mainCandidate["Candidate_ID"] ? {
                  ...cv,
                  CandidateStatus: newStatus
                } : cv));
              }} variant="badge" />}
              </div>
              <div className="flex flex-col gap-1 items-end">
                {/* Only show overall score when status is Call Done */}
                {mainCandidate["Contacted"]?.toLowerCase() === "call done" && getOverallScoreBadge(mainCandidate)}
                {!["ready to contact", "not contacted", "1st no answer", "2nd no answer", "3rd no answer", "1st no anwser", "2nd no anwser", "3rd no anwser"].includes(mainCandidate["Contacted"]?.toLowerCase() || "") && getScoreBadge(mainCandidate["Success Score"] || mainCandidate["cv_score"] || mainCandidate["CV Score"])}
              </div>
            </div>

            {/* Call Log Buttons */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex flex-wrap gap-2">
                {(() => {
                console.log('AI Short List - candidateContacts for candidate:', candidateId, candidateContacts);
                const contactsWithCalls = candidateContacts.filter(contact => contact.callcount > 0);
                console.log('AI Short List - contactsWithCalls:', contactsWithCalls);
                if (contactsWithCalls.length === 0) return null;

                // Get the latest call log (highest callid)
                const latestContact = contactsWithCalls.reduce((latest, current) => current.callid > latest.callid ? current : latest);
                console.log('AI Short List - latestContact:', latestContact);
                return <Button key={latestContact.callid} variant="outline" size="sm" asChild className="flex-1 min-w-[100px]">
                      <Link to={`/call-log-details?candidate=${candidateId}&job=${id}&callid=${latestContact.callid}`} onClick={() => {
                    // Store current tab in URL hash for back navigation
                    window.location.hash = 'tab=shortlist';
                  }}>
                        <FileText className="w-3 h-3 mr-1" />
                        Call Log
                      </Link>
                    </Button>;
              })()}
                <Button variant="ghost" size="sm" asChild className="flex-1 min-w-[100px]">
                  <Link to={`/candidate/${candidateId}`}>
                    <Users className="w-3 h-3 mr-1" />
                    View Profile
                  </Link>
                </Button>
              </div>
              {/* Action Buttons - CV Submitted and Reject */}
              <div className="flex gap-2">
                {mainCandidate["Contacted"] === "Submitted" ? <Button variant="outline" size="sm" className="flex-1 min-w-[100px] bg-transparent border-2 border-blue-500 text-blue-600 cursor-default" disabled>
                    <FileCheck className="w-3 h-3 mr-1" />
                    CV Submitted
                  </Button> : <Button variant="outline" size="sm" onClick={() => handleCVSubmitted(candidateId)} className="flex-1 min-w-[100px] bg-transparent border-2 border-green-500 text-green-600 hover:bg-green-100 hover:border-green-600 hover:text-green-700 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/30 dark:hover:border-green-300 dark:hover:text-green-300 transition-all duration-200">
                    <FileCheck className="w-3 h-3 mr-1" />
                    CV Submitted
                  </Button>}
                {mainCandidate["Contacted"] === "Rejected" ? <Button variant="outline" size="sm" className="flex-1 min-w-[100px] bg-transparent border-2 border-gray-400 text-gray-500 cursor-not-allowed" disabled>
                    <X className="w-3 h-3 mr-1" />
                    Rejected
                  </Button> : <Button variant="outline" size="sm" className="flex-1 min-w-[100px] bg-transparent border-2 border-red-500 text-red-600 hover:bg-red-100 hover:border-red-600 hover:text-red-700 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:border-red-300 dark:hover:text-red-300 transition-all duration-200" onClick={() => handleRejectCandidate(id!, candidateId, candidateContacts[0].callid)}>
                    <X className="w-3 h-3 mr-1" />
                    Reject Candidate
                  </Button>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>;
  };

  // Get CV status for a candidate
  const getCandidateStatus = (candidateId: string) => {
    const cvRecord = cvData.find(cv => cv['candidate_id'] === candidateId);
    return cvRecord?.['CandidateStatus'] || null;
  };

  // Short list candidates (after_call_score > 74) sorted by Overall Score descending
  const shortListCandidates = candidates.filter(candidate => {
    const score = parseFloat(candidate.after_call_score || "0");
    return score > 74;
  }).sort((a, b) => {
    const overallScoreA = calculateOverallScore(a);
    const overallScoreB = calculateOverallScore(b);
    return overallScoreB - overallScoreA; // Sort highest score first
  });

  // Helper function to parse salary as number
  const parseSalary = (salary: string | null | undefined): number => {
    if (!salary) return 0;
    const cleanSalary = salary.toString().replace(/[^0-9.]/g, "");
    return parseFloat(cleanSalary) || 0;
  };

  // Get job budget for comparison
  const jobBudget = parseSalary(job?.job_salary_range?.toString() || job?.["Job Salary Range (ex: 15000 AED)"]);
  const budgetThreshold = jobBudget * 1.2; // 20% above budget

  // Function to filter short list candidates
  const filterShortListCandidates = (candidates: any[]) => {
    return candidates.filter(candidate => {
      const nameMatch = !shortListNameFilter || (candidate["Candidate Name"] || "").toLowerCase().includes(shortListNameFilter.toLowerCase());
      const emailMatch = !shortListEmailFilter || (candidate["Candidate Email"] || "").toLowerCase().includes(shortListEmailFilter.toLowerCase());
      const phoneMatch = !shortListPhoneFilter || (candidate["Candidate Phone Number"] || "").includes(shortListPhoneFilter);
      const userIdMatch = !shortListUserIdFilter || (candidate.user_id || candidate["user_id"] || "").toString().includes(shortListUserIdFilter);
      const sourceMatch = !shortListSourceFilter || shortListSourceFilter === "all" || (candidate["Source"] || "").toLowerCase().includes(shortListSourceFilter.toLowerCase());
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

  // Filter candidates into budget categories with applied filters
  const withinBudgetCandidates = filterShortListCandidates(shortListCandidates.filter(candidate => {
    const expectedSalary = parseSalary(candidate["Salary Expectations"]);
    return expectedSalary === 0 || expectedSalary <= budgetThreshold;
  }));
  const aboveBudgetCandidates = filterShortListCandidates(shortListCandidates.filter(candidate => {
    const expectedSalary = parseSalary(candidate["Salary Expectations"]);
    return expectedSalary > 0 && expectedSalary > budgetThreshold;
  }));
  return <div className="space-y-4 md:space-y-6 p-4 md:p-6 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>
                <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Back to Jobs</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold truncate">Job Details</h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {job?.longlist && job.longlist > 0 ? <Button onClick={handleSearchMoreCandidates} className="bg-foreground text-background hover:bg-foreground/90 text-sm w-full sm:w-auto" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Search for more candidates</span>
                  <span className="sm:hidden">Search More</span>
                </Button> : <Button onClick={handleGenerateLongList} disabled={job?.longlist === 3} className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full sm:w-auto" size="sm">
                  <Zap className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Generate Long List</span>
                  <span className="sm:hidden">Generate List</span>
                </Button>}
              <Button onClick={() => navigate(`/jobs/edit/${job.job_id}`)} size="sm" className="w-full sm:w-auto">
                <FileText className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Edit Job</span>
                <span className="sm:hidden">Edit</span>
              </Button>
              <Button variant="outline" asChild size="sm" className="w-full sm:w-auto">
                <Link to={`/job/${job.job_id}/apply`}>
                  <span className="hidden sm:inline">Apply Link</span>
                  <span className="sm:hidden">Apply</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Job Header Card */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <h2 className="text-xl md:text-2xl font-bold break-words">{job.job_title}</h2>
                  <p className="text-base md:text-lg text-muted-foreground break-words">{job.client_description || "Client Description"}</p>
                </div>
                <Badge variant={job.Processed === true || job.Processed === "true" || job.Processed === "Yes" ? "default" : "destructive"} className={`text-xs md:text-sm px-2 md:px-3 py-1 whitespace-nowrap ${job.Processed === true || job.Processed === "true" || job.Processed === "Yes" ? "bg-green-600 text-white border-0" : "bg-red-600 text-white border-0"}`}>
                  {job.Processed === true || job.Processed === "true" || job.Processed === "Yes" ? "Active" : "Not Active"}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pt-4 border-t">
                <div className="flex items-center space-x-2 text-xs md:text-sm min-w-0">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{job.job_location}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs md:text-sm min-w-0">
                  <Banknote className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{formatCurrency(job.job_salary_range?.toString(), job.Currency)}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs md:text-sm min-w-0 sm:col-span-2 lg:col-span-1">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">Posted: {formatDate(job.Timestamp)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Funnel */}
        <JobFunnel candidates={candidates} jobAssignment={job?.assignment} />

        {/* Detailed Information Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="w-full overflow-x-auto">
            <TabsList className="w-full grid grid-cols-7 h-auto p-1">
              <TabsTrigger value="overview" className="text-xs md:text-sm px-2 py-2">Overview</TabsTrigger>
              <TabsTrigger value="description" className="text-xs md:text-sm px-2 py-2">Description</TabsTrigger>
              <TabsTrigger value="requirements" className="text-xs md:text-sm px-2 py-2">AI Requirements</TabsTrigger>
              <TabsTrigger value="applications" className="text-xs md:text-sm px-2 py-2 relative" onClick={handleApplicationsTabClick}>
                Applications
                {newApplicationsCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] z-10">
                    {newApplicationsCount > 99 ? '99+' : newApplicationsCount}
                  </span>}
              </TabsTrigger>
              <TabsTrigger value="boolean-search" className="text-xs md:text-sm px-2 py-2">AI Longlist</TabsTrigger>
              <TabsTrigger value="shortlist" className="text-xs md:text-sm px-2 py-2">AI Short List</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Job ID:</span>
                    <span className="font-mono text-sm">{job.job_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Itris ID:</span>
                    <span className="font-mono text-sm">{job.itris_job_id || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Client:</span>
                    <span>{job.client_description || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{job.job_location || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Salary Range:</span>
                    <span className="font-medium">
                      {formatCurrency(job["Job Salary Range (ex: 15000 AED)"], job["Currency"])}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Notice Period:</span>
                    <span>{job.notice_period || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Group:</span>
                    <span className="flex items-center gap-2">
                      {jobGroup ? <>
                          <div className="w-3 h-3 rounded-full" style={{
                      backgroundColor: jobGroup.color
                    }} />
                          {jobGroup.name}
                        </> : "No Group"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Automatic Dial:</span>
                    <div className="flex items-center gap-2">
                      <Switch checked={job.automatic_dial || false} onCheckedChange={handleAutomaticDialToggle} disabled={automaticDialSaving} />
                      <span className="text-sm text-muted-foreground">
                        {job.automatic_dial ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Requirements & Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nationality to Include:</span>
                    <span>{job.nationality_to_include || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nationality to Exclude:</span>
                    <span>{job.nationality_to_exclude || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Job Type:</span>
                    <span>
                      {job["Type"] || "N/A"}
                      {job["Contract Length"] && job["Type"] === "Contract" && ` (${job["Contract Length"]})`}
                    </span>
                  </div>
                  {job["assignment"] && <div className="flex justify-between">
                      <span className="text-muted-foreground">Assignment Link:</span>
                      <a href={job["assignment"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                        View Assignment
                      </a>
                    </div>}
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

          <TabsContent value="description" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Job Description
                    </CardTitle>
                    <CardDescription>
                      Detailed overview of the role and responsibilities
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/jobs/edit/${job.job_id}`)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Edit Job
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {job.job_description || "No description available for this position."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Job Documents Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Job Documents
                </CardTitle>
                <CardDescription>
                  Uploaded job description files and related documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No documents uploaded</h3>
                  <p className="text-muted-foreground">Upload job description files when creating or editing this job</p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsEditDialogOpen(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Documents
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      AI Requirements
                    </CardTitle>
                    <CardDescription>
                      Skills, experience, and qualifications needed for this role
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/jobs/edit/${job.job_id}`)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Amend
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Things to look for:</h4>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {job.things_to_look_for || "No specific criteria listed."}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Must have:</h4>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {job.musttohave || "No must-have requirements specified."}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Nice to Have:</h4>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {job.nicetohave || "No nice-to-have requirements specified."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Applications ({applications.length})
                    </CardTitle>
                    <CardDescription>
                      Candidates who have applied for this position
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Application Filters */}
                <Card className="mb-4">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input placeholder="Filter by name..." value={appNameFilter} onChange={e => setAppNameFilter(e.target.value)} className="h-9" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input placeholder="Filter by email..." value={appEmailFilter} onChange={e => setAppEmailFilter(e.target.value)} className="h-9" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone</label>
                        <Input placeholder="Filter by phone..." value={appPhoneFilter} onChange={e => setAppPhoneFilter(e.target.value)} className="h-9" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {applicationsLoading ? <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div> : applications.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                    No applications found for this job.
                  </div> : (() => {
              // Filter applications based on name, email, and phone
              const filteredApplications = applications.filter(application => {
                const fullName = application.first_name && application.last_name ? `${application.first_name} ${application.last_name}` : application.first_name || application.last_name || "";
                const email = application.Email || "";
                const phone = application.phone_number || "";
                const nameMatch = !appNameFilter || fullName.toLowerCase().includes(appNameFilter.toLowerCase());
                const emailMatch = !appEmailFilter || email.toLowerCase().includes(appEmailFilter.toLowerCase());
                const phoneMatch = !appPhoneFilter || phone.includes(appPhoneFilter);
                return nameMatch && emailMatch && phoneMatch;
              });
              return <div>
                        <div className="mb-4 text-sm text-muted-foreground">
                          Showing {filteredApplications.length} of {applications.length} applications
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                          {filteredApplications.map(application => <Card key={application.candidate_id} className="border border-border/50 hover:border-primary/50 transition-colors hover:shadow-lg">
                              <CardContent className="p-3 md:p-4">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-semibold text-sm md:text-base truncate">
                                        {application.first_name && application.last_name ? `${application.first_name} ${application.last_name}` : application.first_name || application.last_name || "Unknown"}
                                      </h4>
                                      <p className="text-xs md:text-sm text-muted-foreground truncate">{application.candidate_id}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2 text-xs md:text-sm">
                                    {application.Email && <div className="flex items-center text-muted-foreground min-w-0">
                                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="truncate">{application.Email}</span>
                                      </div>}
                                    
                                    {application.phone_number && <div className="flex items-center text-muted-foreground min-w-0">
                                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="truncate">{application.phone_number}</span>
                                      </div>}
                                  </div>

                                  {application.cv_summary && <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                                      {application.cv_summary}
                                    </p>}

                                   <div className="flex items-center justify-between pt-2 border-t gap-2">
                                     <div className="flex items-center gap-2">
                                       {application.CV_Link && <Button variant="outline" size="sm" asChild>
                                           <a href={application.CV_Link} target="_blank" rel="noopener noreferrer">
                                             <FileText className="w-4 h-4 mr-1" />
                                             CV
                                           </a>
                                         </Button>}
                                       <Button variant="outline" size="sm" asChild>
                                         <Link to={`/candidate/${application.candidate_id}`}>
                                           View Profile
                                         </Link>
                                       </Button>
                                     </div>
                                     <Button 
                                       size="sm" 
                                       className="bg-primary text-primary-foreground hover:bg-primary/90"
                                       disabled={addedToLongList.has(application.candidate_id)}
                                       onClick={async () => {
                                         try {
                                           const webhookUrl = "https://hook.eu2.make.com/tv58ofd5rftm64t677f65phmbwrnq24e";
                                           const payload = {
                                             "candidate_id": application.candidate_id,
                                             "job_id": job?.job_id,
                                             "company_id": profile?.id || "e2bf7296-2d99-43d0-b357-0cda2c202399"
                                           };

                                           console.log('Triggering webhook with payload:', JSON.stringify(payload, null, 2));
                                           
                                           const response = await fetch(webhookUrl, {
                                             method: "POST",
                                             headers: {
                                               "Content-Type": "application/json",
                                             },
                                             mode: "no-cors",
                                             body: JSON.stringify(payload),
                                           });

                                           // Mark as added to long list
                                           setAddedToLongList(prev => new Set([...prev, application.candidate_id]));
                                           
                                           console.log('Webhook triggered successfully');
                                         } catch (error) {
                                           console.error('Error triggering webhook:', error);
                                         }
                                       }}
                                     >
                                       {addedToLongList.has(application.candidate_id) ? 'Added to Long List' : 'Add to Long List'}
                                     </Button>
                                   </div>
                                </div>
                              </CardContent>
                            </Card>)}
                        </div>
                      </div>;
            })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="boolean-search" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      AI Longlist ({filteredCandidates.length} of {candidates.length})
                    </CardTitle>
                    <CardDescription>
                      All candidates with their CV scores for this position
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
              const readyToContactCount = candidates.filter(candidate => candidate["Contacted"] === "Ready to Contact").length;
              if (readyToContactCount > 0) {
                return <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <div className="flex items-center">
                          <Target className="w-4 h-4 mr-2 text-amber-600 dark:text-amber-400" />
                          <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            {readyToContactCount} {readyToContactCount === 1 ? 'candidate' : 'candidates'} ready to be contacted
                          </span>
                        </div>
                      </div>;
              }
              return null;
            })()}
                {candidatesLoading ? <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div> : candidates.length === 0 ? <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No candidates contacted yet</h3>
                    <p className="text-muted-foreground">Start reaching out to potential candidates for this position</p>
                  </div> : <>
                    {/* Bulk Actions */}
                    {selectedCandidates.size > 0 && <Card className="p-3 md:p-4 mb-4 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {selectedCandidates.size} candidate{selectedCandidates.size > 1 ? 's' : ''} selected
                            </span>
                            <Button variant="ghost" size="sm" onClick={clearAllSelection} className="h-6 text-xs px-2">
                              Clear
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleRemoveSelectedCandidates} className="text-destructive hover:text-destructive border-destructive/50 hover:border-destructive">
                              <X className="w-4 h-4 mr-1" />
                              Remove Selected
                            </Button>
                            <Button variant="default" size="sm" onClick={handleCallSelectedCandidates} disabled={isGeneratingShortList} className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-green-500 dark:hover:bg-green-600">
                              <Phone className="w-4 h-4 mr-1" />
                              {isGeneratingShortList ? "Calling..." : "Call Selected"}
                            </Button>
                          </div>
                        </div>
                      </Card>}

                    {/* Filters */}
                    <Card className="p-3 md:p-4 mb-4 bg-muted/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4" />
                          <h4 className="font-medium text-sm md:text-base">Filters</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={selectAllCandidates} className="h-6 text-xs px-2">
                            Select All
                          </Button>
                        </div>
                      </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input placeholder="Name..." value={nameFilter} onChange={e => setNameFilter(e.target.value)} className="pl-10 h-9 text-sm" />
                          </div>
                          <Input placeholder="Email..." value={emailFilter} onChange={e => setEmailFilter(e.target.value)} className="h-9 text-sm" />
                          <Input placeholder="Phone..." value={phoneFilter} onChange={e => setPhoneFilter(e.target.value)} className="h-9 text-sm" />
                          <Input placeholder="User ID..." value={userIdFilter} onChange={e => setUserIdFilter(e.target.value)} className="h-9 text-sm" />
                          <Select value={longListSourceFilter} onValueChange={setLongListSourceFilter}>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Source" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Sources</SelectItem>
                              <SelectItem value="Itris">Itris</SelectItem>
                              <SelectItem value="Linkedin">LinkedIn</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={scoreFilter} onValueChange={setScoreFilter}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Score" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Scores</SelectItem>
                            <SelectItem value="high">High (75+)</SelectItem>
                            <SelectItem value="moderate">Moderate (50-74)</SelectItem>
                            <SelectItem value="poor">Poor (1-49)</SelectItem>
                            <SelectItem value="none">No Score</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={contactedFilter} onValueChange={setContactedFilter}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
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
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {(() => {
                  // Group candidates by Candidate_ID to handle multiple contacts
                  const groupedCandidates = filteredCandidates.reduce((acc, candidate) => {
                    const candidateId = candidate["Candidate_ID"];
                    if (!acc[candidateId]) {
                      acc[candidateId] = [];
                    }
                    acc[candidateId].push(candidate);
                    return acc;
                  }, {} as Record<string, any[]>);
                  return Object.entries(groupedCandidates).map(([candidateId, candidateContacts]: [string, any[]]) => {
                    // Use the first contact for display info
                    const mainCandidate = candidateContacts[0];
                    return <Card key={candidateId} className={cn("border border-border/50 hover:border-primary/50 transition-colors hover:shadow-lg", selectedCandidates.has(candidateId) && "border-primary bg-primary/5")}>
                              <CardContent className="p-3 md:p-4">
                                 <div className="space-y-3">
                                   <div className="flex items-start justify-between">
                                     <div className="flex items-start gap-3 min-w-0 flex-1">
                                       <input type="checkbox" checked={selectedCandidates.has(candidateId)} onChange={() => toggleCandidateSelection(candidateId)} className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                                       <div className="min-w-0 flex-1">
                                         <h4 className="font-semibold text-sm md:text-base truncate">{mainCandidate["Candidate Name"] || "Unknown"}</h4>
                                         <div className="space-y-1">
                                           
                                           {(mainCandidate["Contacted"]?.toLowerCase() === "call done" || mainCandidate["Contacted"]?.toLowerCase() === "contacted" || mainCandidate["Contacted"]?.toLowerCase() === "low scored" || mainCandidate["Contacted"]?.toLowerCase() === "tasked") && mainCandidate["lastcalltime"] && <div className="text-xs text-muted-foreground flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {new Date(mainCandidate["lastcalltime"]).toLocaleDateString()}
                                                <span className="ml-2">
                                                  {new Date(mainCandidate["lastcalltime"]).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                                </span>
                                              </div>}
                                         </div>
                                       </div>
                                     </div>
                                     <Button variant="ghost" size="sm" onClick={() => showRemoveConfirmation(candidateId, mainCandidate["Candidate Name"] || "Unknown")} className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive" title="Remove from Long List">
                                       <X className="h-3 w-3" />
                                     </Button>
                                   </div>
                                  
                                  <div className="space-y-2 text-xs md:text-sm">
                                    {mainCandidate["Candidate Email"] && <div className="flex items-center text-muted-foreground min-w-0">
                                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="truncate">{mainCandidate["Candidate Email"]}</span>
                                      </div>}
                                    
                                     {mainCandidate["Candidate Phone Number"] && <div className="flex items-center text-muted-foreground min-w-0">
                                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="truncate">{mainCandidate["Candidate Phone Number"]}</span>
                                      </div>}
                                      
                                      {mainCandidate["Source"] && <div className="flex items-center text-muted-foreground min-w-0">
                                        <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="truncate">{mainCandidate["Source"]}</span>
                                      </div>}
                                       {typeof mainCandidate["Source"] === 'string' && mainCandidate["Source"].toLowerCase().includes('linkedin') && !["ready to contact", "not contacted", "1st no answer", "2nd no answer", "3rd no answer", "1st no anwser", "2nd no anwser", "3rd no anwser"].includes(mainCandidate["Contacted"]?.toLowerCase() || "") && <div className="flex items-center text-muted-foreground min-w-0">
                                           <Star className="w-4 h-4 mr-2 flex-shrink-0" />
                                           <span className="truncate">LinkedIn Score: {mainCandidate["linkedin_score"] ?? mainCandidate["cv_score"] ?? mainCandidate["CV Score"] ?? 'N/A'}</span>
                                         </div>}
                                  </div>

                                  {/* CV Score and Reason Section */}
                                  <div className="space-y-2 pt-2 border-t">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                       <div className="space-y-1">
                                          {(!["ready to contact", "not contacted", "1st no answer", "2nd no answer", "3rd no answer", "1st no anwser", "2nd no anwser", "3rd no anwser"].includes(mainCandidate["Contacted"]?.toLowerCase() || "") || typeof mainCandidate["Source"] === 'string' && mainCandidate["Source"].toLowerCase().includes('itris')) && <div className="flex items-center justify-between">
                                               <span className="text-muted-foreground">{typeof mainCandidate["Source"] === 'string' && mainCandidate["Source"].toLowerCase().includes('linkedin') ? 'LinkedIn Score:' : 'CV Score:'}</span>
                                               <span className="font-medium">{typeof mainCandidate["Source"] === 'string' && mainCandidate["Source"].toLowerCase().includes('linkedin') ? mainCandidate["linkedin_score"] || mainCandidate["cv_score"] || "N/A" : mainCandidate["cv_score"] || "N/A"}</span>
                                             </div>}
                                          {mainCandidate["after_call_score"] && mainCandidate["after_call_score"] !== 0 && <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">After Call Score:</span>
                                            <span className="font-medium">{mainCandidate["after_call_score"]}</span>
                                          </div>}
                                          <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">User ID:</span>
                                            <span className="font-mono text-xs">{mainCandidate["user_id"] || "N/A"}</span>
                                          </div>
                                       </div>
                                      <div className="space-y-1">
                                        
                                      </div>
                                    </div>
                                    {mainCandidate["Source"] && typeof mainCandidate["Source"] === 'string' && mainCandidate["Source"].toLowerCase().includes("linkedin") && mainCandidate["linkedin_score_reason"] ? <div className="pt-1">
                                        <span className="text-muted-foreground text-xs">Reason:</span>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                          {mainCandidate["linkedin_score_reason"]}
                                        </p>
                                      </div> : mainCandidate["cv_score_reason"] && <div className="pt-1">
                                          <span className="text-muted-foreground text-xs">Reason:</span>
                                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {mainCandidate["cv_score_reason"]}
                                          </p>
                                        </div>}
                                  </div>

                                   <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t gap-2">
                                     <div className="flex flex-wrap items-center gap-1">
                                       <StatusDropdown currentStatus={mainCandidate["Contacted"]} candidateId={mainCandidate["Candidate_ID"]} jobId={id!} onStatusChange={newStatus => {
                                setCandidates(prev => prev.map(c => c["Candidate_ID"] === mainCandidate["Candidate_ID"] ? {
                                  ...c,
                                  Contacted: newStatus
                                } : c));
                              }} variant="badge" />
                                       {getCandidateStatus(mainCandidate["Candidate_ID"]) && <StatusDropdown currentStatus={getCandidateStatus(mainCandidate["Candidate_ID"])} candidateId={mainCandidate["Candidate_ID"]} jobId={null} onStatusChange={newStatus => {
                                setCvData(prev => prev.map(cv => cv['Cadndidate_ID'] === mainCandidate["Candidate_ID"] ? {
                                  ...cv,
                                  CandidateStatus: newStatus
                                } : cv));
                              }} variant="badge" />}
                                     </div>
                                      <div className="flex flex-col gap-1 items-end">
                                        {/* Only show overall score when status is Call Done */}
                                        {mainCandidate["Contacted"]?.toLowerCase() === "call done" && getOverallScoreBadge(mainCandidate)}
                                        {!["ready to contact", "not contacted", "1st no answer", "2nd no answer", "3rd no answer", "1st no anwser", "2nd no anwser", "3rd no anwser"].includes(mainCandidate["Contacted"]?.toLowerCase() || "") && getScoreBadge(mainCandidate["Success Score"] || mainCandidate["cv_score"] || mainCandidate["CV Score"])}
                                      </div>
                                   </div>

                                  {/* Call Log Buttons */}
                                  <div className="space-y-2 pt-2 border-t">
                                    <div className="flex flex-col sm:flex-row gap-2">
                                      <Button variant="default" size="sm" onClick={() => handleCallCandidate(mainCandidate["Candidate_ID"], id!, mainCandidate["callid"])} disabled={callingCandidateId === candidateId} className="w-full sm:flex-1 bg-foreground hover:bg-foreground/90 text-background disabled:opacity-50 text-xs md:text-sm">
                                        <Phone className="w-3 h-3 mr-1" />
                                        {callingCandidateId === candidateId ? 'Calling...' : 'Call Candidate'}
                                      </Button>
                                      {(() => {
                                const contactsWithCalls = candidateContacts.filter(contact => contact.callcount > 0);
                                if (contactsWithCalls.length === 0) return null;

                                // Get the latest call log (highest callid)
                                const latestContact = contactsWithCalls.reduce((latest, current) => current.callid > latest.callid ? current : latest);
                                return <Button key={latestContact.callid} variant="outline" size="sm" asChild className="flex-1 min-w-0 text-xs md:text-sm">
                                            <Link to={`/call-log-details?candidate=${candidateId}&job=${id}&callid=${latestContact.callid}`} className="truncate" onClick={() => {
                                    // Store current tab in URL hash for back navigation
                                    window.location.hash = 'tab=boolean-search';
                                  }}>
                                              <FileText className="w-3 h-3 mr-1 flex-shrink-0" />
                                              <span className="truncate">Call Log</span>
                                            </Link>
                                          </Button>;
                              })()}
                                    </div>
                                    
                                    {/* Show All Record Info Button */}
                                    
                                    
                                    <Button variant="ghost" size="sm" asChild className="w-full text-xs md:text-sm">
                                      <Link to={`/candidate/${candidateId}`}>
                                        <Users className="w-3 h-3 mr-1" />
                                        View Profile
                                      </Link>
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>;
                  });
                })()}
                    </div>
                  </>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shortlist" className="space-y-4">
            <div className="space-y-6">
              {/* Within Budget Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Within Budget ({withinBudgetCandidates.length} candidates)
                  </CardTitle>
                  <CardDescription>
                    High-scoring candidates with salary expectations within 20% of budget ({formatCurrency(jobBudget.toString(), job?.Currency)} + 20%)
                  </CardDescription>
                  
                  {/* AI Short List Filters - Single Line */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t items-center">
                    <div className="relative min-w-0 flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input placeholder="Name..." value={shortListNameFilter} onChange={e => setShortListNameFilter(e.target.value)} className="pl-10 h-9 text-sm" />
                    </div>
                    <Input placeholder="Email..." value={shortListEmailFilter} onChange={e => setShortListEmailFilter(e.target.value)} className="h-9 text-sm min-w-0 flex-1" />
                    <Input placeholder="Phone..." value={shortListPhoneFilter} onChange={e => setShortListPhoneFilter(e.target.value)} className="h-9 text-sm min-w-0 flex-1" />
                    <Input placeholder="User ID..." value={shortListUserIdFilter} onChange={e => setShortListUserIdFilter(e.target.value)} className="h-9 text-sm min-w-0 flex-1" />
                    <Input placeholder="Source..." value={shortListSourceFilter} onChange={e => setShortListSourceFilter(e.target.value)} className="h-9 text-sm min-w-0 flex-1" />
                    <Select value={shortListSourceFilter} onValueChange={setShortListSourceFilter}>
                      <SelectTrigger className="h-9 text-sm w-32">
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="Itris">Itris</SelectItem>
                        <SelectItem value="Linkedin">LinkedIn</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={shortListScoreFilter} onValueChange={setShortListScoreFilter}>
                      <SelectTrigger className="h-9 text-sm w-32">
                        <SelectValue placeholder="Score" />
                      </SelectTrigger>
                      <SelectContent>
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
                  {withinBudgetCandidates.length === 0 ? <div className="text-center py-8">
                      <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No within-budget candidates yet</h3>
                      <p className="text-muted-foreground">High-scoring candidates within budget will appear here</p>
                    </div> : <ScrollArea className="h-[600px] w-full">
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pr-4">
                        {(() => {
                    // Group within budget candidates by Candidate_ID and sort by score
                    const groupedWithinBudget = withinBudgetCandidates.reduce((acc, candidate) => {
                      const candidateId = candidate["Candidate_ID"];
                      if (!acc[candidateId]) {
                        acc[candidateId] = [];
                      }
                      acc[candidateId].push(candidate);
                      return acc;
                    }, {} as Record<string, any[]>);

                    // Convert to array and sort by highest Overall Score first
                    const sortedCandidateEntries = Object.entries(groupedWithinBudget).sort(([, candidateContactsA], [, candidateContactsB]) => {
                      const candidateA = candidateContactsA[0];
                      const candidateB = candidateContactsB[0];

                      // Use the calculateOverallScore function for consistent scoring
                      const overallScoreA = calculateOverallScore(candidateA);
                      const overallScoreB = calculateOverallScore(candidateB);
                      return overallScoreB - overallScoreA; // Sort in descending order (highest Overall Score first)
                    });
                    return sortedCandidateEntries.map(([candidateId, candidateContacts]: [string, any[]], index: number) => {
                      const mainCandidate = candidateContacts[0];
                      const isTopCandidate = index < 3; // Top 3 candidates get golden effect
                      return renderCandidateCard(candidateId, candidateContacts, mainCandidate, isTopCandidate);
                    });
                  })()}
                      </div>
                    </ScrollArea>}
                </CardContent>
              </Card>

              {/* Above Budget Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Above Budget ({aboveBudgetCandidates.length} candidates)
                  </CardTitle>
                  <CardDescription>
                    High-scoring candidates with salary expectations more than 20% above budget ({formatCurrency(budgetThreshold.toString(), job?.Currency)}+)
                  </CardDescription>
                  
                  {/* AI Short List Filters - Single Line */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t items-center">
                    <div className="relative min-w-0 flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input placeholder="Name..." value={shortListNameFilter} onChange={e => setShortListNameFilter(e.target.value)} className="pl-10 h-9 text-sm" />
                    </div>
                    <Input placeholder="Email..." value={shortListEmailFilter} onChange={e => setShortListEmailFilter(e.target.value)} className="h-9 text-sm min-w-0 flex-1" />
                    <Input placeholder="Phone..." value={shortListPhoneFilter} onChange={e => setShortListPhoneFilter(e.target.value)} className="h-9 text-sm min-w-0 flex-1" />
                    <Input placeholder="User ID..." value={shortListUserIdFilter} onChange={e => setShortListUserIdFilter(e.target.value)} className="h-9 text-sm min-w-0 flex-1" />
                    <Input placeholder="Source..." value={shortListSourceFilter} onChange={e => setShortListSourceFilter(e.target.value)} className="h-9 text-sm min-w-0 flex-1" />
                    <Select value={shortListSourceFilter} onValueChange={setShortListSourceFilter}>
                      <SelectTrigger className="h-9 text-sm w-32">
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="Itris">Itris</SelectItem>
                        <SelectItem value="Linkedin">LinkedIn</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={shortListScoreFilter} onValueChange={setShortListScoreFilter}>
                      <SelectTrigger className="h-9 text-sm w-32">
                        <SelectValue placeholder="Score" />
                      </SelectTrigger>
                      <SelectContent>
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
                  {aboveBudgetCandidates.length === 0 ? <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No above-budget candidates</h3>
                      <p className="text-muted-foreground">High-scoring candidates above budget will appear here</p>
                    </div> : <ScrollArea className="h-[600px] w-full">
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pr-4">
                        {(() => {
                    // Group above budget candidates by Candidate_ID and sort by Overall Score
                    const groupedAboveBudget = aboveBudgetCandidates.reduce((acc, candidate) => {
                      const candidateId = candidate["Candidate_ID"];
                      if (!acc[candidateId]) {
                        acc[candidateId] = [];
                      }
                      acc[candidateId].push(candidate);
                      return acc;
                    }, {} as Record<string, any[]>);

                    // Sort by Overall Score descending (highest first)
                    const sortedAboveBudgetEntries = Object.entries(groupedAboveBudget).sort(([, candidateContactsA], [, candidateContactsB]) => {
                      const candidateA = candidateContactsA[0];
                      const candidateB = candidateContactsB[0];

                      // Use the calculateOverallScore function for consistent scoring
                      const overallScoreA = calculateOverallScore(candidateA);
                      const overallScoreB = calculateOverallScore(candidateB);
                      return overallScoreB - overallScoreA; // Sort in descending order (highest Overall Score first)
                    });
                    return sortedAboveBudgetEntries.map(([candidateId, candidateContacts]: [string, any[]]) => {
                      const mainCandidate = candidateContacts[0];
                      return renderCandidateCard(candidateId, candidateContacts, mainCandidate);
                    });
                  })()}
                      </div>
                    </ScrollArea>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <JobDialog job={job} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} onSave={() => {
      fetchJob(id!);
      setIsEditDialogOpen(false);
    }} />

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Regenerate Long List</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to regenerate Long List?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
            setShowConfirmDialog(false);
            handleGenerateLongList();
          }}>
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
                Please select 3 preferred interview slots and interview type. Only future dates are allowed, and times must be in 15-minute intervals.
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
              {interviewType === 'Online Meeting' && <div className="space-y-2">
                  <label className="text-sm font-medium">Interview Link</label>
                  <Input type="url" placeholder="https://zoom.us/j/... or https://meet.google.com/..." value={interviewLink} onChange={e => setInterviewLink(e.target.value)} className="w-full" />
                </div>}
              
              {interviewSlots.map((slot, index) => <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium">Slot {index + 1}</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Date Picker */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !slot.date && "text-muted-foreground")}>
                            <Calendar className="mr-2 h-4 w-4" />
                            {slot.date ? format(slot.date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent mode="single" selected={slot.date} onSelect={date => updateInterviewSlot(index, 'date', date!)} disabled={date => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }} initialFocus className="p-3 pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Time Picker */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Time</label>
                      <div className="grid grid-cols-2 gap-2">
                        {/* Hours */}
                        <Select value={slot.time.split(':')[0] || ''} onValueChange={hour => {
                    const minute = slot.time.split(':')[1] || '00';
                    const newTime = `${hour}:${minute}`;

                    // Validate time is not in the past for today
                    if (slot.date) {
                      const today = new Date();
                      const slotDate = format(slot.date, 'yyyy-MM-dd');
                      const currentDate = format(today, 'yyyy-MM-dd');
                      const currentTime = format(today, 'HH:mm');
                      if (slotDate === currentDate && newTime <= currentTime) {
                        alert('Cannot select a time in the past for today');
                        return;
                      }
                    }
                    updateInterviewSlot(index, 'time', newTime);
                  }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({
                        length: 24
                      }, (_, i) => <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                {i.toString().padStart(2, '0')}
                              </SelectItem>)}
                          </SelectContent>
                        </Select>

                        {/* Minutes */}
                        <Select value={slot.time.split(':')[1] || ''} onValueChange={minute => {
                    const hour = slot.time.split(':')[0] || '09';
                    const newTime = `${hour}:${minute}`;

                    // Validate time is not in the past for today
                    if (slot.date) {
                      const today = new Date();
                      const slotDate = format(slot.date, 'yyyy-MM-dd');
                      const currentDate = format(today, 'yyyy-MM-dd');
                      const currentTime = format(today, 'HH:mm');
                      if (slotDate === currentDate && newTime <= currentTime) {
                        alert('Cannot select a time in the past for today');
                        return;
                      }
                    }
                    updateInterviewSlot(index, 'time', newTime);
                  }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Min" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map(minute => <SelectItem key={minute} value={minute}>
                                {minute}
                              </SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>)}

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
              <AlertDialogDescription>
                Are you sure you want to remove {candidateToRemove?.name}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmRemoveFromLongList}>
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>;
}