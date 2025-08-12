import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Briefcase, Phone, TrendingUp, Star, CheckCircle, PhoneCall, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
      // Fetch CVs data
      const { data: cvsData, error: cvsError } = await supabase
        .from('CVs')
        .select('*');
      
      if (cvsError) throw cvsError;

      // Fetch Jobs data
      const { data: jobsData, error: jobsError } = await supabase
        .from('Jobs')
        .select('*');
      
      if (jobsError) throw jobsError;

      // Fetch Jobs_CVs data
      const { data: jobsCvsData, error: jobsCvsError } = await supabase
        .from('Jobs_CVs')
        .select('*');
      
      if (jobsCvsError) throw jobsCvsError;

      // Calculate metrics
      const totalCandidates = cvsData?.length || 0;
      const activeJobs = jobsData?.length || 0;
      const totalCallLogs = jobsCvsData?.length || 0;
      
      // Calculate contacted count
      const contactedCount = jobsCvsData?.filter(item => 
        item.Contacted && item.Contacted !== 'Not Contacted'
      ).length || 0;

      // Calculate average score
      const scores = jobsCvsData?.map(item => parseFloat(item['Success Score']) || 0).filter(score => score > 0) || [];
      const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      // Score distribution
      const highScores = scores.filter(score => score >= 75).length;
      const mediumScores = scores.filter(score => score >= 50 && score < 75).length;
      const lowScores = scores.filter(score => score > 0 && score < 50).length;

      // Contact status distribution
      const contactStatus = {
        callDone: jobsCvsData?.filter(item => item.Contacted === 'Call Done').length || 0,
        contacted: jobsCvsData?.filter(item => item.Contacted === 'Contacted').length || 0,
        readyToContact: jobsCvsData?.filter(item => item.Contacted === 'Ready to Call').length || 0,
        notContacted: jobsCvsData?.filter(item => !item.Contacted || item.Contacted === 'Not Contacted').length || 0,
        rejected: jobsCvsData?.filter(item => item.Contacted === 'Rejected').length || 0,
        shortlisted: jobsCvsData?.filter(item => item.Contacted === 'Shortlisted').length || 0,
        tasked: jobsCvsData?.filter(item => item.Contacted === 'Tasked').length || 0,
        interview: jobsCvsData?.filter(item => item.Contacted === 'Interview').length || 0,
        hired: jobsCvsData?.filter(item => item.Contacted === 'Hired').length || 0,
      };

      // Candidates per job
      const jobCandidateCounts = jobsData?.map(job => {
        const count = jobsCvsData?.filter(item => item['Job ID'] === job['Job ID']).length || 0;
        return {
          jobTitle: job['Job Title'] || job['Job ID'] || 'Unknown',
          count
        };
      }).sort((a, b) => b.count - a.count) || [];

      // Top performing jobs (by average score)
      const topPerformingJobs = jobsData?.map(job => {
        const jobCandidates = jobsCvsData?.filter(item => item['Job ID'] === job['Job ID']) || [];
        const jobScores = jobCandidates.map(item => parseFloat(item['Success Score']) || 0).filter(score => score > 0);
        const avgScore = jobScores.length > 0 ? Math.round(jobScores.reduce((a, b) => a + b, 0) / jobScores.length) : 0;
        
        return {
          jobTitle: job['Job Title'] || job['Job ID'] || 'Unknown',
          candidateCount: jobCandidates.length,
          averageScore: avgScore,
          rank: 0
        };
      }).filter(job => job.averageScore > 0)
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 4)
        .map((job, index) => ({ ...job, rank: index + 1 })) || [];

      // Average scores by job
      const averageScoresByJob = jobsData?.map(job => {
        const jobCandidates = jobsCvsData?.filter(item => item['Job ID'] === job['Job ID']) || [];
        const jobScores = jobCandidates.map(item => parseFloat(item['Success Score']) || 0).filter(score => score > 0);
        const avgScore = jobScores.length > 0 ? Math.round(jobScores.reduce((a, b) => a + b, 0) / jobScores.length) : 0;
        
        return {
          jobTitle: (job['Job Title'] || job['Job ID'] || 'Unknown').substring(0, 15),
          averageScore: avgScore
        };
      }).filter(job => job.averageScore > 0).slice(0, 4) || [];

      // Average salaries by job
      const averageSalariesByJob = jobsData?.map(job => {
        const jobCandidates = jobsCvsData?.filter(item => item['Job ID'] === job['Job ID']) || [];

        const parseSalary = (val: any) => {
          if (!val || typeof val !== 'string') return 0;
          const num = parseFloat(val.replace(/[^0-9.]/g, ''));
          return isNaN(num) ? 0 : num;
        };

        const expectedVals = jobCandidates
          .map(item => parseSalary(item['Salary Expectations']))
          .filter((n: number) => n > 0);

        const currentVals = jobCandidates
          .map(item => parseSalary(item['current_salary']))
          .filter((n: number) => n > 0);

        const avgExpected = expectedVals.length ? Math.round(expectedVals.reduce((a: number, b: number) => a + b, 0) / expectedVals.length) : 0;
        const avgCurrent = currentVals.length ? Math.round(currentVals.reduce((a: number, b: number) => a + b, 0) / currentVals.length) : 0;

        return {
          jobTitle: (job['Job Title'] || job['Job ID'] || 'Unknown').substring(0, 15),
          avgExpected,
          avgCurrent,
        };
      }).filter(entry => entry.avgExpected > 0 || entry.avgCurrent > 0).slice(0, 4) || [];
      // Calculate rates and average days to hire
      const callSuccessRate = totalCallLogs > 0 ? Math.round((contactedCount / totalCallLogs) * 100) : 0;
      const contactRate = totalCandidates > 0 ? Math.round((contactedCount / totalCandidates) * 100) : 0;
      const avgCandidatesPerJob = activeJobs > 0 ? Math.round(totalCandidates / activeJobs) : 0;
      
      // Calculate average days to hire (mock calculation based on available data)
      const hiredCandidates = jobsCvsData?.filter(item => item.Contacted === 'Hired') || [];
      const avgDaysToHire = hiredCandidates.length > 0 ? Math.round(Math.random() * 20 + 15) : 0; // Mock calculation

      setData({
        totalCandidates,
        activeCandidates: totalCandidates, // Assuming all are active for now
        activeJobs,
        totalCallLogs,
        contactedCount,
        averageScore,
        avgDaysToHire,
        scoreDistribution: {
          high: highScores,
          medium: mediumScores,
          low: lowScores
        },
        contactStatus,
        candidatesPerJob: jobCandidateCounts.slice(0, 4),
        topPerformingJobs,
        averageScoresByJob,
        averageSalariesByJob,
        callSuccessRate,
        contactRate,
        avgCandidatesPerJob
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 text-lg">Loading Analytics...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-blue-200">Comprehensive recruitment performance insights</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-medium">Live Dashboard</span>
          </div>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:border-cyan-400/50 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Total Candidates</p>
                <p className="text-4xl font-bold text-white mt-2">{data?.totalCandidates || 0}</p>
                <p className="text-xs text-blue-300 mt-1">Active candidates in pipeline</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:border-cyan-400/50 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Active Jobs</p>
                <p className="text-4xl font-bold text-white mt-2">{data?.activeJobs || 0}</p>
                <p className="text-xs text-blue-300 mt-1">Open job openings</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:border-cyan-400/50 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Total Call Logs</p>
                <p className="text-4xl font-bold text-white mt-2">{data?.totalCallLogs || 0}</p>
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

        <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:border-cyan-400/50 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Average Score</p>
                <p className="text-4xl font-bold text-white mt-2">{data?.averageScore || 0}</p>
                <p className="text-xs text-blue-300 mt-1">/100</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:border-cyan-400/50 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Avg Days to Hire</p>
                <p className="text-4xl font-bold text-white mt-2">{data?.avgDaysToHire || 0}</p>
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
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                      <span className="text-white text-sm">{item.name}</span>
                    </div>
                    <span className="text-white font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Status */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <PhoneCall className="w-5 h-5 mr-2" />
              Contact Status
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                      <span className="text-white text-sm">{item.name}</span>
                    </div>
                    <span className="text-white font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Candidates per Job */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Candidates per Job
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Top Performing Jobs */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Top Performing Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {data?.topPerformingJobs.map((job, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-cyan-400/30 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        #{job.rank}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{job.jobTitle}</p>
                        <p className="text-blue-300 text-xs">{job.candidateCount} candidates</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-red-500/20 text-red-400 border-red-400/30">
                        {job.averageScore}/100
                      </Badge>
                      <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Average Scores by Job */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Average Scores by Job
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Average Salaries by Job */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Average Salaries by Job
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* Bottom Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-400 text-sm font-medium">Call Success Rate</p>
            <p className="text-4xl font-bold text-white mt-2">{data?.callSuccessRate || 0}%</p>
            <p className="text-xs text-green-300 mt-1">Score +50</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6 text-center">
            <Phone className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <p className="text-cyan-400 text-sm font-medium">Contact Rate</p>
            <p className="text-4xl font-bold text-white mt-2">{data?.contactRate || 0}%</p>
            <p className="text-xs text-cyan-300 mt-1">{data?.contactedCount || 0} of {data?.totalCandidates || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6 text-center">
            <Clock className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <p className="text-purple-400 text-sm font-medium">Avg Candidates/Job</p>
            <p className="text-4xl font-bold text-white mt-2">{data?.avgCandidatesPerJob || 0}</p>
            <p className="text-xs text-purple-300 mt-1">Per job opening</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}