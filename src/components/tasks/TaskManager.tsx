import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, CheckCircle, Clock, User, Briefcase } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Task {
  id: string;
  title: string;
  description?: string;
  entity_type: string;
  entity_id?: string;
  entity_name?: string;
  due_date?: string;
  completed: boolean;
  created_at: string;
}

interface Candidate {
  'Cadndidate_ID': string;
  'First Name': string;
  'Last Name': string;
}

interface Job {
  'Job ID': string;
  'Job Title': string;
}

interface TaskManagerProps {
  showAddForm?: boolean;
  onTaskCountChange?: (count: number) => void;
}

export function TaskManager({ showAddForm = true, onTaskCountChange }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    entity_type: 'general' as 'candidate' | 'job' | 'general',
    entity_id: '',
    due_date: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
    fetchCandidatesAndJobs();
  }, []);

  useEffect(() => {
    const openTasks = tasks.filter(task => !task.completed).length;
    onTaskCountChange?.(openTasks);
  }, [tasks, onTaskCountChange]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidatesAndJobs = async () => {
    try {
      const [candidatesResponse, jobsResponse] = await Promise.all([
        supabase.from('CVs').select('Cadndidate_ID, "First Name", "Last Name"'),
        supabase.from('Jobs').select('"Job ID", "Job Title"')
      ]);

      if (candidatesResponse.error) throw candidatesResponse.error;
      if (jobsResponse.error) throw jobsResponse.error;

      setCandidates(candidatesResponse.data || []);
      setJobs(jobsResponse.data || []);
    } catch (error) {
      console.error('Error fetching candidates and jobs:', error);
    }
  };

  const addTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive"
      });
      return;
    }

    try {
      let entityName = '';
      if (newTask.entity_type === 'candidate' && newTask.entity_id) {
        const candidate = candidates.find(c => c['Cadndidate_ID'] === newTask.entity_id);
        entityName = `${candidate?.['First Name'] || ''} ${candidate?.['Last Name'] || ''}`.trim();
      } else if (newTask.entity_type === 'job' && newTask.entity_id) {
        const job = jobs.find(j => j['Job ID'] === newTask.entity_id);
        entityName = job?.['Job Title'] || '';
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('tasks')
        .insert([{
          title: newTask.title,
          description: newTask.description || null,
          entity_type: newTask.entity_type,
          entity_id: newTask.entity_id || null,
          entity_name: entityName || null,
          due_date: newTask.due_date || null,
          created_by: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task created successfully"
      });

      setNewTask({
        title: '',
        description: '',
        entity_type: 'general',
        entity_id: '',
        due_date: ''
      });
      setShowForm(false);
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !completed })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, completed: !completed } : task
      ));

      toast({
        title: "Success",
        description: completed ? "Task marked as incomplete" : "Task completed!"
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));

      toast({
        title: "Success",
        description: "Task deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'candidate': return <User className="w-4 h-4" />;
      case 'job': return <Briefcase className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getEntityColor = (entityType: string) => {
    switch (entityType) {
      case 'candidate': return 'bg-cyan-500/20 text-cyan-400 border-cyan-400/40';
      case 'job': return 'bg-purple-500/20 text-purple-400 border-purple-400/40';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/40';
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400">Loading tasks...</div>;
  }

  return (
    <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Clock className="w-5 h-5 mr-2 text-cyan-400" />
            Task Manager
            <Badge className="ml-3 bg-cyan-500/20 text-cyan-400 border-cyan-400/40">
              {tasks.filter(t => !t.completed).length} Open
            </Badge>
          </CardTitle>
          {showAddForm && (
            <Button
              onClick={() => setShowForm(!showForm)}
              size="sm"
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="mb-6 p-4 bg-black/20 rounded-xl border border-white/10 space-y-4">
            <Input
              placeholder="Task title..."
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="bg-white/10 border-cyan-400/30 text-white placeholder-gray-400"
            />
            
            <Textarea
              placeholder="Task description (optional)..."
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="bg-white/10 border-cyan-400/30 text-white placeholder-gray-400"
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                value={newTask.entity_type}
                onValueChange={(value) => setNewTask({ ...newTask, entity_type: value as any, entity_id: '' })}
              >
                <SelectTrigger className="bg-white/10 border-purple-400/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-400/30">
                  <SelectItem value="general" className="text-white">General Task</SelectItem>
                  <SelectItem value="candidate" className="text-white">Candidate Related</SelectItem>
                  <SelectItem value="job" className="text-white">Job Related</SelectItem>
                </SelectContent>
              </Select>

              {newTask.entity_type === 'candidate' && (
                <Select
                  value={newTask.entity_id}
                  onValueChange={(value) => setNewTask({ ...newTask, entity_id: value })}
                >
                  <SelectTrigger className="bg-white/10 border-cyan-400/30 text-white">
                    <SelectValue placeholder="Select candidate" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-cyan-400/30">
                    {candidates.map((candidate) => (
                      <SelectItem 
                        key={candidate['Cadndidate_ID']} 
                        value={candidate['Cadndidate_ID']}
                        className="text-white"
                      >
                        {`${candidate['First Name'] || ''} ${candidate['Last Name'] || ''}`.trim()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {newTask.entity_type === 'job' && (
                <Select
                  value={newTask.entity_id}
                  onValueChange={(value) => setNewTask({ ...newTask, entity_id: value })}
                >
                  <SelectTrigger className="bg-white/10 border-purple-400/30 text-white">
                    <SelectValue placeholder="Select job" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-400/30">
                    {jobs.map((job) => (
                      <SelectItem 
                        key={job['Job ID']} 
                        value={job['Job ID']}
                        className="text-white"
                      >
                        {job['Job Title']}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Input
              type="date"
              value={newTask.due_date}
              onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              className="bg-white/10 border-cyan-400/30 text-white"
            />

            <div className="flex space-x-2">
              <Button onClick={addTask} className="bg-cyan-500 hover:bg-cyan-600">
                Create Task
              </Button>
              <Button 
                onClick={() => setShowForm(false)} 
                variant="outline"
                className="border-gray-400/50 text-gray-400 hover:bg-gray-400/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  task.completed 
                    ? 'bg-green-500/10 border-green-400/30 opacity-60' 
                    : 'bg-white/5 border-white/20 hover:border-cyan-400/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleTask(task.id, task.completed)}
                      className={`p-1 ${task.completed ? 'text-green-400' : 'text-gray-400 hover:text-cyan-400'}`}
                    >
                      <CheckCircle className={`w-5 h-5 ${task.completed ? 'fill-current' : ''}`} />
                    </Button>
                    
                    <div className="flex-1">
                      <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className={`text-sm mt-1 ${task.completed ? 'text-gray-600' : 'text-gray-300'}`}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={`text-xs ${getEntityColor(task.entity_type)}`}>
                          {getEntityIcon(task.entity_type)}
                          <span className="ml-1">{task.entity_type}</span>
                        </Badge>
                        
                        {task.entity_name && (
                          <Badge variant="outline" className="text-xs border-gray-400/40 text-gray-400">
                            {task.entity_name}
                          </Badge>
                        )}
                        
                        {task.due_date && (
                          <Badge variant="outline" className="text-xs border-orange-400/40 text-orange-400">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tasks yet. Create your first task!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}