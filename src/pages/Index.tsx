import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { StatusDropdown } from '@/components/candidates/StatusDropdown';

import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Play,
  Pause,
  Search,
  FileText,
  Upload,
  Users,
  Briefcase,
  Clock,
  Star,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  ClipboardList,
  Video,
  Target,
  Zap,
  Activity,
  Timer,
  Phone
} from 'lucide-react';

import { MetricCardPro } from '@/components/dashboard/MetricCardPro';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { AuroraBackground } from '@/components/decor/AuroraBackground';
import { HeroHeader } from '@/components/dashboard/HeroHeader';
import { BentoKpis } from '@/components/dashboard/BentoKpis';


interface DashboardData {
  totalCandidates: number;
  totalJobs: number;
  candidatesAwaitingReview: number;
  tasksToday: number;
  interviewsThisWeek: number;
  averageTimeToHire: number;
  recentCandidates: any[];
  activeJobs: any[];
}

export default function Index() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('all');
  const [aiSearchActive, setAiSearchActive] = useState<Record<string, boolean>>({});
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [openTasksCount, setOpenTasksCount] = useState(0);
  const [jobStats, setJobStats] = useState<Record<string, any>>({});
  const [highScoreActiveCount, setHighScoreActiveCount] = useState(0);

  useEffect(() => {
    // SEO
    document.title = 'AI CRM Mission Control | Dashboard'
    const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    const content = 'Mission Control dashboard with live candidates, jobs, and KPIs.'
    if (meta) meta.setAttribute('content', content)
    else {
      const m = document.createElement('meta')
      m.name = 'description'
      m.content = content
      document.head.appendChild(m)
    }

    // Fetch initial data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch base tables separately (no relational selects since there are no FKs)
      const [cvsRes, jobsRes, linksRes] = await Promise.all([
        supabase.from('CVs').select('*'),
        supabase.from('Jobs').select('*'),
        supabase.from('Jobs_CVs').select('*'),
      ])

      if (cvsRes.error) throw cvsRes.error
      if (jobsRes.error) throw jobsRes.error
      if (linksRes.error) throw linksRes.error

      const cvs = cvsRes.data || []
      const jobsData = jobsRes.data || []
      const links = linksRes.data || []

      const activeJobs = jobsData.filter((job: any) => job.Processed === 'Yes')

      // Default Live Candidate Feed to the first active job
      if (activeJobs.length > 0) {
        setSelectedJobFilter((prev) => (prev === 'all' ? activeJobs[0]['Job ID'] : prev))
      }

      // Metrics
      const shortlistedCandidates = cvs.filter((c: any) => c.CandidateStatus === 'Shortlisted')
      const interviewCandidates = cvs.filter((c: any) => c.CandidateStatus === 'Interview')
      const taskedCandidates = cvs.filter((c: any) => c.CandidateStatus === 'Tasked')

      // High score candidates from Job-Candidate links
      const highScoreCandidates = links.filter((jc: any) => {
        const scoreNum = parseFloat(jc['Success Score'])
        return Number.isFinite(scoreNum) && scoreNum > 74
      })

      const recentCandidates = highScoreCandidates
        .sort(
          (a: any, b: any) => new Date(b['lastcalltime'] || 0).getTime() - new Date(a['lastcalltime'] || 0).getTime()
        )
        .slice(0, 10)

      setCandidates(recentCandidates)
      setJobs(jobsData)

      // Per-job stats (for Active Jobs Funnel)
      const stats: Record<string, any> = {}
      activeJobs.forEach((job: any) => {
        const jobId = job['Job ID']
        const jobLinks = links.filter((jc: any) => jc['Job ID'] === jobId)
        const cvsForJob = cvs.filter((cv: any) => jobLinks.some((jc: any) => jc['Candidate_ID'] === cv['Cadndidate_ID']))

        stats[jobId] = {
          longlist: jobLinks.filter((jc: any) => jc['Contacted'] && String(jc['Contacted']).trim() !== '').length,
          shortlist:
            jobLinks.filter((jc: any) => Boolean(jc.shortlisted_at)).length ||
            cvsForJob.filter((cv: any) => cv.CandidateStatus === 'Shortlisted').length,
          tasked: cvsForJob.filter((cv: any) => cv.CandidateStatus === 'Tasked').length,
          hired: cvsForJob.filter((cv: any) => cv.CandidateStatus === 'Hired').length,
        }
      })

      setJobStats(stats)

      // Candidates needing review: Score > 74 across active jobs only
      const activeJobIds = new Set(activeJobs.map((j: any) => j['Job ID']))
      const highScoreActiveCountVal = highScoreCandidates.filter((jc: any) => activeJobIds.has(jc['Job ID'])).length
      setHighScoreActiveCount(highScoreActiveCountVal)

      setData({
        totalCandidates: cvs.length,
        totalJobs: activeJobs.length,
        candidatesAwaitingReview: taskedCandidates.length,
        tasksToday: openTasksCount,
        interviewsThisWeek: interviewCandidates.length,
        averageTimeToHire: 14,
        recentCandidates,
        activeJobs,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  };
  const handleTaskCountChange = (count: number) => {
    setOpenTasksCount(count);
    // Update the dashboard data to reflect the new task count
    setData(prev => prev ? { ...prev, tasksToday: count } : null);
  };

  const handleCandidateClick = (candidateId: string, jobId: string) => {
    navigate(`/call-log-details?candidate=${candidateId}&job=${jobId}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 75) return 'text-purple-400';
    return 'text-muted-foreground';
  };

  const toggleAiSearch = (jobId: string) => {
    setAiSearchActive(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  const getCurrentTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Filter candidates based on selected job
  const filteredCandidates = selectedJobFilter === 'all' 
    ? candidates || []
    : candidates?.filter(c => c['Job ID'] === selectedJobFilter) || [];

  // Enrich candidates with job titles
  const enrichedCandidates = filteredCandidates.map(candidate => {
    const job = jobs.find(j => j['Job ID'] === candidate['Job ID']);
    return {
      ...candidate,
      'Job Title': job?.['Job Title'] || 'Unknown Position'
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Activity className="h-8 w-8 animate-spin text-cyan-400" />
          <span className="text-xl text-white">Loading Mission Control...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <AuroraBackground />
      
      <div className="mb-8 relative z-10">
        <div className="rounded-2xl border border-border/50 bg-gradient-card backdrop-blur-xl p-6 shadow-card animate-fade-in">
          <HeroHeader
            title="Mission Control"
            subtitle={`Welcome back, ${profile?.first_name || 'Commander'}. Your day at a glance.`}
            actions={
              <Button variant="outline" size="sm" className="font-medium">
                <TrendingUp className="h-4 w-4 mr-2" /> View Reports
              </Button>
            }
          />

          <BentoKpis>
            <MetricCardPro
              title="Active Jobs"
              value={data?.totalJobs ?? 0}
              delta="+3 this week"
              icon={Briefcase}
              accent="primary"
              trend={[3,5,4,6,7,8,7,9]}
            />
            <MetricCardPro
              title="Awaiting Review"
              value={data?.candidatesAwaitingReview ?? 0}
              delta="-12%"
              icon={ClipboardList}
              accent="purple"
              trend={[12,10,11,9,8,7,8,6]}
            />
            <MetricCardPro
              title="Interviews"
              value={data?.interviewsThisWeek ?? 0}
              delta="+8%"
              icon={Video}
              accent="cyan"
              trend={[2,3,3,4,5,6,6,7]}
            />
            <MetricCardPro
              title="Tasks Today"
              value={data?.tasksToday ?? 0}
              delta={data?.tasksToday ? `${data.tasksToday > 0 ? '+' : ''}${data.tasksToday}%` : undefined}
              icon={Target}
              accent="emerald"
              trend={[1,2,1,3,2,4,3,5]}
            />
          </BentoKpis>
        </div>
      </div>

      <div className="flex gap-6 relative z-10">
        {/* Left Side - Job Control Panels - 30% width */}
        <div className="w-[30%] space-y-4">
          <h2 className="text-lg font-bold text-cyan-300 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Active Jobs Funnel
          </h2>
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {data?.activeJobs?.map((job) => (
                <Card key={job['Job ID']} className="bg-gradient-to-br from-white/5 via-white/3 to-white/5 backdrop-blur-lg border-white/20 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm truncate">{job['Job Title']}</h3>
                      <Button
                        size="sm"
                        variant={aiSearchActive[job['Job ID']] ? "default" : "outline"}
                        onClick={() => toggleAiSearch(job['Job ID'])}
                        className={`h-6 px-2 ${aiSearchActive[job['Job ID']] 
                          ? 'bg-cyan-500 hover:bg-cyan-600 animate-pulse' 
                          : 'border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10'}`}
                      >
                        <Zap className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{job['Job Location']}</p>
                    <div className="grid grid-cols-4 gap-1 text-xs">
                      <div className="text-center">
                        <div className="text-cyan-300 font-bold">{jobStats[job['Job ID']]?.longlist || 0}</div>
                        <div className="text-gray-500">Longlist</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-300 font-bold">{jobStats[job['Job ID']]?.shortlist || 0}</div>
                        <div className="text-gray-500">Shortlist</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-300 font-bold">{jobStats[job['Job ID']]?.tasked || 0}</div>
                        <div className="text-gray-500">Tasked</div>
                      </div>
                      <div className="text-center">
                        <div className="text-emerald-300 font-bold">{jobStats[job['Job ID']]?.hired || 0}</div>
                        <div className="text-gray-500">Hired</div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/job/${job['Job ID']}`)}
                      className="w-full mt-2 text-xs text-cyan-400 hover:bg-cyan-400/10"
                    >
                      Open Job
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Side - Live Candidate Feed & Action Center - 60% width */}
        <div className="w-[60%] space-y-6">
          {/* Live Candidate Feed */}
          <Card className="bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-lg border-cyan-400/30 shadow-2xl shadow-cyan-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-cyan-300 flex items-center">
                  <Activity className="h-5 w-5 mr-2 animate-pulse text-cyan-400" />
                  Live Candidate Feed
                  <Badge className="ml-3 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 text-emerald-300 border-emerald-400/40 animate-pulse">
                    LIVE
                  </Badge>
                </CardTitle>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-300 font-medium">Active</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border border-cyan-400/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => window.location.href = '/live-feed'}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Open Live Feed
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {enrichedCandidates.slice(0, 5).map((candidate, index) => {
                    const score = parseFloat(candidate['Success Score']) || 0;
                    const jobTitle = candidate['Job Title'] || 'Unknown Position';
                    
                    return (
                      <div 
                        key={index} 
                        className={`bg-gradient-to-r rounded-xl p-4 border ${index < 3 ? 'from-amber-400/20 to-yellow-500/20 border-yellow-400/40' : 'from-white/5 to-white/10 border-white/20'} hover:border-cyan-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 group cursor-pointer`}
                        onClick={() => handleCandidateClick(candidate["Candidate_ID"], candidate["Job ID"])}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {candidate['Candidate Name']?.charAt(0) || 'C'}
                              </div>
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-white text-lg group-hover:text-cyan-300 transition-colors">{candidate['Candidate Name']}</h4>
                              <p className="text-sm text-purple-300 font-medium">{jobTitle}</p>
                              <Badge variant="outline" className="mt-1 text-xs border-cyan-400/50 text-cyan-400 bg-cyan-400/10">
                                ID: {candidate['Job ID']}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold mb-2 ${getScoreColor(score)}`}>
                              {score}
                            </div>
                            <div className="flex flex-col space-y-1">
                              <StatusDropdown
                                currentStatus={candidate['Contacted']}
                                candidateId={candidate["Candidate_ID"]}
                                jobId={candidate["Job ID"]}
                                statusType="contacted"
                                onStatusChange={(newStatus) => {
                                  setCandidates(prev => prev.map(c => 
                                    c["Candidate_ID"] === candidate["Candidate_ID"] 
                                      ? { ...c, Contacted: newStatus }
                                      : c
                                  ))
                                }}
                                variant="badge"
                              />
                              <StatusDropdown
                                currentStatus={candidate['CandidateStatus']}
                                candidateId={candidate["Candidate_ID"]}
                                statusType="candidate"
                                onStatusChange={(newStatus) => {
                                  setCandidates(prev => prev.map(c => 
                                    c["Candidate_ID"] === candidate["Candidate_ID"] 
                                      ? { ...c, CandidateStatus: newStatus }
                                      : c
                                  ))
                                }}
                                variant="badge"
                              />
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 mb-4 leading-relaxed bg-black/20 p-3 rounded-lg">
                          {candidate['Score and Reason']?.slice(0, 120)}...
                        </p>
                        <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                            <StatusDropdown
                              currentStatus={candidate['Contacted']}
                              candidateId={candidate["Candidate_ID"]}
                              jobId={candidate["Job ID"]}
                              statusType="contacted"
                              onStatusChange={(newStatus) => {
                                setCandidates(prev => prev.map(c => 
                                  c["Candidate_ID"] === candidate["Candidate_ID"] 
                                    ? { ...c, Contacted: newStatus }
                                    : c
                                ))
                              }}
                            />
                            <StatusDropdown
                              currentStatus={candidate['CandidateStatus']}
                              candidateId={candidate["Candidate_ID"]}
                              statusType="candidate"
                              onStatusChange={(newStatus) => {
                                setCandidates(prev => prev.map(c => 
                                  c["Candidate_ID"] === candidate["Candidate_ID"] 
                                    ? { ...c, CandidateStatus: newStatus }
                                    : c
                                ))
                              }}
                            />
                          </div>
                          {score >= 74 && (
                            <Badge className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 border-emerald-400/40 animate-pulse">
                              ⭐ Priority
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {enrichedCandidates.length > 5 && (
                    <div className="text-center pt-4">
                      <Button 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border border-purple-400/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        onClick={() => window.location.href = '/live-feed'}
                      >
                        View All {enrichedCandidates.length} Candidates
                        <Activity className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Action Center */}
          <Card className="bg-gradient-to-br from-white/5 via-white/3 to-white/5 backdrop-blur-lg border-white/20 shadow-xl shadow-purple-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-purple-300">My Next Moves</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-400/30">
                  <h4 className="font-semibold text-purple-300 mb-2">Candidates Needing Review</h4>
                  <div className="text-2xl font-bold text-purple-400">{highScoreActiveCount || 0}</div>
                  <p className="text-sm text-purple-200">Score &gt; 74</p>
                </div>
                <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-400/30">
                  <h4 className="font-semibold text-cyan-300 mb-2">Upcoming Interviews</h4>
                  <div className="text-2xl font-bold text-cyan-400">{data?.interviewsThisWeek || 0}</div>
                  <p className="text-sm text-cyan-200">This week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}