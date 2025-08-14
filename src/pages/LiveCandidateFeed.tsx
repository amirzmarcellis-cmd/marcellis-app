// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatusDropdown } from '@/components/candidates/StatusDropdown';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Filter, Users, Zap, Activity, Star, Clock, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

interface Candidate {
  'Candidate_ID': string;
  'Candidate Name': string;
  'Candidate Email': string;
  'Candidate Phone Number': string;
  'Job ID': string;
  'Job Title': string;
  'Success Score': string;
  'Score and Reason': string;
  'Contacted': string;
  'Summary': string;
  'pros': string;
  'cons': string;
  'Notice Period': string;
  'Salary Expectations': string;
}

interface Job {
  'Job ID': string;
  'Job Title': string;
  'Processed'?: string | null;
}

export default function LiveCandidateFeed() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [cvData, setCvData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch Jobs_CVs data with job titles
      const { data: jobsCvsData, error: jobsCvsError } = await supabase
        .from('Jobs_CVs')
        .select('*')
        .order('success_score', { ascending: false });

      if (jobsCvsError) throw jobsCvsError;

      // Fetch Jobs data
      const { data: jobsData, error: jobsError } = await supabase
        .from('Jobs')
        .select('*');

      if (jobsError) throw jobsError;

      // Fetch CVs data for candidate status
      const { data: cvsData, error: cvsError } = await supabase
        .from('CVs')
        .select('*');

      if (cvsError) throw cvsError;

      // Enrich candidates with job titles
      const enrichedCandidates = (jobsCvsData || []).map(candidate => {
        const job = (jobsData || []).find(j => j.job_id === candidate.job_id);
        return {
          ...candidate,
          'Job Title': job?.job_title || 'Unknown Position'
        };
      });

      // Filter: only score >= 74 and ACTIVE jobs
      const activeJobIds = new Set((jobsData || []).filter(j => j.Processed === 'Yes').map(j => j.job_id))
      const filteredHighScoreActive = enrichedCandidates.filter(c => {
        const score = parseFloat(c.success_score || '0');
        return Number.isFinite(score) && score >= 74 && activeJobIds.has(c.job_id);
      });

      setCandidates(filteredHighScoreActive);
      setJobs(jobsData || []);
      setCvData(cvsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      (candidate.candidate_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate['Job Title'] || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesJob = selectedJob === 'all' || candidate.job_id === selectedJob;
    
    const matchesStatus = statusFilter === 'all' || 
      statusFilter === candidate.contacted ||
      (statusFilter === 'Shortlisted' && getCandidateStatus(candidate.Candidate_ID || candidate.candidate_id) === 'Shortlisted') ||
      (statusFilter === 'Interview' && getCandidateStatus(candidate.Candidate_ID || candidate.candidate_id) === 'Interview') ||
      (statusFilter === 'Hired' && getCandidateStatus(candidate.Candidate_ID || candidate.candidate_id) === 'Hired') ||
      (statusFilter === 'Rejected' && getCandidateStatus(candidate.Candidate_ID || candidate.candidate_id) === 'Rejected');
    
    const matchesScoreFilter = scoreFilter === 'all' ||
      (scoreFilter === '50-74' && parseFloat(candidate.success_score || '0') >= 50 && parseFloat(candidate.success_score || '0') <= 74) ||
      (scoreFilter === '75-100' && parseFloat(candidate.success_score || '0') >= 75 && parseFloat(candidate.success_score || '0') <= 100);

    return matchesSearch && matchesJob && matchesStatus && matchesScoreFilter;
  });

  // Ensure highest scores are shown first regardless of fetch order
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    const sa = parseFloat(a.success_score || '0') || 0;
    const sb = parseFloat(b.success_score || '0') || 0;
    return sb - sa;
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-400/20 border-emerald-400/40';
    if (score >= 75) return 'text-cyan-400 bg-cyan-400/20 border-cyan-400/40';
    if (score >= 50) return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/40';
    return 'text-red-400 bg-red-400/20 border-red-400/40';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-emerald-400/20 to-emerald-600/40';
    if (score >= 75) return 'from-cyan-400/20 to-cyan-600/40';
    if (score >= 50) return 'from-yellow-400/20 to-yellow-600/40';
    return 'from-red-400/20 to-red-600/40';
  };

  // Get CV status for a candidate
  const getCandidateStatus = (candidateId: string) => {
    const cvRecord = cvData.find(cv => cv.candidate_id === candidateId || cv.Candidate_ID === candidateId)
    return cvRecord?.CandidateStatus || null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-cyan-400/30 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-t-cyan-400 rounded-full animate-spin"></div>
          </div>
          <p className="text-cyan-400 text-xl font-medium mt-6 animate-pulse">
            Initializing Live Feed...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-blue-900 p-4 sm:p-6 overflow-x-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center animate-pulse shadow-2xl shadow-cyan-400/25">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                LIVE CANDIDATE FEED
              </h1>
              <p className="text-purple-200 text-lg">Real-time AI-powered candidate monitoring system</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-background/30 px-4 py-2 rounded-full border-2 border-primary/60 glow-cyan">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              <span className="text-primary font-medium">LIVE</span>
            </div>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-400/40 px-4 py-2 text-lg">
              {filteredCandidates.length} Active
            </Badge>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <Card className="mb-8 bg-card border-border dark:bg-gradient-to-r dark:from-white/10 dark:to-white/5 dark:backdrop-blur-xl dark:border-white/20 shadow-2xl shadow-purple-500/10">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <Filter className="w-5 h-5 mr-2 text-cyan-400" />
            Advanced Filtering System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-300">Search Candidates</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4" />
                <Input
                  placeholder="Name or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/20 border-cyan-400/30 text-foreground placeholder-muted-foreground focus:border-cyan-400 focus:ring-cyan-400/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-300">Active Job</label>
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger className="bg-black/20 border-purple-400/30 text-foreground focus:border-purple-400">
                  <SelectValue placeholder="All Jobs" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-400/30 backdrop-blur-xl z-50">
                  <SelectItem value="all" className="text-white hover:bg-purple-600/20">All Jobs</SelectItem>
                  {jobs.filter(job => job.Processed === 'Yes').map((job) => (
                    <SelectItem key={job.job_id} value={job.job_id} className="text-white hover:bg-purple-600/20">
                      {job.job_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-300">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-black/20 border-pink-400/30 text-foreground focus:border-pink-400">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-pink-400/30 backdrop-blur-xl z-50">
                  <SelectItem value="all" className="text-white hover:bg-pink-600/20">All Status</SelectItem>
                  <SelectItem value="Contacted" className="text-white hover:bg-pink-600/20">Contacted</SelectItem>
                  <SelectItem value="Call Done" className="text-white hover:bg-pink-600/20">Call Done</SelectItem>
                  <SelectItem value="Low Scored" className="text-white hover:bg-pink-600/20">Low Scored</SelectItem>
                  <SelectItem value="Shortlisted" className="text-white hover:bg-pink-600/20">Shortlisted</SelectItem>
                  <SelectItem value="Interview" className="text-white hover:bg-pink-600/20">Interview</SelectItem>
                  <SelectItem value="Hired" className="text-white hover:bg-pink-600/20">Hired</SelectItem>
                  <SelectItem value="Rejected" className="text-white hover:bg-pink-600/20">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-300">Score Range</label>
              <Select value={scoreFilter} onValueChange={setScoreFilter}>
                <SelectTrigger className="bg-black/20 border-emerald-400/30 text-foreground focus:border-emerald-400">
                  <SelectValue placeholder="All Scores" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-emerald-400/30 backdrop-blur-xl z-50">
                  <SelectItem value="all" className="text-white hover:bg-emerald-600/20">All Scores</SelectItem>
                  <SelectItem value="50-74" className="text-white hover:bg-emerald-600/20">50-74</SelectItem>
                  <SelectItem value="75-100" className="text-white hover:bg-emerald-600/20">75-100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Feed */}
      <Card className="bg-card border-border dark:bg-gradient-to-br dark:from-white/10 dark:to-white/5 dark:backdrop-blur-xl dark:border-white/20 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-foreground flex items-center">
              <Users className="w-6 h-6 mr-3 text-cyan-400" />
              Active Candidate Stream
              <Badge className="ml-4 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 text-cyan-300 border-cyan-400/40">
                {filteredCandidates.length} Candidates
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span className="text-yellow-400 text-sm font-medium">Real-time Updates</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {sortedCandidates.map((candidate, index) => {
                const score = parseFloat(candidate.success_score) || 0;
                return (
                  <div 
                    key={index} 
                    className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer
                      bg-gradient-to-r ${index < 3 ? 'from-yellow-400/30 to-amber-500/50' : getScoreGradient(score)} ${index < 3 ? 'border-yellow-400/50 hover:border-yellow-400/60' : 'border-border hover:border-primary/40 dark:border-white/20'}
                      backdrop-blur-sm animate-fade-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => window.location.href = `/call-log-details?candidate=${candidate.Candidate_ID || candidate.candidate_id}&job=${candidate.job_id}&callid=${candidate.callid || ''}`}
                  >
                    {/* Score Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className={`text-lg font-bold px-3 py-1 ${getScoreColor(score)} border`}>
                        {score}
                        <Star className="w-4 h-4 ml-1 fill-current" />
                      </Badge>
                    </div>

                    {/* Candidate Info */}
                    <div className="flex items-start space-x-4 mb-4">
                      <Avatar className="w-16 h-16 border-2 border-cyan-400/50">
                        <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-lg font-bold">
                          {candidate.candidate_name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-foreground">{candidate.candidate_name}</h3>
                          <div className="flex items-center space-x-2">
                            <StatusDropdown
                              currentStatus={candidate.contacted}
                              candidateId={candidate.Candidate_ID || candidate.candidate_id}
                              jobId={candidate.job_id}
                              statusType="contacted"
                              onStatusChange={(newStatus) => {
                                setCandidates(prev => prev.map(c => 
                                  (c.Candidate_ID || c.candidate_id) === (candidate.Candidate_ID || candidate.candidate_id)
                                    ? { ...c, contacted: newStatus }
                                    : c
                                ))
                              }}
                              variant="badge"
                            />
                            <StatusDropdown
                              currentStatus={getCandidateStatus(candidate.Candidate_ID || candidate.candidate_id)}
                              candidateId={candidate.Candidate_ID || candidate.candidate_id}
                              statusType="candidate"
                              onStatusChange={(newStatus) => {
                                setCvData(prev => prev.map(cv => 
                                  (cv.candidate_id || cv.Candidate_ID) === (candidate.Candidate_ID || candidate.candidate_id)
                                    ? { ...cv, CandidateStatus: newStatus }
                                    : cv
                                ))
                              }}
                              variant="badge"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center text-purple-300">
                            <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                            <span className="font-medium">{candidate['Job Title']}</span>
                          </div>
                          <div className="flex items-center text-purple-300">
                            <Mail className="w-4 h-4 mr-2 text-cyan-400" />
                            <span>{candidate.candidate_email}</span>
                          </div>
                          <div className="flex items-center text-purple-300">
                            <Phone className="w-4 h-4 mr-2 text-green-400" />
                            <span>{candidate.candidate_phone_number}</span>
                          </div>
                          <div className="flex items-center text-purple-300">
                            <Clock className="w-4 h-4 mr-2 text-orange-400" />
                            <span>{candidate['Notice Period'] || 'Not specified'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Score Reason */}
                    <div className="bg-black/20 rounded-xl p-4 mb-4 border border-border dark:border-white/10">
                      <h4 className="text-cyan-300 font-medium mb-2">AI Assessment</h4>
                      <p className="text-foreground/90 text-sm leading-relaxed">
                        {candidate['Score and Reason']?.slice(0, 200)}...
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
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
                      
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/40">
                          💰 {candidate['Salary Expectations'] || 'Negotiable'}
                        </Badge>
                        {score >= 74 && (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/40 animate-pulse">
                            ⭐ High Priority
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredCandidates.length === 0 && (
                <div className="text-center py-16">
                  <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No candidates found</h3>
                  <p className="text-gray-400">Try adjusting your filters or search criteria</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}