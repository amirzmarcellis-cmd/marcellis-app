import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Calendar, TrendingUp, Users, MapPin } from "lucide-react";
import { format, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface JobAnalytics {
  jobAddedDate: string | null;
  timeToFirstLonglist: string | null;
  timeToFirstShortlist: string | null;
  sourcesBreakdown: { source: string; count: number }[];
  totalCandidates: number;
}

export function JobAnalytics() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [analytics, setAnalytics] = useState<JobAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchAnalytics(selectedJobId);
    }
  }, [selectedJobId]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("Jobs")
        .select("job_id, job_title, Timestamp")
        .order("Timestamp", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
      
      // Auto-select first job
      if (data && data.length > 0) {
        setSelectedJobId(data[0].job_id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setLoading(false);
    }
  };

  const fetchAnalytics = async (jobId: string) => {
    try {
      setLoading(true);

      // Get job details
      const { data: jobData, error: jobError } = await supabase
        .from("Jobs")
        .select("Timestamp")
        .eq("job_id", jobId)
        .single();

      if (jobError) throw jobError;

      // Get all candidates for this job
      const { data: candidatesData, error: candidatesError } = await supabase
        .from("Jobs_CVs")
        .select("longlisted_at, shortlisted_at, source")
        .eq("job_id", jobId)
        .order("longlisted_at", { ascending: true });

      if (candidatesError) throw candidatesError;

      const jobAddedDate = jobData?.Timestamp || null;
      let timeToFirstLonglist: string | null = null;
      let timeToFirstShortlist: string | null = null;

      // Calculate time to first longlist
      if (candidatesData && candidatesData.length > 0 && jobAddedDate) {
        const firstLonglistedCandidate = candidatesData.find(c => c.longlisted_at);
        
        if (firstLonglistedCandidate?.longlisted_at) {
          const jobDate = new Date(jobAddedDate);
          const longlistDate = new Date(firstLonglistedCandidate.longlisted_at);
          timeToFirstLonglist = formatTimeDifference(jobDate, longlistDate);

          // Calculate time to first shortlist (from first longlist)
          const firstShortlistedCandidate = candidatesData.find(c => c.shortlisted_at);
          if (firstShortlistedCandidate?.shortlisted_at) {
            const shortlistDate = new Date(firstShortlistedCandidate.shortlisted_at);
            timeToFirstShortlist = formatTimeDifference(longlistDate, shortlistDate);
          }
        }
      }

      // Calculate sources breakdown
      const sourcesMap = new Map<string, number>();
      candidatesData?.forEach(candidate => {
        const source = candidate.source || "Unknown";
        sourcesMap.set(source, (sourcesMap.get(source) || 0) + 1);
      });

      const sourcesBreakdown = Array.from(sourcesMap.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);

      setAnalytics({
        jobAddedDate,
        timeToFirstLonglist,
        timeToFirstShortlist,
        sourcesBreakdown,
        totalCandidates: candidatesData?.length || 0,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setLoading(false);
    }
  };

  const formatTimeDifference = (startDate: Date, endDate: Date): string => {
    const days = differenceInDays(endDate, startDate);
    const hours = differenceInHours(endDate, startDate) % 24;
    const minutes = differenceInMinutes(endDate, startDate) % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const selectedJob = jobs.find(j => j.job_id === selectedJobId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Analytics</CardTitle>
          <CardDescription>
            View detailed analytics and performance metrics for your jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Job</label>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.job_id} value={job.job_id}>
                      {job.job_title || job.job_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedJob && analytics && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Job Created
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.jobAddedDate
                    ? format(new Date(analytics.jobAddedDate), "MMM dd, yyyy")
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.jobAddedDate
                    ? format(new Date(analytics.jobAddedDate), "HH:mm")
                    : ""}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Time to First Longlist
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.timeToFirstLonglist || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From job creation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Time to First Shortlist
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.timeToFirstShortlist || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From first longlist
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Candidates
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.totalCandidates}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Longlisted candidates
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Candidate Sources</CardTitle>
              <CardDescription>
                Breakdown of candidates by source channel
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.sourcesBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {analytics.sourcesBreakdown.map((item) => (
                    <div
                      key={item.source}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{item.source}</p>
                          <p className="text-sm text-muted-foreground">
                            {((item.count / analytics.totalCandidates) * 100).toFixed(1)}% of
                            total
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-lg font-semibold">
                        {item.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No candidates found for this job
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}
