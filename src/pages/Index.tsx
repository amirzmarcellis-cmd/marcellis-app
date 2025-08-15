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
import { Plus, Play, Pause, Search, FileText, Upload, Users, Briefcase, Clock, Star, TrendingUp, Calendar, CheckCircle, XCircle, ClipboardList, Video, Target, Activity, Timer, Phone } from 'lucide-react';
import { MetricCardPro } from '@/components/dashboard/MetricCardPro';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { HeroHeader } from '@/components/dashboard/HeroHeader';
import { BentoKpis } from '@/components/dashboard/BentoKpis';
import { TiltCard } from '@/components/effects/TiltCard';
import { ActivityTicker } from '@/components/dashboard/ActivityTicker';
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
  const {
    profile
  } = useProfile();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('all');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [cvData, setCvData] = useState<any[]>([]);
  const [openTasksCount, setOpenTasksCount] = useState(0);
  const [jobStats, setJobStats] = useState<Record<string, any>>({});
  const [highScoreActiveCount, setHighScoreActiveCount] = useState(0);
  useEffect(() => {
    // SEO
    document.title = 'AI CRM Mission Control | Dashboard';
    const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const content = 'Mission Control dashboard with live candidates, jobs, and KPIs.';
    if (meta) meta.setAttribute('content', content);else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = content;
      document.head.appendChild(m);
    }

    // Fetch initial data
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
      // Fetch base tables separately (no relational selects since there are no FKs)
      const [cvsRes, jobsRes, linksRes] = await Promise.all([supabase.from('CVs').select('*'), supabase.from('Jobs').select('*'), supabase.from('Jobs_CVs').select('*')]);
      if (cvsRes.error) throw cvsRes.error;
      if (jobsRes.error) throw jobsRes.error;
      if (linksRes.error) throw linksRes.error;
      const cvs = cvsRes.data || [];
      const jobsData = jobsRes.data || [];
      const links = linksRes.data || [];
      const activeJobs = jobsData.filter((job: any) => job.Processed === 'Yes');
      const activeJobIds = new Set(activeJobs.map((j: any) => j.job_id));

      // Keep 'all' to show candidates across all jobs by default

      // Metrics
      const shortlistedCandidates = cvs.filter((c: any) => c.CandidateStatus === 'Shortlisted');
      const interviewCandidates = cvs.filter((c: any) => c.CandidateStatus === 'Interview');
      const taskedCandidates = cvs.filter((c: any) => c.CandidateStatus === 'Tasked');

      // Show only shortlisted candidates from ACTIVE jobs, sorted by highest score
      const shortlistedCandidateIds = new Set(cvs.filter(c => c.CandidateStatus === 'Shortlisted').map(c => c.candidate_id));
      const shortlistedActiveCandidates = links.filter((jc: any) => {
        return shortlistedCandidateIds.has(jc.Candidate_ID) && activeJobIds.has(jc.job_id);
      });
      const recentCandidates = shortlistedActiveCandidates.sort((a: any, b: any) => {
        const scoreA = parseFloat(a.success_score) || 0;
        const scoreB = parseFloat(b.success_score) || 0;
        return scoreB - scoreA; // Highest score first
      }).slice(0, 10);
      setCandidates(recentCandidates);
      setJobs(jobsData);
      setCvData(cvs);

      // Per-job stats (for Active Jobs Funnel)
      const stats: Record<string, any> = {};
      activeJobs.forEach((job: any) => {
        const jobId = job.job_id;
        const jobLinks = links.filter((jc: any) => jc.job_id === jobId);
        const cvsForJob = cvs.filter((cv: any) => jobLinks.some((jc: any) => jc.Candidate_ID === cv.candidate_id));
        stats[jobId] = {
          longlist: jobLinks.length,
          contacted: jobLinks.filter((jc: any) => jc.contacted && ['Contacted', 'Call Done', '1st No Answer', '2nd No Answer', '3rd No Answer'].includes(jc.contacted)).length,
          lowScored: jobLinks.filter((jc: any) => jc.contacted === 'Low Scored').length,
          shortlist: jobLinks.filter((jc: any) => jc.shortlisted_at !== null).length,
          tasked: jobLinks.filter((jc: any) => jc.contacted === 'Tasked').length,
          hired: cvsForJob.filter((cv: any) => cv.CandidateStatus === 'Hired').length
        };
      });
      setJobStats(stats);

      // Candidates needing review: Shortlisted candidates count
      const highScoreActiveCountVal = shortlistedActiveCandidates.length;
      setHighScoreActiveCount(highScoreActiveCountVal);
      setData({
        totalCandidates: cvs.length,
        totalJobs: activeJobs.length,
        candidatesAwaitingReview: taskedCandidates.length,
        tasksToday: openTasksCount,
        interviewsThisWeek: interviewCandidates.length,
        averageTimeToHire: 14,
        recentCandidates,
        activeJobs
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleTaskCountChange = (count: number) => {
    setOpenTasksCount(count);
    // Update the dashboard data to reflect the new task count
    setData(prev => prev ? {
      ...prev,
      tasksToday: count
    } : null);
  };
  const handleCandidateClick = (candidateId: string, jobId: string, callid?: number) => {
    navigate(`/call-log-details?candidate=${candidateId}&job=${jobId}&callid=${callid || ''}`);
  };
  const handleRejectCandidate = async (candidateId: string, jobId: string) => {
    // Show confirmation alert
    const confirmed = window.confirm('Are you sure you want to Reject Candidate?');
    if (!confirmed) {
      return; // User cancelled, don't proceed
    }
    try {
      // Update database
      await supabase.from('Jobs_CVs').update({
        contacted: 'Rejected'
      }).eq('Candidate_ID', candidateId).eq('job_id', jobId);

      // Send webhook to Make.com
      const candidate = candidates.find(c => c.Candidate_ID === candidateId);
      if (candidate) {
        try {
          await fetch('https://hook.eu2.make.com/castzb5q0mllr7eq9zzyqll4ffcpet7j', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              job_id: jobId,
              candidate_id: candidateId,
              callid: candidate.callid
            })
          });
        } catch (webhookError) {
          console.error('Webhook error:', webhookError);
        }
      }

      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error('Error rejecting candidate:', error);
    }
  };
  const handleArrangeInterview = async (candidateId: string, jobId: string) => {
    try {
      await supabase.from('CVs').update({
        CandidateStatus: 'Interview'
      }).eq('candidate_id', candidateId);

      // Refresh data
      fetchDashboardData();
    } catch (error) {
      console.error('Error arranging interview:', error);
    }
  };
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 75) return 'text-purple-400';
    return 'text-muted-foreground';
  };
  const getCandidateStatus = (candidateId: string) => {
    const cvRecord = cvData.find(cv => cv.candidate_id === candidateId);
    return cvRecord?.CandidateStatus || null;
  };
  const getCurrentTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Filter candidates based on selected job
  const filteredCandidates = selectedJobFilter === 'all' ? candidates || [] : candidates?.filter(c => c.job_id === selectedJobFilter) || [];

  // Enrich candidates with job titles
  const enrichedCandidates = filteredCandidates.map(candidate => {
    const job = jobs.find(j => j.job_id === candidate.job_id);
    return {
      ...candidate,
      job_title: job?.job_title || 'Unknown Position'
    };
  });
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Activity className="h-8 w-8 animate-spin text-cyan-400" />
          <span className="text-xl text-foreground">Loading Mission Control...</span>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 relative overflow-hidden mx-auto max-w-screen-2xl">
      
      <div className="mb-8 relative z-10">
        <div className="rounded-2xl border border-border/50 bg-gradient-card backdrop-blur-xl p-6 shadow-card animate-fade-in">
          <HeroHeader title="Mission Control" subtitle={`Welcome back, ${profile?.name || 'Commander'}. Your day at a glance.`} />

          <BentoKpis>
            <TiltCard>
              <MetricCardPro title="Active Jobs" value={data?.totalJobs ?? 0} delta="+3 this week" icon={Briefcase} accent="primary" trend={[3, 5, 4, 6, 7, 8, 7, 9]} progress={Math.min(100, (data?.totalJobs ?? 0) * 12)} />
            </TiltCard>
            <TiltCard>
              <MetricCardPro title="Awaiting Review" value={highScoreActiveCount || 0} delta="-12%" icon={ClipboardList} accent="purple" trend={[12, 10, 11, 9, 8, 7, 8, 6]} progress={Math.min(100, highScoreActiveCount || 0)} className="border-2 border-primary/60 glow-cyan" />
            </TiltCard>
            <TiltCard>
              <MetricCardPro title="Interviews" value={data?.interviewsThisWeek ?? 0} delta="+8%" icon={Video} accent="cyan" trend={[2, 3, 3, 4, 5, 6, 6, 7]} progress={Math.min(100, (data?.interviewsThisWeek ?? 0) * 15)} />
            </TiltCard>
            <TiltCard>
              <MetricCardPro title="Tasks Today" value={data?.tasksToday ?? 0} delta={data?.tasksToday ? `${data.tasksToday > 0 ? '+' : ''}${data.tasksToday}%` : undefined} icon={Target} accent="emerald" trend={[1, 2, 1, 3, 2, 4, 3, 5]} progress={Math.min(100, (data?.tasksToday ?? 0) * 10)} />
            </TiltCard>
          </BentoKpis>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Left Side - Job Control Panels - 30% width */}
        <div className="space-y-4 lg:col-span-1">
          <h2 className="text-lg font-bold text-cyan-300 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Active Jobs Funnel
          </h2>
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {data?.activeJobs?.map(job => <Card key={job.job_id} className="bg-card border-border dark:bg-gradient-to-br dark:from-white/5 dark:via-white/3 dark:to-white/5 dark:backdrop-blur-lg dark:border-white/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02]">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-3">
                      <h3 className="font-semibold text-sm truncate">{job.job_title}</h3>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{job.job_location}</p>
                    <div className="grid grid-cols-3 gap-1 text-xs mb-2">
                      <div className="text-center">
                        <div className="text-cyan-300 font-bold">{jobStats[job.job_id]?.longlist || 0}</div>
                        <div className="text-gray-500">Longlist</div>
                      </div>
                      <div className="text-center">
                        <div className="text-orange-300 font-bold">{jobStats[job.job_id]?.contacted || 0}</div>
                        <div className="text-gray-500">Contacted</div>
                      </div>
                      <div className="text-center">
                        <div className="text-red-300 font-bold">{jobStats[job.job_id]?.lowScored || 0}</div>
                        <div className="text-gray-500">Low Scored</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      <div className="text-center">
                        <div className="text-purple-300 font-bold">{jobStats[job.job_id]?.shortlist || 0}</div>
                        <div className="text-gray-500">Shortlist</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-300 font-bold">{jobStats[job.job_id]?.tasked || 0}</div>
                        <div className="text-gray-500">Tasked</div>
                      </div>
                      <div className="text-center">
                        <div className="text-emerald-300 font-bold">{jobStats[job.job_id]?.hired || 0}</div>
                        <div className="text-gray-500">Hired</div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/job/${job.job_id}`)} className="w-full mt-2 text-xs text-cyan-400 hover:bg-cyan-400/10">
                      Open Job
                    </Button>
                  </CardContent>
                </Card>)}
            </div>
          </ScrollArea>
        </div>

        {/* Right Side - Live Candidate Feed & Action Center - 60% width */}
        <div className="space-y-6 lg:col-span-2">
          <ActivityTicker items={enrichedCandidates.slice(0, 10).map(c => `${c.candidate_name} • ${c.job_title} • ${parseFloat(c.success_score) || 0}`)} />
          {/* Live Candidate Feed */}
          <Card className="bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-lg border-cyan-400/30 shadow-2xl shadow-cyan-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-cyan-300 flex items-center">
                  <Activity className="h-5 w-5 mr-2 animate-pulse text-cyan-400" />
                  Live Candidate Feed
                  <Badge className="ml-3 bg-background/40 text-primary border-2 border-primary/60 glow-cyan animate-pulse">
                    LIVE
                  </Badge>
                </CardTitle>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-300 font-medium">Active</span>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border border-cyan-400/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" onClick={() => window.location.href = '/live-feed'}>
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
                  const score = parseFloat(candidate.success_score) || 0;
                  const jobTitle = candidate.job_title || 'Unknown Position';
                  return <div key={index} className={`bg-gradient-to-r rounded-xl p-4 border ${index < 3 ? 'from-amber-400/20 to-yellow-500/20 border-yellow-400/40' : 'from-white/5 to-white/10 border-white/20'} hover:border-cyan-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 group cursor-pointer`} onClick={() => handleCandidateClick(candidate.Candidate_ID, candidate.job_id, candidate.callid)}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {candidate.candidate_name?.charAt(0) || 'C'}
                              </div>
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground text-lg group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">{candidate.candidate_name}</h4>
                              <p className="text-sm text-purple-300 font-medium">{jobTitle}</p>
                              <Badge variant="outline" className="mt-1 text-xs border-cyan-400/50 text-cyan-400 bg-cyan-400/10">
                                ID: {candidate.job_id}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold mb-2 ${getScoreColor(score)}`}>
                              {score}
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Button size="sm" variant="destructive" onClick={e => {
                            e.stopPropagation();
                            handleRejectCandidate(candidate.Candidate_ID, candidate.job_id);
                          }} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject Candidate
                              </Button>
                              <Button size="sm" variant="default" onClick={e => {
                            e.stopPropagation();
                            handleArrangeInterview(candidate.Candidate_ID, candidate.job_id);
                          }} className="bg-green-600 hover:bg-green-700 text-white bg-emerald-700 hover:bg-emerald-600">
                                <Calendar className="w-4 h-4 mr-1" />
                                Arrange an Interview
                              </Button>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 mb-4 leading-relaxed bg-black/20 p-3 rounded-lg">
                          {candidate.score_and_reason?.slice(0, 120)}...
                        </p>
                         <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-400">
                            Updated: {new Date(candidate.lastcalltime || Date.now()).toLocaleDateString()}
                          </div>
                          <Badge className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 border-emerald-400/40 animate-pulse">
                            ⭐ Shortlisted
                          </Badge>
                        </div>
                      </div>;
                })}
                  {enrichedCandidates.length > 5 && <div className="text-center pt-4">
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border border-purple-400/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" onClick={() => window.location.href = '/live-feed'}>
                        View All {enrichedCandidates.length} Candidates
                        <Activity className="w-4 h-4 ml-2" />
                      </Button>
                    </div>}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Action Center */}
          <Card className="bg-card border-border dark:bg-gradient-to-br dark:from-white/5 dark:via-white/3 dark:to-white/5 dark:backdrop-blur-lg dark:border-white/20 shadow-xl shadow-purple-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-purple-300">My Next Moves</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-400/30 cursor-pointer hover:bg-purple-500/20 hover:border-purple-400/50 transition-all duration-300 hover:scale-[1.02]" onClick={() => navigate('/jobs')}>
                  <h4 className="font-semibold text-purple-300 mb-2">Candidates Needing Review</h4>
                  <div className="text-2xl font-bold text-purple-400">{highScoreActiveCount || 0}</div>
                  <p className="text-sm text-purple-200">Score &gt; 74</p>
                </div>
                <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-400/30 cursor-pointer hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-[1.02]" onClick={() => navigate('/jobs')}>
                  <h4 className="font-semibold text-cyan-300 mb-2">Upcoming Interviews</h4>
                  <div className="text-2xl font-bold text-cyan-400">{data?.interviewsThisWeek || 0}</div>
                  <p className="text-sm text-cyan-200">This week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>;
}