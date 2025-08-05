import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building2, MapPin, DollarSign, Users, Edit, Trash2, Play, Pause, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { JobDialog } from "./JobDialog";

interface Job {
  "Job ID": string;
  "Job Title": string | null;
  "Job Description": string | null;
  "Client Description": string | null;
  "Job Location": string | null;
  "Job Salary Range (ex: 15000 AED)": string | null;
  "Processed": string | null;
  "Things to look for": string | null;
  "JD Summary": string | null;
  "Criteria to evaluate by": string | null;
  Timestamp: string | null;
}

export function JobManagementPanel() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('Jobs')
        .select('*')
        .order('Timestamp', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
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

  const handleStatusToggle = async (jobId: string, currentStatus: string | null) => {
    const newStatus = currentStatus === "Yes" ? "No" : "Yes";
    
    try {
      const { error } = await supabase
        .from('Jobs')
        .update({ Processed: newStatus })
        .eq('Job ID', jobId);

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
        .eq('Job ID', jobId);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-glow">Job Management</h2>
          <p className="text-muted-foreground">Manage job postings and recruitment campaigns</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedJob(null);
            setIsDialogOpen(true);
          }}
          className="action-button bg-gradient-primary hover:shadow-glow"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Job
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="glass-card">
          <TabsTrigger value="active" className="data-[state=active]:bg-status-active data-[state=active]:text-white">
            Active Jobs ({activeJobs.length})
          </TabsTrigger>
          <TabsTrigger value="paused">
            Paused Jobs ({pausedJobs.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Jobs ({jobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <JobGrid jobs={activeJobs} onEdit={(job) => { setSelectedJob(job); setIsDialogOpen(true); }} onDelete={handleDelete} onStatusToggle={handleStatusToggle} />
        </TabsContent>
        
        <TabsContent value="paused">
          <JobGrid jobs={pausedJobs} onEdit={(job) => { setSelectedJob(job); setIsDialogOpen(true); }} onDelete={handleDelete} onStatusToggle={handleStatusToggle} />
        </TabsContent>
        
        <TabsContent value="all">
          <JobGrid jobs={jobs} onEdit={(job) => { setSelectedJob(job); setIsDialogOpen(true); }} onDelete={handleDelete} onStatusToggle={handleStatusToggle} />
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
}

function JobGrid({ jobs, onEdit, onDelete, onStatusToggle }: JobGridProps) {
  
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
        <Card key={job["Job ID"]} className="mission-card group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
                  {job["Job Title"] || "Untitled Position"}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(job.Processed)}
                  <Badge variant="outline" className="text-xs">
                    ID: {job["Job ID"]}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              {job["Job Location"] && (
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2 text-cyan" />
                  {job["Job Location"]}
                </div>
              )}
              
              {job["Job Salary Range (ex: 15000 AED)"] && (
                <div className="flex items-center text-muted-foreground">
                  <DollarSign className="h-4 w-4 mr-2 text-green" />
                  {job["Job Salary Range (ex: 15000 AED)"]}
                </div>
              )}
              
              {job["Client Description"] && (
                <div className="flex items-center text-muted-foreground">
                  <Building2 className="h-4 w-4 mr-2 text-blue" />
                  <span className="line-clamp-1">{job["Client Description"]}</span>
                </div>
              )}
            </div>

            {job["JD Summary"] && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {job["JD Summary"]}
              </p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(job)}
                  className="h-8 px-2"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusToggle(job["Job ID"], job.Processed)}
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
                  onClick={() => onDelete(job["Job ID"])}
                  className="h-8 px-2 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              
              <Button size="sm" className="h-8">
                <Users className="h-3 w-3 mr-1" />
                Candidates
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}