import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { StatusDropdown } from '@/components/candidates/StatusDropdown';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Pause, Search, FileText, Upload, Users, Briefcase, Clock, Star, TrendingUp, Calendar, CheckCircle, XCircle, ClipboardList, Video, Target, Activity, Timer, Phone, UserCheck, Building2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
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

interface Interview {
  intid: string;
  candidate_id: string;
  job_id: string;
  callid: number;
  appoint1: string;
  appoint2: string;
  appoint3: string;
  chosen_time: string | null;
  inttype: string;
  intlink: string | null;
  intstatus: string;
  created_at: string;
  updated_at: string;
}
export default function Index() {
  const { profile } = useProfile();
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
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<{candidateId: string, jobId: string, callid: number, intid?: string} | null>(null);
  const [interviewSlots, setInterviewSlots] = useState<{date: Date | undefined, time: string}[]>([
    { date: undefined, time: '' },
    { date: undefined, time: '' },
    { date: undefined, time: '' }
  ]);
  const [interviewType, setInterviewType] = useState<string>('Phone');
  const [interviewLink, setInterviewLink] = useState<string>('');
  const [interviews, setInterviews] = useState<Interview[]>([]);
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
    fetchInterviews();
  }, []);
  const fetchDashboardData = async () => {
    try {
      // Fetch real data from Supabase
      const { data: jobsData, error: jobsError } = await supabase
        .from('Jobs')
        .select('*')
        .eq('Processed', 'Yes');

      const { data: jobsCvsData, error: jobsCvsError } = await supabase
        .from('Jobs_CVs')
        .select('*');

      if (jobsError || jobsCvsError) {
        console.error('Error fetching data:', jobsError || jobsCvsError);
        return;
      }

      console.log('Fetched jobs:', jobsData?.length || 0);
      console.log('Fetched jobs_cvs:', jobsCvsData?.length || 0);

      const activeJobs = jobsData || [];
      const links = jobsCvsData || [];
      const activeJobIds = new Set(activeJobs.map((j: any) => j.job_id));

      console.log('Active jobs:', activeJobs.length);
      console.log('Active job IDs:', Array.from(activeJobIds));

      // Keep 'all' to show candidates across all jobs by default

      // Mock data for candidates - will be replaced with real candidate data later
      const cvs: any[] = [];
      
      // Metrics
      const shortlistedCandidates = links.filter((c: any) => c.shortlisted_at !== null);
      const interviewCandidates = links.filter((c: any) => c.contacted === 'Interview Scheduled');
      const taskedCandidates = links.filter((c: any) => c.contacted === 'Tasked');

      // Recent candidates from Jobs_CVs data - only Call Done candidates
      const callDoneActiveCandidates = links.filter((c: any) => 
        activeJobIds.has(c.job_id) && c.contacted === 'Call Done'
      );
      
      const recentCandidates = callDoneActiveCandidates.sort((a: any, b: any) => {
        const scoreA = parseFloat(a.cv_score) || 0;
        const scoreB = parseFloat(b.cv_score) || 0;
        return scoreB - scoreA; // Highest score first
      }).slice(0, 10);
      
      setCandidates(recentCandidates);
      setJobs(activeJobs);
      setCvData(cvs);

      // Per-job stats (for Active Jobs Funnel)
      const stats: Record<string, any> = {};
      activeJobs.forEach((job: any) => {
        const jobId = job.job_id;
        const jobLinks = links.filter((jc: any) => jc.job_id === jobId);
        const cvsForJob = cvs.filter((cv: any) => jobLinks.some((jc: any) => jc.Candidate_ID === cv.candidate_id));
        stats[jobId] = {
          longlist: jobLinks.length,
          shortlist: jobLinks.filter((jc: any) => jc.shortlisted_at !== null).length,
          contacted: jobLinks.filter((jc: any) => jc.contacted && ['contacted', 'call done'].includes(jc.contacted.toLowerCase())).length,
          lowScored: jobLinks.filter((jc: any) => jc.contacted && jc.contacted.toLowerCase() === 'low scored').length,
          submittedCv: jobLinks.filter((jc: any) => jc.contacted && jc.contacted.toLowerCase() === 'submitted').length
        };
      });
      setJobStats(stats);

      // Candidates needing review: Shortlisted candidates count
      const highScoreActiveCountVal = callDoneActiveCandidates.length;
      setHighScoreActiveCount(highScoreActiveCountVal);
      setData({
        totalCandidates: links.length,
        totalJobs: activeJobs.length,
        candidatesAwaitingReview: callDoneActiveCandidates.length,
        tasksToday: taskedCandidates.length,
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

  const fetchInterviews = async () => {
    try {
      // Mock data for interviews since table doesn't exist
      setInterviews([]);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    }
  };

  const getCandidate = (candidateId: string) => {
    return cvData.find(c => c.candidate_id === candidateId);
  };

  const getJob = (jobId: string) => {
    return jobs.find(j => j.job_id === jobId);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/40';
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-400 border-blue-400/40';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-400/40';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-400/40';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-400/40';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'Phone' ? <Phone className="w-4 h-4" /> : <Video className="w-4 h-4" />;
  };

  const handleTaskCountChange = (count: number) => {
    // This function is no longer needed for task count since we're tracking tasked candidates
    // But keeping it for potential future use
    setOpenTasksCount(count);
  };
  const handleCandidateClick = (recordid: number, jobId: string) => {
    navigate(`/call-log-details/${recordid}`);
  };
  const handleRejectCandidate = async (candidateId: string, jobId: string) => {
    // Show confirmation alert
    const confirmed = window.confirm('Are you sure you want to Reject Candidate?');
    if (!confirmed) {
      return; // User cancelled, don't proceed
    }
    try {
      // Mock rejection since tables don't exist
      console.log('Rejecting candidate:', candidateId, 'for job:', jobId);
      
      // Mock webhook call
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
              callid: candidate.callid,
              company_id: 'default'
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
  const handleArrangeInterview = (candidateId: string, jobId: string, intid?: string) => {
    const candidate = candidates.find(c => c.Candidate_ID === candidateId);
    if (candidate) {
      setSelectedCandidate({
        candidateId,
        jobId,
        callid: candidate.callid,
        intid
      });
      setInterviewDialogOpen(true);
      // Reset slots and type
      setInterviewSlots([
        { date: undefined, time: '' },
        { date: undefined, time: '' },
        { date: undefined, time: '' }
      ]);
      setInterviewType('Phone');
      setInterviewLink('');
    }
  };

  const handleCVSubmitted = async (candidateId: string, jobId: string) => {
    try {
      const { error } = await supabase
        .from('Jobs_CVs')
        .update({ 'contacted': 'Submitted' })
        .eq('recordid', parseInt(candidateId)) // Convert to number since recordid is bigint
        .eq('job_id', jobId);

      if (error) throw error;

      toast.success("Candidate's CV has been marked as submitted");
      // Reload the page to refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error submitting CV:', error);
      toast.error("Failed to submit CV. Please try again.");
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedCandidate) return;

    // Validate that all slots are filled
    const validSlots = interviewSlots.filter(slot => slot.date && slot.time);
    if (validSlots.length !== 3) {
      alert('Please fill in all 3 interview slots');
      return;
    }

    // Validate that times are not in the past for today's date
    const now = new Date();
    const currentDate = format(now, 'yyyy-MM-dd');
    const currentTime = format(now, 'HH:mm');
    
    for (const slot of validSlots) {
      const slotDate = format(slot.date!, 'yyyy-MM-dd');
      if (slotDate === currentDate && slot.time <= currentTime) {
        alert('Cannot schedule interview times in the past for today. Please select a future time.');
        return;
      }
    }

    // Validate interview link for online meetings
    if (interviewType === 'Online Meeting' && !interviewLink.trim()) {
      alert('Please provide an interview link for online meetings');
      return;
    }

    try {
      // Mock status update since CVs table doesn't exist
      console.log('Updating candidate status to Interview:', selectedCandidate.candidateId);
      
      // Format appointments for webhook
      const appointments = interviewSlots.map(slot => {
        if (slot.date && slot.time) {
          return `${format(slot.date, 'yyyy-MM-dd')} ${slot.time}`;
        }
        return '';
      });

      // Mock interview save
      const mockInterview = {
        intid: `interview-${Date.now()}`,
        candidate_id: selectedCandidate.candidateId,
        job_id: selectedCandidate.jobId,
        callid: selectedCandidate.callid,
        appoint1: appointments[0],
        appoint2: appointments[1],
        appoint3: appointments[2],
        inttype: interviewType,
        intlink: interviewType === 'Online Meeting' ? interviewLink : null,
        company_id: 'default'
      };

      // Send webhook to Make.com
      await fetch('https://hook.eu2.make.com/3t88lby79dnf6x6hgm1i828yhen75omb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          job_id: selectedCandidate.jobId,
          candidate_id: selectedCandidate.candidateId,
          callid: selectedCandidate.callid,
          intid: mockInterview.intid,
          appoint1: appointments[0],
          appoint2: appointments[1],
          appoint3: appointments[2],
          inttype: interviewType
        })
      });

      // Close dialog and refresh data
      setInterviewDialogOpen(false);
      setSelectedCandidate(null);
      setInterviewType('Phone');
      setInterviewLink('');
      fetchDashboardData();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert('Error scheduling interview. Please try again.');
    }
  };

  const updateInterviewSlot = (index: number, field: 'date' | 'time', value: Date | string) => {
    setInterviewSlots(prev => {
      const newSlots = [...prev];
      if (field === 'date') {
        newSlots[index] = { ...newSlots[index], date: value as Date };
      } else {
        newSlots[index] = { ...newSlots[index], time: value as string };
      }
      return newSlots;
    });
  };

  const timeOptions = ['00', '15', '30', '45'];
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

  // Check if candidate has pending or scheduled interview
  const getCandidateInterviewStatus = (candidateId: string) => {
    const candidateInterviews = interviews.filter(interview => 
      interview.candidate_id === candidateId && 
      (interview.intstatus === 'Scheduled' || interview.intstatus === 'Pending')
    );
    return candidateInterviews.length > 0 ? candidateInterviews[0].intstatus : null;
  };

  const handleHireCandidate = async (candidateId: string, jobId: string) => {
    try {
      // Mock hiring since CVs table doesn't exist
      console.log('Hiring candidate:', candidateId, 'for job:', jobId);

      // Refresh dashboard data
      fetchDashboardData();
      toast.success('Candidate hired successfully!');
    } catch (error) {
      console.error('Error hiring candidate:', error);
      toast.error('Failed to hire candidate');
    }
  };
  const getCurrentTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Filter candidates based on selected job
  // Helper function to get enriched candidates with job titles
  const enrichedCandidates = candidates.map(candidate => {
    const job = jobs.find(j => j.job_id === candidate.job_id);
    return {
      ...candidate,
      Candidate_ID: candidate.recordid, // Map recordid to Candidate_ID for compatibility
      job_title: job?.job_title || 'Unknown Position',
      success_score: candidate.cv_score || candidate.after_call_score || 0
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

  // Admin interface for amir.z@marc-ellis.com
  if (false && profile?.is_admin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCardPro
            title="Total Users"
            value="1"
            icon={Users}
            trend={[0, 0, 0, 0, 0]}
          />
          <MetricCardPro
            title="System Health"
            value="100%"
            icon={Activity}
            trend={[100, 100, 100, 100, 100]}
          />
        </div>
      </div>
    );
  }
  return <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 relative overflow-hidden mx-auto max-w-screen-2xl">
      
      <div className="mb-8 relative z-10">
        <div className="rounded-2xl border border-border/50 bg-gradient-card backdrop-blur-xl p-6 shadow-card animate-fade-in">
          <HeroHeader title="Mission Control" subtitle={`Welcome back, ${profile?.name || 'Commander'}. Your day at a glance.`} />

          <BentoKpis>
            <TiltCard>
              <div onClick={() => navigate('/jobs')} className="cursor-pointer">
                <MetricCardPro title="Active Jobs" value={data?.totalJobs ?? 0} delta="+3 this week" icon={Briefcase} accent="primary" trend={[3, 5, 4, 6, 7, 8, 7, 9]} progress={Math.min(100, (data?.totalJobs ?? 0) * 12)} />
              </div>
            </TiltCard>
            <TiltCard>
              <div onClick={() => navigate('/live-feed')} className="cursor-pointer">
                <MetricCardPro title="Awaiting Review" value={highScoreActiveCount || 0} delta="-12%" icon={ClipboardList} accent="purple" trend={[12, 10, 11, 9, 8, 7, 8, 6]} progress={Math.min(100, highScoreActiveCount || 0)} className="border-2 border-primary/60 glow-cyan" />
              </div>
            </TiltCard>
            <TiltCard>
              <div onClick={() => navigate('/jobs')} className="cursor-pointer">
                <MetricCardPro title="Tasked" value={data?.tasksToday ?? 0} delta={data?.tasksToday ? `${data.tasksToday > 0 ? '+' : ''}${data.tasksToday}` : undefined} icon={Target} accent="emerald" trend={[1, 2, 1, 3, 2, 4, 3, 5]} progress={Math.min(100, (data?.tasksToday ?? 0) * 10)} />
              </div>
            </TiltCard>
            <TiltCard>
              <div onClick={() => navigate('/interviews')} className="cursor-pointer">
                <MetricCardPro title="Interviews" value={data?.interviewsThisWeek ?? 0} delta="+8%" icon={Video} accent="cyan" trend={[2, 3, 3, 4, 5, 6, 6, 7]} progress={Math.min(100, (data?.interviewsThisWeek ?? 0) * 15)} />
              </div>
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
                    <div className="grid grid-cols-5 gap-1 text-xs mb-3">
                      <div className="text-center">
                        <div className="text-cyan-300 font-bold">{jobStats[job.job_id]?.longlist || 0}</div>
                        <div className="text-gray-500">Longlist</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-300 font-bold">{jobStats[job.job_id]?.shortlist || 0}</div>
                        <div className="text-gray-500">Shortlist</div>
                      </div>
                      <div className="text-center">
                        <div className="text-orange-300 font-bold">{jobStats[job.job_id]?.contacted || 0}</div>
                        <div className="text-gray-500">Contacted</div>
                      </div>
                      <div className="text-center">
                        <div className="text-red-300 font-bold">{jobStats[job.job_id]?.lowScored || 0}</div>
                        <div className="text-gray-500">Low Scored</div>
                      </div>
                      <div className="text-center">
                        <div className="text-emerald-300 font-bold">{jobStats[job.job_id]?.submittedCv || 0}</div>
                        <div className="text-gray-500">Submitted</div>
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
                  return <div key={index} className={`bg-gradient-to-r rounded-xl p-4 border ${index < 3 ? 'from-amber-400/20 to-yellow-500/20 border-yellow-400/40' : 'from-white/5 to-white/10 border-white/20'} hover:border-cyan-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 group cursor-pointer`} onClick={() => handleCandidateClick(candidate.recordid, candidate.job_id)}>
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
                               <div className="flex flex-wrap gap-2 mt-1">
                                 <Badge variant="outline" className="text-xs border-cyan-400/50 text-cyan-400 bg-cyan-400/10">
                                   Candidate ID: {candidate.recordid}
                                 </Badge>
                                 <Badge variant="outline" className="text-xs border-purple-400/50 text-purple-400 bg-purple-400/10">
                                   Job ID: {candidate.job_id}
                                 </Badge>
                               </div>
                             </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold mb-2 ${getScoreColor(score)}`}>
                              {score}
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Button size="xs" variant="outline" onClick={e => {
                                e.stopPropagation();
                                handleRejectCandidate(candidate.Candidate_ID, candidate.job_id);
                              }} className="bg-transparent border-2 border-red-500 text-red-600 hover:bg-red-100 hover:border-red-600 hover:text-red-700 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:border-red-300 dark:hover:text-red-300 transition-all duration-200 text-xs">
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject Candidate
                              </Button>
                              <Button size="xs" variant="outline" onClick={e => {
                                e.stopPropagation();
                                handleCVSubmitted(candidate.Candidate_ID, candidate.job_id);
                              }} className="bg-transparent border-2 border-green-500 text-green-600 hover:bg-green-100 hover:border-green-600 hover:text-green-700 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/30 dark:hover:border-green-300 dark:hover:text-green-300 transition-all duration-200 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Submit CV
                              </Button>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 mb-4 leading-relaxed bg-black/20 p-3 rounded-lg">
                          {candidate.after_call_reason ? candidate.after_call_reason.slice(0, 200) + "..." : "No after call reason available"}
                        </p>
                         <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-400">
                            Updated: {new Date(candidate.lastcalltime || Date.now()).toLocaleDateString()}
                          </div>
                           <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-400/40 animate-pulse">
                             📞 Call Done
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

      {/* Interview Scheduling Dialog */}
      <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Interview Slots</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 overflow-y-auto max-h-[70vh] px-1">
            <p className="text-sm text-muted-foreground">
              Please select 3 preferred interview slots and interview type. Only future dates are allowed, and times must be in 15-minute intervals.
            </p>
            
            {/* Interview Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Interview Type</label>
              <Select value={interviewType} onValueChange={setInterviewType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select interview type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Online Meeting">Online Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Conditional Interview Link Input */}
            {interviewType === 'Online Meeting' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Interview Link</label>
                <Input
                  type="url"
                  placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                  value={interviewLink}
                  onChange={(e) => setInterviewLink(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
            
            {interviewSlots.map((slot, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Slot {index + 1}</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Date Picker */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !slot.date && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {slot.date ? format(slot.date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={slot.date}
                          onSelect={(date) => updateInterviewSlot(index, 'date', date!)}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time Picker */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time</label>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Hours */}
                      <Select
                        value={slot.time.split(':')[0] || ''}
                        onValueChange={(hour) => {
                          const minute = slot.time.split(':')[1] || '00';
                          const newTime = `${hour}:${minute}`;
                          
                          // Validate time is not in the past for today
                          if (slot.date) {
                            const today = new Date();
                            const slotDate = format(slot.date, 'yyyy-MM-dd');
                            const currentDate = format(today, 'yyyy-MM-dd');
                            const currentTime = format(today, 'HH:mm');
                            
                            if (slotDate === currentDate && newTime <= currentTime) {
                              alert('Cannot select a time in the past for today');
                              return;
                            }
                          }
                          
                          updateInterviewSlot(index, 'time', newTime);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Hour" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                              {i.toString().padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Minutes */}
                      <Select
                        value={slot.time.split(':')[1] || ''}
                        onValueChange={(minute) => {
                          const hour = slot.time.split(':')[0] || '09';
                          const newTime = `${hour}:${minute}`;
                          
                          // Validate time is not in the past for today
                          if (slot.date) {
                            const today = new Date();
                            const slotDate = format(slot.date, 'yyyy-MM-dd');
                            const currentDate = format(today, 'yyyy-MM-dd');
                            const currentTime = format(today, 'HH:mm');
                            
                            if (slotDate === currentDate && newTime <= currentTime) {
                              alert('Cannot select a time in the past for today');
                              return;
                            }
                          }
                          
                          updateInterviewSlot(index, 'time', newTime);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Min" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((minute) => (
                            <SelectItem key={minute} value={minute}>
                              {minute}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end space-x-2 pt-4 sticky bottom-0 bg-background border-t">
              <Button variant="outline" onClick={() => setInterviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleInterview} className="bg-emerald-600 hover:bg-emerald-700">
                Schedule Interview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>;
}