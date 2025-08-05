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
import { format } from 'date-fns';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Call Center</h2>
          <p className="text-muted-foreground">Manage candidate communications and track call activities</p>
        </div>
        
        <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mission-control-button">
              <Plus className="h-4 w-4 mr-2" />
              Log New Call
            </Button>
          </DialogTrigger>
          <DialogContent className="mission-control-panel">
            <DialogHeader>
              <DialogTitle>Log New Call</DialogTitle>
              <DialogDescription>Record a new call with candidate details</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Candidate</label>
                <Select value={newCall.candidate_id} onValueChange={(value) => setNewCall({...newCall, candidate_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map(candidate => (
                      <SelectItem key={candidate['Cadndidate_ID']} value={candidate['Cadndidate_ID']}>
                        {candidate['First Name']} {candidate['Last Name']} - {candidate['Title']}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Call Type</label>
                  <Select value={newCall.call_type} onValueChange={(value) => setNewCall({...newCall, call_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outbound">Outbound</SelectItem>
                      <SelectItem value="inbound">Inbound</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={newCall.call_status} onValueChange={(value) => setNewCall({...newCall, call_status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="answered">Answered</SelectItem>
                      <SelectItem value="no_answer">No Answer</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="voicemail">Voicemail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  value={newCall.duration}
                  onChange={(e) => setNewCall({...newCall, duration: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={newCall.recruiter_notes}
                  onChange={(e) => setNewCall({...newCall, recruiter_notes: e.target.value})}
                  placeholder="Call notes and observations..."
                  rows={3}
                />
              </div>
              
              <Button onClick={handleSaveCall} className="w-full mission-control-button">
                Save Call Log
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mission-control-panel">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by candidate name or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="answered">Answered</SelectItem>
                <SelectItem value="no_answer">No Answer</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="voicemail">Voicemail</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Call Logs Grid */}
      <div className="grid gap-4">
        {filteredCallLogs.map(call => {
          const candidate = getCandidate(call.candidate_id);
          
          return (
            <Card key={call.id} className="mission-control-panel hover:glow-effect transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedCall(call);
                    fetchComments(call.id);
                  }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {candidate ? `${candidate['First Name']?.[0]}${candidate['Last Name']?.[0]}` : 'UN'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-semibold">
                        {candidate ? `${candidate['First Name']} ${candidate['Last Name']}` : 'Unknown Candidate'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {candidate?.['Title']} • {candidate?.['Email']}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge variant={getStatusVariant(call.call_status)}>
                      {call.call_status.replace('_', ' ')}
                    </Badge>
                    
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {call.call_type}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {call.duration}m
                      </div>
                      <div>
                        {format(new Date(call.call_timestamp), 'MMM dd, HH:mm')}
                      </div>
                    </div>
                  </div>
                </div>
                
                {call.recruiter_notes && (
                  <div className="mt-4 p-3 bg-background/50 rounded-lg">
                    <p className="text-sm">{call.recruiter_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Call Detail Dialog */}
      {selectedCall && (
        <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
          <DialogContent className="mission-control-panel max-w-2xl">
            <DialogHeader>
              <DialogTitle>Call Details</DialogTitle>
              <DialogDescription>
                {(() => {
                  const candidate = getCandidate(selectedCall.candidate_id);
                  return candidate ? `${candidate['First Name']} ${candidate['Last Name']}` : 'Unknown Candidate';
                })()}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Call Details</TabsTrigger>
                <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Call Type</label>
                    <p className="text-sm text-muted-foreground capitalize">{selectedCall.call_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Badge variant={getStatusVariant(selectedCall.call_status)}>
                      {selectedCall.call_status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Duration</label>
                    <p className="text-sm text-muted-foreground">{selectedCall.duration} minutes</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date & Time</label>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedCall.call_timestamp), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
                
                {selectedCall.recruiter_notes && (
                  <div>
                    <label className="text-sm font-medium">Recruiter Notes</label>
                    <div className="mt-2 p-3 bg-background/50 rounded-lg">
                      <p className="text-sm">{selectedCall.recruiter_notes}</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="comments" className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {comments.map(comment => (
                    <div key={comment.id} className="p-3 bg-background/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Recruiter</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.created_at), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                  />
                  <Button onClick={handleAddComment} className="mission-control-button">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {filteredCallLogs.length === 0 && (
        <Card className="mission-control-panel">
          <CardContent className="pt-6 text-center py-12">
            <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No call logs found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' ? 'No calls match your current filters' : 'Start by logging your first call'}
            </p>
            <Button onClick={() => setIsCallDialogOpen(true)} className="mission-control-button">
              <Plus className="h-4 w-4 mr-2" />
              Log First Call
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}