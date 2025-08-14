// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, TrendingUp, Target, Award, CheckCircle2, UserCheck } from 'lucide-react';

interface FunnelCandidate {
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  job_id: string;
  contacted: string;
  candidateStatus: string;
  success_score: string;
  callid: string;
}

interface FunnelStage {
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  candidates: FunnelCandidate[];
  count: number;
}

export function ActiveJobsFunnel() {
  const [candidates, setCandidates] = useState<FunnelCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFunnelData();
  }, []);

  const fetchFunnelData = async () => {
    try {
      // Fetch Jobs_CVs data with job titles and CV status
      const { data: jobsCvsData, error: jobsCvsError } = await supabase
        .from('Jobs_CVs')
        .select(`
          *,
          Jobs!inner(job_title, job_id, Processed)
        `)
        .eq('Jobs.Processed', 'Yes');

      if (jobsCvsError) throw jobsCvsError;

      // Fetch CV data for candidate status
      const { data: cvsData, error: cvsError } = await supabase
        .from('CVs')
        .select('candidate_id, CandidateStatus, first_name, last_name, Email');

      if (cvsError) throw cvsError;

      // Combine data
      const enrichedCandidates = (jobsCvsData || []).map(candidate => {
        const cv = (cvsData || []).find(cv => cv.candidate_id === candidate.Candidate_ID);
        return {
          candidate_id: candidate.Candidate_ID,
          candidate_name: candidate.candidate_name || `${cv?.first_name || ''} ${cv?.last_name || ''}`.trim(),
          candidate_email: candidate.candidate_email || cv?.Email,
          job_title: candidate.Jobs?.job_title || 'Unknown Position',
          job_id: candidate.job_id,
          contacted: candidate.contacted,
          candidateStatus: cv?.CandidateStatus,
          success_score: candidate.success_score,
          callid: candidate.callid
        };
      });

      setCandidates(enrichedCandidates);
    } catch (error) {
      console.error('Error fetching funnel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const organizeCandidatesByStage = (): FunnelStage[] => {
    const stages: FunnelStage[] = [
      {
        name: 'Longlist',
        icon: Users,
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10',
        borderColor: 'border-blue-400/30',
        candidates: [],
        count: 0
      },
      {
        name: 'Contacted',
        icon: UserCheck,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400/10',
        borderColor: 'border-yellow-400/30',
        candidates: [],
        count: 0
      },
      {
        name: 'Low Scored',
        icon: TrendingUp,
        color: 'text-red-400',
        bgColor: 'bg-red-400/10',
        borderColor: 'border-red-400/30',
        candidates: [],
        count: 0
      },
      {
        name: 'Shortlist',
        icon: Target,
        color: 'text-purple-400',
        bgColor: 'bg-purple-400/10',
        borderColor: 'border-purple-400/30',
        candidates: [],
        count: 0
      },
      {
        name: 'Tasked',
        icon: Award,
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-400/10',
        borderColor: 'border-cyan-400/30',
        candidates: [],
        count: 0
      },
      {
        name: 'Hired',
        icon: CheckCircle2,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-400/10',
        borderColor: 'border-emerald-400/30',
        candidates: [],
        count: 0
      }
    ];

    candidates.forEach(candidate => {
      // Determine stage based on status and conditions
      if (candidate.candidateStatus === 'Hired') {
        stages[5].candidates.push(candidate);
      } else if (candidate.contacted === 'Tasked' || candidate.candidateStatus === 'Tasked') {
        stages[4].candidates.push(candidate);
      } else if (candidate.candidateStatus === 'Shortlisted') {
        stages[3].candidates.push(candidate);
      } else if (candidate.contacted === 'Low Scored') {
        stages[2].candidates.push(candidate);
      } else if (candidate.contacted === 'Contacted' || candidate.contacted === 'Call Done') {
        stages[1].candidates.push(candidate);
      } else {
        // Default to Longlist for others
        stages[0].candidates.push(candidate);
      }
    });

    // Update counts
    stages.forEach(stage => {
      stage.count = stage.candidates.length;
    });

    return stages;
  };

  const funnelStages = organizeCandidatesByStage();

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Active Jobs Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border dark:bg-gradient-to-br dark:from-white/10 dark:to-white/5 dark:backdrop-blur-xl dark:border-white/20 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl text-foreground flex items-center">
          <TrendingUp className="w-6 h-6 mr-3 text-cyan-400" />
          Active Jobs Funnel
          <Badge className="ml-4 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 text-cyan-300 border-cyan-400/40">
            {candidates.length} Total Candidates
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {funnelStages.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <Card key={stage.name} className={`${stage.bgColor} ${stage.borderColor} border transition-all duration-300 hover:scale-105`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-5 h-5 ${stage.color}`} />
                      <h3 className={`font-semibold ${stage.color}`}>{stage.name}</h3>
                    </div>
                    <Badge className={`${stage.bgColor} ${stage.color} ${stage.borderColor} border`}>
                      {stage.count}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {stage.candidates.slice(0, 3).map((candidate) => (
                        <div 
                          key={`${candidate.candidate_id}-${candidate.job_id}`}
                          className="flex items-center space-x-2 p-2 rounded-lg bg-background/30 cursor-pointer hover:bg-background/50 transition-colors"
                          onClick={() => window.location.href = `/call-log-details?candidate=${candidate.candidate_id}&job=${candidate.job_id}&callid=${candidate.callid || ''}`}
                        >
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs bg-gradient-to-br from-cyan-500 to-purple-600 text-white">
                              {candidate.candidate_name?.charAt(0) || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                              {candidate.candidate_name || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {candidate.job_title}
                            </p>
                          </div>
                          {candidate.success_score && (
                            <Badge variant="outline" className="text-xs">
                              {parseFloat(candidate.success_score).toFixed(0)}
                            </Badge>
                          )}
                        </div>
                      ))}
                      {stage.candidates.length > 3 && (
                        <div className="text-xs text-center text-muted-foreground py-1">
                          +{stage.candidates.length - 3} more
                        </div>
                      )}
                      {stage.candidates.length === 0 && (
                        <div className="text-xs text-center text-muted-foreground py-4">
                          No candidates
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Funnel Flow Visualization */}
        <div className="mt-6 flex items-center justify-center space-x-2 overflow-x-auto">
          {funnelStages.map((stage, index) => (
            <div key={stage.name} className="flex items-center">
              <div className={`flex flex-col items-center p-3 rounded-lg ${stage.bgColor} ${stage.borderColor} border min-w-[100px]`}>
                <div className={`w-8 h-8 rounded-full ${stage.bgColor} ${stage.borderColor} border-2 flex items-center justify-center mb-1`}>
                  <stage.icon className={`w-4 h-4 ${stage.color}`} />
                </div>
                <span className={`text-xs font-medium ${stage.color}`}>{stage.name}</span>
                <span className={`text-lg font-bold ${stage.color}`}>{stage.count}</span>
              </div>
              {index < funnelStages.length - 1 && (
                <div className="w-6 h-0.5 bg-border mx-1"></div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}