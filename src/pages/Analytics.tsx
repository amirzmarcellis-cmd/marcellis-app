// @ts-nocheck
import { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from '@/integrations/supabase/client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Briefcase, Phone, TrendingUp, Star, CheckCircle, PhoneCall, Clock } from 'lucide-react';

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  totalCandidates: number;
  activeCandidates: number;
  activeJobs: number;
  totalJobs: number;
  totalCallLogs: number;
  contactedCount: number;
  averageScore: number;
  avgDaysToHire: number;
  totalLonglisted: number;
  totalShortlisted: number;
  totalRejected: number;
  totalSubmitted: number;
  scoreDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  contactStatus: {
    callDone: number;
    contacted: number;
    readyToContact: number;
    notContacted: number;
    rejected: number;
    shortlisted: number;
    tasked: number;
    interview: number;
    hired: number;
  };
  candidatesPerJob: Array<{
    jobTitle: string;
    count: number;
  }>;
  topPerformingJobs: Array<{
    jobTitle: string;
    candidateCount: number;
    averageScore: number;
    rank: number;
  }>;
  averageScoresByJob: Array<{
    jobTitle: string;
    averageScore: number;
  }>;
  averageSalariesByJob: Array<{
    jobTitle: string;
    avgExpected: number;
    avgCurrent: number;
  }>;
  callSuccessRate: number;
  contactRate: number;
  avgCandidatesPerJob: number;
}

const COLORS = {
  high: '#10b981',     // emerald-500
  medium: '#3b82f6',   // blue-500
  low: '#ef4444',      // red-500
  callDone: '#10b981',
  contacted: '#3b82f6',
  readyToContact: '#f59e0b',
  notContacted: '#ef4444',
  rejected: '#ef4444',
  shortlisted: '#10b981',
  tasked: '#8b5cf6',
  interview: '#06b6d4',
  hired: '#10b981',
  primary: '#00ffff',  // cyan-400
};

export default function Analytics() {
  
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      console.log('Fetching analytics data...');
      
      // Parallel fetch with only required fields for 10x faster loading
      const [candidatesResult, jobsResult, countResult, submittedCountResult, rejectedCountResult, shortlistedCountResult, longlistedCountResult] = await Promise.all([
        supabase
          .from('Jobs_CVs')
          .select('job_id, contacted, cv_score, after_call_score, callcount, current_salary, salary_expectations, submitted_at, longlisted_at, shortlisted_at, lastcalltime'),
        
        supabase
          .from('Jobs')
          .select('job_id, job_title, Processed'),
        
        supabase
          .from('Jobs_CVs')
          .select('*', { count: 'exact', head: true }),
        
        // Accurate server-side count for submitted
        supabase
          .from('Jobs_CVs')
          .select('*', { count: 'exact', head: true })
          .or('submitted_at.not.is.null,contacted.ilike.%submit%'),
        
        // Accurate server-side count for rejected
        supabase
          .from('Jobs_CVs')
          .select('*', { count: 'exact', head: true })
          .ilike('contacted', '%reject%'),
        
        // Accurate server-side count for shortlisted
        supabase
          .from('Jobs_CVs')
          .select('*', { count: 'exact', head: true })
          .not('shortlisted_at', 'is', null),
        
        // Accurate server-side count for longlisted
        supabase
          .from('Jobs_CVs')
          .select('*', { count: 'exact', head: true })
          .not('longlisted_at', 'is', null)
      ]);

      const { data: candidates, error: candidatesError } = candidatesResult;
      const { data: jobs, error: jobsError } = jobsResult;
      const { count: totalCandidates, error: countError } = countResult;
      const { count: submittedCount, error: submittedCountError } = submittedCountResult;
      const { count: rejectedCount, error: rejectedCountError } = rejectedCountResult;
      const { count: shortlistedCount, error: shortlistedCountError } = shortlistedCountResult;
      const { count: longlistedCount, error: longlistedCountError } = longlistedCountResult;

      if (candidatesError) throw candidatesError;
      if (jobsError) throw jobsError;
      if (countError) throw countError;
      if (submittedCountError) throw submittedCountError;
      if (rejectedCountError) throw rejectedCountError;
      if (shortlistedCountError) throw shortlistedCountError;
      if (longlistedCountError) throw longlistedCountError;

      console.log('Candidates fetched:', candidates?.length || 0);
      console.log('Total candidates count:', totalCandidates || 0);
      console.log('Jobs fetched:', jobs?.length || 0);
      const totalJobs = jobs?.length || 0;
      const activeJobs = jobs?.filter(j => j.Processed === 'Yes').length || 0;

      console.log('Total candidates (accurate count):', totalCandidates || 0);
      console.log('Total jobs:', totalJobs);
      console.log('Active jobs:', activeJobs);

      // Calculate contact status counts (case-insensitive)
      const contactStatus = {
        callDone: candidates?.filter(c => (c.contacted?.toLowerCase().includes('call done') ?? false) || (typeof c.after_call_score === 'number' && c.after_call_score > 0)).length || 0,
        contacted: candidates?.filter(c => c.contacted?.toLowerCase().includes('contacted') ?? false).length || 0,
        readyToContact: candidates?.filter(c => c.contacted?.toLowerCase().includes('ready to contact') ?? false).length || 0,
        notContacted: candidates?.filter(c => {
          const s = (c.contacted || '').toLowerCase();
          return !s || s.includes('not contacted') || s.includes('no answer') || s.includes('connection sent');
        }).length || 0,
        rejected: candidates?.filter(c => (c.contacted?.toLowerCase().includes('reject') ?? false)).length || 0,
        shortlisted: candidates?.filter(c => (c.contacted?.toLowerCase().includes('shortlist') ?? false) || (c.shortlisted_at !== null && String(c.shortlisted_at).trim() !== '')).length || 0,
        tasked: candidates?.filter(c => c.contacted?.toLowerCase().includes('task') ?? false).length || 0,
        interview: candidates?.filter(c => c.contacted?.toLowerCase().includes('interview') ?? false).length || 0,
        hired: candidates?.filter(c => c.contacted?.toLowerCase().includes('hire') ?? false).length || 0,
      };

      const totalCallLogs = candidates?.filter(c => c.callcount && c.callcount > 0).length || 0;
      const contactedCount = contactStatus.callDone + contactStatus.contacted;

      // Helper to validate date-like values
      const hasDate = (val: any) => {
        const s = String(val ?? '').trim();
        if (!s) return false;
        const d = new Date(s.includes(' ') ? s.replace(' ', 'T') : s);
        return !isNaN(d.getTime());
      };

      // Use accurate server-side counts for stage metrics
      const totalLonglisted = longlistedCount || 0;
      
      const totalShortlisted = shortlistedCount || 0;
      
      const totalRejected = rejectedCount || 0;
      
      const totalSubmitted = submittedCount || 0;

      // === DEBUG: Detailed Filter Results ===
      console.log('=== ANALYTICS DEBUG: Filter Results ===');
      console.log('Total candidates fetched:', candidates?.length || 0);
      console.log('');
      console.log('Candidates with "call done" (case-insensitive):', 
        candidates?.filter(c => c.contacted?.toLowerCase() === 'call done').length || 0);
      console.log('  - With score >= 75 (SHORTLISTED):', 
        candidates?.filter(c => c.contacted?.toLowerCase() === 'call done' && c.after_call_score !== null && parseInt(c.after_call_score?.toString() || '0') >= 75).length || 0);
      console.log('  - With score < 75 (LONGLISTED):', 
        candidates?.filter(c => c.contacted?.toLowerCase() === 'call done' && c.after_call_score !== null && parseInt(c.after_call_score?.toString() || '0') < 75).length || 0);
      console.log('  - With null/undefined score:', 
        candidates?.filter(c => c.contacted?.toLowerCase() === 'call done' && (c.after_call_score === null || c.after_call_score === undefined)).length || 0);
      console.log('');
      console.log('Candidates with "rejected" (case-insensitive):', 
        candidates?.filter(c => c.contacted?.toLowerCase() === 'rejected').length || 0);
      console.log('Candidates with submitted_at not null (SUBMITTED):', 
        candidates?.filter(c => c.submitted_at !== null).length || 0);
      console.log('');
      console.log('CALCULATED TOTALS:');
      console.log('  - totalLonglisted:', totalLonglisted);
      console.log('  - totalShortlisted:', totalShortlisted);
      console.log('  - totalRejected:', totalRejected);
      console.log('  - totalSubmitted:', totalSubmitted);
      console.log('');
      console.log('Sample of first 5 candidates with contacted status:');
      candidates?.slice(0, 5).forEach((c, idx) => {
        console.log(`  ${idx + 1}. contacted="${c.contacted}", after_call_score=${c.after_call_score}, submitted_at=${c.submitted_at}`);
      });
      console.log('');
      console.log('Unique contacted values in dataset:');
      const uniqueContacted = [...new Set(candidates?.map(c => c.contacted || 'NULL'))];
      console.log(uniqueContacted);
      console.log('=== END ANALYTICS DEBUG ===');
      console.log('');

      // Calculate average scores
      const candidatesWithScores = candidates?.filter(c => c.cv_score !== null && c.cv_score !== undefined) || [];
      const averageScore = candidatesWithScores.length > 0
        ? Math.round(candidatesWithScores.reduce((sum, c) => sum + (c.cv_score || 0), 0) / candidatesWithScores.length)
        : 0;

      // Score distribution
      const scoreDistribution = {
        high: candidates?.filter(c => c.cv_score && c.cv_score >= 75).length || 0,
        medium: candidates?.filter(c => c.cv_score && c.cv_score >= 50 && c.cv_score < 75).length || 0,
        low: candidates?.filter(c => c.cv_score && c.cv_score > 0 && c.cv_score < 50).length || 0,
      };

      // Candidates per job
      const jobCandidateCounts = jobs?.map(job => {
        const count = candidates?.filter(c => c.job_id === job.job_id).length || 0;
        return {
          jobTitle: job.job_title || 'Unknown',
          count
        };
      }).filter(j => j.count > 0) || [];

      // Average scores by job
      const averageScoresByJob = jobs?.map(job => {
        const jobCandidates = candidates?.filter(c => c.job_id === job.job_id && c.cv_score) || [];
        const avgScore = jobCandidates.length > 0
          ? Math.round(jobCandidates.reduce((sum, c) => sum + (c.cv_score || 0), 0) / jobCandidates.length)
          : 0;
        return {
          jobId: job.job_id,
          jobTitle: job.job_title || 'Unknown',
          averageScore: avgScore
        };
      }).filter(j => j.averageScore > 0) || [];

      // Top performing jobs
      const topPerformingJobs = (averageScoresByJob || [])
        .slice()
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 5)
        .map((job, index) => ({
          ...job,
          candidateCount: candidates?.filter(c => c.job_id === job.jobId).length || 0,
          rank: index + 1
        }));

      // Average salaries by job
      const averageSalariesByJob = jobs?.map(job => {
        const jobCandidates = candidates?.filter(c => c.job_id === job.job_id) || [];
        const candidatesWithCurrentSalary = jobCandidates.filter(c => c.current_salary);
        const candidatesWithExpectedSalary = jobCandidates.filter(c => c.salary_expectations);
        
        const avgCurrent = candidatesWithCurrentSalary.length > 0
          ? Math.round(candidatesWithCurrentSalary.reduce((sum, c) => sum + (c.current_salary || 0), 0) / candidatesWithCurrentSalary.length)
          : 0;
        
        const avgExpected = candidatesWithExpectedSalary.length > 0
          ? Math.round(candidatesWithExpectedSalary.reduce((sum, c) => {
              const salary = parseInt(c.salary_expectations?.replace(/[^\d]/g, '') || '0');
              return sum + salary;
            }, 0) / candidatesWithExpectedSalary.length)
          : 0;
        
        return {
          jobTitle: job.job_title || 'Unknown',
          avgCurrent,
          avgExpected
        };
      }).filter(j => j.avgCurrent > 0 || j.avgExpected > 0) || [];

      // Calculate average days to hire (longlist -> shortlist) + (shortlist -> submitted)
      const toDate = (val: any): Date | null => {
        if (!val) return null;
        const s = String(val).trim();
        if (!s) return null;
        let d = new Date(s);
        if (isNaN(d.getTime())) {
          const normalized = s.replace(' ', 'T');
          d = new Date(normalized);
        }
        return isNaN(d.getTime()) ? null : d;
      };

      // Phase 1: Longlist -> Shortlist
      const l2sDiffsDays: number[] = (candidates || [])
        .map((c) => {
          const longlisted = toDate(c.longlisted_at);
          const shortlisted = toDate(c.shortlisted_at);
          if (!longlisted || !shortlisted) return null;
          const diff = (shortlisted.getTime() - longlisted.getTime()) / (1000 * 60 * 60 * 24);
          return diff >= 0 ? diff : null;
        })
        .filter((v): v is number => v !== null);

      // Phase 2: Shortlist -> Submitted
      const s2subDiffsDays: number[] = (candidates || [])
        .map((c) => {
          const shortlisted = toDate(c.shortlisted_at);
          const submitted = toDate(c.submitted_at);
          if (!shortlisted || !submitted) return null;
          const diff = (submitted.getTime() - shortlisted.getTime()) / (1000 * 60 * 60 * 24);
          return diff >= 0 ? diff : null;
        })
        .filter((v): v is number => v !== null);

      const avgL2S = l2sDiffsDays.length
        ? l2sDiffsDays.reduce((a, b) => a + b, 0) / l2sDiffsDays.length
        : 0;
      const avgS2Sub = s2subDiffsDays.length
        ? s2subDiffsDays.reduce((a, b) => a + b, 0) / s2subDiffsDays.length
        : 0;

      const avgDaysToHire = Math.ceil(avgL2S + avgS2Sub);

      console.log('Avg L2S samples:', l2sDiffsDays.slice(0, 5), 'count:', l2sDiffsDays.length, 'avg:', avgL2S);
      console.log('Avg S2Sub samples:', s2subDiffsDays.slice(0, 5), 'count:', s2subDiffsDays.length, 'avg:', avgS2Sub);

      const analyticsData = {
        totalCandidates,
        activeCandidates: totalCandidates,
        activeJobs,
        totalJobs,
        totalCallLogs,
        contactedCount,
        averageScore,
        avgDaysToHire,
        totalLonglisted,
        totalShortlisted,
        totalRejected,
        totalSubmitted,
        scoreDistribution,
        contactStatus,
        candidatesPerJob: jobCandidateCounts,
        topPerformingJobs,
        averageScoresByJob,
        averageSalariesByJob,
        callSuccessRate: totalCallLogs > 0 ? Math.round((contactedCount / totalCallLogs) * 100) : 0,
        contactRate: totalCandidates > 0 ? Math.round((contactedCount / totalCandidates) * 100) : 0,
        avgCandidatesPerJob: activeJobs > 0 ? Math.round(totalCandidates / activeJobs) : 0
      };

      console.log('Analytics data prepared:', analyticsData);
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Set empty data on error so UI doesn't show null
      setData({
        totalCandidates: 0,
        activeCandidates: 0,
        activeJobs: 0,
        totalJobs: 0,
        totalCallLogs: 0,
        contactedCount: 0,
        averageScore: 0,
        avgDaysToHire: 0,
        totalLonglisted: 0,
        totalShortlisted: 0,
        totalRejected: 0,
        totalSubmitted: 0,
        scoreDistribution: { high: 0, medium: 0, low: 0 },
        contactStatus: {
          callDone: 0,
          contacted: 0,
          readyToContact: 0,
          notContacted: 0,
          rejected: 0,
          shortlisted: 0,
          tasked: 0,
          interview: 0,
          hired: 0,
        },
        candidatesPerJob: [],
        topPerformingJobs: [],
        averageScoresByJob: [],
        averageSalariesByJob: [],
        callSuccessRate: 0,
        contactRate: 0,
        avgCandidatesPerJob: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 p-6">
        <div className="mb-8">
          <Skeleton className="h-10 w-80 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="bg-card border-border dark:bg-white/10">
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="bg-card border-border dark:bg-white/10">
              <CardContent className="p-6">
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const scoreDistributionData = [
    { name: '+75 (High)', value: data?.scoreDistribution.high || 0, color: COLORS.high },
    { name: '50-74 (Medium)', value: data?.scoreDistribution.medium || 0, color: COLORS.medium },
    { name: '1-49 (Low)', value: data?.scoreDistribution.low || 0, color: COLORS.low },
  ];

  const contactStatusData = [
    { name: 'Call Done', value: data?.contactStatus.callDone || 0, color: COLORS.callDone },
    { name: 'Contacted', value: data?.contactStatus.contacted || 0, color: COLORS.contacted },
    { name: 'Ready to Contact', value: data?.contactStatus.readyToContact || 0, color: COLORS.readyToContact },
    { name: 'Not Contacted', value: data?.contactStatus.notContacted || 0, color: COLORS.notContacted },
    { name: 'Rejected', value: data?.contactStatus.rejected || 0, color: COLORS.rejected },
    { name: 'Shortlisted', value: data?.contactStatus.shortlisted || 0, color: COLORS.shortlisted },
    { name: 'Tasked', value: data?.contactStatus.tasked || 0, color: COLORS.tasked },
    { name: 'Interview', value: data?.contactStatus.interview || 0, color: COLORS.interview },
  ].filter(item => item.value > 0); // Only show statuses with values

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-6xl font-light font-work tracking-tight text-foreground mb-2">Analytics Dashboard</h1>
            <p className="text-base font-light font-inter text-muted-foreground">Comprehensive recruitment performance insights</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-light font-inter">Live Dashboard</span>
          </div>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20 hover:border-primary/40 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light font-inter uppercase tracking-wide text-muted-foreground">Total Candidates</p>
                <p className="text-5xl font-light font-work text-foreground mt-2">{data?.totalCandidates || 0}</p>
                <p className="text-xs font-light font-inter text-muted-foreground mt-1">From Jobs_CVs table</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20 hover:border-primary/40 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Active Jobs</p>
                <p className="text-4xl font-bold text-foreground mt-2">{data?.activeJobs || 0}</p>
                <p className="text-xs text-blue-300 mt-1">Open job openings</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20 hover:border-primary/40 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Total Call Logs</p>
                <p className="text-4xl font-bold text-foreground mt-2">{data?.totalCallLogs || 0}</p>
                <div className="text-xs text-cyan-300 mt-1">
                  <Badge className="bg-cyan-400/20 text-cyan-400 border-cyan-400/30">
                    {data?.contactedCount || 0} Contacted
                  </Badge>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <Phone className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20 hover:border-primary/40 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Average Score</p>
                <p className="text-4xl font-bold text-foreground mt-2">{data?.averageScore || 0}</p>
                <p className="text-xs text-blue-300 mt-1">/100</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20 hover:border-primary/40 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Avg Days to Hire</p>
                <p className="text-4xl font-bold text-foreground mt-2">{data?.avgDaysToHire || 0}</p>
                <p className="text-xs text-blue-300 mt-1">days</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Aggregate Metrics Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-light font-work text-foreground mb-4">Jobs Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20 hover:border-primary/40 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-light font-inter uppercase tracking-wide text-muted-foreground">Number of Jobs</p>
                  <p className="text-5xl font-light font-work text-foreground mt-2">{data?.totalJobs || 0}</p>
                  <p className="text-xs font-light font-inter text-muted-foreground mt-1">All jobs in system</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20 hover:border-primary/40 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-light font-inter uppercase tracking-wide text-muted-foreground">Total Longlisted</p>
                  <p className="text-5xl font-light font-work text-foreground mt-2">{data?.totalLonglisted || 0}</p>
                  <p className="text-xs font-light font-inter text-muted-foreground mt-1">Across all jobs</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20 hover:border-primary/40 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-light font-inter uppercase tracking-wide text-muted-foreground">Total Shortlisted</p>
                  <p className="text-5xl font-light font-work text-foreground mt-2">{data?.totalShortlisted || 0}</p>
                  <p className="text-xs font-light font-inter text-muted-foreground mt-1">Across all jobs</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20 hover:border-primary/40 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-light font-inter uppercase tracking-wide text-muted-foreground">Total Rejected</p>
                  <p className="text-5xl font-light font-work text-foreground mt-2">{data?.totalRejected || 0}</p>
                  <p className="text-xs font-light font-inter text-muted-foreground mt-1">Across all jobs</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20 hover:border-primary/40 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-light font-inter uppercase tracking-wide text-muted-foreground">Total Submitted</p>
                  <p className="text-5xl font-light font-work text-foreground mt-2">{data?.totalSubmitted || 0}</p>
                  <p className="text-xs font-light font-inter text-muted-foreground mt-1">Across all jobs</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center">
                  <Star className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Score Distribution */}
        <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Score Distribution
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              CV Scores: {(data?.scoreDistribution.high || 0) + (data?.scoreDistribution.medium || 0) + (data?.scoreDistribution.low || 0)} total candidates
            </p>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
              {((data?.scoreDistribution.high || 0) + (data?.scoreDistribution.medium || 0) + (data?.scoreDistribution.low || 0)) > 0 ? (
                <div className="flex items-center justify-center h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scoreDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={130}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {scoreDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="ml-8 space-y-3">
                    {scoreDistributionData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between min-w-[140px]">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-foreground text-sm font-medium">{item.name}</span>
                        </div>
                        <span className="text-foreground font-bold text-lg">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                  No score data available
                </div>
              )}
            </Suspense>
          </CardContent>
        </Card>

        {/* Contact Status */}
        <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <PhoneCall className="w-5 h-5 mr-2" />
              Contact Status
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Total candidates tracked: {data?.totalCandidates || 0}
            </p>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              {contactStatusData.length > 0 ? (
                <div className="flex items-center justify-center h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contactStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={130}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {contactStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <ScrollArea className="ml-8 h-[380px]">
                    <div className="space-y-3 pr-4">
                      {contactStatusData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between min-w-[160px]">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-3" 
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-foreground text-sm font-medium">{item.name}</span>
                          </div>
                          <span className="text-foreground font-bold text-lg">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  No contact status data available
                </div>
              )}
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Candidates per Job */}
        <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Candidates per Job
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              {data?.candidatesPerJob && data.candidatesPerJob.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.candidatesPerJob}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="jobTitle" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 10, fill: '#93c5fd' }}
                  />
                  <YAxis tick={{ fill: '#93c5fd' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" name="Candidates" fill={COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No candidate data available for jobs
                </div>
              )}
            </Suspense>
          </CardContent>
        </Card>

        {/* Top Performing Jobs */}
        <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Top Performing Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              {data?.topPerformingJobs && data.topPerformingJobs.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.topPerformingJobs}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="jobTitle" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 10, fill: '#93c5fd' }}
                    />
                    <YAxis tick={{ fill: '#93c5fd' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="averageScore" name="Avg Score" fill="#10b981" />
                    <Bar dataKey="candidateCount" name="Candidates" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No job performance data available
                </div>
              )}
            </Suspense>
          </CardContent>
        </Card>

        {/* Average Scores by Job */}
        <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Average Scores by Job
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              {data?.averageScoresByJob && data.averageScoresByJob.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.averageScoresByJob}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="jobTitle" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 10, fill: '#93c5fd' }}
                  />
                  <YAxis tick={{ fill: '#93c5fd' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="averageScore" name="Average Score" fill={COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No score data available for jobs
                </div>
              )}
            </Suspense>
          </CardContent>
        </Card>

        {/* Average Salaries by Job */}
        <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Average Salaries by Job
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              {data?.averageSalariesByJob && data.averageSalariesByJob.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.averageSalariesByJob}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="jobTitle" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 10, fill: '#93c5fd' }}
                    />
                    <YAxis tick={{ fill: '#93c5fd' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="avgCurrent" name="Current Salary" fill="#3b82f6" />
                    <Bar dataKey="avgExpected" name="Expected Salary" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No salary data available for jobs
                </div>
              )}
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-400 text-sm font-medium">Call Success Rate</p>
            <p className="text-4xl font-bold text-foreground mt-2">{data?.callSuccessRate || 0}%</p>
            <p className="text-xs text-green-300 mt-1">Score +50</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20">
          <CardContent className="p-6 text-center">
            <Phone className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <p className="text-cyan-400 text-sm font-medium">Contact Rate</p>
            <p className="text-4xl font-bold text-foreground mt-2">{data?.contactRate || 0}%</p>
            <p className="text-xs text-cyan-300 mt-1">{data?.contactedCount || 0} of {data?.totalCandidates || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20">
          <CardContent className="p-6 text-center">
            <Clock className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <p className="text-purple-400 text-sm font-medium">Avg Candidates/Job</p>
            <p className="text-4xl font-bold text-foreground mt-2">{data?.avgCandidatesPerJob || 0}</p>
            <p className="text-xs text-purple-300 mt-1">Per job opening</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}