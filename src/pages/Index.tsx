import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Phone,
  Calendar,
  Activity,
  Target,
  Users,
  Briefcase,
  TrendingUp,
  CheckCircle,
  Clock,
  Star,
  BarChart3,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Tooltip,
  Legend
} from "recharts"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

interface DashboardData {
  totalCandidates: number
  totalJobs: number
  totalCallLogs: number
  contactedCandidates: number
  averageScore: number
  scoreDistribution: { name: string; value: number; color: string }[]
  contactedDistribution: { name: string; value: number; color: string }[]
  topPerformingJobs: { jobTitle: string; candidateCount: number; avgScore: number }[]
  recentActivity: any[]
  callSuccessRate: number
  candidatesPerJob: { jobTitle: string; count: number }[]
  scoresByJob: { jobTitle: string; avgScore: number }[]
}

const Index = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalCandidates: 0,
    totalJobs: 0,
    totalCallLogs: 0,
    contactedCandidates: 0,
    averageScore: 0,
    scoreDistribution: [],
    contactedDistribution: [],
    topPerformingJobs: [],
    recentActivity: [],
    callSuccessRate: 0,
    candidatesPerJob: [],
    scoresByJob: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [candidatesResult, jobsResult, callLogsResult] = await Promise.all([
        supabase.from('CVs').select('*'),
        supabase.from('Jobs').select('*'),
        supabase.from('Jobs_CVs').select('*')
      ])

      const candidates = candidatesResult.data || []
      const jobs = jobsResult.data || []
      const callLogs = callLogsResult.data || []

      // Calculate metrics
      const totalCandidates = candidates.length
      const totalJobs = jobs.length
      const totalCallLogs = callLogs.length

      // Contacted candidates
      const contactedCandidates = callLogs.filter(log => 
        log.Contacted && log.Contacted !== 'Not contacted' && log.Contacted !== ''
      ).length

      // Average score calculation
      const scoresArray = callLogs
        .filter(log => log['Success Score'] && !isNaN(parseInt(log['Success Score'])))
        .map(log => parseInt(log['Success Score']))
      const averageScore = scoresArray.length > 0 
        ? Math.round(scoresArray.reduce((sum, score) => sum + score, 0) / scoresArray.length)
        : 0

      // Score distribution
      const highScores = scoresArray.filter(score => score >= 75).length
      const mediumScores = scoresArray.filter(score => score >= 50 && score < 75).length
      const lowScores = scoresArray.filter(score => score >= 1 && score < 50).length
      
      const scoreDistribution = [
        { name: '+75 (High)', value: highScores, color: '#22c55e' },
        { name: '50-74 (Medium)', value: mediumScores, color: '#3b82f6' },
        { name: '1-49 (Low)', value: lowScores, color: '#ef4444' }
      ]

      // Contacted distribution
      const readyToContact = callLogs.filter(log => log.Contacted === 'Ready to Contact').length
      const contacted = callLogs.filter(log => log.Contacted === 'Contacted').length
      const callDone = callLogs.filter(log => log.Contacted === 'Call Done').length
      const notContacted = callLogs.filter(log => !log.Contacted || log.Contacted === 'Not contacted' || log.Contacted === '').length

      const contactedDistribution = [
        { name: 'Call Done', value: callDone, color: '#22c55e' },
        { name: 'Contacted', value: contacted, color: '#3b82f6' },
        { name: 'Ready to Contact', value: readyToContact, color: '#f59e0b' },
        { name: 'Not Contacted', value: notContacted, color: '#ef4444' }
      ]

      // Top performing jobs
      const jobPerformance = jobs.map(job => {
        const jobCallLogs = callLogs.filter(log => log['Job ID'] === job['Job ID'])
        const jobScores = jobCallLogs
          .filter(log => log['Success Score'] && !isNaN(parseInt(log['Success Score'])))
          .map(log => parseInt(log['Success Score']))
        
        return {
          jobTitle: job['Job Title'] || `Job ${job['Job ID']}`,
          candidateCount: jobCallLogs.length,
          avgScore: jobScores.length > 0 
            ? Math.round(jobScores.reduce((sum, score) => sum + score, 0) / jobScores.length)
            : 0
        }
      }).filter(job => job.candidateCount > 0)
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, 5)

      // Call success rate (calls with good scores vs total calls)
      const successfulCalls = scoresArray.filter(score => score >= 50).length
      const callSuccessRate = scoresArray.length > 0 
        ? Math.round((successfulCalls / scoresArray.length) * 100)
        : 0

      // Candidates per job for chart
      const candidatesPerJob = jobs.map(job => ({
        jobTitle: (job['Job Title'] || `Job ${job['Job ID']}`).substring(0, 20),
        count: callLogs.filter(log => log['Job ID'] === job['Job ID']).length
      })).filter(item => item.count > 0).slice(0, 8)

      // Scores by job for chart
      const scoresByJob = jobs.map(job => {
        const jobCallLogs = callLogs.filter(log => log['Job ID'] === job['Job ID'])
        const jobScores = jobCallLogs
          .filter(log => log['Success Score'] && !isNaN(parseInt(log['Success Score'])))
          .map(log => parseInt(log['Success Score']))
        
        return {
          jobTitle: (job['Job Title'] || `Job ${job['Job ID']}`).substring(0, 20),
          avgScore: jobScores.length > 0 
            ? Math.round(jobScores.reduce((sum, score) => sum + score, 0) / jobScores.length)
            : 0
        }
      }).filter(item => item.avgScore > 0).slice(0, 6)

      setDashboardData({
        totalCandidates,
        totalJobs,
        totalCallLogs,
        contactedCandidates,
        averageScore,
        scoreDistribution,
        contactedDistribution,
        topPerformingJobs: jobPerformance,
        recentActivity: callLogs.slice(0, 5), // Recent 5 activities
        callSuccessRate,
        candidatesPerJob,
        scoresByJob
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted/30 rounded w-24"></div>
                  <div className="h-8 bg-muted/30 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Top Row - Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Candidates */}
        <Card className="glass-card metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Candidates</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-foreground">{dashboardData.totalCandidates}</span>
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Candidates in pipeline</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Jobs */}
        <Card className="glass-card metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-foreground">{dashboardData.totalJobs}</span>
                  <Badge variant="outline" className="text-xs">Open</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Job openings</p>
              </div>
              <div className="w-12 h-12 bg-accent-blue/10 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-accent-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Call Logs */}
        <Card className="glass-card metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Call Logs</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-foreground">{dashboardData.totalCallLogs}</span>
                  <Badge variant="default" className="text-xs">{dashboardData.contactedCandidates} Contacted</Badge>
                </div>
                <p className="text-xs text-muted-foreground">All recruitment calls</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Score */}
        <Card className="glass-card metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-foreground">{dashboardData.averageScore}</span>
                  <span className="text-lg text-muted-foreground">/100</span>
                </div>
                <Progress value={dashboardData.averageScore} className="h-2" />
              </div>
              <div className="w-12 h-12 bg-accent-orange/10 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-accent-orange" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Score Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.scoreDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {dashboardData.scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-3 mt-4">
              {dashboardData.scoreDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Status Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Contact Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.contactedDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {dashboardData.contactedDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-3 mt-4">
              {dashboardData.contactedDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Third Row - Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Candidates per Job */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Candidates per Job
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.candidatesPerJob}>
                  <XAxis 
                    dataKey="jobTitle" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Jobs */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Performing Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.topPerformingJobs.slice(0, 5).map((job, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{job.jobTitle}</p>
                      <p className="text-xs text-muted-foreground">{job.candidateCount} candidates</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={job.avgScore >= 75 ? "default" : job.avgScore >= 50 ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {job.avgScore}/100
                    </Badge>
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  </div>
                </div>
              ))}
              {dashboardData.topPerformingJobs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No performance data available yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fourth Row - Average Scores by Job */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5" />
            Average Scores by Job
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.scoresByJob}>
                <XAxis 
                  dataKey="jobTitle" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  formatter={(value) => [`${value}/100`, 'Average Score']}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="avgScore" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Fifth Row - Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Call Success Rate</p>
                <p className="text-2xl font-bold text-foreground">{dashboardData.callSuccessRate}%</p>
                <p className="text-xs text-muted-foreground">Scores ≥50</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {dashboardData.totalCallLogs > 0 
                    ? Math.round((dashboardData.contactedCandidates / dashboardData.totalCallLogs) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.contactedCandidates} of {dashboardData.totalCallLogs}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-accent-orange/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent-orange" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Candidates/Job</p>
                <p className="text-2xl font-bold text-foreground">
                  {dashboardData.totalJobs > 0 
                    ? Math.round(dashboardData.totalCallLogs / dashboardData.totalJobs)
                    : 0}
                </p>
                <p className="text-xs text-muted-foreground">Per job opening</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Index
