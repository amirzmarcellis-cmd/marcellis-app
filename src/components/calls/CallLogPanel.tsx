// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Clock, User, FileText, MessageSquare, Plus, Search, Filter } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface CallLog {
  id: string;
  candidate_id: string;
  job_id: string | null;
  recruiter_id: string;
  call_type: string;
  call_status: string;
  duration: number;
  recruiter_notes: string | null;
  call_timestamp: string;
  created_at: string;
}

interface Candidate {
  'Cadndidate_ID': string;
  'First Name': string;
  'Last Name': string;
  'Email': string;
  'Phone Number': string;
  'Title': string;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  tagged_users: string[];
}

export default function CallLogPanel() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  // New call form
  const [newCall, setNewCall] = useState({
    candidate_id: '',
    job_id: '',
    call_type: 'outbound',
    call_status: 'no_answer',
    duration: 0,
    recruiter_notes: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch call logs
      const { data: callData, error: callError } = await supabase
        .from('call_logs')
        .select('*')
        .order('call_timestamp', { ascending: false });

      if (callError) throw callError;

      // Fetch candidates
      const { data: candidateData, error: candidateError } = await supabase
        .from('CVs')
        .select('*');

      if (candidateError) throw candidateError;

      setCallLogs(callData || []);
      setCandidates(candidateData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch call logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (callId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('entity_type', 'call_log')
        .eq('entity_id', callId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSaveCall = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const callData = {
        ...newCall,
        recruiter_id: user.id,
        call_timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('call_logs')
        .insert([callData]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Call log saved successfully',
      });

      setIsCallDialogOpen(false);
      setNewCall({
        candidate_id: '',
        job_id: '',
        call_type: 'outbound',
        call_status: 'no_answer',
        duration: 0,
        recruiter_notes: ''
      });
      
      fetchData();
    } catch (error) {
      console.error('Error saving call:', error);
      toast({
        title: 'Error',
        description: 'Failed to save call log',
        variant: 'destructive',
      });
    }
  };

  const handleAddComment = async () => {
    if (!selectedCall || !newComment.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('comments')
        .insert([{
          entity_type: 'call_log',
          entity_id: selectedCall.id,
          user_id: user.id,
          content: newComment,
          tagged_users: []
        }]);

      if (error) throw error;

      setNewComment('');
      fetchComments(selectedCall.id);
      
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    }
  };

  const getCandidate = (candidateId: string) => {
    return candidates.find(c => c['Cadndidate_ID'] === candidateId);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'answered': return 'default';
      case 'no_answer': return 'secondary';
      case 'busy': return 'outline';
      case 'voicemail': return 'secondary';
      default: return 'outline';
    }
  };

  const filteredCallLogs = callLogs.filter(call => {
    const candidate = getCandidate(call.candidate_id);
    const candidateName = candidate ? `${candidate['First Name']} ${candidate['Last Name']}` : '';
    
    const matchesSearch = candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.recruiter_notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || call.call_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Mission Control Header */}
      <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-900/50 to-slate-900/50 backdrop-blur-md border border-blue-500/20 rounded-xl shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center animate-pulse">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              MISSION CONTROL CENTER
            </h2>
            <p className="text-blue-200">Advanced Recruitment Command Hub</p>
          </div>
        </div>
        
        <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border border-blue-400/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Plus className="h-4 w-4 mr-2" />
              INITIATE CALL LOG
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-br from-slate-900 to-blue-900 border border-blue-500/30 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-blue-400 text-xl">INITIALIZE NEW CALL PROTOCOL</DialogTitle>
              <DialogDescription className="text-blue-200">Configure mission parameters for candidate contact</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="relative">
                <label className="text-sm font-medium text-blue-300 mb-2 block">TARGET CANDIDATE</label>
                <Select value={newCall.candidate_id} onValueChange={(value) => setNewCall({...newCall, candidate_id: value})}>
                  <SelectTrigger className="bg-slate-800/50 border-blue-500/30 text-white">
                    <SelectValue placeholder="Select mission target" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-blue-500/30">
                    {candidates.map(candidate => (
                      <SelectItem key={candidate['Cadndidate_ID']} value={candidate['Cadndidate_ID']} className="text-white hover:bg-blue-600/20">
                        {candidate['First Name']} {candidate['Last Name']} - {candidate['Title']}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-blue-300 mb-2 block">TRANSMISSION TYPE</label>
                  <Select value={newCall.call_type} onValueChange={(value) => setNewCall({...newCall, call_type: value})}>
                    <SelectTrigger className="bg-slate-800/50 border-blue-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-blue-500/30">
                      <SelectItem value="outbound" className="text-white hover:bg-blue-600/20">Outbound Signal</SelectItem>
                      <SelectItem value="inbound" className="text-white hover:bg-blue-600/20">Incoming Signal</SelectItem>
                      <SelectItem value="follow_up" className="text-white hover:bg-blue-600/20">Follow-up Protocol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-blue-300 mb-2 block">MISSION STATUS</label>
                  <Select value={newCall.call_status} onValueChange={(value) => setNewCall({...newCall, call_status: value})}>
                    <SelectTrigger className="bg-slate-800/50 border-blue-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-blue-500/30">
                      <SelectItem value="answered" className="text-white hover:bg-blue-600/20">Connection Established</SelectItem>
                      <SelectItem value="no_answer" className="text-white hover:bg-blue-600/20">No Response</SelectItem>
                      <SelectItem value="busy" className="text-white hover:bg-blue-600/20">Target Busy</SelectItem>
                      <SelectItem value="voicemail" className="text-white hover:bg-blue-600/20">Voice Log Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-blue-300 mb-2 block">DURATION (Minutes)</label>
                <Input
                  type="number"
                  value={newCall.duration}
                  onChange={(e) => setNewCall({...newCall, duration: parseInt(e.target.value) || 0})}
                  placeholder="0"
                  className="bg-slate-800/50 border-blue-500/30 text-white placeholder-blue-300/50"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-blue-300 mb-2 block">MISSION REPORT</label>
                <Textarea
                  value={newCall.recruiter_notes}
                  onChange={(e) => setNewCall({...newCall, recruiter_notes: e.target.value})}
                  placeholder="Enter detailed mission observations and outcomes..."
                  rows={3}
                  className="bg-slate-800/50 border-blue-500/30 text-white placeholder-blue-300/50"
                />
              </div>
              
              <Button onClick={handleSaveCall} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 border border-green-400/50 shadow-lg">
                SAVE MISSION LOG
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Control Panel Filters */}
      <Card className="bg-gradient-to-r from-slate-900/80 to-blue-900/80 backdrop-blur-md border border-blue-500/30 shadow-2xl">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                <Input
                  placeholder="Search mission logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-blue-500/30 text-white placeholder-blue-300/50"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-slate-800/50 border-blue-500/30 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-blue-500/30">
                <SelectItem value="all" className="text-white hover:bg-blue-600/20">All Status</SelectItem>
                <SelectItem value="answered" className="text-white hover:bg-blue-600/20">Connection Established</SelectItem>
                <SelectItem value="no_answer" className="text-white hover:bg-blue-600/20">No Response</SelectItem>
                <SelectItem value="busy" className="text-white hover:bg-blue-600/20">Target Busy</SelectItem>
                <SelectItem value="voicemail" className="text-white hover:bg-blue-600/20">Voice Log Left</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mission Logs Grid */}
      <div className="grid gap-4">
        {filteredCallLogs.map(call => {
          const candidate = getCandidate(call.candidate_id);
          
          return (
            <Card key={call.id} className="bg-gradient-to-r from-slate-900/90 to-blue-900/90 backdrop-blur-md border border-blue-500/30 hover:border-cyan-400/60 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] shadow-xl hover:shadow-2xl hover:shadow-blue-500/20"
                  onClick={() => {
                    setSelectedCall(call);
                    fetchComments(call.id);
                  }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="w-12 h-12 border-2 border-blue-400/50">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                          {candidate ? `${candidate['First Name']?.[0]}${candidate['Last Name']?.[0]}` : 'UN'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        {candidate ? `${candidate['First Name']} ${candidate['Last Name']}` : 'UNKNOWN TARGET'}
                      </h3>
                      <p className="text-blue-300 text-sm">
                        {candidate?.['Title']} • {candidate?.['Email']}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <Badge className={`${getStatusVariant(call.call_status) === 'default' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 
                                                getStatusVariant(call.call_status) === 'secondary' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 
                                                'bg-red-500/20 text-red-400 border-red-500/50'} font-bold uppercase tracking-wider`}>
                      {call.call_status.replace('_', ' ')}
                    </Badge>
                    
                    <div className="text-right text-sm text-blue-200 space-y-1">
                      <div className="flex items-center text-cyan-400">
                        <Phone className="h-4 w-4 mr-2" />
                        <span className="font-mono">{call.call_type.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center text-blue-300">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="font-mono">{call.duration}m</span>
                      </div>
                      <div className="text-blue-400 font-mono">
                        {formatDate(call.call_timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {call.recruiter_notes && (
                  <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-blue-500/20">
                    <p className="text-blue-200 text-sm font-mono">{call.recruiter_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mission Detail Protocol Dialog */}
      {selectedCall && (
        <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
          <DialogContent className="bg-gradient-to-br from-slate-900 to-blue-900 border border-blue-500/30 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-blue-400 tracking-wider">MISSION BRIEFING</DialogTitle>
              <DialogDescription className="text-blue-200">
                {(() => {
                  const candidate = getCandidate(selectedCall.candidate_id);
                  return candidate ? `Target: ${candidate['First Name']} ${candidate['Last Name']}` : 'Unknown Target';
                })()}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-blue-500/30">
                <TabsTrigger value="details" className="data-[state=active]:bg-blue-600/50 data-[state=active]:text-white">Mission Intel</TabsTrigger>
                <TabsTrigger value="comments" className="data-[state=active]:bg-blue-600/50 data-[state=active]:text-white">Communications ({comments.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6 mt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-300 uppercase tracking-wider">Transmission Type</label>
                    <p className="text-cyan-400 font-mono text-lg capitalize bg-slate-800/30 p-2 rounded border border-blue-500/20">{selectedCall.call_type}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-300 uppercase tracking-wider">Mission Status</label>
                    <Badge className={`${getStatusVariant(selectedCall.call_status) === 'default' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 
                                                    getStatusVariant(selectedCall.call_status) === 'secondary' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 
                                                    'bg-red-500/20 text-red-400 border-red-500/50'} font-bold uppercase tracking-wider text-base p-2`}>
                      {selectedCall.call_status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-300 uppercase tracking-wider">Duration</label>
                    <p className="text-cyan-400 font-mono text-lg bg-slate-800/30 p-2 rounded border border-blue-500/20">{selectedCall.duration} minutes</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-300 uppercase tracking-wider">Timestamp</label>
                    <p className="text-cyan-400 font-mono bg-slate-800/30 p-2 rounded border border-blue-500/20">
                      {formatDate(selectedCall.call_timestamp)}
                    </p>
                  </div>
                </div>
                
                {selectedCall.recruiter_notes && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-300 uppercase tracking-wider">Mission Report</label>
                    <div className="bg-slate-800/50 rounded-lg border border-blue-500/20 p-4">
                      <p className="text-blue-200 font-mono leading-relaxed">{selectedCall.recruiter_notes}</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="comments" className="space-y-4 mt-6">
                <div className="space-y-4 max-h-64 overflow-y-auto bg-slate-800/30 p-4 rounded-lg border border-blue-500/20">
                  {comments.length === 0 ? (
                    <p className="text-blue-300 text-center font-mono">No communications logged</p>
                  ) : (
                    comments.map(comment => (
                      <div key={comment.id} className="bg-slate-700/50 p-3 rounded border border-blue-500/20">
                        <p className="text-blue-200 font-mono text-sm">{comment.content}</p>
                        <p className="text-blue-400 text-xs mt-2 font-mono">
                          {formatDate(comment.created_at)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Add mission communication..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="bg-slate-800/50 border-blue-500/30 text-white placeholder-blue-300/50"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <Button 
                    onClick={handleAddComment}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border border-blue-400/50"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}