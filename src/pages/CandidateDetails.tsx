import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, FileText } from 'lucide-react';

interface Candidate {
  candidate_id: string;
  first_name: string;
  last_name: string;
  Email: string;
  phone_number: string;
  Title: string;
  cv_text: string;
  CandidateStatus: string;
}

export default function CandidateDetails() {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCandidate = async (candidateId: string) => {
    try {
      // Mock candidate data since CVs table doesn't exist
      const mockCandidate = {
        candidate_id: candidateId,
        first_name: 'John',
        last_name: 'Doe',
        Email: 'john.doe@example.com',
        phone_number: '+971501234567',
        Title: 'Software Engineer',
        cv_text: 'Mock CV content...',
        CandidateStatus: 'Applied'
      };
      setCandidate(mockCandidate);
    } catch (error) {
      console.error('Error fetching candidate:', error);
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
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Candidate Details</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Loading candidate...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Candidate Details</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Candidate not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">
          {candidate.first_name} {candidate.last_name}
        </h1>
        <Badge variant="secondary">{candidate.CandidateStatus}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{candidate.Email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{candidate.phone_number}</span>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{candidate.Title}</span>
          </div>
        </CardContent>
      </Card>

      {candidate.cv_text && (
        <Card>
          <CardHeader>
            <CardTitle>CV Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm text-muted-foreground">
              {candidate.cv_text}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}