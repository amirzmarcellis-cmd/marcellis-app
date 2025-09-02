import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, FileText } from 'lucide-react';

interface Candidate {
  user_id: string;
  name: string;
  email: string;
  phone_number: string;
  cv_text: string;
}

export default function CandidateDetails() {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCandidate = async (candidateId: string) => {
    try {
      setLoading(true);
      
      // Use a dynamic import to avoid TypeScript issues
      const supabaseModule = await import('@/integrations/supabase/client');
      const supabase = supabaseModule.supabase;
      
      // Query the Jobs_CVs table using recordid
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
          const cvQueryResult: any = await (supabase as any)
            .from('CVs')
            .select('cv_text')
            .eq('user_id', candidateData.user_id.toString());
          
          if (cvQueryResult.data && cvQueryResult.data.length > 0) {
            cvText = cvQueryResult.data[0].cv_text || '';
          }
        }
        
        setCandidate({
          user_id: candidateData.user_id?.toString() || candidateId,
          name: candidateData.candidate_name || 'Unknown Candidate',
          email: candidateData.candidate_email || '',
          phone_number: candidateData.candidate_phone_number || '',
          cv_text: cvText
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

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CV Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          {candidate.cv_text ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed bg-muted/30 p-4 rounded-lg border max-h-96 overflow-y-auto">
              {candidate.cv_text}
            </div>
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