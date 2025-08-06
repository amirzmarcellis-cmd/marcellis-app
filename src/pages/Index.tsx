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
  Timer
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
  todos: any[];
}

interface Todo {
  id: string;
  title: string;
  type: 'job' | 'candidate';
  entityId: string;
  entityName: string;
  dueDate?: Date;
  completed: boolean;
}

export default function Index() {
  const { profile } = useProfile();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('all');
  const [aiSearchActive, setAiSearchActive] = useState<Record<string, boolean>>({});
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState({ title: '', type: 'job', entityId: '', dueDate: '' });
  const [candidates, setCandidates] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    loadTodos();
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

      // Calculate average time to hire (placeholder calculation)
      const averageTimeToHire = 14; // days

      setData({
        totalCandidates: candidates?.length || 0,
        totalJobs: jobs?.length || 0,
        candidatesAwaitingReview: highScoreCandidates.length,
        tasksToday: 3, // placeholder
        interviewsThisWeek: 5, // placeholder
        averageTimeToHire,
        recentCandidates,
        activeJobs: jobs || [],
        todos: []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodos = () => {
    const saved = localStorage.getItem('dashboard-todos');
    if (saved) {
      setTodos(JSON.parse(saved));
    }
  };

  const saveTodos = (updatedTodos: Todo[]) => {
    setTodos(updatedTodos);
    localStorage.setItem('dashboard-todos', JSON.stringify(updatedTodos));
  };

  const addTodo = () => {
    if (!newTodo.title) return;
    
    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo.title,
      type: newTodo.type as 'job' | 'candidate',
      entityId: newTodo.entityId,
      entityName: newTodo.entityId,
      dueDate: newTodo.dueDate ? new Date(newTodo.dueDate) : undefined,
      completed: false
    };

    saveTodos([...todos, todo]);
    setNewTodo({ title: '', type: 'job', entityId: '', dueDate: '' });
  };

  const toggleTodo = (id: string) => {
    const updated = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos(updated);
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
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const filteredCandidates = selectedJobFilter === 'all' 
    ? candidates || []
    : candidates?.filter(c => c['Job ID'] === selectedJobFilter) || [];

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
            You have {data?.totalJobs || 0} roles running, {data?.candidatesAwaitingReview || 0} candidates awaiting review, 
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

            <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-400/30 hover:scale-105 transition-transform cursor-pointer">
              <CardContent className="p-4 text-center">
                <Timer className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-300">{data?.averageTimeToHire || 0}</div>
                <div className="text-xs text-orange-200">Avg Days to Hire</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Side - Job Control Panels */}
        <div className="col-span-3 space-y-4">
          <h2 className="text-xl font-bold text-cyan-300 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Job Control Panels
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

        {/* Center - Live Candidate Feed & Action Center */}
        <div className="col-span-6 space-y-6">
          {/* Live Candidate Feed */}
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-cyan-300 flex items-center">
                  <Activity className="h-5 w-5 mr-2 animate-pulse" />
                  Live Candidate Feed
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-cyan-300">Live</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedJobFilter('all')}
                    className="ml-4 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10"
                  >
                    Show All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filteredCandidates.map((candidate, index) => {
                    const score = parseFloat(candidate['Success Score']) || 0;
                    return (
                      <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-cyan-400/30 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              {candidate['Candidate Name']?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <h4 className="font-semibold">{candidate['Candidate Name']}</h4>
                              <p className="text-sm text-gray-400">{candidate['Job ID']}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-bold ${getScoreColor(score)}`}>
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
                        <p className="text-sm text-gray-300 mb-3">{candidate['Score and Reason']?.slice(0, 100)}...</p>
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
                      </div>
                    );
                  })}
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

        {/* Right Side - To-Do List */}
        <div className="col-span-3">
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-emerald-300 flex items-center">
                <ClipboardList className="h-5 w-5 mr-2" />
                Mission Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Todo */}
              <div className="space-y-2">
                <Input
                  placeholder="Task description..."
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Select value={newTodo.type} onValueChange={(value) => setNewTodo({ ...newTodo, type: value })}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="job">Job</SelectItem>
                      <SelectItem value="candidate">Candidate</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="datetime-local"
                    value={newTodo.dueDate}
                    onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <Input
                  placeholder={`${newTodo.type === 'job' ? 'Job Title' : 'Candidate Name'}...`}
                  value={newTodo.entityId}
                  onChange={(e) => setNewTodo({ ...newTodo, entityId: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
                <Button onClick={addTodo} className="w-full bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>

              <Separator className="bg-white/20" />

              {/* Todo List */}
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {todos.map((todo) => (
                    <div 
                      key={todo.id} 
                      className={`p-3 rounded-lg border ${
                        todo.completed 
                          ? 'bg-emerald-500/10 border-emerald-400/30 opacity-50' 
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleTodo(todo.id)}
                            className="p-0 h-5 w-5 mt-0.5"
                          >
                            <CheckCircle className={`h-4 w-4 ${todo.completed ? 'text-emerald-400' : 'text-gray-400'}`} />
                          </Button>
                          <div className="flex-1">
                            <p className={`text-sm ${todo.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                              {todo.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {todo.type}
                              </Badge>
                              {todo.entityId && (
                                <span className="text-xs text-gray-400">{todo.entityId}</span>
                              )}
                            </div>
                            {todo.dueDate && (
                              <div className="flex items-center space-x-1 mt-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-400">
                                  {new Date(todo.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Action Dock */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <Card className="bg-black/50 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                <Plus className="h-4 w-4 mr-1" />
                Add Job
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600">
                <Play className="h-4 w-4 mr-1" />
                Start AI
              </Button>
              <Button size="sm" variant="outline" className="border-orange-400/50 text-orange-400 hover:bg-orange-400/10">
                <Pause className="h-4 w-4 mr-1" />
                Pause AI
              </Button>
              <Button size="sm" variant="outline" className="border-purple-400/50 text-purple-400 hover:bg-purple-400/10">
                <Search className="h-4 w-4 mr-1" />
                View All
              </Button>
              <Button size="sm" variant="outline" className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10">
                <ClipboardList className="h-4 w-4 mr-1" />
                Templates
              </Button>
              <Button size="sm" variant="outline" className="border-blue-400/50 text-blue-400 hover:bg-blue-400/10">
                <Upload className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}