// @ts-nocheck
import { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from '@/integrations/supabase/client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Briefcase, Phone, TrendingUp, Star, CheckCircle, PhoneCall, Clock } from 'lucide-react';

// Lazy load chart components
const PieChart = lazy(() => import('recharts').then(mod => ({ default: mod.PieChart })));
const Pie = lazy(() => import('recharts').then(mod => ({ default: mod.Pie })));
const Cell = lazy(() => import('recharts').then(mod => ({ default: mod.Cell })));
const BarChart = lazy(() => import('recharts').then(mod => ({ default: mod.BarChart })));
const Bar = lazy(() => import('recharts').then(mod => ({ default: mod.Bar })));
const XAxis = lazy(() => import('recharts').then(mod => ({ default: mod.XAxis })));
const YAxis = lazy(() => import('recharts').then(mod => ({ default: mod.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })));
const Tooltip = lazy(() => import('recharts').then(mod => ({ default: mod.Tooltip })));
const ResponsiveContainer = lazy(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })));

interface AnalyticsData {
  totalCandidates: number;
  activeCandidates: number;
  activeJobs: number;
  totalCallLogs: number;
  contactedCount: number;
  averageScore: number;
  avgDaysToHire: number;
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
      
      // Fetch all candidates
      const { data: candidates, error: candidatesError } = await supabase
        .from('Jobs_CVs')
        .select('*');

      if (candidatesError) {
        console.error('Error fetching candidates:', candidatesError);
        throw candidatesError;
      }

      console.log('Candidates fetched:', candidates?.length || 0);

      // Fetch all jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('Jobs')
        .select('job_id, job_title, Processed');

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        throw jobsError;
      }

      console.log('Jobs fetched:', jobs?.length || 0);

      const totalCandidates = candidates?.length || 0;
      const activeJobs = jobs?.filter(j => j.Processed === 'Yes').length || 0;

      console.log('Total candidates:', totalCandidates);
      console.log('Active jobs:', activeJobs);

      // Calculate contact status counts
      const contactStatus = {
        callDone: candidates?.filter(c => c.contacted === 'Call Done').length || 0,
        contacted: candidates?.filter(c => c.contacted === 'Contacted').length || 0,
        readyToContact: candidates?.filter(c => c.contacted === 'Ready to Contact').length || 0,
        notContacted: candidates?.filter(c => !c.contacted || c.contacted === 'Not Contacted').length || 0,
        rejected: candidates?.filter(c => c.contacted === 'Rejected').length || 0,
        shortlisted: candidates?.filter(c => c.contacted === 'Shortlisted').length || 0,
        tasked: candidates?.filter(c => c.contacted === 'Tasked').length || 0,
        interview: candidates?.filter(c => c.contacted === 'Interview').length || 0,
        hired: candidates?.filter(c => c.contacted === 'Hired').length || 0,
      };

      const totalCallLogs = candidates?.filter(c => c.callcount && c.callcount > 0).length || 0;
      const contactedCount = contactStatus.callDone + contactStatus.contacted;

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
          jobTitle: job.job_title || 'Unknown',
          averageScore: avgScore
        };
      }).filter(j => j.averageScore > 0) || [];

      // Top performing jobs
      const topPerformingJobs = averageScoresByJob
        .map((job, index) => ({
          ...job,
          candidateCount: candidates?.filter(c => c.job_id === jobs?.find(j => j.job_title === job.jobTitle)?.job_id).length || 0,
          rank: index + 1
        }))
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 5);

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

      const analyticsData = {
        totalCandidates,
        activeCandidates: totalCandidates,
        activeJobs,
        totalCallLogs,
        contactedCount,
        averageScore,
        avgDaysToHire: 0,
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
        totalCallLogs: 0,
        contactedCount: 0,
        averageScore: 0,
        avgDaysToHire: 0,
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
  ];

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive recruitment performance insights</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-medium">Live Dashboard</span>
          </div>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20 hover:border-primary/40 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Total Candidates</p>
                <p className="text-4xl font-bold text-foreground mt-2">{data?.totalCandidates || 0}</p>
                <p className="text-xs text-blue-300 mt-1">Active candidates in pipeline</p>
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
                <p className="text-xs text-cyan-300 mt-1">
                  <Badge className="bg-cyan-400/20 text-cyan-400 border-cyan-400/30">
                    {data?.contactedCount || 0} Contacted
                  </Badge>
                </p>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Score Distribution */}
        <Card className="bg-card border-border dark:bg-white/10 dark:border-white/20">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              <div className="flex items-center justify-center h-[300px]">
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                  <Pie
                    data={scoreDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {scoreDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="ml-8 space-y-3">
                {scoreDistributionData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between min-w-[120px]">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-foreground text-sm">{item.name}</span>
                    </div>
                    <span className="text-foreground font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
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
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              <div className="flex items-center justify-center h-[300px]">
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                  <Pie
                    data={contactStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {contactStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="ml-8 space-y-3">
                {contactStatusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between min-w-[140px]">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-foreground text-sm">{item.name}</span>
                    </div>
                    <span className="text-foreground font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.candidatesPerJob}>
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
                <Bar dataKey="count" fill={COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.topPerformingJobs}>
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.averageScoresByJob}>
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
                <Bar dataKey="averageScore" fill={COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.averageSalariesByJob}>
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
                  <Bar dataKey="avgCurrent" name="Avg Current" fill="#3b82f6" />
                  <Bar dataKey="avgExpected" name="Avg Expected" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
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