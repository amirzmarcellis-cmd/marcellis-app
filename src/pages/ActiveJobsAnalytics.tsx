import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Briefcase, Users, Search, TrendingUp, CheckCircle, XCircle, Send, ListChecks } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface JobWithMetrics {
  job_id: string;
  job_title: string;
  recruiter_name: string;
  recruiter_email: string;
  timestamp: string | null;
  longlisted: number;
  shortlisted: number;
  rejected: number;
  submitted: number;
}

interface RecruiterWithMetrics {
  recruiter_id: string;
  recruiter_name: string;
  recruiter_email: string;
  active_jobs: number;
  longlisted: number;
  shortlisted: number;
  rejected: number;
  submitted: number;
}

export default function ActiveJobsAnalytics() {
  const [activeTab, setActiveTab] = useState("jobs");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch active jobs
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['active-jobs-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Jobs')
        .select('job_id, job_title, recruiter_id, assignment, Timestamp')
        .eq('Processed', 'Yes');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch all candidates for active jobs
  const { data: candidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ['active-jobs-candidates', jobs?.map(j => j.job_id)],
    queryFn: async () => {
      if (!jobs || jobs.length === 0) return [];
      
      const jobIds = jobs.map(j => j.job_id);
      const { data, error } = await supabase
        .from('Jobs_CVs')
        .select('job_id, contacted, after_call_score, submitted_at')
        .in('job_id', jobIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!jobs && jobs.length > 0
  });

  // Fetch profiles for recruiter names
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['recruiter-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, linkedin_id, email, name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Helper to get recruiter info
  const getRecruiterInfo = (recruiterId: string | null, assignment: string | null) => {
    if (!profiles) return { name: 'Unassigned', email: '' };
    
    const profile = profiles.find(p => 
      p.user_id === recruiterId || 
      p.linkedin_id === recruiterId ||
      p.email === assignment
    );
    
    return {
      name: profile?.name || profile?.email || 'Unassigned',
      email: profile?.email || ''
    };
  };

  // Helper to calculate metrics for a job (same logic as JobManagementPanel)
  const calculateJobMetrics = (jobId: string) => {
    if (!candidates) return { longlisted: 0, shortlisted: 0, rejected: 0, submitted: 0 };
    
    const jobCandidates = candidates.filter(c => c.job_id === jobId);
    
    return {
      // Longlisted: ALL candidates in Jobs_CVs (AI Long List)
      longlisted: jobCandidates.length,
      // Shortlisted: candidates with score >= 74
      shortlisted: jobCandidates.filter(c => {
        const score = parseInt(String(c.after_call_score || "0"));
        return score >= 74;
      }).length,
      // Rejected: candidates with contacted = 'Rejected'
      rejected: jobCandidates.filter(c => 
        (c.contacted || "").trim() === 'Rejected'
      ).length,
      // Submitted: candidates with contacted = 'Submitted'
      submitted: jobCandidates.filter(c => 
        (c.contacted || "").trim() === 'Submitted'
      ).length
    };
  };

  // Compute jobs with metrics (sorted by most recent first)
  const jobsWithMetrics: JobWithMetrics[] = useMemo(() => {
    if (!jobs) return [];
    
    return jobs
      .map(job => {
        const recruiter = getRecruiterInfo(job.recruiter_id, job.assignment);
        const metrics = calculateJobMetrics(job.job_id);
        
        return {
          job_id: job.job_id,
          job_title: job.job_title || 'Untitled Job',
          recruiter_name: recruiter.name,
          recruiter_email: recruiter.email,
          timestamp: job.Timestamp,
          ...metrics
        };
      })
      .sort((a, b) => {
        // Sort by timestamp descending (most recent first)
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  }, [jobs, candidates, profiles]);

  // Compute recruiters with aggregated metrics
  const recruitersWithMetrics: RecruiterWithMetrics[] = useMemo(() => {
    if (!jobsWithMetrics.length) return [];
    
    const recruiterMap = new Map<string, RecruiterWithMetrics>();
    
    jobsWithMetrics.forEach(job => {
      const key = job.recruiter_email || job.recruiter_name;
      
      if (recruiterMap.has(key)) {
        const existing = recruiterMap.get(key)!;
        existing.active_jobs += 1;
        existing.longlisted += job.longlisted;
        existing.shortlisted += job.shortlisted;
        existing.rejected += job.rejected;
        existing.submitted += job.submitted;
      } else {
        recruiterMap.set(key, {
          recruiter_id: key,
          recruiter_name: job.recruiter_name,
          recruiter_email: job.recruiter_email,
          active_jobs: 1,
          longlisted: job.longlisted,
          shortlisted: job.shortlisted,
          rejected: job.rejected,
          submitted: job.submitted
        });
      }
    });
    
    return Array.from(recruiterMap.values());
  }, [jobsWithMetrics]);

  // Filter data based on search
  const filteredJobs = useMemo(() => {
    if (!searchTerm) return jobsWithMetrics;
    const term = searchTerm.toLowerCase();
    return jobsWithMetrics.filter(j => 
      j.job_title.toLowerCase().includes(term) ||
      j.recruiter_name.toLowerCase().includes(term)
    );
  }, [jobsWithMetrics, searchTerm]);

  const filteredRecruiters = useMemo(() => {
    if (!searchTerm) return recruitersWithMetrics;
    const term = searchTerm.toLowerCase();
    return recruitersWithMetrics.filter(r => 
      r.recruiter_name.toLowerCase().includes(term) ||
      r.recruiter_email.toLowerCase().includes(term)
    );
  }, [recruitersWithMetrics, searchTerm]);

  // Summary totals
  const totals = useMemo(() => {
    return jobsWithMetrics.reduce((acc, job) => ({
      jobs: acc.jobs + 1,
      longlisted: acc.longlisted + job.longlisted,
      shortlisted: acc.shortlisted + job.shortlisted,
      rejected: acc.rejected + job.rejected,
      submitted: acc.submitted + job.submitted
    }), { jobs: 0, longlisted: 0, shortlisted: 0, rejected: 0, submitted: 0 });
  }, [jobsWithMetrics]);

  const isLoading = jobsLoading || candidatesLoading || profilesLoading;

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-light text-foreground">Active Jobs Analytics</h1>
        <p className="text-muted-foreground font-light">Track performance metrics for active jobs and recruiters</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Active Jobs</span>
            </div>
            <p className="text-2xl font-light mt-1">{isLoading ? '-' : totals.jobs}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Longlisted</span>
            </div>
            <p className="text-2xl font-light mt-1">{isLoading ? '-' : totals.longlisted}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Shortlisted</span>
            </div>
            <p className="text-2xl font-light mt-1">{isLoading ? '-' : totals.shortlisted}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Rejected</span>
            </div>
            <p className="text-2xl font-light mt-1">{isLoading ? '-' : totals.rejected}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-xl border-border/50 col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Submitted</span>
            </div>
            <p className="text-2xl font-light mt-1">{isLoading ? '-' : totals.submitted}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Tabs */}
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs or recruiters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card/50 border-border/50"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card/50 border border-border/50">
            <TabsTrigger value="jobs" className="gap-2">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">By Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="recruiters" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">By Recruiters</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-4">
            <Card className="bg-card/50 backdrop-blur-xl border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-light flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Jobs Overview ({filteredJobs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50">
                          <TableHead className="text-muted-foreground">Job Title</TableHead>
                          <TableHead className="text-muted-foreground">Recruiter</TableHead>
                          <TableHead className="text-muted-foreground text-center">Longlisted</TableHead>
                          <TableHead className="text-muted-foreground text-center">Shortlisted</TableHead>
                          <TableHead className="text-muted-foreground text-center">Rejected</TableHead>
                          <TableHead className="text-muted-foreground text-center">Submitted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredJobs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                              No active jobs found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredJobs.map((job) => (
                            <TableRow key={job.job_id} className="border-border/50">
                              <TableCell className="font-medium max-w-[200px] truncate">
                                {job.job_title}
                              </TableCell>
                              <TableCell className="text-muted-foreground max-w-[150px] truncate">
                                {job.recruiter_name}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                                  {job.longlisted}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                                  {job.shortlisted}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
                                  {job.rejected}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/30">
                                  {job.submitted}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recruiters" className="mt-4">
            <Card className="bg-card/50 backdrop-blur-xl border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-light flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Recruiters Overview ({filteredRecruiters.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50">
                          <TableHead className="text-muted-foreground">Recruiter</TableHead>
                          <TableHead className="text-muted-foreground text-center">Active Jobs</TableHead>
                          <TableHead className="text-muted-foreground text-center">Longlisted</TableHead>
                          <TableHead className="text-muted-foreground text-center">Shortlisted</TableHead>
                          <TableHead className="text-muted-foreground text-center">Rejected</TableHead>
                          <TableHead className="text-muted-foreground text-center">Submitted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecruiters.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                              No recruiters found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredRecruiters.map((recruiter) => (
                            <TableRow key={recruiter.recruiter_id} className="border-border/50">
                              <TableCell className="max-w-[200px]">
                                <div className="truncate font-medium">{recruiter.recruiter_name}</div>
                                {recruiter.recruiter_email && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {recruiter.recruiter_email}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                  {recruiter.active_jobs}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                                  {recruiter.longlisted}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                                  {recruiter.shortlisted}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
                                  {recruiter.rejected}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/30">
                                  {recruiter.submitted}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
