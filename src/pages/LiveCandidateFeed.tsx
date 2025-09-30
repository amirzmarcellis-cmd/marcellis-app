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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Search, Filter, Users, Zap, Activity, Star, Clock, Mail, Phone, MapPin, Briefcase, XCircle, Calendar, UserCheck, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

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
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<{candidateId: string, jobId: string, callid: number, intid?: string} | null>(null);
  const [interviewSlots, setInterviewSlots] = useState<{date: Date | undefined, time: string}[]>([
    { date: undefined, time: '' },
    { date: undefined, time: '' },
    { date: undefined, time: '' }
  ]);
  const [interviewType, setInterviewType] = useState<string>('Phone');
  const [interviewLink, setInterviewLink] = useState<string>('');
  
  const handleRejectCandidate = async (candidateId: string, jobId: string) => {
    // Show confirmation alert
    const confirmed = window.confirm('Are you sure you want to Reject Candidate?');
    if (!confirmed) {
      return; // User cancelled, don't proceed
    }
    try {
      // Send webhook to Make.com first
      const candidate = candidates.find(c => c.candidate_id === candidateId || c['Candidate_ID'] === candidateId);
      if (candidate) {
        try {
          await fetch('https://hook.eu2.make.com/mk46k4ibvs5n5nk1lto9csljygesv75f', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              candidate_id: candidateId,
              Job_Title: candidate['Job Title'],
              Name: candidate['Candidate Name'],
              company_id: 'your_company_id_here'
            })
          });
          
          toast('Rejection webhook sent successfully!');
        } catch (webhookError) {
          console.error('Webhook error:', webhookError);
          toast('Failed to send rejection notification');
        }
      }

      // Refresh data to show updated status
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
      fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error submitting CV:', error);
      toast('Failed to submit CV');
    }
  };
  const handleArrangeInterview = (candidateId: string) => {
    const candidate = candidates.find(c => c.Candidate_ID === candidateId || c.candidate_id === candidateId);
    if (candidate) {
      setSelectedCandidate({
        candidateId,
        jobId: candidate.job_id || candidate.Job_ID || '',
        callid: candidate.callid || 0
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
      // Update candidate status
      await supabase.from('CVs').update({
        CandidateStatus: 'Interview'
      }).eq('candidate_id', selectedCandidate.candidateId);

      // Format appointments
      const appointments = validSlots.map(slot => 
        `${format(slot.date!, 'yyyy-MM-dd')} ${slot.time}`
      );

      // Create interview record
      const { data: interviewData, error: interviewError } = await supabase
        .from('interview')
        .insert({
          candidate_id: selectedCandidate.candidateId,
          job_id: selectedCandidate.jobId,
          callid: selectedCandidate.callid,
          appoint1: appointments[0],
          appoint2: appointments[1],
          appoint3: appointments[2],
          inttype: interviewType,
          intlink: interviewType === 'Online Meeting' ? interviewLink : null,
          company_id: null
        })
        .select('intid')
        .maybeSingle();

      if (interviewError) {
        console.error('Interview creation error:', interviewError);
        throw interviewError;
      }

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
          intid: interviewData?.intid,
          appointment1: appointments[0],
          appointment2: appointments[1],
          appointment3: appointments[2],
          inttype: interviewType,
          intlink: interviewType === 'Online Meeting' ? interviewLink : null
        })
      });

      // Close dialog and refresh data
      setInterviewDialogOpen(false);
      setSelectedCandidate(null);
      setInterviewType('Phone');
      setInterviewLink('');
      fetchData();
      
      toast("Interview scheduled successfully!");
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast("Failed to schedule interview. Please try again.");
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

  // Check if candidate has pending or scheduled interview
  const getCandidateInterviewStatus = (candidateId: string) => {
    const candidateInterviews = interviews.filter(interview => interview.candidate_id === candidateId && (interview.intstatus === 'Scheduled' || interview.intstatus === 'Pending'));
    return candidateInterviews.length > 0 ? candidateInterviews[0].intstatus : null;
  };
  const handleHireCandidate = async (candidateId: string) => {
    try {
      const {
        error
      } = await supabase.from('CVs').update({
        CandidateStatus: 'Hired'
      }).eq('candidate_id', candidateId);
      if (error) throw error;

      // Refresh data
      fetchData();
      toast.success('Candidate hired successfully!');
    } catch (error) {
      console.error('Error hiring candidate:', error);
      toast.error('Failed to hire candidate');
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('Jobs')
        .select('*')
        .eq('Processed', 'Yes');
      
      if (jobsError) throw jobsError;
      
      // Fetch Jobs_CVs data (candidates)
      const { data: jobsCvsData, error: jobsCvsError } = await supabase
        .from('Jobs_CVs')
        .select('*');
      
      if (jobsCvsError) throw jobsCvsError;
      
      // Set jobs data
      setJobs(jobsData?.map(job => ({
        'Job ID': job.job_id,
        'Job Title': job.job_title,
        'Processed': job.Processed
      })) || []);
      
      // Filter for "Call Done" candidates and map to expected format
      const callDoneCandidates = jobsCvsData?.filter(c => c.contacted === 'Call Done').map(candidate => ({
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
        // Additional fields for compatibility
        candidate_id: candidate.recordid?.toString() || '',
        candidate_name: candidate.candidate_name || '',
        candidate_email: candidate.candidate_email || '',
        candidate_phone_number: candidate.candidate_phone_number || '',
        job_id: candidate.job_id || '',
        success_score: candidate.after_call_score?.toString() || candidate.cv_score?.toString() || '0',
        after_call_reason: candidate.after_call_reason || '',
        callid: candidate.recordid || 0,
        recordid: candidate.recordid || 0
      })) || [];
      
      setCandidates(callDoneCandidates);
      setCvData([]);
      setInterviews([]);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast('Failed to load candidate data');
    } finally {
      setLoading(false);
    }
  };
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = (candidate.candidate_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (candidate['Job Title'] || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = selectedJob === 'all' || candidate.job_id === selectedJob;
    return matchesSearch && matchesJob;
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
    const cvRecord = cvData.find(cv => cv.candidate_id === candidateId || cv.Candidate_ID === candidateId);
    return cvRecord?.CandidateStatus || null;
  };
  if (loading) {
    return <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-cyan-400/30 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-t-cyan-400 rounded-full animate-spin"></div>
          </div>
          <p className="text-cyan-400 text-xl font-medium mt-6 animate-pulse">
            Initializing Live Feed...
          </p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-blue-900 p-4 sm:p-6 overflow-x-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-300">Search Candidates</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4" />
                <Input placeholder="Name or position..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-black/20 border-cyan-400/30 text-foreground placeholder-muted-foreground focus:border-cyan-400 focus:ring-cyan-400/20" />
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
                  {jobs.filter(job => job.Processed === 'Yes').map(job => <SelectItem key={job.job_id} value={job.job_id} className="text-white hover:bg-purple-600/20">
                      {job.job_title}
                    </SelectItem>)}
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
              return <div key={index} className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer
                      bg-gradient-to-r ${index < 3 ? 'from-yellow-400/30 to-amber-500/50' : getScoreGradient(score)} ${index < 3 ? 'border-yellow-400/50 hover:border-yellow-400/60' : 'border-border hover:border-primary/40 dark:border-white/20'}
                      backdrop-blur-sm animate-fade-in`} style={{
                animationDelay: `${index * 0.1}s`
              }} onClick={() => window.location.href = `/call-log-details/${candidate.recordid || candidate.callid}`}>
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
                          <h3 className="text-xl font-bold text-foreground">{candidate.candidate_name}</h3>
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
                            <Briefcase className="w-4 h-4 mr-2 text-orange-400" />
                            <span>💰 {candidate.salary_expectations || 'Negotiable'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-4 border-t border-border/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="destructive" onClick={e => {
                        e.stopPropagation();
                        handleRejectCandidate(candidate.Candidate_ID || candidate.candidate_id, candidate.job_id);
                      }} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject Candidate
                          </Button>
                          
                          {(() => {
                        const interviewStatus = getCandidateInterviewStatus(candidate.Candidate_ID || candidate.candidate_id);
                        if (interviewStatus) {
                          return <Button size="sm" variant="outline" disabled className="border-blue-400/40 text-blue-400">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {interviewStatus}
                                </Button>;
                        }
                        return <Button size="sm" variant="outline" onClick={e => {
                          e.stopPropagation();
                          handleArrangeInterview(candidate.Candidate_ID || candidate.candidate_id);
                        }} className="bg-transparent border-2 border-green-500 text-green-600 hover:bg-green-100 hover:border-green-600 hover:text-green-700 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/30 dark:hover:border-green-300 dark:hover:text-green-300 transition-all duration-200">
                                <Calendar className="w-4 h-4 mr-1" />
                                Arrange an Interview
                              </Button>;
                      })()}
                          
                           <Button size="sm" variant="default" onClick={e => {
                         e.stopPropagation();
                         handleCVSubmitted(candidate.Candidate_ID || candidate.candidate_id, candidate.job_id || candidate['Job ID']);
                       }} className="bg-green-500 hover:bg-green-600 text-white border-2 border-green-400 hover:border-green-300 shadow-md hover:shadow-lg transition-all duration-200">
                             <CheckCircle className="w-4 h-4 mr-1" />
                             Submit CV
                           </Button>
                        </div>
                      </div>
                    </div>
                  </div>;
            })}
              
              {filteredCandidates.length === 0 && <div className="text-center py-16">
                  <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No candidates found</h3>
                  <p className="text-gray-400">Try adjusting your filters or search criteria</p>
                </div>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

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