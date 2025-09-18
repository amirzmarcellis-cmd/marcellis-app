// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building2, MapPin, Banknote, Users, Edit, Trash2, Play, Pause, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { JobDialog } from "./JobDialog";


interface Job {
  job_id: string;
  job_title: string | null;
  job_description: string | null;
  client_description: string | null;
  job_location: string | null;
  job_salary_range: string | null;
  Currency?: string | null;
  Processed: string | null;
  things_to_look_for: string | null;
  jd_summary: string | null;
  musttohave?: string | null;
  nicetohave?: string | null;
  Timestamp: string | null;
  group_id?: string | null;
  longlisted_count?: number;
  shortlisted_count?: number;
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
  const [groups, setGroups] = useState<Array<{id: string, name: string, color: string | null}>>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  

  useEffect(() => {
    fetchJobs();
    fetchGroups();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data: jobsData, error } = await supabase
        .from('Jobs')
        .select(`
          *,
          groups (
            id,
            name,
            color
          )
        `)
        .order('Timestamp', { ascending: false });

      if (error) throw error;
      
      // Fetch candidate counts for each job
      const jobsWithCounts = await Promise.all(
        (jobsData || []).map(async (job) => {
          const { data: candidatesData, error: candidatesError } = await supabase
            .from('Jobs_CVs')
            .select('cv_score, after_call_score')
            .eq('job_id', job.job_id);

          if (candidatesError) {
            console.error('Error fetching candidate counts for job:', job.job_id, candidatesError);
            return {
              ...job,
              longlisted_count: 0,
              shortlisted_count: 0
            };
          }

          // Longlist = total candidates for this job
          const longlisted_count = candidatesData?.length || 0;
          
          // Shortlist = candidates with after_call_score >= 74 (matching JobFunnel logic)
          const shortlisted_count = candidatesData?.filter(c => {
            const score = parseInt(c.after_call_score || "0");
            return score >= 74;
          }).length || 0;

          return {
            ...job,
            longlisted_count,
            shortlisted_count
          };
        })
      );
      
      setJobs(jobsWithCounts);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, color')
        .order('name');

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleStatusToggle = async (jobId: string, currentStatus: string | null) => {
    const newStatus = currentStatus === "Yes" ? "No" : "Yes";
    
    try {
      const { error } = await supabase
        .from('Jobs')
        .update({ Processed: newStatus })
        .eq('job_id', jobId);

      if (error) throw error;
      
      await fetchJobs();
      toast({
        title: "Success",
        description: `Job ${newStatus === "Yes" ? "activated" : "paused"}`,
      });
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
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

      if (error) throw error;
      
      await fetchJobs();
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string | null) => {
    return status === "Yes" ? (
      <Badge className="bg-status-active text-white">
        <Play className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary">
        <Pause className="h-3 w-3 mr-1" />
        Paused
      </Badge>
    );
  };

  const activeJobs = jobs.filter(job => job.Processed === "Yes");
  const pausedJobs = jobs.filter(job => job.Processed !== "Yes");

  // Filter jobs by selected group
  const filterJobsByGroup = (jobList: Job[]) => {
    if (!selectedGroupFilter) return jobList;
    if (selectedGroupFilter === "ungrouped") {
      return jobList.filter(job => !job.group_id);
    }
    return jobList.filter(job => job.group_id === selectedGroupFilter);
  };

  const filteredActiveJobs = filterJobsByGroup(activeJobs);
  const filteredPausedJobs = filterJobsByGroup(pausedJobs);
  const filteredAllJobs = filterJobsByGroup(jobs);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-glow">Job Management</h2>
          <p className="text-muted-foreground">Manage job postings and recruitment campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => navigate("/groups")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            Manage Groups
          </Button>
          <Button 
            onClick={() => navigate("/jobs/add")}
            className="action-button bg-gradient-primary hover:shadow-glow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        </div>
      </div>

      {/* Group Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter by Group:</label>
          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            className="px-3 py-1 rounded-md border border-border bg-background text-sm"
          >
            <option value="">All Groups</option>
            <option value="ungrouped">Ungrouped</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        {selectedGroupFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedGroupFilter("")}
            className="text-xs"
          >
            Clear Filter
          </Button>
        )}
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="glass-card flex-nowrap whitespace-nowrap overflow-x-auto">
          <TabsTrigger value="active" className="data-[state=active]:bg-status-active data-[state=active]:text-white flex-shrink-0">
            Active Jobs ({filteredActiveJobs.length})
          </TabsTrigger>
          <TabsTrigger value="paused" className="flex-shrink-0">
            Paused Jobs ({filteredPausedJobs.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-shrink-0">
            All Jobs ({filteredAllJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <JobGrid jobs={filteredActiveJobs} onEdit={(job) => { setSelectedJob(job); setIsDialogOpen(true); }} onDelete={handleDelete} onStatusToggle={handleStatusToggle} navigate={navigate} />
        </TabsContent>
        
        <TabsContent value="paused">
          <JobGrid jobs={filteredPausedJobs} onEdit={(job) => { setSelectedJob(job); setIsDialogOpen(true); }} onDelete={handleDelete} onStatusToggle={handleStatusToggle} navigate={navigate} />
        </TabsContent>
        
        <TabsContent value="all">
          <JobGrid jobs={filteredAllJobs} onEdit={(job) => { setSelectedJob(job); setIsDialogOpen(true); }} onDelete={handleDelete} onStatusToggle={handleStatusToggle} navigate={navigate} />
        </TabsContent>
      </Tabs>

      <JobDialog
        job={selectedJob}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setSelectedJob(null);
          }
        }}
        onSave={() => {
          fetchJobs();
          setIsDialogOpen(false);
          setSelectedJob(null);
        }}
      />
    </div>
  );
}

interface JobGridProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
  onStatusToggle: (jobId: string, currentStatus: string | null) => void;
  navigate: (path: string) => void;
}

function JobGrid({ jobs, onEdit, onDelete, onStatusToggle, navigate }: JobGridProps) {

  const formatCurrency = (amountStr: string | null | undefined, currency?: string | null) => {
    const amount = parseFloat((amountStr || "").toString().replace(/[^0-9.]/g, ""));
    if (!amount || !currency) return amountStr || "N/A";
    try {
      return new Intl.NumberFormat("en", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    } catch {
      return `${currency} ${isNaN(amount) ? amountStr : amount.toLocaleString()}`;
    }
  };

  const getStatusBadge = (status: string | null) => {
    return status === "Yes" ? (
      <Badge className="bg-status-active text-white">
        <Play className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary">
        <Pause className="h-3 w-3 mr-1" />
        Paused
      </Badge>
    );
  };

  if (jobs.length === 0) {
    return (
      <Card className="mission-card">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground">Create your first job posting to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <Card key={job.job_id} className="mission-card group">
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
                  {job.groups && (
                    <Badge 
                      variant="outline" 
                      className="text-xs border"
                      style={{ 
                        borderColor: job.groups.color || "#3B82F6",
                        color: job.groups.color || "#3B82F6"
                      }}
                    >
                      {job.groups.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              {job.job_location && (
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2 text-cyan" />
                  {job.job_location}
                </div>
              )}
              
              {job.job_salary_range && (
                <div className="flex items-center text-muted-foreground">
                  <Banknote className="h-4 w-4 mr-2 text-green" />
                  {formatCurrency(job.job_salary_range, job["Currency"] as string | null)}
                </div>
              )}
              
              {job.client_description && (
                <div className="flex items-center text-muted-foreground">
                  <Building2 className="h-4 w-4 mr-2 text-blue" />
                  <span className="line-clamp-1">{job.client_description}</span>
                </div>
              )}
            </div>

            {job.jd_summary && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {job.jd_summary}
              </p>
            )}

            {/* Candidate Counts */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center text-muted-foreground">
                <Users className="h-4 w-4 mr-1 text-blue" />
                <span className="font-medium text-foreground">{job.longlisted_count || 0}</span>
                <span className="ml-1">Longlisted</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Users className="h-4 w-4 mr-1 text-green" />
                <span className="font-medium text-foreground">{job.shortlisted_count || 0}</span>
                <span className="ml-1">Shortlisted</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/jobs/edit/${job.job_id}`)}
                  className="h-8 px-2"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusToggle(job.job_id, job.Processed)}
                  className="h-8 px-2"
                >
                  {job.Processed === "Yes" ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(job.job_id)}
                  className="h-8 px-2 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              
              <Button 
                size="sm" 
                className="h-8"
                onClick={() => navigate(`/job/${job.job_id}`)}
              >
                <Users className="h-3 w-3 mr-1" />
                Open Job
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
