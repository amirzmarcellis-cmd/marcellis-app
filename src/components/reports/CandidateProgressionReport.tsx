import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Clock, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, differenceInHours, differenceInDays } from "date-fns";
import { useUserRole } from "@/hooks/useUserRole";

interface CandidateProgression {
  job_id: string;
  candidate_name: string;
  longlisted_at: string | null;
  shortlisted_at: string | null;
  contacted: string | null;
  timeToShortlist?: number; // hours
  timeToSubmission?: number; // hours
}

export function CandidateProgressionReport() {
  const [progressionData, setProgressionData] = useState<CandidateProgression[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [jobs, setJobs] = useState<{job_id: string, job_title: string}[]>([]);
  const { isAdmin, isTeamLeader } = useUserRole();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getUser();
    fetchJobs();
    fetchProgressionData();
  }, []);

  useEffect(() => {
    fetchProgressionData();
  }, [selectedJobId, isAdmin, isTeamLeader, currentUserId, jobs]);

  const fetchJobs = async () => {
    try {
      let query = supabase
        .from('Jobs')
        .select('job_id, job_title, recruiter_id');

      // Filter jobs based on user role
      if (!isAdmin && !isTeamLeader && currentUserId) {
        query = query.eq('recruiter_id', currentUserId);
      }

      const { data } = await query.order('job_id');
      
      if (data) {
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchProgressionData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('Jobs_CVs')
        .select('job_id, candidate_name, longlisted_at, shortlisted_at, contacted')
        .not('longlisted_at', 'is', null);

      if (selectedJobId !== "all") {
        query = query.eq('job_id', selectedJobId);
      } else if (!isAdmin && !isTeamLeader && currentUserId) {
        // For non-admin/non-team-leader users, filter by jobs they created
        const jobIds = jobs.map(job => job.job_id);
        if (jobIds.length > 0) {
          query = query.in('job_id', jobIds);
        } else {
          // If no jobs found for this user, return empty result
          setProgressionData([]);
          setLoading(false);
          return;
        }
      }

      const { data } = await query.order('longlisted_at', { ascending: false });

      if (data) {
        const processedData = data.map(item => {
          const processed: CandidateProgression = { ...item };
          
          // Calculate time to shortlist (longlisted_at to shortlisted_at)
          if (item.longlisted_at && item.shortlisted_at) {
            const longlistedTime = parseISO(item.longlisted_at);
            const shortlistedTime = parseISO(item.shortlisted_at);
            processed.timeToShortlist = differenceInHours(shortlistedTime, longlistedTime);
          }

          // Calculate time to submission (shortlisted_at to contacted/submitted)
          if (item.shortlisted_at && item.contacted) {
            const shortlistedTime = parseISO(item.shortlisted_at);
            const contactedTime = parseISO(item.contacted);
            processed.timeToSubmission = differenceInHours(contactedTime, shortlistedTime);
          }

          return processed;
        });

        setProgressionData(processedData);
      }
    } catch (error) {
      console.error('Error fetching progression data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (hours: number | undefined) => {
    if (!hours) return "—";
    
    const totalMinutes = Math.round(hours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);
    const secs = Math.round((hours * 3600) % 60);
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressionStatus = (item: CandidateProgression) => {
    if (item.contacted) return "Submitted";
    if (item.shortlisted_at) return "Shortlisted";
    if (item.longlisted_at) return "Longlisted";
    return "Pending";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Submitted": return "default";
      case "Shortlisted": return "secondary";
      case "Longlisted": return "outline";
      default: return "destructive";
    }
  };

  const averageTimeToShortlist = progressionData
    .filter(item => item.timeToShortlist)
    .reduce((sum, item) => sum + (item.timeToShortlist || 0), 0) / 
    progressionData.filter(item => item.timeToShortlist).length || 0;

  const averageTimeToSubmission = progressionData
    .filter(item => item.timeToSubmission)
    .reduce((sum, item) => sum + (item.timeToSubmission || 0), 0) / 
    progressionData.filter(item => item.timeToSubmission).length || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Candidate Progression Time Analysis
              </CardTitle>
              <CardDescription>
                Track time taken for candidates to move through recruitment stages
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.job_id} value={job.job_id}>
                      {job.job_title || job.job_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Avg. Longlisted → Shortlisted</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatDuration(averageTimeToShortlist)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Avg. Shortlisted → Submission</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatDuration(averageTimeToSubmission)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Total Candidates</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {progressionData.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Table */}
          {loading ? (
            <div className="text-center py-8">Loading progression data...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate Name</TableHead>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Longlisted At</TableHead>
                  <TableHead>Shortlisted At</TableHead>
                  <TableHead>Longlisted → Shortlisted</TableHead>
                  <TableHead>Shortlisted → Submission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {progressionData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.candidate_name || "—"}
                    </TableCell>
                    <TableCell>{item.job_id}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(getProgressionStatus(item))}>
                        {getProgressionStatus(item)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.longlisted_at 
                        ? format(parseISO(item.longlisted_at), 'MMM dd, yyyy HH:mm')
                        : "—"
                      }
                    </TableCell>
                    <TableCell>
                      {item.shortlisted_at 
                        ? format(parseISO(item.shortlisted_at), 'MMM dd, yyyy HH:mm')
                        : "—"
                      }
                    </TableCell>
                    <TableCell>
                      <span className={item.timeToShortlist ? "font-medium" : "text-muted-foreground"}>
                        {formatDuration(item.timeToShortlist)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={item.timeToSubmission ? "font-medium" : "text-muted-foreground"}>
                        {formatDuration(item.timeToSubmission)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}