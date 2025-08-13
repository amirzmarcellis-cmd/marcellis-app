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
        .order('"Success Score"', { ascending: false });

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
        const job = (jobsData || []).find(j => j['Job ID'] === candidate['Job ID']);
        return {
          ...candidate,
          'Job Title': job?.['Job Title'] || 'Unknown Position'
        };
      });

      setCandidates(enrichedCandidates);
      setJobs(jobsData || []);
      setCvData(cvsData || []);

      // Keep 'all' to show all jobs by default
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      (candidate['Candidate Name'] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate['Job Title'] || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesJob = selectedJob === 'all' || candidate['Job ID'] === selectedJob;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'high-score' && parseFloat(candidate['Success Score'] || '0') >= 74) ||
      (statusFilter === 'contacted' && candidate['Contacted'] && candidate['Contacted'] !== 'Not Contacted') ||
      (statusFilter === 'new' && (!candidate['Contacted'] || candidate['Contacted'] === 'Not Contacted'));
    
    const matchesScoreFilter = scoreFilter === 'all' ||
      (scoreFilter === 'high' && parseFloat(candidate['Success Score'] || '0') >= 75) ||
      (scoreFilter === 'medium' && parseFloat(candidate['Success Score'] || '0') >= 50 && parseFloat(candidate['Success Score'] || '0') < 75) ||
      (scoreFilter === 'low' && parseFloat(candidate['Success Score'] || '0') < 50 && parseFloat(candidate['Success Score'] || '0') > 0);

    return matchesSearch && matchesJob && matchesStatus && matchesScoreFilter;
  });

  // Ensure highest scores are shown first regardless of fetch order
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    const sa = parseFloat(a['Success Score'] || '0') || 0;
    const sb = parseFloat(b['Success Score'] || '0') || 0;
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
    const cvRecord = cvData.find(cv => cv['Cadndidate_ID'] === candidateId)
    return cvRecord?.['CandidateStatus'] || null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
              <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
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
      <Card className="mb-8 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border-white/20 shadow-2xl shadow-purple-500/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
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
                  className="pl-10 bg-black/20 border-cyan-400/30 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-300">Active Job</label>
              <div className="flex items-center gap-2 bg-black/20 border border-purple-400/30 text-white px-3 py-2 rounded-md">
                <Briefcase className="w-4 h-4 text-purple-300" />
                <span>{selectedJob === 'all' ? 'All Jobs' : (jobs.find(j => j['Job ID'] === selectedJob)?.['Job Title'] || '—')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-300">Status Filter</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-black/20 border-pink-400/30 text-white focus:border-pink-400">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-pink-400/30 backdrop-blur-xl z-50">
                  <SelectItem value="all" className="text-white hover:bg-pink-600/20">All Candidates</SelectItem>
                  <SelectItem value="high-score" className="text-white hover:bg-pink-600/20">High Score (74+)</SelectItem>
                  <SelectItem value="contacted" className="text-white hover:bg-pink-600/20">Contacted</SelectItem>
                  <SelectItem value="new" className="text-white hover:bg-pink-600/20">New/Uncontacted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-300">Score Range</label>
              <Select value={scoreFilter} onValueChange={setScoreFilter}>
                <SelectTrigger className="bg-black/20 border-emerald-400/30 text-white focus:border-emerald-400">
                  <SelectValue placeholder="All Scores" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-emerald-400/30 backdrop-blur-xl z-50">
                  <SelectItem value="all" className="text-white hover:bg-emerald-600/20">All Scores</SelectItem>
                  <SelectItem value="high" className="text-white hover:bg-emerald-600/20">Excellent (75+)</SelectItem>
                  <SelectItem value="medium" className="text-white hover:bg-emerald-600/20">Good (50-74)</SelectItem>
                  <SelectItem value="low" className="text-white hover:bg-emerald-600/20">Fair (&lt;50)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Feed */}
      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-white flex items-center">
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
          <ScrollArea className="h-[60vh] md:h-[600px] pr-0 md:pr-4">
            <div className="space-y-4">
              {sortedCandidates.map((candidate, index) => {
                const score = parseFloat(candidate['Success Score']) || 0;
                return (
                  <div 
                    key={index} 
                    className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer
                      bg-gradient-to-r ${index < 3 ? 'from-yellow-400/30 to-amber-500/50' : getScoreGradient(score)} ${index < 3 ? 'border-yellow-400/50 hover:border-yellow-400/60' : 'border-white/20 hover:border-cyan-400/40'}
                      backdrop-blur-sm animate-fade-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => window.location.href = `/call-log-details?candidate=${candidate["Candidate_ID"]}&job=${candidate["Job ID"]}`}
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
                          {candidate['Candidate Name']?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{candidate['Candidate Name']}</h3>
                          <div className="flex items-center space-x-2">
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
                              variant="badge"
                            />
                            <StatusDropdown
                              currentStatus={getCandidateStatus(candidate["Candidate_ID"])}
                              candidateId={candidate["Candidate_ID"]}
                              statusType="candidate"
                              onStatusChange={(newStatus) => {
                                setCvData(prev => prev.map(cv => 
                                  cv['Cadndidate_ID'] === candidate["Candidate_ID"] 
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
                            <span>{candidate['Candidate Email']}</span>
                          </div>
                          <div className="flex items-center text-purple-300">
                            <Phone className="w-4 h-4 mr-2 text-green-400" />
                            <span>{candidate['Candidate Phone Number']}</span>
                          </div>
                          <div className="flex items-center text-purple-300">
                            <Clock className="w-4 h-4 mr-2 text-orange-400" />
                            <span>{candidate['Notice Period'] || 'Not specified'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Score Reason */}
                    <div className="bg-black/20 rounded-xl p-4 mb-4 border border-white/10">
                      <h4 className="text-cyan-300 font-medium mb-2">AI Assessment</h4>
                      <p className="text-white/90 text-sm leading-relaxed">
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
                  <h3 className="text-xl font-semibold text-white mb-2">No candidates found</h3>
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