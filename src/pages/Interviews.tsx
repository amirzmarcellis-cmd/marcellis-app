import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, Video, Phone, Calendar as CalendarIcon, Clock, MapPin, Briefcase, Mail, PhoneCall, User, Users } from 'lucide-react';
import { HeroHeader } from '@/components/dashboard/HeroHeader';
import { toast } from 'sonner';
import { format, parseISO, isSameDay } from 'date-fns';
import { useCompanyContext } from '@/contexts/CompanyContext';

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

interface Candidate {
  candidate_id: string;
  first_name: string | null;
  last_name: string | null;
  Email: string | null;
  phone_number: string | null;
  Title: string | null;
  Location: string | null;
  Skills: string | null;
}

interface Job {
  job_id: string;
  job_title: string;
  job_location: string | null;
}

export default function Interviews() {
  const { currentCompany } = useCompanyContext();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (currentCompany?.id) {
      fetchInterviews();
    }
  }, [currentCompany?.id]);

  const fetchInterviews = async () => {
    if (!currentCompany?.id) return;

    try {
      // Fetch interviews for current company
      const { data: interviewsData, error: interviewsError } = await supabase
        .from('interview')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (interviewsError) throw interviewsError;

      // Fetch candidates for current company
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('CVs')
        .select('candidate_id, first_name, last_name, Email, phone_number, Title, Location, Skills')
        .eq('company_id', currentCompany.id);

      if (candidatesError) throw candidatesError;

      // Fetch jobs for current company
      const { data: jobsData, error: jobsError } = await supabase
        .from('Jobs')
        .select('job_id, job_title, job_location')
        .eq('company_id', currentCompany.id);

      if (jobsError) throw jobsError;

      setInterviews((interviewsData as Interview[]) || []);
      setCandidates(candidatesData || []);
      setJobs(jobsData || []);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast.error('Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  };

  const getCandidate = (candidateId: string) => {
    return candidates.find(c => c.candidate_id === candidateId);
  };

  const getJob = (jobId: string) => {
    return jobs.find(j => j.job_id === jobId);
  };

  const filteredInterviews = interviews.filter(interview => {
    const candidate = getCandidate(interview.candidate_id);
    const job = getJob(interview.job_id);
    const candidateName = `${candidate?.first_name || ''} ${candidate?.last_name || ''}`.trim();
    
    const matchesSearch = candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (job?.job_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.intid.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || interview.intstatus === statusFilter;
    const matchesType = typeFilter === 'all' || interview.inttype === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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

  const updateStatus = async (interviewId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('interview')
        .update({ intstatus: newStatus })
        .eq('intid', interviewId);

      if (error) throw error;

      setInterviews(prev => 
        prev.map(interview => 
          interview.intid === interviewId 
            ? { ...interview, intstatus: newStatus }
            : interview
        )
      );

      toast.success('Interview status updated successfully');
    } catch (error) {
      console.error('Error updating interview status:', error);
      toast.error('Failed to update interview status');
    }
  };

  // Get interviews with confirmed times for calendar
  const getConfirmedInterviews = () => {
    return interviews.filter(interview => 
      interview.chosen_time && 
      interview.intstatus === 'Scheduled'
    );
  };

  // Get interviews for a specific date
  const getInterviewsForDate = (date: Date) => {
    const confirmedInterviews = getConfirmedInterviews();
    return confirmedInterviews.filter(interview => {
      if (!interview.chosen_time) return false;
      try {
        const interviewDate = parseISO(interview.chosen_time);
        return isSameDay(interviewDate, date);
      } catch {
        return false;
      }
    });
  };

  // Check if a date has interviews
  const hasInterviewsOnDate = (date: Date) => {
    return getInterviewsForDate(date).length > 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-cyan-400/30 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-t-cyan-400 rounded-full animate-spin"></div>
          </div>
          <p className="text-cyan-400 text-xl font-medium mt-6 animate-pulse">
            Loading Interviews...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeroHeader
        title="Interviews"
        subtitle="Manage scheduled interviews with candidates"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-1">
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-purple-500/5 to-cyan-500/5 backdrop-blur-xl border border-primary/20 sticky top-6 shadow-2xl shadow-primary/10">
            {/* Futuristic background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02] pointer-events-none" />
            
            <div className="relative p-6 space-y-6">
              {/* Header with futuristic styling */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm animate-pulse" />
                  <CalendarIcon className="relative w-6 h-6 text-primary drop-shadow-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    Interview Calendar
                  </h3>
                  <p className="text-xs text-muted-foreground/80">Select a date to view scheduled interviews</p>
                </div>
              </div>
              
              {/* Enhanced Calendar Container */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-500 rounded-xl blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                <div className="relative bg-background/80 backdrop-blur-sm rounded-xl border border-primary/30 p-4 shadow-inner">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="pointer-events-auto w-full [&_.rdp-months]:justify-center [&_.rdp-caption_label]:text-primary [&_.rdp-caption_label]:font-semibold [&_.rdp-head_cell]:text-muted-foreground/80 [&_.rdp-head_cell]:font-medium [&_.rdp-nav_button]:border-primary/20 [&_.rdp-nav_button]:hover:bg-primary/10 [&_.rdp-nav_button]:hover:border-primary/40 [&_.rdp-nav_button]:transition-all [&_.rdp-day]:transition-all [&_.rdp-day]:hover:bg-primary/10 [&_.rdp-day]:hover:scale-105 [&_.rdp-day_selected]:bg-primary [&_.rdp-day_selected]:text-primary-foreground [&_.rdp-day_selected]:shadow-lg [&_.rdp-day_selected]:shadow-primary/30 [&_.rdp-day_today]:bg-secondary/50 [&_.rdp-day_today]:text-secondary-foreground [&_.rdp-day_today]:font-bold [&_.rdp-day_today]:ring-2 [&_.rdp-day_today]:ring-primary/30"
                    modifiers={{
                      hasInterview: (date) => hasInterviewsOnDate(date)
                    }}
                    modifiersStyles={{
                      hasInterview: {
                        background: 'linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--secondary) / 0.2))',
                        color: 'hsl(var(--primary))',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        border: '2px solid hsl(var(--primary) / 0.6)',
                        boxShadow: '0 0 20px hsl(var(--primary) / 0.3), inset 0 0 10px hsl(var(--primary) / 0.1)',
                        transform: 'scale(1.05)',
                        position: 'relative',
                        zIndex: 10
                      }
                    }}
                  />
                </div>
              </div>
              
              {/* Enhanced Selected Date Info */}
              {selectedDate && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur-sm opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                  <div className="relative bg-gradient-to-br from-primary/10 via-purple-500/5 to-cyan-500/10 backdrop-blur-sm border border-primary/30 rounded-xl p-5 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-sm animate-pulse" />
                        <Clock className="relative w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-lg">{format(selectedDate, 'MMMM d, yyyy')}</h4>
                        <p className="text-xs text-muted-foreground/80">Scheduled interviews for this date</p>
                      </div>
                    </div>
                    
                    <ScrollArea className="max-h-56">
                      <div className="space-y-3">
                        {getInterviewsForDate(selectedDate).map((interview) => {
                          const candidate = getCandidate(interview.candidate_id);
                          const job = getJob(interview.job_id);
                          const candidateName = `${candidate?.first_name || ''} ${candidate?.last_name || ''}`.trim();
                          
                          return (
                            <div key={interview.intid} className="relative group/item">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg blur-sm opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                              <div className="relative bg-background/60 backdrop-blur-sm rounded-lg border border-primary/20 p-3 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="p-1.5 bg-primary/20 rounded-full">
                                    {getTypeIcon(interview.inttype)}
                                  </div>
                                  <span className="font-semibold text-foreground text-sm truncate">{candidateName}</span>
                                </div>
                                <div className="text-xs text-muted-foreground/90 mb-2 truncate pl-8">{job?.job_title}</div>
                                <div className="flex items-center gap-2 pl-8">
                                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                                  <span className="text-xs font-bold text-cyan-400">
                                    {interview.chosen_time ? format(parseISO(interview.chosen_time), 'HH:mm') : 'TBD'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {getInterviewsForDate(selectedDate).length === 0 && (
                          <div className="text-center py-8">
                            <div className="relative">
                              <div className="absolute inset-0 bg-muted-foreground/10 rounded-full blur-xl" />
                              <CalendarIcon className="relative w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                            </div>
                            <p className="text-sm text-muted-foreground/70 font-medium">No interviews scheduled</p>
                            <p className="text-xs text-muted-foreground/50 mt-1">Select another date to view interviews</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Filters and Interviews Section */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters */}
          <Card className="p-6 bg-card border-border dark:bg-gradient-card dark:backdrop-blur-glass">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by candidate name, job title, or interview ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-background/50 border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px] bg-background/50 border-border">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Online Meeting">Online Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Interviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredInterviews.map((interview) => {
          const candidate = getCandidate(interview.candidate_id);
          const job = getJob(interview.job_id);
          const candidateName = `${candidate?.first_name || ''} ${candidate?.last_name || ''}`.trim();
          const candidateInitials = `${candidate?.first_name?.[0] || ''}${candidate?.last_name?.[0] || ''}`;

          return (
            <Card key={interview.intid} className="bg-card border-border dark:bg-gradient-to-br dark:from-white/5 dark:via-white/3 dark:to-white/5 dark:backdrop-blur-lg dark:border-white/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {interview.intid}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(interview.inttype)}
                    <Badge className={getStatusColor(interview.intstatus)} variant="outline">
                      {interview.intstatus}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Candidate Info */}
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12 border-2 border-cyan-400/50">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white font-bold">
                      {candidateInitials || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {candidateName || 'Unknown Candidate'}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {candidate?.Email || 'No email'}
                    </p>
                  </div>
                </div>

                {/* Job Info */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Briefcase className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <span className="truncate">{job?.job_title || 'Unknown Position'}</span>
                </div>

                {/* Interview Type */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {getTypeIcon(interview.inttype)}
                  <span>{interview.inttype}</span>
                </div>

                {/* Chosen Time */}
                {interview.chosen_time && (
                  <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span className="font-semibold text-foreground">Chosen Time:</span>
                    </div>
                    <p className="text-sm font-medium text-cyan-400 mt-1">{interview.chosen_time}</p>
                  </div>
                )}

                {/* Interview Slots */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Interview Slots:</h4>
                  <div className="space-y-1">
                    {[interview.appoint1, interview.appoint2, interview.appoint3].map((slot, index) => (
                      slot && (
                        <div key={index} className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <CalendarIcon className="w-3 h-3 text-cyan-400" />
                          <span>{slot}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Select
                    value={interview.intstatus}
                    onValueChange={(value) => updateStatus(interview.intid, value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {candidate?.phone_number && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          const response = await fetch('https://hook.eu2.make.com/iqzrkr3av3h6j5t6kqy45043kytq8t6s', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              inttype: interview.inttype,
                              job_id: interview.job_id,
                              candidate_id: interview.candidate_id,
                              callid: interview.callid,
                              appoint1: interview.appoint1,
                              appoint2: interview.appoint2,
                              appoint3: interview.appoint3
                            })
                          });
                          
                          if (response.ok) {
                            toast.success('Call request sent successfully');
                          } else {
                            toast.error('Failed to send call request');
                          }
                        } catch (error) {
                          console.error('Error sending call request:', error);
                          toast.error('Failed to send call request');
                        }
                      }}
                      className="px-3 gap-2"
                    >
                      <PhoneCall className="w-4 h-4" />
                      Call Candidate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
            })}
          </div>
        </div>
      </div>

      {filteredInterviews.length === 0 && !loading && (
        <div className="lg:col-span-3 lg:col-start-2">
          <Card className="p-12 text-center bg-card border-border dark:bg-gradient-card dark:backdrop-blur-glass">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Interviews Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'No interviews have been scheduled yet.'}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}