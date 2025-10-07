// @ts-nocheck
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building2, MapPin, Banknote, Users, Edit, Trash2, Play, Pause, Briefcase, Phone, PhoneOff, UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { JobDialog } from "./JobDialog";
import { useProfile } from "@/hooks/useProfile";
import { useUserRole } from "@/hooks/useUserRole";
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
  longlisted_count?: number;
  shortlisted_count?: number;
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
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("");
  const [groups, setGroups] = useState<Array<{
    id: string;
    name: string;
    color: string | null;
  }>>([]);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const { profile, loading: profileLoading } = useProfile();
  const { isAdmin, isManager, isTeamLeader } = useUserRole();

  useEffect(() => {
    if (profile?.user_id) {
      fetchJobs();
      fetchGroups();
    } else if (!profileLoading) {
      // No profile available (not logged in or failed to load) -> don't block UI
      setLoading(false);
    }
  }, [profile?.user_id, isAdmin, isManager, isTeamLeader, profileLoading]);
  const fetchJobs = useCallback(async () => {
    if (!profile?.user_id) {
      setLoading(false);
      return;
    }
    
    try {
      console.log('JobManagementPanel: Starting fetch for user:', profile.user_id);
      const startTime = performance.now();
      
      // Optimize: Build query with proper conditions
      let query = supabase.from('Jobs').select(`
          job_id, job_title, job_location, job_salary_range, Currency, Processed, status, Timestamp, group_id, automatic_dial, jd_summary, recruiter_id,
          groups ( id, name, color )
        `);

      // Admins, Managers, and Team Leaders can view all jobs
      const canViewAllJobs = isAdmin || isManager || isTeamLeader;
      
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

      // Fetch jobs and candidates in parallel
      const [jobsResult, candidatesResult] = await Promise.all([
        query.order('Timestamp', { ascending: false }),
        supabase
          .from('Jobs_CVs')
          .select('job_id, source, contacted, shortlisted_at')
      ]);

      if (jobsResult.error) throw jobsResult.error;
      const initialJobs = jobsResult.data || [];
      
      console.log('JobManagementPanel: Jobs fetched:', initialJobs.length);
      
      // Filter candidates by job access
      const jobIds = new Set(initialJobs.map(j => j.job_id).filter(Boolean));
      const allCandidates = candidatesResult.data || [];
      
      // Build candidates by job map
      const candidatesByJob = new Map<string, any[]>();
      allCandidates.forEach(candidate => {
        if (jobIds.has(candidate.job_id)) {
          if (!candidatesByJob.has(candidate.job_id)) {
            candidatesByJob.set(candidate.job_id, []);
          }
          candidatesByJob.get(candidate.job_id)!.push(candidate);
        }
      });

      // Fetch recruiter names only if needed
      const recruiterIds = [...new Set(initialJobs.map(j => j.recruiter_id).filter(Boolean))];
      const recruiterNamesMap = new Map<string, string>();
      
      if (recruiterIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, linkedin_id, name')
          .or(`user_id.in.(${recruiterIds.join(',')}),linkedin_id.in.(${recruiterIds.join(',')})`);
        
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
        
        // Longlisted: candidates with source containing 'itris' or 'linkedin'
        const longlistedCandidates = candidates.filter(c => {
          const source = (c.source || "").toLowerCase();
          return source.includes("itris") || source.includes("linkedin");
        });
        
        const longlisted_count = longlistedCandidates.length;
        
        // Shortlisted: candidates with shortlisted_at timestamp set
        const shortlisted_count = candidates.filter(c => c.shortlisted_at !== null).length;
        
        // Submitted: candidates with contacted status = 'Submitted'
        const submitted_count = candidates.filter(c => {
          const contacted = (c.contacted || "").trim();
          return contacted === 'Submitted';
        }).length;

        return {
          ...job,
          longlisted_count,
          shortlisted_count,
          submitted_count,
          recruiter_name: job.recruiter_id ? recruiterNamesMap.get(job.recruiter_id) || null : null
        };
      });

      const endTime = performance.now();
      console.log(`JobManagementPanel: Fetch completed in ${(endTime - startTime).toFixed(2)}ms`);
      console.log('JobManagementPanel: Jobs with counts:', jobsWithCounts.length);

      setJobs(jobsWithCounts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive"
      });
      setLoading(false);
    }
  }, [profile?.user_id, isAdmin, isManager, isTeamLeader, toast]);
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
  const handleStatusToggle = async (jobId: string, currentStatus: string | null) => {
    const newStatus = currentStatus === "Yes" ? "No" : "Yes";
    try {
      const {
        error
      } = await supabase.from('Jobs').update({
        Processed: newStatus
      }).eq('job_id', jobId);
      if (error) throw error;
      await fetchJobs();
      toast({
        title: "Success",
        description: `Job ${newStatus === "Yes" ? "activated" : "paused"}`
      });
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive"
      });
    }
  };

  const handleAutomaticDialToggle = async (jobId: string, currentValue: boolean | null) => {
    const newValue = !currentValue;
    try {
      const {
        error
      } = await supabase.from('Jobs').update({
        automatic_dial: newValue
      }).eq('job_id', jobId);
      if (error) throw error;
      await fetchJobs();
      toast({
        title: "Success",
        description: `Automatic dial ${newValue ? "enabled" : "disabled"}`
      });
    } catch (error) {
      console.error('Error updating automatic dial:', error);
      toast({
        title: "Error",
        description: "Failed to update automatic dial setting",
        variant: "destructive"
      });
    }
  };
  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      const {
        error
      } = await supabase.from('Jobs').delete().eq('job_id', jobId);
      if (error) throw error;
      await fetchJobs();
      toast({
        title: "Success",
        description: "Job deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive"
      });
    }
  };
  const getStatusBadge = (status: string | null) => {
    return status === "Yes" ? <Badge className="bg-status-active text-white">
        <Play className="h-3 w-3 mr-1" />
        Active
      </Badge> : <Badge variant="secondary">
        <Pause className="h-3 w-3 mr-1" />
        Paused
      </Badge>;
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

    const activeJobs = jobs.filter(job => job.Processed === "Yes");
    const pausedJobs = jobs.filter(job => job.Processed !== "Yes");

    return {
      activeJobs: filterJobsByGroup(activeJobs),
      pausedJobs: filterJobsByGroup(pausedJobs),
      allJobs: filterJobsByGroup(jobs)
    };
  }, [jobs, selectedGroupFilter]);
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-glow">Job Management</h2>
          <p className="text-muted-foreground">Manage job postings and recruitment campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate("/groups")} variant="outline" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Manage Groups
          </Button>
          <Button onClick={() => navigate("/jobs/add")} className="action-button bg-gradient-primary hover:shadow-glow">
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        </div>
      </div>

      {/* Group Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter by Group:</label>
          <select value={selectedGroupFilter} onChange={e => setSelectedGroupFilter(e.target.value)} className="px-3 py-1 rounded-md border border-border bg-background text-sm">
            <option value="">All Groups</option>
            <option value="ungrouped">Ungrouped</option>
            {groups.map(group => <option key={group.id} value={group.id}>
                {group.name}
              </option>)}
          </select>
        </div>
        {selectedGroupFilter && <Button variant="ghost" size="sm" onClick={() => setSelectedGroupFilter("")} className="text-xs">
            Clear Filter
          </Button>}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="mission-card">
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
            </Card>
          ))}
        </div>
      ) : (
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="glass-card flex-nowrap whitespace-nowrap overflow-x-auto">
            <TabsTrigger value="active" className="data-[state=active]:bg-status-active data-[state=active]:text-white flex-shrink-0">
              Active Jobs ({filteredJobs.activeJobs.length})
            </TabsTrigger>
            <TabsTrigger value="paused" className="flex-shrink-0">
              Paused Jobs ({filteredJobs.pausedJobs.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex-shrink-0">
              All Jobs ({filteredJobs.allJobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <JobGrid jobs={filteredJobs.activeJobs} loading={false} onEdit={job => {
            setSelectedJob(job);
            setIsDialogOpen(true);
          }} onDelete={handleDelete} onStatusToggle={handleStatusToggle} onAutomaticDialToggle={handleAutomaticDialToggle} navigate={navigate} />
          </TabsContent>
          
          <TabsContent value="paused">
            <JobGrid jobs={filteredJobs.pausedJobs} loading={false} onEdit={job => {
            setSelectedJob(job);
            setIsDialogOpen(true);
          }} onDelete={handleDelete} onStatusToggle={handleStatusToggle} onAutomaticDialToggle={handleAutomaticDialToggle} navigate={navigate} />
          </TabsContent>
          
          <TabsContent value="all">
            <JobGrid jobs={filteredJobs.allJobs} loading={false} onEdit={job => {
            setSelectedJob(job);
            setIsDialogOpen(true);
          }} onDelete={handleDelete} onStatusToggle={handleStatusToggle} onAutomaticDialToggle={handleAutomaticDialToggle} navigate={navigate} />
          </TabsContent>
        </Tabs>
      )}

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
}
const JobGrid = memo(function JobGrid({
  jobs,
  loading,
  onEdit,
  onDelete,
  onStatusToggle,
  onAutomaticDialToggle,
  navigate
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
  const getStatusBadge = (status: string | null) => {
    return status === "Yes" ? <Badge className="bg-status-active text-white">
        <Play className="h-3 w-3 mr-1" />
        Active
      </Badge> : <Badge variant="secondary">
        <Pause className="h-3 w-3 mr-1" />
        Paused
      </Badge>;
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
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map(job => <Card key={job.job_id} className="mission-card group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
                  {job.job_title || "Untitled Position"}
                </CardTitle>
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusBadge(job.Processed)}
                  <Badge variant="outline" className="text-xs">
                    ID: {job.job_id}
                  </Badge>
                  {job.groups && <Badge variant="outline" className="text-xs border" style={{
                borderColor: job.groups.color || "#3B82F6",
                color: job.groups.color || "#3B82F6"
              }}>
                      {job.groups.name}
                    </Badge>}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              {job.recruiter_name && <div className="flex items-center text-muted-foreground">
                  <UserCircle className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">{job.recruiter_name}</span>
                </div>}
              {job.job_location && <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2 text-cyan" />
                  {job.job_location}
                </div>}
              
              {job.job_salary_range && <div className="flex items-center text-muted-foreground">
                  <Banknote className="h-4 w-4 mr-2 text-green" />
                  {formatCurrency(job.job_salary_range, job["Currency"] as string | null)}
                </div>}
            </div>

            {job.jd_summary && <p className="text-sm text-muted-foreground line-clamp-3">
                {job.jd_summary}
              </p>}

            {/* Candidate Counts */}
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="flex flex-col items-center p-2 rounded-md bg-blue/10 border border-blue/20">
                <div className="flex items-center gap-1 text-blue">
                  <Users className="h-3 w-3" />
                  <span className="font-bold text-lg">{job.longlisted_count || 0}</span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">Longlisted</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-md bg-yellow/10 border border-yellow/20">
                <div className="flex items-center gap-1 text-yellow">
                  <Users className="h-3 w-3" />
                  <span className="font-bold text-lg">{job.shortlisted_count || 0}</span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">Shortlisted</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-md bg-green/10 border border-green/20">
                <div className="flex items-center gap-1 text-green">
                  <Users className="h-3 w-3" />
                  <span className="font-bold text-lg">{job.submitted_count || 0}</span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">Submitted</span>
              </div>
            </div>

            {/* Automatic Dial Toggle */}
            <div className="flex items-center justify-between py-2 border-t border-border/30">
              <div className="flex items-center gap-2 text-sm">
                {job.automatic_dial ? (
                  <Phone className="h-4 w-4 text-green" />
                ) : (
                  <PhoneOff className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-muted-foreground">Automatic Dial</span>
              </div>
              <Switch
                checked={job.automatic_dial || false}
                onCheckedChange={() => onAutomaticDialToggle(job.job_id, job.automatic_dial)}
                className="data-[state=checked]:bg-green data-[state=unchecked]:bg-muted"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex space-x-2">
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
              
              <Button size="sm" className="h-8" onClick={() => navigate(`/job/${job.job_id}`)}>
                <Users className="h-3 w-3 mr-1" />
                Open Job
              </Button>
            </div>
          </CardContent>
        </Card>)}
    </div>;
});