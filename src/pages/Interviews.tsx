import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Filter, Video, Phone, Calendar, Clock, MapPin, Briefcase, Mail, PhoneCall, User, Users } from 'lucide-react';
import { HeroHeader } from '@/components/dashboard/HeroHeader';
import { toast } from 'sonner';

interface Interview {
  intid: string;
  candidate_id: string;
  job_id: string;
  callid: number;
  appoint1: string;
  appoint2: string;
  appoint3: string;
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
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      // Fetch interviews
      const { data: interviewsData, error: interviewsError } = await supabase
        .from('interview')
        .select('*')
        .order('created_at', { ascending: false });

      if (interviewsError) throw interviewsError;

      // Fetch candidates
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('CVs')
        .select('candidate_id, first_name, last_name, Email, phone_number, Title, Location, Skills');

      if (candidatesError) throw candidatesError;

      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('Jobs')
        .select('job_id, job_title, job_location');

      if (jobsError) throw jobsError;

      setInterviews(interviewsData || []);
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
    switch (status) {
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                {/* Interview Slots */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Interview Slots:</h4>
                  <div className="space-y-1">
                    {[interview.appoint1, interview.appoint2, interview.appoint3].map((slot, index) => (
                      slot && (
                        <div key={index} className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 text-cyan-400" />
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {candidate?.phone_number && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`tel:${candidate.phone_number}`, '_self')}
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

      {filteredInterviews.length === 0 && !loading && (
        <Card className="p-12 text-center bg-card border-border dark:bg-gradient-card dark:backdrop-blur-glass">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Interviews Found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'No interviews have been scheduled yet.'}
          </p>
        </Card>
      )}
    </div>
  );
}