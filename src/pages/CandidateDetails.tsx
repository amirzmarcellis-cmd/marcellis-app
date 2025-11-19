import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone, FileText, Search, ArrowLeft, ExternalLink, Briefcase } from 'lucide-react';

interface Candidate {
  user_id: string;
  name: string;
  email: string;
  phone_number: string;
  cv_text: string;
  cv_link?: string | null;
}

interface AssociatedJob {
  job_id: string;
  job_title: string;
  contacted?: string;
  after_call_score?: number;
}

export default function CandidateDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [associatedJobs, setAssociatedJobs] = useState<AssociatedJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  
  const fromJob = location.state?.fromJob;
  const fromTab = location.state?.tab;
  const longListSourceFilter = location.state?.longListSourceFilter;

  const fetchAssociatedJobs = async (userId: string) => {
    try {
      setJobsLoading(true);
      
      const supabaseModule = await import('@/integrations/supabase/client');
      const supabase = supabaseModule.supabase;
      
      // First, fetch Jobs_CVs records for this user
      const { data: jobsCvsData, error: jobsCvsError } = await supabase
        .from('Jobs_CVs')
        .select('job_id, contacted, after_call_score')
        .eq('user_id', userId);

      if (jobsCvsError) {
        console.error('Error fetching Jobs_CVs:', jobsCvsError);
        setAssociatedJobs([]);
        return;
      }

      if (!jobsCvsData || jobsCvsData.length === 0) {
        setAssociatedJobs([]);
        return;
      }

      // Get unique job_ids
      const uniqueJobIds = [...new Set(jobsCvsData.map(item => item.job_id))];

      // Fetch job details for these job_ids
      const { data: jobsData, error: jobsError } = await supabase
        .from('Jobs')
        .select('job_id, job_title')
        .in('job_id', uniqueJobIds);

      if (jobsError) {
        console.error('Error fetching Jobs:', jobsError);
        setAssociatedJobs([]);
        return;
      }

      // Combine the data
      const jobsMap = new Map(jobsData?.map(job => [job.job_id, job.job_title]) || []);
      
      const uniqueJobs: AssociatedJob[] = uniqueJobIds
        .map(jobId => {
          const jobCv = jobsCvsData.find(item => item.job_id === jobId);
          const jobTitle = jobsMap.get(jobId);
          
          if (jobTitle && jobCv) {
            return {
              job_id: jobId,
              job_title: jobTitle,
              contacted: jobCv.contacted,
              after_call_score: jobCv.after_call_score
            };
          }
          return null;
        })
        .filter(job => job !== null) as AssociatedJob[];
      
      uniqueJobs.sort((a, b) => a.job_title.localeCompare(b.job_title));

      setAssociatedJobs(uniqueJobs);
    } catch (error) {
      console.error('Error fetching associated jobs:', error);
      setAssociatedJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchCandidate = async (candidateId: string) => {
    try {
      setLoading(true);
      
      // Use a dynamic import to avoid TypeScript issues
      const supabaseModule = await import('@/integrations/supabase/client');
      const supabase = supabaseModule.supabase;
      
      // First try to find candidate in CVs table using user_id (for Applications tab)
      const cvQueryResult: any = await (supabase as any)
        .from('CVs')
        .select('*')
        .eq('user_id', candidateId);
      
      if (cvQueryResult.data && cvQueryResult.data.length > 0) {
        const candidateData = cvQueryResult.data[0];
        
        const userId = candidateData.user_id?.toString() || candidateId;
        setCandidate({
          user_id: userId,
          name: candidateData.name || `${candidateData.Firstname || ''} ${candidateData.Lastname || ''}`.trim() || 'Unknown Candidate',
          email: candidateData.email || '',
          phone_number: candidateData.phone_number || '',
          cv_text: candidateData.cv_text || '',
          cv_link: candidateData.cv_link || null
        });
        
        // Fetch associated jobs
        await fetchAssociatedJobs(userId);
        return;
      }
      
      // Fallback: Query the Jobs_CVs table using recordid (for other tabs)
      const queryResult: any = await (supabase as any)
        .from('Jobs_CVs')
        .select('*')
        .eq('recordid', parseInt(candidateId));
      
      const { data, error } = queryResult;

      if (error) {
        console.error('Error fetching candidate:', error);
        setCandidate(null);
        return;
      }

      if (data && data.length > 0) {
        const candidateData = data[0];
        
        // Try to get CV text and cv_link from CVs table using user_id
        let cvText = '';
        let cvLink = null;
        if (candidateData.user_id) {
          const cvTextQueryResult: any = await (supabase as any)
            .from('CVs')
            .select('cv_text, cv_link')
            .eq('user_id', candidateData.user_id.toString());
          
          if (cvTextQueryResult.data && cvTextQueryResult.data.length > 0) {
            cvText = cvTextQueryResult.data[0].cv_text || '';
            cvLink = cvTextQueryResult.data[0].cv_link || null;
          }
        }
        
        const userId = candidateData.user_id?.toString() || candidateId;
        setCandidate({
          user_id: userId,
          name: candidateData.candidate_name || 'Unknown Candidate',
          email: candidateData.candidate_email || '',
          phone_number: candidateData.candidate_phone_number || '',
          cv_text: cvText,
          cv_link: cvLink
        });
        
        // Fetch associated jobs
        await fetchAssociatedJobs(userId);
      } else {
        setCandidate(null);
      }
    } catch (error) {
      console.error('Error fetching candidate:', error);
      setCandidate(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCandidate(id);
    }
  }, [id]);

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (regex.test(part)) {
        return `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">${part}</mark>`;
      }
      return part;
    }).join('');
  };

  const getSearchResultsCount = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return 0;
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return (text.match(regex) || []).length;
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 pb-20 sm:pb-24 max-w-full overflow-x-hidden">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (fromJob) {
                navigate(`/job/${fromJob}#tab=${fromTab || 'boolean-search'}`, { 
                  state: { 
                    tab: fromTab || 'boolean-search', 
                    focusCandidateId: id,
                    longListSourceFilter 
                  } 
                });
              } else {
                navigate('/candidates');
              }
            }}
            className="h-10 w-10 sm:h-8 sm:w-8 p-0 flex-shrink-0 min-h-[44px] sm:min-h-0"
          >
            <ArrowLeft className="h-4 w-4 sm:h-4 sm:w-4" />
          </Button>
          <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold break-words min-w-0">Candidate Details</h1>
        </div>
        <Card className="max-w-full overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <p className="text-muted-foreground text-center text-sm sm:text-base">Loading candidate...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 pb-20 sm:pb-24 max-w-full overflow-x-hidden">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (fromJob) {
                navigate(`/job/${fromJob}#tab=${fromTab || 'boolean-search'}`, { 
                  state: { 
                    tab: fromTab || 'boolean-search', 
                    focusCandidateId: id,
                    longListSourceFilter 
                  } 
                });
              } else {
                navigate('/candidates');
              }
            }}
            className="h-10 w-10 sm:h-8 sm:w-8 p-0 flex-shrink-0 min-h-[44px] sm:min-h-0"
          >
            <ArrowLeft className="h-4 w-4 sm:h-4 sm:w-4" />
          </Button>
          <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold break-words min-w-0">Candidate Details</h1>
        </div>
        <Card className="max-w-full overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <p className="text-muted-foreground text-center text-sm sm:text-base">Candidate not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 pb-20 sm:pb-24 max-w-full overflow-x-hidden">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (fromJob) {
              navigate(`/job/${fromJob}#tab=${fromTab || 'boolean-search'}`, { 
                state: { 
                  tab: fromTab || 'boolean-search', 
                  focusCandidateId: id,
                  longListSourceFilter 
                } 
              });
            } else {
              navigate('/candidates');
            }
          }}
          className="h-10 w-10 sm:h-8 sm:w-8 p-0 flex-shrink-0 min-h-[44px] sm:min-h-0"
        >
          <ArrowLeft className="h-4 w-4 sm:h-4 sm:w-4" />
        </Button>
        <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold break-words min-w-0">
          {candidate.name}
        </h1>
      </div>

      <Card className="max-w-full overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            <User className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          {candidate.email && (
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm sm:text-base break-all">{candidate.email}</span>
            </div>
          )}
          {candidate.phone_number && (
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm sm:text-base">{candidate.phone_number}</span>
            </div>
          )}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm sm:text-base break-all">User ID: {candidate.user_id}</span>
          </div>
          {candidate.cv_link && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(candidate.cv_link!, '_blank')}
              className="w-full sm:w-auto h-11 sm:h-9 text-sm min-h-[44px] sm:min-h-0"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View CV Link
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="max-w-full overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            Associated Jobs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {jobsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : associatedJobs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4 text-sm sm:text-base">
              No jobs associated with this candidate
            </p>
          ) : (
            <div className="space-y-2">
              {associatedJobs.map((job, index) => (
                <div
                  key={job.job_id}
                  className={`${
                    index !== 0 ? 'border-t border-border pt-2' : ''
                  }`}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-3 px-3 hover:bg-accent min-h-[44px]"
                    onClick={() => navigate(`/job/${job.job_id}`)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 text-sm sm:text-base break-words">{job.job_title}</span>
                    </div>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="max-w-full overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            CV Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          {candidate.cv_text ? (
            <>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 min-w-0">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search in CV content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 sm:h-10 text-sm min-w-0 w-full"
                  />
                </div>
                {searchTerm && (
                  <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap text-center sm:text-left">
                    {getSearchResultsCount(candidate.cv_text, searchTerm)} results
                  </div>
                )}
              </div>
              <div 
                className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed bg-muted/30 p-3 sm:p-4 rounded-lg border max-h-96 overflow-y-auto break-words"
                dangerouslySetInnerHTML={{
                  __html: highlightText(candidate.cv_text, searchTerm)
                }}
              />
            </>
          ) : (
            <div className="text-muted-foreground text-xs sm:text-sm p-4 text-center bg-muted/20 rounded-lg border border-dashed">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
              <p>No CV content available for this candidate</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}