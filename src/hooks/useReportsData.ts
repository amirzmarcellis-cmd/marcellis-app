import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

interface DateRange {
  from?: Date;
  to?: Date;
}

export interface PipelineMetrics {
  totalLonglisted: number;
  shortlisted: number;
  called: number;
  submitted: number;
  rejected: number;
  conversionRate: number;
  shortlistRate: number;
}

export interface CallPerformanceMetrics {
  totalCalls: number;
  callsWithRecordings: number;
  avgAiScore: number;
  avgCvScore: number;
  avgCommScore: number;
  highScorers: number;
  lowScorers: number;
  scoreDistribution: { range: string; count: number }[];
}

export interface RecruiterMetrics {
  recruiter_id: string;
  recruiter_name: string;
  totalCandidates: number;
  shortlisted: number;
  submitted: number;
  submissionRate: number;
  avgTimeToSubmit: number | null;
}

export interface JobStatusMetrics {
  totalJobs: number;
  activeJobs: number;
  sourcingJobs: number;
  recruitingJobs: number;
  autoDialJobs: number;
  avgCandidatesPerJob: number;
  statusBreakdown: { status: string; count: number; fill: string }[];
}

export function useReportsData(dateRange: DateRange) {
  // Pipeline metrics query
  const pipelineQuery = useQuery({
    queryKey: ['reports-pipeline', dateRange.from, dateRange.to],
    queryFn: async (): Promise<PipelineMetrics> => {
      let query = supabase.from('Jobs_CVs').select('contacted, shortlisted_at, after_call_score, longlisted_at, submitted_at');
      
      if (dateRange.from) {
        query = query.gte('longlisted_at', dateRange.from.toISOString());
      }
      if (dateRange.to) {
        query = query.lte('longlisted_at', dateRange.to.toISOString());
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const records = data || [];
      const totalLonglisted = records.filter(r => r.longlisted_at).length;
      const shortlisted = records.filter(r => r.shortlisted_at).length;
      const called = records.filter(r => r.after_call_score !== null).length;
      const submitted = records.filter(r => r.contacted === 'Submitted').length;
      const rejected = records.filter(r => r.contacted === 'Rejected').length;
      
      return {
        totalLonglisted,
        shortlisted,
        called,
        submitted,
        rejected,
        conversionRate: totalLonglisted > 0 ? (submitted / totalLonglisted) * 100 : 0,
        shortlistRate: totalLonglisted > 0 ? (shortlisted / totalLonglisted) * 100 : 0,
      };
    },
  });

  // Call performance metrics query
  const callPerformanceQuery = useQuery({
    queryKey: ['reports-call-performance', dateRange.from, dateRange.to],
    queryFn: async (): Promise<CallPerformanceMetrics> => {
      let query = supabase.from('Jobs_CVs').select('lastcalltime, recording, after_call_score, cv_score, comm_score');
      
      if (dateRange.from) {
        query = query.gte('lastcalltime', dateRange.from.toISOString());
      }
      if (dateRange.to) {
        query = query.lte('lastcalltime', dateRange.to.toISOString());
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const records = data || [];
      const calledRecords = records.filter(r => r.lastcalltime);
      const withScores = calledRecords.filter(r => r.after_call_score !== null);
      
      const avgAiScore = withScores.length > 0 
        ? withScores.reduce((sum, r) => sum + (r.after_call_score || 0), 0) / withScores.length 
        : 0;
      
      const withCvScores = records.filter(r => r.cv_score !== null);
      const avgCvScore = withCvScores.length > 0
        ? withCvScores.reduce((sum, r) => sum + (r.cv_score || 0), 0) / withCvScores.length
        : 0;
        
      const withCommScores = records.filter(r => r.comm_score !== null);
      const avgCommScore = withCommScores.length > 0
        ? withCommScores.reduce((sum, r) => sum + (r.comm_score || 0), 0) / withCommScores.length
        : 0;
      
      // Score distribution buckets
      const scoreDistribution = [
        { range: '0-25', count: withScores.filter(r => (r.after_call_score || 0) <= 25).length },
        { range: '26-50', count: withScores.filter(r => (r.after_call_score || 0) > 25 && (r.after_call_score || 0) <= 50).length },
        { range: '51-75', count: withScores.filter(r => (r.after_call_score || 0) > 50 && (r.after_call_score || 0) <= 75).length },
        { range: '76-100', count: withScores.filter(r => (r.after_call_score || 0) > 75).length },
      ];
      
      return {
        totalCalls: calledRecords.length,
        callsWithRecordings: calledRecords.filter(r => r.recording).length,
        avgAiScore: Math.round(avgAiScore),
        avgCvScore: Math.round(avgCvScore),
        avgCommScore: Math.round(avgCommScore),
        highScorers: withScores.filter(r => (r.after_call_score || 0) >= 75).length,
        lowScorers: withScores.filter(r => (r.after_call_score || 0) < 50).length,
        scoreDistribution,
      };
    },
  });

  // Recruiter metrics query
  const recruiterQuery = useQuery({
    queryKey: ['reports-recruiters', dateRange.from, dateRange.to],
    queryFn: async (): Promise<RecruiterMetrics[]> => {
      let cvQuery = supabase.from('Jobs_CVs').select('recruiter_id, contacted, shortlisted_at, longlisted_at, submitted_at');
      
      if (dateRange.from) {
        cvQuery = cvQuery.gte('longlisted_at', dateRange.from.toISOString());
      }
      if (dateRange.to) {
        cvQuery = cvQuery.lte('longlisted_at', dateRange.to.toISOString());
      }
      
      const { data: cvData, error: cvError } = await cvQuery;
      if (cvError) throw cvError;
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name, email');
      if (profilesError) throw profilesError;
      
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p.name || p.email]) || []);
      
      // Group by recruiter
      const recruiterMap = new Map<string, {
        totalCandidates: number;
        shortlisted: number;
        submitted: number;
        submissionTimes: number[];
      }>();
      
      (cvData || []).forEach(record => {
        if (!record.recruiter_id) return;
        
        const existing = recruiterMap.get(record.recruiter_id) || {
          totalCandidates: 0,
          shortlisted: 0,
          submitted: 0,
          submissionTimes: [],
        };
        
        existing.totalCandidates++;
        if (record.shortlisted_at) existing.shortlisted++;
        if (record.contacted === 'Submitted') {
          existing.submitted++;
          if (record.longlisted_at && record.submitted_at) {
            const longlisted = new Date(record.longlisted_at);
            const submitted = new Date(record.submitted_at);
            const diffHours = (submitted.getTime() - longlisted.getTime()) / (1000 * 60 * 60);
            if (diffHours > 0 && diffHours < 720) { // Less than 30 days
              existing.submissionTimes.push(diffHours);
            }
          }
        }
        
        recruiterMap.set(record.recruiter_id, existing);
      });
      
      return Array.from(recruiterMap.entries()).map(([id, data]) => ({
        recruiter_id: id,
        recruiter_name: profilesMap.get(id) || id,
        totalCandidates: data.totalCandidates,
        shortlisted: data.shortlisted,
        submitted: data.submitted,
        submissionRate: data.totalCandidates > 0 ? (data.submitted / data.totalCandidates) * 100 : 0,
        avgTimeToSubmit: data.submissionTimes.length > 0 
          ? data.submissionTimes.reduce((a, b) => a + b, 0) / data.submissionTimes.length 
          : null,
      })).sort((a, b) => b.submitted - a.submitted);
    },
  });

  // Job status metrics query
  const jobStatusQuery = useQuery({
    queryKey: ['reports-job-status'],
    queryFn: async (): Promise<JobStatusMetrics> => {
      const { data: jobsData, error: jobsError } = await supabase
        .from('Jobs')
        .select('job_id, status, Processed, automatic_dial');
      if (jobsError) throw jobsError;
      
      const { data: cvData, error: cvError } = await supabase
        .from('Jobs_CVs')
        .select('job_id');
      if (cvError) throw cvError;
      
      const jobs = jobsData || [];
      const candidateCounts = new Map<string, number>();
      (cvData || []).forEach(cv => {
        candidateCounts.set(cv.job_id, (candidateCounts.get(cv.job_id) || 0) + 1);
      });
      
      const totalJobs = jobs.length;
      const activeJobs = jobs.filter(j => j.Processed === 'Yes' || j.status === 'active').length;
      const sourcingJobs = jobs.filter(j => j.status?.toLowerCase() === 'sourcing').length;
      const recruitingJobs = jobs.filter(j => j.status?.toLowerCase() === 'recruiting').length;
      const autoDialJobs = jobs.filter(j => j.automatic_dial === true).length;
      
      const totalCandidates = Array.from(candidateCounts.values()).reduce((a, b) => a + b, 0);
      const avgCandidatesPerJob = totalJobs > 0 ? totalCandidates / totalJobs : 0;
      
      // Status breakdown for pie chart
      const statusCounts = new Map<string, number>();
      jobs.forEach(job => {
        const status = job.status || 'Unknown';
        statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
      });
      
      const colors = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
      const statusBreakdown = Array.from(statusCounts.entries()).map(([status, count], i) => ({
        status,
        count,
        fill: colors[i % colors.length],
      }));
      
      return {
        totalJobs,
        activeJobs,
        sourcingJobs,
        recruitingJobs,
        autoDialJobs,
        avgCandidatesPerJob: Math.round(avgCandidatesPerJob * 10) / 10,
        statusBreakdown,
      };
    },
  });

  return {
    pipeline: pipelineQuery,
    callPerformance: callPerformanceQuery,
    recruiters: recruiterQuery,
    jobStatus: jobStatusQuery,
    isLoading: pipelineQuery.isLoading || callPerformanceQuery.isLoading || recruiterQuery.isLoading || jobStatusQuery.isLoading,
    refetchAll: () => {
      pipelineQuery.refetch();
      callPerformanceQuery.refetch();
      recruiterQuery.refetch();
      jobStatusQuery.refetch();
    },
  };
}
