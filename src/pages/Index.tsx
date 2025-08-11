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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch candidates
      const { data: candidates, error: candidatesError } = await supabase
        .from('CVs')
        .select('*');

      if (candidatesError) throw candidatesError;

      // Fetch jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('Jobs')
        .select('*');

      if (jobsError) throw jobsError;

      // Fetch job-candidate matches
      const { data: jobCandidates, error: jobCandidatesError } = await supabase
        .from('Jobs_CVs')
        .select('*');

      if (jobCandidatesError) throw jobCandidatesError;

      // Calculate metrics
      const highScoreCandidates = jobCandidates?.filter(jc => {
        const score = parseFloat(jc['Success Score']) || 0;
        return score > 74;
      }) || [];

      const recentCandidates = highScoreCandidates
        .sort((a, b) => new Date(b['Timestamp'] || 0).getTime() - new Date(a['Timestamp'] || 0).getTime())
         .slice(0, 10);

      setCandidates(recentCandidates);
      setJobs(jobs || []);

      // Calculate average time to hire (placeholder calculation)
      const averageTimeToHire = 14; // days

      setData({
        totalCandidates: candidates?.length || 0,
        totalJobs: jobs?.length || 0,
        candidatesAwaitingReview: highScoreCandidates.length,
        tasksToday: openTasksCount,
        interviewsThisWeek: 5, // placeholder
        averageTimeToHire,
        recentCandidates,
        activeJobs: jobs || []
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
    setData(prev => prev ? { ...prev, tasksToday: count } : null);
  };

  const handleCandidateClick = (candidateId: string, jobId: string) => {
    navigate(`/call-log?candidate=${candidateId}&job=${jobId}`);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      {/* Welcome & Quick Status */}
      <div className="mb-8">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 shadow-2xl">
          <h1 className="text-3xl font-bold mb-2">
            {getCurrentTimeGreeting()}, {profile?.first_name || 'Commander'}
          </h1>
          <p className="text-cyan-300 mb-6">
            You have {data?.totalJobs || 0} Active roles, {data?.candidatesAwaitingReview || 0} candidates to review, 
            and {data?.tasksToday || 0} tasks due today.
          </p>
          
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-400/30 hover:scale-105 transition-transform cursor-pointer">
              <CardContent className="p-4 text-center">
                <Briefcase className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-300">{data?.totalJobs || 0}</div>
                <div className="text-xs text-blue-200">Active Jobs</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-400/30 hover:scale-105 transition-transform cursor-pointer">
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-300">{data?.candidatesAwaitingReview || 0}</div>
                <div className="text-xs text-purple-200">Scores &gt; 74</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-400/30 hover:scale-105 transition-transform cursor-pointer">
              <CardContent className="p-4 text-center">
                <ClipboardList className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-emerald-300">{data?.tasksToday || 0}</div>
                <div className="text-xs text-emerald-200">Tasks Due</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-cyan-400/30 hover:scale-105 transition-transform cursor-pointer">
              <CardContent className="p-4 text-center">
                <Video className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-cyan-300">{data?.interviewsThisWeek || 0}</div>
                <div className="text-xs text-cyan-200">Interviews This Week</div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Side - Job Control Panels */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-cyan-300 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Job Control
          </h2>
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {data?.activeJobs?.map((job) => (
                <Card key={job['Job ID']} className="bg-white/5 backdrop-blur-lg border-white/10 hover:border-cyan-400/50 transition-all">
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
                        <div className="text-cyan-300 font-bold">12</div>
                        <div className="text-gray-500">Contact</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-300 font-bold">5</div>
                        <div className="text-gray-500">Short</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-300 font-bold">3</div>
                        <div className="text-gray-500">Task</div>
                      </div>
                      <div className="text-center">
                        <div className="text-emerald-300 font-bold">1</div>
                        <div className="text-gray-500">Inter</div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedJobFilter(job['Job ID'])}
                      className="w-full mt-2 text-xs text-cyan-400 hover:bg-cyan-400/10"
                    >
                      Filter Feed
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Side - Live Candidate Feed & Action Center */}
        <div className="col-span-10 space-y-6">
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
                    variant="outline"
                    onClick={() => setSelectedJobFilter('all')}
                    className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 hover:border-cyan-400 transition-all duration-300"
                  >
                    Show All
                  </Button>
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
                        className="bg-gradient-to-r from-white/5 to-white/10 rounded-xl p-4 border border-white/20 hover:border-cyan-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 group cursor-pointer"
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
                            <StatusDropdown
                              currentStatus={candidate['Contacted']}
                              candidateId={candidate["Candidate_ID"]}
                              jobId={candidate["Job ID"]}
                              onStatusChange={(newStatus) => {
                                setCandidates(prev => prev.map(c => 
                                  c["Candidate_ID"] === candidate["Candidate_ID"] 
                                    ? { ...c, Contacted: newStatus }
                                    : c
                                ))
                              }}
                              variant="badge"
                            />
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
                              onStatusChange={(newStatus) => {
                                setCandidates(prev => prev.map(c => 
                                  c["Candidate_ID"] === candidate["Candidate_ID"] 
                                    ? { ...c, Contacted: newStatus }
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
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-purple-300">My Next Moves</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-400/30">
                  <h4 className="font-semibold text-purple-300 mb-2">Candidates Needing Review</h4>
                  <div className="text-2xl font-bold text-purple-400">{data?.candidatesAwaitingReview || 0}</div>
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