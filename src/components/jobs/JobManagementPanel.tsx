// @ts-nocheck
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building2, MapPin, Banknote, Users, Edit, Trash2, Play, Pause, Briefcase, Phone, PhoneOff, UserCircle, Calendar, Clock, X, Info, Lock, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { JobDialog } from "./JobDialog";
import { useProfile } from "@/hooks/useProfile";
import { useUserRole } from "@/hooks/useUserRole";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
interface Job {
  job_id: string;
  job_title: string | null;
  job_description: string | null;
  client_description: string | null;
  job_location: string | null;
  job_salary_range: string | null;
  Currency?: string | null;
  Processed: string | null;
  status?: string | null;
  things_to_look_for: string | null;
  jd_summary: string | null;
  musttohave?: string | null;
  nicetohave?: string | null;
  Timestamp: string | null;
  group_id?: string | null;
  automatic_dial?: boolean | null;
  contract_length?: string | null;
  longlisted_count?: number;
  shortlisted_count?: number;
  rejected_count?: number;
  submitted_count?: number;
  recruiter_id?: string | null;
  recruiter_name?: string | null;
  groups?: {
    id: string;
    name: string;
    color: string | null;
  } | null;
}
export function JobManagementPanel() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("");
  const [selectedRecruiterFilter, setSelectedRecruiterFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });
  const [groups, setGroups] = useState<Array<{
    id: string;
    name: string;
    color: string | null;
  }>>([]);
  const [recruiters, setRecruiters] = useState<Array<{
    id: string;
    name: string;
  }>>([]);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    profile,
    loading: profileLoading
  } = useProfile();
  const {
    isAdmin,
    isManager,
    isTeamLeader,
    isViewer,
    canCreateJobs,
    loading: rolesLoading
  } = useUserRole();
  const { isAutomaticDialPaused, isJobCreationPaused } = useAdminSettings();

  
  useEffect(() => {
    // Wait for both profile and roles to be fully loaded before fetching
    if (profileLoading || rolesLoading) {
      return; // Keep loading state true while data is being fetched
    }
    
    if (profile?.user_id) {
      fetchJobs();
      fetchGroups();
    } else {
      // Profile loading complete but no user - set loading false
      setLoading(false);
    }
  }, [profile?.user_id, isAdmin, isManager, isTeamLeader, profileLoading, rolesLoading]);
  const fetchJobs = useCallback(async () => {
    // Guard: Ensure we have all necessary data before fetching
    if (!profile?.user_id) {
      console.log('JobManagementPanel: No user_id, skipping fetch');
      setLoading(false);
      return;
    }
    
    // Don't fetch if roles haven't loaded yet
    if (rolesLoading) {
      console.log('JobManagementPanel: Roles still loading, skipping fetch');
      return;
    }
    
    try {
      console.log('JobManagementPanel: Starting fetch for user:', profile.user_id, 
                  'Roles:', { isAdmin, isManager, isTeamLeader });
      const startTime = performance.now();

      // Optimize: Build query with proper conditions
      let query = supabase.from('Jobs').select(`
          job_id, job_title, client_description, job_location, job_salary_range, Currency, Processed, status, Timestamp, group_id, automatic_dial, jd_summary, recruiter_id, contract_length,
          groups ( id, name, color )
        `);

      // Admins, Managers, Team Leaders, and Viewers can view all jobs
      const canViewAllJobs = isAdmin || isManager || isTeamLeader || isViewer;
      if (!canViewAllJobs) {
        // Regular employees only see jobs assigned to them (support both new and legacy fields)
        const userId = profile.user_id;
        const email = profile.email;
        if (userId && email) {
          query = query.or(`recruiter_id.eq.${userId},assignment.eq.${email}`);
        } else if (userId) {
          query = query.eq('recruiter_id', userId);
        } else if (email) {
          query = query.eq('assignment', email);
        }
      }
      const jobsResult = await query.order('Timestamp', {
        ascending: false
      });
      if (jobsResult.error) throw jobsResult.error;
      const initialJobs = jobsResult.data || [];

      // Fetch candidates only for the jobs we have access to
      const jobIds = initialJobs.map(j => j.job_id).filter(Boolean);
      // Optimized: Fetch candidates per job with reduced limit
      const candidatesByJob = new Map<string, any[]>();
      if (jobIds.length > 0) {
        const perJobPromises = jobIds.map(jid => supabase.from('Jobs_CVs').select('job_id, source, contacted, shortlisted_at, longlisted_at, submitted_at, after_call_score').eq('job_id', jid).limit(500)); // Reduced from 10000 to 500
        const perJobResults = await Promise.all(perJobPromises);
        perJobResults.forEach((res, idx) => {
          if (res.error) {
            console.warn('JobManagementPanel: error fetching candidates for', jobIds[idx], res.error);
            return;
          }
          const rows = res.data || [];
          candidatesByJob.set(jobIds[idx], rows);
        });
      }
      console.log('JobManagementPanel: Jobs fetched:', initialJobs.length);
      console.log('JobManagementPanel: candidatesByJob built for jobs:', candidatesByJob.size);

      // Fetch recruiter names only if needed
      const recruiterIds = [...new Set(initialJobs.map(j => j.recruiter_id).filter(Boolean))];
      const recruiterNamesMap = new Map<string, string>();
      if (recruiterIds.length > 0) {
        const {
          data: profiles,
          error: profilesError
        } = await supabase.from('profiles').select('user_id, linkedin_id, name').or(`user_id.in.(${recruiterIds.join(',')}),linkedin_id.in.(${recruiterIds.join(',')})`);
        if (!profilesError && profiles) {
          profiles.forEach(p => {
            if (p.user_id && p.name) {
              recruiterNamesMap.set(p.user_id, p.name);
            }
            if (p.linkedin_id && p.name) {
              recruiterNamesMap.set(p.linkedin_id, p.name);
            }
          });
        }
      }

      // Calculate counts for all jobs before setting state
      const jobsWithCounts = initialJobs.map(job => {
        const candidates = candidatesByJob.get(job.job_id) || [];

        // Debug logging for the specific job
        if (job.job_id === 'me-j-0023') {
          console.log(`JobManagementPanel: Job "${job.job_title}" (${job.job_id}) has ${candidates.length} total candidates from Jobs_CVs`);
        }

        // Longlisted: all candidates in Jobs_CVs (AI Long List)
        const longlisted_count = candidates.length;
        const longlistedCandidates = candidates;

        // Debug logging for the specific job
        if (job.job_id === 'me-j-0023') {
          console.log(`JobManagementPanel: Job "${job.job_title}" longlisted count: ${longlisted_count}`);
        }

        // Shortlisted: candidates with score >= 75 (unified definition)
        // Exclude candidates with "Shortlisted from Similar jobs" status
        const shortlisted_count = longlistedCandidates.filter(c => {
          const score = parseInt(c.after_call_score || "0");
          const contacted = c.contacted || "";
          return score >= 75 && contacted !== "Shortlisted from Similar jobs";
        }).length;

        // Rejected: longlisted candidates with contacted status = 'Rejected'
        const rejected_count = longlistedCandidates.filter(c => {
          const contacted = (c.contacted || "").trim();
          return contacted === 'Rejected';
        }).length;

        // Submitted: only longlisted candidates with contacted status = 'Submitted' (matches JobFunnel)
        const submitted_count = longlistedCandidates.filter(c => {
          const contacted = (c.contacted || "").trim();
          return contacted === 'Submitted';
        }).length;
        return {
          ...job,
          longlisted_count,
          shortlisted_count,
          rejected_count,
          submitted_count,
          recruiter_name: job.recruiter_id ? recruiterNamesMap.get(job.recruiter_id) || null : null
        };
      });
      
      // Auto-disable removed - users have full manual control
      
      const endTime = performance.now();
      console.log(`JobManagementPanel: Fetch completed in ${(endTime - startTime).toFixed(2)}ms`);
      console.log('JobManagementPanel: Jobs with counts:', jobsWithCounts.length);

      // Extract unique recruiters
      const uniqueRecruiters = Array.from(new Map(jobsWithCounts.filter(job => job.recruiter_id && job.recruiter_name).map(job => [job.recruiter_id, {
        id: job.recruiter_id!,
        name: job.recruiter_name!
      }])).values()).sort((a, b) => a.name.localeCompare(b.name));
      setRecruiters(uniqueRecruiters);
      console.log('JobManagementPanel: Fetch complete. Jobs count:', jobsWithCounts.length);
      setJobs(jobsWithCounts);
      setLoading(false);
    } catch (error) {
      console.error('JobManagementPanel: Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive"
      });
      setJobs([]); // Set empty array on error to prevent stale data
      setLoading(false);
    }
  }, [profile?.user_id, isAdmin, isManager, isTeamLeader, rolesLoading, toast]);
  const fetchGroups = useCallback(async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('groups').select('id, name, color').order('name');
      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  }, []);

  // Real-time subscription for all Jobs table changes
  useEffect(() => {
    const channel = supabase
      .channel('jobs-realtime-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Jobs'
        },
        (payload) => {
          console.log('Jobs table changed:', payload.eventType, payload);
          
          // Refresh jobs list for any change
          fetchJobs();
          
          // Show toast for auto-dial disabled
          if (payload.eventType === 'UPDATE') {
            const updatedJob = payload.new as any;
            if (updatedJob.automatic_dial === false && !updatedJob.auto_dial_enabled_at) {
              toast({
                title: "Auto-dial disabled",
                description: `Job "${updatedJob.job_title}" has reached 6 shortlisted candidates. Auto-dial has been automatically disabled.`,
                duration: 8000,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, fetchJobs]);
  const handleStatusToggle = async (jobId: string, currentProcessed: string | null) => {
    const newProcessed = currentProcessed === "Yes" ? "No" : "Yes";
    
    // Optimistic UI update
    setJobs(prevJobs => prevJobs.map(job => 
      job.job_id === jobId 
        ? { ...job, Processed: newProcessed, status: newProcessed === "No" ? "Complete" : "Active" }
        : job
    ));
    
    try {
      let newStatus = null;
      
      if (newProcessed === "No") {
        // User is pausing - always set to Complete
        newStatus = 'Complete';
      } else {
        // User is resuming - check if job has candidates
        const { data: candidatesData } = await supabase
          .from('Jobs_CVs')
          .select('recordid')
          .eq('job_id', jobId)
          .limit(1);
        
        const hasCandidates = candidatesData && candidatesData.length > 0;
        
        if (hasCandidates) {
          newStatus = 'Recruiting';
        } else {
          // Check if AI requirements exist
          const { data: jobData } = await supabase
            .from('Jobs')
            .select('things_to_look_for, musttohave, nicetohave')
            .eq('job_id', jobId)
            .single();
          
          const hasAI = jobData?.things_to_look_for || jobData?.musttohave || jobData?.nicetohave;
          newStatus = hasAI ? 'Processing' : 'Active';
        }
      }
      
      const updateData: any = { Processed: newProcessed };
      if (newStatus) {
        updateData.status = newStatus;
      }
      
      const { error } = await supabase
        .from('Jobs')
        .update(updateData)
        .eq('job_id', jobId);
      
      if (error) throw error;
      
      // Refresh to get accurate data
      await fetchJobs();
      
      toast({
        title: "✓ Success",
        description: newProcessed === "Yes" ? "Job reactivated and active" : "Job paused successfully",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating job status:', error);
      // Revert optimistic update on error
      await fetchJobs();
      toast({
        title: "Error",
        description: "Failed to update job status. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  const handleAutomaticDialToggle = async (jobId: string, currentValue: boolean | null) => {
    const newValue = !currentValue;
    
    // Optimistic UI update
    setJobs(prevJobs => prevJobs.map(job => 
      job.job_id === jobId 
        ? { ...job, automatic_dial: newValue }
        : job
    ));
    
    try {
      // Update with timestamp when enabling
      const updateData: { automatic_dial: boolean; auto_dial_enabled_at?: string | null } = {
        automatic_dial: newValue
      };
      
      if (newValue) {
        // Set timestamp when enabling
        updateData.auto_dial_enabled_at = new Date().toISOString();
      } else {
        // Clear timestamp when disabling
        updateData.auto_dial_enabled_at = null;
      }
      
      const { error } = await supabase.from('Jobs').update(updateData).eq('job_id', jobId);
      if (error) throw error;
      
      // Refresh to get accurate data
      await fetchJobs();
      
      toast({
        title: "✓ Success",
        description: newValue 
          ? "Automatic dial enabled - will auto-disable after 48 hours or when 6 candidates are shortlisted" 
          : "Automatic dial disabled successfully",
        duration: 4000,
      });
    } catch (error) {
      console.error('Error updating automatic dial:', error);
      // Revert optimistic update on error
      await fetchJobs();
      toast({
        title: "Error",
        description: "Failed to update automatic dial. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      const { error } = await supabase
        .from('Jobs')
        .delete()
        .eq('job_id', jobId);
      
      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
      
      await fetchJobs();
      toast({
        title: "✓ Success",
        description: "Job deleted successfully",
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error Deleting Job",
        description: error?.message || "Failed to delete job. Please check your permissions.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  const getStatusBadge = (status: string | null, processed: string | null) => {
    const displayStatus = status || (processed === "Yes" ? "Active" : "Completed");
    
    const badgeConfig: Record<string, { color: string; icon: string }> = {
      'Active': { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '🔵' },
      'Processing': { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30 animate-pulse', icon: '🟣' },
      'Recruiting': { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '🟢' },
      'Completed': { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: '🟡' },
    };
    
    const config = badgeConfig[displayStatus] || badgeConfig['Active'];
    
    return (
      <Badge className={`${config.color} font-light border`}>
        <span className="mr-1">{config.icon}</span>
        {displayStatus}
      </Badge>
    );
  };
  // Memoize expensive filtering operations
  const filteredJobs = useMemo(() => {
    const filterJobsByGroup = (jobList: Job[]) => {
      if (!selectedGroupFilter) return jobList;
      if (selectedGroupFilter === "ungrouped") {
        return jobList.filter(job => !job.group_id);
      }
      return jobList.filter(job => job.group_id === selectedGroupFilter);
    };
    const filterJobsByDate = (jobList: Job[]) => {
      if (!dateRange.from && !dateRange.to) return jobList;
      return jobList.filter(job => {
        if (!job.Timestamp) return false;
        const jobDate = new Date(job.Timestamp);
        if (dateRange.from && dateRange.to) {
          const fromDate = new Date(dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          return jobDate >= fromDate && jobDate <= toDate;
        }
        if (dateRange.from) {
          const fromDate = new Date(dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          return jobDate >= fromDate;
        }
        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          return jobDate <= toDate;
        }
        return true;
      });
    };
    const filterJobsByRecruiter = (jobList: Job[]) => {
      if (!selectedRecruiterFilter) return jobList;
      return jobList.filter(job => job.recruiter_id === selectedRecruiterFilter);
    };
    const filterJobsByTitle = (jobList: Job[]) => {
      if (!searchQuery.trim()) return jobList;
      const q = searchQuery.toLowerCase();
      return jobList.filter(job => job.job_title?.toLowerCase().includes(q));
    };
    const applyFilters = (jobList: Job[]) => {
      let filtered = filterJobsByGroup(jobList);
      filtered = filterJobsByDate(filtered);
      filtered = filterJobsByRecruiter(filtered);
      filtered = filterJobsByTitle(filtered);
      return filtered;
    };
    const activeJobs = jobs.filter(job => job.Processed === "Yes");
    const pausedJobs = jobs.filter(job => job.Processed !== "Yes");
    return {
      activeJobs: applyFilters(activeJobs),
      pausedJobs: applyFilters(pausedJobs),
      allJobs: applyFilters(jobs)
    };
  }, [jobs, selectedGroupFilter, selectedRecruiterFilter, dateRange, searchQuery]);
  return <div className="space-y-4 sm:space-y-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="w-full sm:w-auto">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-light font-work tracking-tight">Job Management</h2>
          <p className="text-sm sm:text-base font-light font-inter text-muted-foreground">Manage job postings and recruitment campaigns</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {!isViewer && (
            <Button onClick={() => navigate("/groups")} variant="outline" className="flex items-center gap-2 font-light font-inter text-xs sm:text-sm flex-1 sm:flex-none">
              <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Manage</span> Groups
            </Button>
          )}
          {!isViewer && (
            (isAdmin || !isJobCreationPaused) ? (
              <Button 
                onClick={() => navigate("/jobs/add")} 
                className="action-button bg-gradient-primary hover:shadow-glow font-light font-inter text-xs sm:text-sm flex-1 sm:flex-none"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Create Job
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      disabled
                      className="action-button bg-muted text-muted-foreground font-light font-inter text-xs sm:text-sm flex-1 sm:flex-none cursor-not-allowed"
                    >
                      <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Create Job
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Job creation is currently paused by admin</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          )}
        </div>
      </div>

      {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Search by Job Title */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search by job title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-10 px-3 py-2 rounded-md border border-border bg-background text-sm font-light font-inter w-full sm:w-[240px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {/* Group Filter */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:flex-row sm:items-center sm:gap-2">
            <label className="text-xs sm:text-sm font-light font-inter">Filter by Group:</label>
            <select value={selectedGroupFilter} onChange={e => setSelectedGroupFilter(e.target.value)} className="h-10 px-3 py-2 rounded-md border border-border bg-background text-sm font-light font-inter w-full sm:w-auto">
              <option value="">All Groups</option>
              <option value="ungrouped">Ungrouped</option>
              {groups.map(group => <option key={group.id} value={group.id}>
                  {group.name}
                </option>)}
            </select>
          </div>
        {selectedGroupFilter && <Button variant="ghost" size="sm" onClick={() => setSelectedGroupFilter("")} className="text-xs font-light font-inter h-10 w-full sm:w-auto">
            Clear Filter
          </Button>}

        {/* Recruiter Filter */}
        <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:flex-row sm:items-center sm:gap-2">
          <label className="text-xs sm:text-sm font-light font-inter">Filter by Recruiter:</label>
          <select value={selectedRecruiterFilter} onChange={e => setSelectedRecruiterFilter(e.target.value)} className="h-10 px-3 py-2 rounded-md border border-border bg-background text-sm font-light font-inter w-full sm:w-auto">
            <option value="">All Recruiters</option>
            {recruiters.map(recruiter => <option key={recruiter.id} value={recruiter.id}>
                {recruiter.name}
              </option>)}
          </select>
        </div>
        {selectedRecruiterFilter && <Button variant="ghost" size="sm" onClick={() => setSelectedRecruiterFilter("")} className="text-xs font-light font-inter h-10 w-full sm:w-auto">
            Clear Filter
          </Button>}

        {/* Date Range Filter */}
        <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:flex-row sm:items-center sm:gap-2">
          <label className="text-xs sm:text-sm font-light font-inter whitespace-nowrap">Filter by Date:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("h-10 w-full sm:w-[280px] justify-start text-left font-light font-inter text-xs sm:text-sm", !dateRange.from && !dateRange.to && "text-muted-foreground")}>
                <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {dateRange.from ? dateRange.to ? <>
                        {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                      </> : format(dateRange.from, "MMM dd, yyyy") : "Pick a date range"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 pointer-events-auto bg-background">
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium mb-1 block">From:</label>
                    <input type="date" value={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : ''} onChange={e => {
                    const newDate = e.target.value ? new Date(e.target.value) : undefined;
                    setDateRange(prev => ({
                      ...prev,
                      from: newDate
                    }));
                  }} className="w-full px-2 py-1 text-sm border border-border rounded-md bg-background" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">To:</label>
                    <input type="date" value={dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''} onChange={e => {
                    const newDate = e.target.value ? new Date(e.target.value) : undefined;
                    setDateRange(prev => ({
                      ...prev,
                      to: newDate
                    }));
                  }} className="w-full px-2 py-1 text-sm border border-border rounded-md bg-background" />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {(dateRange.from || dateRange.to) && <Button variant="ghost" size="sm" onClick={() => setDateRange({
          from: undefined,
          to: undefined
        })} className="h-8 px-2">
              <X className="h-4 w-4" />
            </Button>}
        </div>
      </div>

      {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({
        length: 6
      }).map((_, i) => <Card key={i} className="mission-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-6 bg-muted rounded mb-2 animate-pulse" />
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                      <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-16 bg-muted rounded animate-pulse" />
                <div className="flex items-center justify-between pt-2">
                  <div className="flex space-x-2">
                    <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                    <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                    <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>)}
        </div> : <Tabs defaultValue="active" className="space-y-4 sm:space-y-6">
          <TabsList className="glass-card w-full grid grid-cols-3 gap-1 sm:flex sm:flex-nowrap h-auto p-1">
            <TabsTrigger value="active" className="data-[state=active]:bg-status-active data-[state=active]:text-white text-xs sm:text-sm whitespace-normal sm:whitespace-nowrap py-2.5 px-2 sm:px-4 min-h-[44px]">
              <span className="hidden sm:inline">Active Jobs</span>
              <span className="sm:hidden">Active</span>
              <span className="ml-0.5 sm:ml-1">({filteredJobs.activeJobs.length})</span>
            </TabsTrigger>
            <TabsTrigger value="paused" className="text-xs sm:text-sm whitespace-normal sm:whitespace-nowrap py-2.5 px-2 sm:px-4 min-h-[44px]">
              <span className="hidden sm:inline">Paused Jobs</span>
              <span className="sm:hidden">Paused</span>
              <span className="ml-0.5 sm:ml-1">({filteredJobs.pausedJobs.length})</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm whitespace-normal sm:whitespace-nowrap py-2.5 px-2 sm:px-4 min-h-[44px]">
              <span className="hidden sm:inline">All Jobs</span>
              <span className="sm:hidden">All</span>
              <span className="ml-0.5 sm:ml-1">({filteredJobs.allJobs.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <JobGrid jobs={filteredJobs.activeJobs} loading={false} onEdit={job => {
          setSelectedJob(job);
          setIsDialogOpen(true);
        }} onDelete={handleDelete} onStatusToggle={handleStatusToggle} onAutomaticDialToggle={handleAutomaticDialToggle} navigate={navigate} isAutomaticDialPaused={isAutomaticDialPaused} isAdmin={isAdmin} />
          </TabsContent>
          
          <TabsContent value="paused">
            <JobGrid jobs={filteredJobs.pausedJobs} loading={false} onEdit={job => {
          setSelectedJob(job);
          setIsDialogOpen(true);
        }} onDelete={handleDelete} onStatusToggle={handleStatusToggle} onAutomaticDialToggle={handleAutomaticDialToggle} navigate={navigate} isAutomaticDialPaused={isAutomaticDialPaused} isAdmin={isAdmin} />
          </TabsContent>
          
          <TabsContent value="all">
            <JobGrid jobs={filteredJobs.allJobs} loading={false} onEdit={job => {
          setSelectedJob(job);
          setIsDialogOpen(true);
        }} onDelete={handleDelete} onStatusToggle={handleStatusToggle} onAutomaticDialToggle={handleAutomaticDialToggle} navigate={navigate} isAutomaticDialPaused={isAutomaticDialPaused} isAdmin={isAdmin} />
          </TabsContent>
        </Tabs>}

      <JobDialog job={selectedJob} open={isDialogOpen} onOpenChange={open => {
      setIsDialogOpen(open);
      if (!open) {
        setSelectedJob(null);
      }
    }} onSave={() => {
      fetchJobs();
      setIsDialogOpen(false);
      setSelectedJob(null);
    }} />
    </div>;
}
interface JobGridProps {
  jobs: Job[];
  loading: boolean;
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
  onStatusToggle: (jobId: string, currentStatus: string | null) => void;
  onAutomaticDialToggle: (jobId: string, currentValue: boolean | null) => void;
  navigate: (path: string) => void;
  isAutomaticDialPaused: boolean;
  isAdmin: boolean;
}
const JobGrid = memo(function JobGrid({
  jobs,
  loading,
  onEdit,
  onDelete,
  onStatusToggle,
  onAutomaticDialToggle,
  navigate,
  isAutomaticDialPaused,
  isAdmin
}: JobGridProps) {
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
  const getStatusBadge = (status: string | null, processed: string | null) => {
    // If Processed is "No", always show Complete regardless of status field
    const displayStatus = processed === "No" 
      ? "Complete" 
      : (status || "Active");
    
    const badgeConfig: Record<string, { color: string; icon: string }> = {
      'Active': { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '🔵' },
      'Sourcing': { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: '🟣' },
      'Recruiting': { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '🟢' },
      'Complete': { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: '🟣' },
      'Completed': { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: '🟣' },
    };
    
    const config = badgeConfig[displayStatus] || badgeConfig['Active'];
    
    return (
      <Badge className={`${config.color} font-light border`}>
        <span className="mr-1">{config.icon}</span>
        {displayStatus}
      </Badge>
    );
  };
  if (!loading && jobs.length === 0) {
    return <Card className="mission-card">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground">Create your first job posting to get started</p>
          </div>
        </CardContent>
      </Card>;
  }
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 px-2 sm:px-0">
      {jobs.map(job => <Card key={job.job_id} className="mission-card group overflow-hidden w-full">
          <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-5 lg:p-6">
            <div className="flex items-start justify-between gap-2 min-w-0">
              <div className="flex-1 min-w-0 overflow-hidden">
                <h4 className="line-clamp-2 mb-2 text-base sm:text-lg lg:text-xl font-normal break-words">
                  {job.job_title || "Untitled Position"}
                </h4>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                  {getStatusBadge(job.status, job.Processed)}
                  <Badge variant="outline" className="text-xs truncate max-w-[150px]">
                    ID: {job.job_id}
                  </Badge>
                  {job.groups && <Badge variant="outline" className="text-xs border truncate max-w-[150px] font-medium" style={{
                borderColor: job.groups.color || "#3B82F6",
                color: job.groups.color || "#3B82F6",
                backgroundColor: `${job.groups.color || "#3B82F6"}20`
              }}>
                      {job.groups.name}
                    </Badge>}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-5 lg:p-6 overflow-hidden">
            <div className="hidden sm:block space-y-1 sm:space-y-2 text-xs sm:text-sm">
              {job.recruiter_name && <div className="flex items-center text-muted-foreground min-w-0">
                  <UserCircle className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                  <span className="font-medium truncate">{job.recruiter_name}</span>
                </div>}
              {job.job_location && <div className="flex items-center text-muted-foreground min-w-0">
                  <MapPin className="h-4 w-4 mr-2 text-cyan flex-shrink-0" />
                  <span className="truncate">{job.job_location}</span>
                </div>}
              
              {job.job_salary_range && <div className="flex items-center text-muted-foreground min-w-0">
                  <Banknote className="h-4 w-4 mr-2 text-green flex-shrink-0" />
                  <span className="truncate">{formatCurrency(job.job_salary_range, job["Currency"] as string | null)}</span>
                </div>}
              
              {job.contract_length && <div className="flex items-center text-muted-foreground min-w-0">
                  <Clock className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                  <span className="truncate">{job.contract_length}</span>
                </div>}
              
              {job.Timestamp && <div className="flex items-center text-muted-foreground min-w-0">
                  <Calendar className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                  <span className="truncate">Created: {format(new Date(job.Timestamp), 'MMM dd, yyyy HH:mm')}</span>
                </div>}
            </div>

            {job.client_description && <p className="text-sm text-muted-foreground line-clamp-3">
                {job.client_description}
              </p>}

            {/* Candidate Counts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="flex flex-col items-center p-2 sm:p-2.5 rounded-md bg-blue/10 border border-blue/20">
                <div className="flex items-center gap-1 text-blue">
                  <Users className="h-4 w-4 sm:h-3 sm:w-3" />
                  <span className="font-bold text-lg sm:text-xl">{job.longlisted_count || 0}</span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">Longlisted</span>
              </div>
              <div
                className="flex flex-col items-center p-2 sm:p-2.5 rounded-md bg-warning/10 border border-warning/20 cursor-pointer hover:bg-warning/20 transition-colors"
                onClick={() => navigate(`/job/${job.job_id}`, { state: { tab: "shortlist" } })}
                title="Click to view AI Shortlist"
              >
                <div className="flex items-center gap-1 text-warning">
                  <Users className="h-4 w-4 sm:h-3 sm:w-3" />
                  <span className="font-bold text-lg sm:text-xl">{job.shortlisted_count || 0}</span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">Shortlisted</span>
              </div>
              <div
                className="flex flex-col items-center p-2 sm:p-2.5 rounded-md bg-destructive/10 border border-destructive/20 cursor-pointer hover:bg-destructive/20 transition-colors"
                onClick={() => navigate(`/job/${job.job_id}`, { state: { tab: "shortlist" } })}
                title="Click to view AI Shortlist"
              >
                <div className="flex items-center gap-1 text-destructive">
                  <Users className="h-4 w-4 sm:h-3 sm:w-3" />
                  <span className="font-bold text-lg sm:text-xl">{job.rejected_count || 0}</span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">Rejected</span>
              </div>
              <div
                className="flex flex-col items-center p-2 sm:p-2.5 rounded-md bg-success/10 border border-success/20 cursor-pointer hover:bg-success/20 transition-colors"
                onClick={() => navigate(`/job/${job.job_id}`, { state: { tab: "shortlist" } })}
                title="Click to view AI Shortlist"
              >
                <div className="flex items-center gap-1 text-success">
                  <Users className="h-4 w-4 sm:h-3 sm:w-3" />
                  <span className="font-bold text-lg sm:text-xl">{job.submitted_count || 0}</span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">Submitted</span>
              </div>
            </div>

            {/* Automatic Dial Toggle */}
            <div className="py-2 border-t border-border/30 space-y-1 sm:space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-sm">
                  {job.automatic_dial ? <Phone className="h-4 w-4 text-emerald-500" /> : <PhoneOff className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-muted-foreground text-xs sm:text-sm">Automatic Dial</span>
                  {isAutomaticDialPaused && !isAdmin && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-amber-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Automatic dialing is currently disabled by an administrator</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Switch 
                          checked={job.automatic_dial || false} 
                          onCheckedChange={() => onAutomaticDialToggle(job.job_id, job.automatic_dial)}
                          disabled={isAutomaticDialPaused && !isAdmin && !job.automatic_dial}
                        />
                      </span>
                    </TooltipTrigger>
                    {isAutomaticDialPaused && !isAdmin && !job.automatic_dial && (
                      <TooltipContent>
                        <p className="text-xs">Enabling automatic dial is currently disabled by an administrator</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Show status info */}
              {job.automatic_dial === true && (
                <span className="hidden sm:inline text-xs text-muted-foreground">
                  Active • {job.shortlisted_count || 0} shortlisted
                </span>
              )}
            </div>

            {/* Action Buttons - Mobile and Desktop */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-2 gap-2">
              {/* Mobile: Show all actions in a grid */}
              <div className="grid grid-cols-3 gap-2 sm:hidden">
                <Button size="sm" variant="outline" onClick={() => navigate(`/jobs/edit/${job.job_id}`)} className="h-11 flex-col gap-1">
                  <Edit className="h-4 w-4" />
                  <span className="text-[10px]">Edit</span>
                </Button>
                <Button size="sm" variant="outline" onClick={() => onStatusToggle(job.job_id, job.Processed)} className="h-11 flex-col gap-1">
                  {job.Processed === "Yes" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span className="text-[10px]">{job.Processed === "Yes" ? "Pause" : "Resume"}</span>
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(job.job_id)} className="h-11 flex-col gap-1 hover:bg-destructive hover:text-destructive-foreground">
                  <Trash2 className="h-4 w-4" />
                  <span className="text-[10px]">Delete</span>
                </Button>
              </div>

              {/* Desktop: Icon-only buttons */}
              <div className="hidden sm:flex space-x-2 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={() => navigate(`/jobs/edit/${job.job_id}`)} className="h-8 px-2">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onStatusToggle(job.job_id, job.Processed)} className="h-8 px-2">
                  {job.Processed === "Yes" ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(job.job_id)} className="h-8 px-2 hover:bg-destructive hover:text-destructive-foreground">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Open Job Button - Full width on mobile */}
              <Button size="sm" className="h-11 sm:h-8 w-full sm:w-auto text-sm" asChild>
                <Link to={`/job/${job.job_id}`}>
                  <Users className="h-4 w-4 sm:h-3 sm:w-3 mr-1.5" />
                  Open Job
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>)}
    </div>;
});