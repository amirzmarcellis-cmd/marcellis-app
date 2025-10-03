import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone, FileText, Search, ArrowLeft, ExternalLink } from 'lucide-react';

interface Candidate {
  user_id: string;
  name: string;
  email: string;
  phone_number: string;
  cv_text: string;
  cv_link?: string | null;
}

export default function CandidateDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const fromJob = location.state?.fromJob;
  const fromTab = location.state?.tab;
  const longListSourceFilter = location.state?.longListSourceFilter;

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
        
        setCandidate({
          user_id: candidateData.user_id?.toString() || candidateId,
          name: candidateData.name || `${candidateData.Firstname || ''} ${candidateData.Lastname || ''}`.trim() || 'Unknown Candidate',
          email: candidateData.email || '',
          phone_number: candidateData.phone_number || '',
          cv_text: candidateData.cv_text || '',
          cv_link: candidateData.cv_link || null
        });
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
        
        // Try to get CV text from CVs table using user_id
        let cvText = '';
        if (candidateData.user_id) {
          const cvTextQueryResult: any = await (supabase as any)
            .from('CVs')
            .select('cv_text')
            .eq('user_id', candidateData.user_id.toString());
          
          if (cvTextQueryResult.data && cvTextQueryResult.data.length > 0) {
            cvText = cvTextQueryResult.data[0].cv_text || '';
          }
        }
        
        setCandidate({
          user_id: candidateData.user_id?.toString() || candidateId,
          name: candidateData.candidate_name || 'Unknown Candidate',
          email: candidateData.candidate_email || '',
          phone_number: candidateData.candidate_phone_number || '',
          cv_text: cvText,
          cv_link: candidateData.cv_link || null
        });
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
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
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
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <User className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Candidate Details</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <p className="text-muted-foreground text-center">Loading candidate...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
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
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <User className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Candidate Details</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center">Candidate not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
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
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <User className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">
          {candidate.name}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {candidate.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{candidate.email}</span>
            </div>
          )}
          {candidate.phone_number && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{candidate.phone_number}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>User ID: {candidate.user_id}</span>
          </div>
          {candidate.cv_link && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(candidate.cv_link!, '_blank')}
              className="w-full sm:w-auto"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View CV Link
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CV Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {candidate.cv_text ? (
            <>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search in CV content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {searchTerm && (
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {getSearchResultsCount(candidate.cv_text, searchTerm)} results
                  </div>
                )}
              </div>
              <div 
                className="whitespace-pre-wrap text-sm leading-relaxed bg-muted/30 p-4 rounded-lg border max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{
                  __html: highlightText(candidate.cv_text, searchTerm)
                }}
              />
            </>
          ) : (
            <div className="text-muted-foreground text-sm p-4 text-center bg-muted/20 rounded-lg border border-dashed">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No CV content available for this candidate</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}