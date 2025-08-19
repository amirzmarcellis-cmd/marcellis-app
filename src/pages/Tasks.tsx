import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, ExternalLink, Phone, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface TaskCandidate {
  taskid: number;
  created_at: string;
  callid: number | null;
  candidate_id: string;
  job_id: string;
  tasklink: string | null;
  status: 'Pending' | 'Received' | 'Reviewed';
  updated_at: string;
}

interface Candidate {
  candidate_id: string;
  first_name?: string;
  last_name?: string;
  Email?: string;
}

interface Job {
  job_id: string;
  job_title?: string;
}

interface JobCVData {
  Candidate_ID: string;
  job_id: string;
  contacted?: string;
  candidate_name?: string;
  candidate_email?: string;
}

export default function Tasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [taskCandidates, setTaskCandidates] = useState<TaskCandidate[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobCVData, setJobCVData] = useState<JobCVData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch task candidates
      const { data: taskData, error: taskError } = await supabase
        .from('task_candidates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (taskError) throw taskError;
      setTaskCandidates((taskData || []).map(task => ({
        ...task,
        status: task.status as 'Pending' | 'Received' | 'Reviewed'
      })));

      // Fetch candidates
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('CVs')
        .select('candidate_id, first_name, last_name, Email');
      
      if (candidatesError) throw candidatesError;
      setCandidates(candidatesData || []);

      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('Jobs')
        .select('job_id, job_title');
      
      if (jobsError) throw jobsError;
      setJobs(jobsData || []);

      // Fetch Jobs_CVs data for candidate names and emails
      const { data: jobCVsData, error: jobCVsError } = await supabase
        .from('Jobs_CVs')
        .select('Candidate_ID, job_id, contacted, candidate_name, candidate_email');
      
      if (jobCVsError) throw jobCVsError;
      setJobCVData(jobCVsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch task data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: 'Pending' | 'Received' | 'Reviewed') => {
    try {
      const { error } = await supabase
        .from('task_candidates')
        .update({ status: newStatus })
        .eq('taskid', taskId);

      if (error) throw error;

      setTaskCandidates(prev => 
        prev.map(task => 
          task.taskid === taskId ? { ...task, status: newStatus } : task
        )
      );

      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const getCandidateName = (candidateId: string) => {
    const candidate = candidates.find(c => c.candidate_id === candidateId);
    if (candidate?.first_name || candidate?.last_name) {
      return `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim();
    }
    
    // Fallback to Jobs_CVs data
    const jobCV = jobCVData.find(jc => jc.Candidate_ID === candidateId);
    return jobCV?.candidate_name || candidateId;
  };

  const getCandidateEmail = (candidateId: string) => {
    const candidate = candidates.find(c => c.candidate_id === candidateId);
    if (candidate?.Email) return candidate.Email;
    
    // Fallback to Jobs_CVs data
    const jobCV = jobCVData.find(jc => jc.Candidate_ID === candidateId);
    return jobCV?.candidate_email || '';
  };

  const getJobTitle = (jobId: string) => {
    const job = jobs.find(j => j.job_id === jobId);
    return job?.job_title || jobId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Received':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Reviewed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const openCallLog = (callId: number) => {
    navigate(`/call-log-details?callid=${callId}`);
  };

  const deleteTask = async (taskId: number) => {
    try {
      const { error } = await supabase
        .from('task_candidates')
        .delete()
        .eq('taskid', taskId);

      if (error) throw error;

      setTaskCandidates(prev => prev.filter(task => task.taskid !== taskId));

      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const filteredTasks = taskCandidates.filter(task => {
    const candidateName = getCandidateName(task.candidate_id).toLowerCase();
    const candidateEmail = getCandidateEmail(task.candidate_id).toLowerCase();
    const jobTitle = getJobTitle(task.job_id).toLowerCase();
    
    const matchesSearch = searchTerm === "" || 
      candidateName.includes(searchTerm.toLowerCase()) ||
      candidateEmail.includes(searchTerm.toLowerCase()) ||
      jobTitle.includes(searchTerm.toLowerCase()) ||
      task.candidate_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesJob = jobFilter === "all" || task.job_id === jobFilter;
    
    return matchesSearch && matchesStatus && matchesJob;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tasks</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, job, or candidate ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Received">Received</SelectItem>
                <SelectItem value="Reviewed">Reviewed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map(job => (
                  <SelectItem key={job.job_id} value={job.job_id}>
                    {job.job_title || job.job_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Task Candidates ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created At</TableHead>
                <TableHead>Candidate Name</TableHead>
                <TableHead>Candidate Email</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Task Link</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.taskid}>
                  <TableCell>
                    {format(new Date(task.created_at), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {getCandidateName(task.candidate_id)}
                  </TableCell>
                  <TableCell>{getCandidateEmail(task.candidate_id)}</TableCell>
                  <TableCell>{getJobTitle(task.job_id)}</TableCell>
                  <TableCell>
                    {task.tasklink ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(task.tasklink!, '_blank')}
                        className="p-1 h-auto"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={task.status}
                      onValueChange={(value) => updateTaskStatus(task.taskid, value as any)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Received">Received</SelectItem>
                        <SelectItem value="Reviewed">Reviewed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {task.callid && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCallLog(task.callid!)}
                          className="flex items-center gap-1"
                        >
                          <Phone className="h-4 w-4" />
                          Call Log
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTask(task.taskid)}
                        className="flex items-center gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No tasks found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}