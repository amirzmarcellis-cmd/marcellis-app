// @ts-nocheck - Updated version v2.0
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Filter, Users, Zap, Activity, Star, Mail, Phone, Briefcase, XCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';
import { useUserRole } from '@/hooks/useUserRole';

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
  candidate_id?: string;
  candidate_name?: string;
  candidate_email?: string;
  job_id?: string;
  success_score?: string;
  after_call_reason?: string;
  callid?: number;
  recordid?: number;
}

interface Job {
  'Job ID': string;
  'Job Title': string;
  'Processed'?: string | null;
  job_id?: string;
  job_title?: string;
}

export default function LiveCandidateFeed() {
  console.log('LiveCandidateFeed component loaded - v2.0');
  
  const { profile } = useProfile();
  const { isAdmin, isManager, isTeamLeader } = useUserRole();
  
  // Force cache reload - this is the updated version without interview functionality
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<string>('all');
  
  const handleRejectCandidate = async (candidateId: string, jobId: string) => {
    const confirmed = window.confirm('Are you sure you want to Reject Candidate?');
    if (!confirmed) return;
    
    try {
      const candidate = candidates.find(c => c.candidate_id === candidateId || c['Candidate_ID'] === candidateId);
      if (candidate) {
        await fetch('https://hook.eu2.make.com/mk46k4ibvs5n5nk1lto9csljygesv75f', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: candidateId,
            Job_Title: candidate['Job Title'],
            Name: candidate['Candidate Name'],
            company_id: 'your_company_id_here'
          })
        });
        toast('Rejection webhook sent successfully!');
      }
      fetchData();
    } catch (error) {
      console.error('Error rejecting candidate:', error);
      toast('Failed to reject candidate');
    }
  };

  const handleCVSubmitted = async (candidateId: string, jobId: string) => {
    try {
      const { error } = await supabase
        .from('Jobs_CVs')
        .update({ 'contacted': 'Submitted' })
        .eq('recordid', parseInt(candidateId))
        .eq('job_id', jobId);

      if (error) throw error;
      toast('CV submitted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error submitting CV:', error);
      toast('Failed to submit CV');
    }
  };

  useEffect(() => {
    if (profile?.user_id) {
      fetchData();
    }
  }, [profile?.user_id, isAdmin, isManager, isTeamLeader]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('LiveFeed: Fetching data for user:', profile?.user_id, 'Roles:', { isAdmin, isManager, isTeamLeader });
      
      // Fetch jobs - only necessary fields, filtered by role
      let jobsQuery = supabase
        .from('Jobs')
        .select('job_id, job_title, Processed, recruiter_id, assignment')
        .eq('Processed', 'Yes');
      
      // Filter jobs based on user role
      const canViewAllJobs = isAdmin || isManager || isTeamLeader;
      console.log('LiveFeed: Can view all jobs:', canViewAllJobs);
      
      if (!canViewAllJobs) {
        const userId = profile?.user_id;
        const email = profile?.email;
        console.log('LiveFeed: Filtering for team member - userId:', userId, 'email:', email);
        
        if (userId && email) {
          jobsQuery = jobsQuery.or(`recruiter_id.eq.${userId},assignment.eq.${email}`);
        } else if (userId) {
          jobsQuery = jobsQuery.eq('recruiter_id', userId);
        } else if (email) {
          jobsQuery = jobsQuery.eq('assignment', email);
        }
      }
      
      const { data: jobsData, error: jobsError } = await jobsQuery;
      console.log('LiveFeed: Jobs fetched:', jobsData?.length || 0, 'Error:', jobsError);
      
      if (jobsError) throw jobsError;
      
      // Fetch Jobs_CVs data (candidates) - only for jobs user has access to
      const jobIds = (jobsData || []).map(job => job.job_id).filter(Boolean);
      console.log('LiveFeed: Job IDs for candidates:', jobIds);
      
      let jobsCvsData: any[] = [];
      if (jobIds.length > 0) {
        const { data, error: jobsCvsError } = await supabase
          .from('Jobs_CVs')
          .select('recordid, candidate_name, candidate_email, candidate_phone_number, job_id, after_call_score, cv_score, after_call_reason, cv_score_reason, contacted, call_summary, after_call_pros, after_call_cons, notice_period, salary_expectations')
          .eq('contacted', 'Call Done')
          .in('job_id', jobIds);
        
        console.log('LiveFeed: Candidates fetched:', data?.length || 0, 'Error:', jobsCvsError);
        if (jobsCvsError) throw jobsCvsError;
        jobsCvsData = data || [];
      } else {
        console.log('LiveFeed: No job IDs, skipping candidate fetch');
      }
      
      // Set jobs data
      setJobs(jobsData?.map(job => ({
        'Job ID': job.job_id,
        'Job Title': job.job_title,
        'Processed': job.Processed,
        job_id: job.job_id,
        job_title: job.job_title
      })) || []);
      
      // Map candidates to expected format (already filtered by query)
      const callDoneCandidates = jobsCvsData?.map(candidate => ({
        'Candidate_ID': candidate.recordid?.toString() || '',
        'Candidate Name': candidate.candidate_name || '',
        'Candidate Email': candidate.candidate_email || '',
        'Candidate Phone Number': candidate.candidate_phone_number || '',
        'Job ID': candidate.job_id || '',
        'Job Title': jobsData?.find(job => job.job_id === candidate.job_id)?.job_title || '',
        'Success Score': candidate.after_call_score?.toString() || candidate.cv_score?.toString() || '0',
        'Score and Reason': candidate.after_call_reason || candidate.cv_score_reason || '',
        'Contacted': candidate.contacted || '',
        'Summary': candidate.call_summary || '',
        'pros': candidate.after_call_pros || '',
        'cons': candidate.after_call_cons || '',
        'Notice Period': candidate.notice_period || '',
        'Salary Expectations': candidate.salary_expectations || '',
        candidate_id: candidate.recordid?.toString() || '',
        candidate_name: candidate.candidate_name || '',
        candidate_email: candidate.candidate_email || '',
        job_id: candidate.job_id || '',
        success_score: candidate.after_call_score?.toString() || candidate.cv_score?.toString() || '0',
        after_call_reason: candidate.after_call_reason || '',
        callid: candidate.recordid || 0,
        recordid: candidate.recordid || 0
      })) || [];
      
      console.log('LiveFeed: Final candidates count:', callDoneCandidates.length);
      setCandidates(callDoneCandidates);
      setLoading(false);
      
    } catch (error) {
      console.error('LiveFeed: Error fetching data:', error);
      toast('Failed to load candidate data');
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = (candidate.candidate_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (candidate['Job Title'] || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = selectedJob === 'all' || candidate.job_id === selectedJob;
    return matchesSearch && matchesJob;
  });

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


  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 overflow-x-auto">
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
            <h3 className="text-6xl sm:text-7xl font-light font-work tracking-tight">
              LIVE CANDIDATE FEED
            </h3>
            <p className="text-base font-light font-inter text-muted-foreground">Call Done Candidates - Ready for Action</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-background/30 px-4 py-2 rounded-full border-2 border-primary/60">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              <span className="text-primary font-light font-inter">LIVE</span>
            </div>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-400/40 px-4 py-2 text-lg font-light font-inter">
              {filteredCandidates.length} Active
            </Badge>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-8 bg-card border-border dark:bg-gradient-to-r dark:from-white/10 dark:to-white/5 dark:backdrop-blur-xl dark:border-white/20 shadow-2xl shadow-purple-500/10">
        <CardHeader>
          <CardTitle className="text-3xl font-light font-work tracking-tight text-foreground flex items-center">
            <Filter className="w-5 h-5 mr-2 text-cyan-400" />
            Advanced Filtering System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-light font-inter uppercase tracking-wide text-muted-foreground">Search Candidates</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4" />
                <Input 
                  placeholder="Name or position..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  className="pl-10 bg-black/20 border-cyan-400/30 text-foreground placeholder-muted-foreground focus:border-cyan-400 focus:ring-cyan-400/20 font-light font-inter" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-light font-inter uppercase tracking-wide text-muted-foreground">Active Job</label>
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger className="bg-black/20 border-purple-400/30 text-foreground focus:border-purple-400">
                  <SelectValue placeholder="All Jobs" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-400/30 backdrop-blur-xl z-50">
                  <SelectItem value="all" className="text-white hover:bg-purple-600/20">All Jobs</SelectItem>
                  {jobs.filter(job => job.Processed === 'Yes').map(job => (
                    <SelectItem key={job.job_id} value={job.job_id || ''} className="text-white hover:bg-purple-600/20">
                      {job.job_title}
                    </SelectItem>
                  ))}
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
            <CardTitle className="text-3xl font-light font-work tracking-tight text-foreground flex items-center">
              <Users className="w-6 h-6 mr-3 text-cyan-400" />
              Call Done Candidates
              <Badge className="ml-4 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 text-cyan-300 border-cyan-400/40 font-light font-inter">
                {filteredCandidates.length} Candidates
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span className="text-yellow-400 text-sm font-light font-inter">Real-time Updates</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {sortedCandidates.map((candidate, index) => {
                const score = parseFloat(candidate.success_score || '0') || 0;
                return (
                  <div 
                    key={index} 
                    className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer
                    bg-gradient-to-r ${index < 3 ? 'from-yellow-400/30 to-amber-500/50' : getScoreGradient(score)} 
                    ${index < 3 ? 'border-yellow-400/50 hover:border-yellow-400/60' : 'border-border hover:border-primary/40 dark:border-white/20'}
                    backdrop-blur-sm animate-fade-in`} 
                    style={{ animationDelay: `${index * 0.1}s` }} 
                    onClick={() => window.location.href = `/call-log-details/${candidate.recordid || candidate.callid}`}
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
                        <div className="mb-3">
                          <h3 className="text-3xl font-light font-work tracking-tight text-foreground">{candidate.candidate_name}</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-light font-inter">
                          <div className="flex items-center text-muted-foreground">
                            <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                            <span>{candidate['Job Title']}</span>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Mail className="w-4 h-4 mr-2 text-cyan-400" />
                            <span>{candidate.candidate_email}</span>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Phone className="w-4 h-4 mr-2 text-green-400" />
                            <span>{candidate.candidate_phone_number}</span>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Briefcase className="w-4 h-4 mr-2 text-orange-400" />
                            <span>💰 {candidate['Salary Expectations'] || 'Negotiable'}</span>
                          </div>
                        </div>

                        {/* After Call Reason */}
                        {candidate.after_call_reason && (
                          <div className="mt-3 p-3 bg-black/20 rounded-lg">
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {candidate.after_call_reason.slice(0, 200)}...
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-4 border-t border-border/20">
                      <div className="flex items-center justify-end">
                        <div className="flex items-center space-x-3">
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={e => {
                              e.stopPropagation();
                              handleRejectCandidate(candidate.Candidate_ID || candidate.candidate_id || '', candidate.job_id || candidate['Job ID'] || '');
                            }} 
                            className="bg-red-500 hover:bg-red-600 text-white border-2 border-red-400 hover:border-red-300"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject Candidate
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="default" 
                            onClick={e => {
                              e.stopPropagation();
                              handleCVSubmitted(candidate.Candidate_ID || candidate.candidate_id || '', candidate.job_id || candidate['Job ID'] || '');
                            }} 
                            className="bg-green-500 hover:bg-green-600 text-white border-2 border-green-400 hover:border-green-300"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Submit CV
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredCandidates.length === 0 && (
                <div className="text-center py-16">
                  <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No candidates found</h3>
                  <p className="text-gray-400">No candidates with "Call Done" status found. Try adjusting your filters.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}