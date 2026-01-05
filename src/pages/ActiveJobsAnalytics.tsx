import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Briefcase, Users, Search, TrendingUp, CheckCircle, XCircle, Send, ListChecks, CalendarIcon, X, ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SortDirection = 'asc' | 'desc' | null;
type JobSortField = 'job_title' | 'recruiter_name' | 'longlisted' | 'shortlisted' | 'pending_action' | 'rejected' | 'submitted';
type RecruiterSortField = 'recruiter_name' | 'active_jobs' | 'longlisted' | 'shortlisted' | 'pending_action' | 'rejected' | 'submitted';

interface JobWithMetrics {
  job_id: string;
  job_title: string;
  recruiter_name: string;
  recruiter_email: string;
  timestamp: string | null;
  longlisted: number;
  shortlisted: number;
  pending_action: number;
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
  pending_action: number;
  rejected: number;
  submitted: number;
}

// Helper function to calculate percentage
const calculatePercentage = (numerator: number, denominator: number): string => {
  if (denominator === 0) return '0%';
  return ((numerator / denominator) * 100).toFixed(1) + '%';
};

export default function ActiveJobsAnalytics() {
  const [activeTab, setActiveTab] = useState("jobs");
  const [searchTerm, setSearchTerm] = useState("");
  const [jobScope, setJobScope] = useState<"active" | "all">("active");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });
  
  // Sorting state
  const [jobSort, setJobSort] = useState<{ field: JobSortField | null; direction: SortDirection }>({
    field: null,
    direction: null
  });
  const [recruiterSort, setRecruiterSort] = useState<{ field: RecruiterSortField | null; direction: SortDirection }>({
    field: null,
    direction: null
  });

  // Sort handlers
  const handleJobSort = (field: JobSortField) => {
    setJobSort(prev => ({
      field,
      direction: prev.field === field 
        ? prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc'
        : 'asc'
    }));
  };

  const handleRecruiterSort = (field: RecruiterSortField) => {
    setRecruiterSort(prev => ({
      field,
      direction: prev.field === field 
        ? prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc'
        : 'asc'
    }));
  };

  // Sortable header component
  const SortableHeader = ({ 
    label, 
    field, 
    currentSort, 
    onSort, 
    className 
  }: { 
    label: string; 
    field: string; 
    currentSort: { field: string | null; direction: SortDirection }; 
    onSort: (field: any) => void; 
    className?: string;
  }) => (
    <TableHead 
      className={cn("text-muted-foreground cursor-pointer hover:text-foreground select-none transition-colors", className)}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {currentSort.field === field ? (
          currentSort.direction === 'asc' ? (
            <ArrowUp className="w-3 h-3" />
          ) : currentSort.direction === 'desc' ? (
            <ArrowDown className="w-3 h-3" />
          ) : (
            <ArrowUpDown className="w-3 h-3 opacity-50" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-30" />
        )}
      </div>
    </TableHead>
  );

  // Fetch jobs based on selected scope and date range
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs-analytics', jobScope, dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      let query = supabase
        .from('Jobs')
        .select('job_id, job_title, recruiter_id, assignment, Timestamp');
      
      // Only filter by Processed='Yes' if viewing active jobs
      if (jobScope === 'active') {
        query = query.eq('Processed', 'Yes');
      }
      
      // Apply date range filter
      if (dateRange.from) {
        query = query.gte('Timestamp', format(dateRange.from, 'yyyy-MM-dd'));
      }
      if (dateRange.to) {
        query = query.lte('Timestamp', format(dateRange.to, 'yyyy-MM-dd') + ' 23:59:59');
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch job counts for toggle badges
  const { data: jobCounts } = useQuery({
    queryKey: ['job-counts'],
    queryFn: async () => {
      const [activeResult, allResult] = await Promise.all([
        supabase.from('Jobs').select('job_id', { count: 'exact', head: true }).eq('Processed', 'Yes'),
        supabase.from('Jobs').select('job_id', { count: 'exact', head: true })
      ]);
      return {
        active: activeResult.count || 0,
        all: allResult.count || 0
      };
    }
  });

  // Fetch summary totals directly from database for accuracy
  const { data: summaryTotals, isLoading: summaryLoading } = useQuery({
    queryKey: ['analytics-summary-totals', jobScope, dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      // Get job_ids for the current scope
      let jobsQuery = supabase.from('Jobs').select('job_id');
      if (jobScope === 'active') {
        jobsQuery = jobsQuery.eq('Processed', 'Yes');
      }
      
      // Apply date range filter
      if (dateRange.from) {
        jobsQuery = jobsQuery.gte('Timestamp', format(dateRange.from, 'yyyy-MM-dd'));
      }
      if (dateRange.to) {
        jobsQuery = jobsQuery.lte('Timestamp', format(dateRange.to, 'yyyy-MM-dd') + ' 23:59:59');
      }
      
      const { data: scopedJobs } = await jobsQuery;
      if (!scopedJobs || scopedJobs.length === 0) {
        return { jobs: 0, longlisted: 0, shortlisted: 0, rejected: 0, submitted: 0 };
      }
      
      const jobIds = scopedJobs.map(j => j.job_id);
      
      // Execute all count queries in parallel for performance
      const [longlistedResult, shortlistedResult, rejectedResult, submittedResult] = await Promise.all([
        // Total candidates (longlisted)
        supabase
          .from('Jobs_CVs')
          .select('*', { count: 'exact', head: true })
          .in('job_id', jobIds),
        // Shortlisted (after_call_score >= 74)
        supabase
          .from('Jobs_CVs')
          .select('*', { count: 'exact', head: true })
          .in('job_id', jobIds)
          .gte('after_call_score', 74),
        // Rejected
        supabase
          .from('Jobs_CVs')
          .select('*', { count: 'exact', head: true })
          .in('job_id', jobIds)
          .eq('contacted', 'Rejected'),
        // Submitted
        supabase
          .from('Jobs_CVs')
          .select('*', { count: 'exact', head: true })
          .in('job_id', jobIds)
          .eq('contacted', 'Submitted')
      ]);
      
      const shortlisted = shortlistedResult.count || 0;
      const rejected = rejectedResult.count || 0;
      const submitted = submittedResult.count || 0;
      
      return {
        jobs: scopedJobs.length,
        longlisted: longlistedResult.count || 0,
        shortlisted,
        pending_action: shortlisted - (rejected + submitted),
        rejected,
        submitted
      };
    }
  });

  // Fetch per-job metrics directly from database for accuracy
  const { data: jobMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['jobs-metrics-db', jobScope, jobs?.map(j => j.job_id)],
    queryFn: async () => {
      if (!jobs || jobs.length === 0) return new Map<string, { longlisted: number; shortlisted: number; rejected: number; submitted: number }>();
      
      // Execute count queries for each job in parallel
      const metricsPromises = jobs.map(async (job) => {
        const [longlistedRes, shortlistedRes, rejectedRes, submittedRes] = await Promise.all([
          supabase.from('Jobs_CVs').select('*', { count: 'exact', head: true }).eq('job_id', job.job_id),
          supabase.from('Jobs_CVs').select('*', { count: 'exact', head: true }).eq('job_id', job.job_id).gte('after_call_score', 74),
          supabase.from('Jobs_CVs').select('*', { count: 'exact', head: true }).eq('job_id', job.job_id).eq('contacted', 'Rejected'),
          supabase.from('Jobs_CVs').select('*', { count: 'exact', head: true }).eq('job_id', job.job_id).eq('contacted', 'Submitted')
        ]);
        
        return {
          job_id: job.job_id,
          longlisted: longlistedRes.count || 0,
          shortlisted: shortlistedRes.count || 0,
          rejected: rejectedRes.count || 0,
          submitted: submittedRes.count || 0
        };
      });
      
      const results = await Promise.all(metricsPromises);
      const metricsMap = new Map<string, { longlisted: number; shortlisted: number; rejected: number; submitted: number }>();
      results.forEach(r => metricsMap.set(r.job_id, {
        longlisted: r.longlisted,
        shortlisted: r.shortlisted,
        rejected: r.rejected,
        submitted: r.submitted
      }));
      
      return metricsMap;
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

  // Compute jobs with metrics (sorted by most recent first)
  const jobsWithMetrics: JobWithMetrics[] = useMemo(() => {
    if (!jobs || !jobMetrics) return [];
    
    return jobs
      .map(job => {
        const recruiter = getRecruiterInfo(job.recruiter_id, job.assignment);
        const metrics = jobMetrics.get(job.job_id) || { longlisted: 0, shortlisted: 0, rejected: 0, submitted: 0 };
        
        return {
          job_id: job.job_id,
          job_title: job.job_title || 'Untitled Job',
          recruiter_name: recruiter.name,
          recruiter_email: recruiter.email,
          timestamp: job.Timestamp,
          ...metrics,
          pending_action: metrics.shortlisted - (metrics.rejected + metrics.submitted)
        };
      })
      .sort((a, b) => {
        // Sort by timestamp descending (most recent first)
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  }, [jobs, jobMetrics, profiles]);

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
        existing.pending_action += job.pending_action;
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
          pending_action: job.pending_action,
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

  // Sorted jobs
  const sortedJobs = useMemo(() => {
    if (!jobSort.field || !jobSort.direction) return filteredJobs;
    
    return [...filteredJobs].sort((a, b) => {
      const aVal = a[jobSort.field!];
      const bVal = b[jobSort.field!];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return jobSort.direction === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      return jobSort.direction === 'asc' 
        ? (aVal as number) - (bVal as number) 
        : (bVal as number) - (aVal as number);
    });
  }, [filteredJobs, jobSort]);

  // Sorted recruiters
  const sortedRecruiters = useMemo(() => {
    if (!recruiterSort.field || !recruiterSort.direction) return filteredRecruiters;
    
    return [...filteredRecruiters].sort((a, b) => {
      const aVal = a[recruiterSort.field!];
      const bVal = b[recruiterSort.field!];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return recruiterSort.direction === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      return recruiterSort.direction === 'asc' 
        ? (aVal as number) - (bVal as number) 
        : (bVal as number) - (aVal as number);
    });
  }, [filteredRecruiters, recruiterSort]);

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

  const isLoading = jobsLoading || metricsLoading || profilesLoading;

  // Export to CSV function
  const exportToCSV = () => {
    let headers: string[];
    let rows: string[][];
    let filename: string;

    if (activeTab === 'jobs') {
      headers = ['Job Title', 'Recruiter', 'Longlisted', 'Shortlisted', 'Pending Action', 'Rejected', 'Submitted'];
      rows = sortedJobs.map(job => [
        job.job_title,
        job.recruiter_name,
        job.longlisted.toString(),
        job.shortlisted.toString(),
        job.pending_action.toString(),
        job.rejected.toString(),
        job.submitted.toString()
      ]);
      filename = 'jobs-analytics';
    } else {
      headers = ['Recruiter', 'Active Jobs', 'Longlisted', 'Shortlisted', 'Pending Action', 'Rejected', 'Submitted'];
      rows = sortedRecruiters.map(r => [
        r.recruiter_name,
        r.active_jobs.toString(),
        r.longlisted.toString(),
        r.shortlisted.toString(),
        r.pending_action.toString(),
        r.rejected.toString(),
        r.submitted.toString()
      ]);
      filename = 'recruiters-analytics';
    }

    // Add date range to filename if filtered
    if (dateRange.from) {
      filename += `_${format(dateRange.from, 'yyyy-MM-dd')}`;
      if (dateRange.to) {
        filename += `_to_${format(dateRange.to, 'yyyy-MM-dd')}`;
      }
    }

    // Build CSV content with proper escaping
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-light text-foreground">
          {jobScope === 'active' ? 'Active' : 'All'} Jobs Analytics
        </h1>
        <p className="text-muted-foreground font-light">
          Track performance metrics for {jobScope === 'active' ? 'active' : 'all'} jobs and recruiters
        </p>
      </div>

      {/* Job Scope Selector - Improved Design */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl p-1.5 shadow-lg">
          <button
            onClick={() => setJobScope("active")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
              jobScope === "active"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Briefcase className="w-4 h-4" />
            <span>Active Jobs</span>
            <span className={cn(
              "ml-1 px-2 py-0.5 text-xs rounded-full",
              jobScope === "active"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {jobCounts?.active ?? '-'}
            </span>
          </button>
          <button
            onClick={() => setJobScope("all")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
              jobScope === "all"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <ListChecks className="w-4 h-4" />
            <span>All Jobs</span>
            <span className={cn(
              "ml-1 px-2 py-0.5 text-xs rounded-full",
              jobScope === "all"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {jobCounts?.all ?? '-'}
            </span>
          </button>
        </div>
      </div>

      {/* Summary Cards - Using database-level counts for accuracy */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">
                {jobScope === 'active' ? 'Active Jobs' : 'All Jobs'}
              </span>
            </div>
            <p className="text-2xl font-light mt-1">{summaryLoading ? '-' : summaryTotals?.jobs ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Longlisted</span>
            </div>
            <p className="text-2xl font-light mt-1">{summaryLoading ? '-' : summaryTotals?.longlisted ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Shortlisted</span>
            </div>
            <p className="text-2xl font-light mt-1">{summaryLoading ? '-' : summaryTotals?.shortlisted ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Rejected</span>
            </div>
            <p className="text-2xl font-light mt-1">{summaryLoading ? '-' : summaryTotals?.rejected ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-xl border-border/50 col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Submitted</span>
            </div>
            <p className="text-2xl font-light mt-1">{summaryLoading ? '-' : summaryTotals?.submitted ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs or recruiters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-card/50 border-border/50"
            />
          </div>
          
          {/* Date Range Picker */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal bg-card/50 border-border/50",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM dd, yyyy")
                    )
                  ) : (
                    <span>Filter by date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            {/* Clear Date Filter Button */}
            {(dateRange.from || dateRange.to) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDateRange({ from: undefined, to: undefined })}
                className="h-9 w-9"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Export CSV Button */}
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={isLoading || (activeTab === 'jobs' ? sortedJobs.length === 0 : sortedRecruiters.length === 0)}
            className="bg-card/50 border-border/50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
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
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto relative">
                    <Table>
                      <TableHeader className="sticky top-0 bg-card z-10">
                        <TableRow className="border-border/50">
                          <SortableHeader label="Job Title" field="job_title" currentSort={jobSort} onSort={handleJobSort} />
                          <SortableHeader label="Recruiter" field="recruiter_name" currentSort={jobSort} onSort={handleJobSort} />
                          <SortableHeader label="Longlisted" field="longlisted" currentSort={jobSort} onSort={handleJobSort} className="text-center justify-center" />
                          <SortableHeader label="Shortlisted" field="shortlisted" currentSort={jobSort} onSort={handleJobSort} className="text-center justify-center" />
                          <SortableHeader label="Pending Action" field="pending_action" currentSort={jobSort} onSort={handleJobSort} className="text-center justify-center" />
                          <SortableHeader label="Rejected" field="rejected" currentSort={jobSort} onSort={handleJobSort} className="text-center justify-center" />
                          <SortableHeader label="Submitted" field="submitted" currentSort={jobSort} onSort={handleJobSort} className="text-center justify-center" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedJobs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                              No {jobScope === 'active' ? 'active ' : ''}jobs found
                            </TableCell>
                          </TableRow>
                        ) : (
                          <>
                            {sortedJobs.map((job) => (
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
                                  <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                                    {job.pending_action}
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
                            ))}
                          </>
                        )}
                      </TableBody>
                      {filteredJobs.length > 0 && (
                        <tfoot className="sticky bottom-0 bg-card z-10">
                          <TableRow className="bg-muted/30 border-t-2 border-primary/30 font-semibold">
                            <TableCell className="font-semibold">
                              Total ({summaryTotals?.jobs ?? filteredJobs.length} jobs)
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-blue-500 text-white border-0">
                                {summaryTotals?.longlisted ?? 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-green-500 text-white border-0">
                                {summaryTotals?.shortlisted ?? 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-amber-500 text-white border-0">
                                {summaryTotals?.pending_action ?? 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-red-500 text-white border-0">
                                {summaryTotals?.rejected ?? 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-purple-500 text-white border-0">
                                {summaryTotals?.submitted ?? 0}
                              </Badge>
                            </TableCell>
                          </TableRow>
                          <TableRow className="bg-muted/20 text-xs">
                            <TableCell className="font-medium italic text-muted-foreground" colSpan={2}>
                              Conversion Rates
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">-</TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center">
                                <span className="text-green-400 font-medium">
                                  {calculatePercentage(summaryTotals?.shortlisted ?? 0, summaryTotals?.longlisted ?? 0)}
                                </span>
                                <span className="text-[10px] text-muted-foreground">of Longlisted</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center">
                                <span className="text-amber-400 font-medium">
                                  {calculatePercentage(summaryTotals?.pending_action ?? 0, summaryTotals?.shortlisted ?? 0)}
                                </span>
                                <span className="text-[10px] text-muted-foreground">of Shortlisted</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center">
                                <span className="text-red-400 font-medium">
                                  {calculatePercentage(summaryTotals?.rejected ?? 0, summaryTotals?.shortlisted ?? 0)}
                                </span>
                                <span className="text-[10px] text-muted-foreground">of Shortlisted</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center">
                                <span className="text-purple-400 font-medium">
                                  {calculatePercentage(summaryTotals?.submitted ?? 0, summaryTotals?.shortlisted ?? 0)}
                                </span>
                                <span className="text-[10px] text-muted-foreground">of Shortlisted</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        </tfoot>
                      )}
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
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto relative">
                    <Table>
                      <TableHeader className="sticky top-0 bg-card z-10">
                        <TableRow className="border-border/50">
                          <SortableHeader label="Recruiter" field="recruiter_name" currentSort={recruiterSort} onSort={handleRecruiterSort} />
                          <SortableHeader label={jobScope === 'active' ? 'Active Jobs' : 'Total Jobs'} field="active_jobs" currentSort={recruiterSort} onSort={handleRecruiterSort} className="text-center justify-center" />
                          <SortableHeader label="Longlisted" field="longlisted" currentSort={recruiterSort} onSort={handleRecruiterSort} className="text-center justify-center" />
                          <SortableHeader label="Shortlisted" field="shortlisted" currentSort={recruiterSort} onSort={handleRecruiterSort} className="text-center justify-center" />
                          <SortableHeader label="Pending Action" field="pending_action" currentSort={recruiterSort} onSort={handleRecruiterSort} className="text-center justify-center" />
                          <SortableHeader label="Rejected" field="rejected" currentSort={recruiterSort} onSort={handleRecruiterSort} className="text-center justify-center" />
                          <SortableHeader label="Submitted" field="submitted" currentSort={recruiterSort} onSort={handleRecruiterSort} className="text-center justify-center" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedRecruiters.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                              No recruiters found
                            </TableCell>
                          </TableRow>
                        ) : (
                          <>
                            {sortedRecruiters.map((recruiter) => (
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
                                  <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                                    {recruiter.pending_action}
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
                            ))}
                          </>
                        )}
                      </TableBody>
                      {filteredRecruiters.length > 0 && (
                        <tfoot className="sticky bottom-0 bg-card z-10">
                          <TableRow className="bg-muted/30 border-t-2 border-primary/30 font-semibold">
                            <TableCell className="font-semibold">
                              Total ({filteredRecruiters.length} recruiters)
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-primary text-primary-foreground border-0">
                                {summaryTotals?.jobs ?? 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-blue-500 text-white border-0">
                                {summaryTotals?.longlisted ?? 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-green-500 text-white border-0">
                                {summaryTotals?.shortlisted ?? 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-amber-500 text-white border-0">
                                {summaryTotals?.pending_action ?? 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-red-500 text-white border-0">
                                {summaryTotals?.rejected ?? 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-purple-500 text-white border-0">
                                {summaryTotals?.submitted ?? 0}
                              </Badge>
                            </TableCell>
                          </TableRow>
                          <TableRow className="bg-muted/20 text-xs">
                            <TableCell className="font-medium italic text-muted-foreground" colSpan={2}>
                              Conversion Rates
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">-</TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center">
                                <span className="text-green-400 font-medium">
                                  {calculatePercentage(summaryTotals?.shortlisted ?? 0, summaryTotals?.longlisted ?? 0)}
                                </span>
                                <span className="text-[10px] text-muted-foreground">of Longlisted</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center">
                                <span className="text-amber-400 font-medium">
                                  {calculatePercentage(summaryTotals?.pending_action ?? 0, summaryTotals?.shortlisted ?? 0)}
                                </span>
                                <span className="text-[10px] text-muted-foreground">of Shortlisted</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center">
                                <span className="text-red-400 font-medium">
                                  {calculatePercentage(summaryTotals?.rejected ?? 0, summaryTotals?.shortlisted ?? 0)}
                                </span>
                                <span className="text-[10px] text-muted-foreground">of Shortlisted</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center">
                                <span className="text-purple-400 font-medium">
                                  {calculatePercentage(summaryTotals?.submitted ?? 0, summaryTotals?.shortlisted ?? 0)}
                                </span>
                                <span className="text-[10px] text-muted-foreground">of Shortlisted</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        </tfoot>
                      )}
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
