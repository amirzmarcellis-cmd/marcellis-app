import { useState } from 'react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, User, Calendar, Phone, Mail, MapPin } from "lucide-react";
import { useProfile } from '@/hooks/useProfile';

interface Candidate {
  user_id: number;
  Firstname: string;
  Lastname: string;
  cv_text: string;
}

export default function CandidateDetails() {
  const { isAdmin } = useProfile();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock candidate data since the schema is simplified
  const mockCandidate: Candidate = {
    user_id: 1,
    Firstname: "John",
    Lastname: "Doe",
    cv_text: "Experienced software developer with 5+ years in React and TypeScript..."
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Candidate Details</h1>
            <p className="text-muted-foreground">View candidate information and CV</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidate Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {mockCandidate.Firstname} {mockCandidate.Lastname}
                </CardTitle>
                <CardDescription>Candidate Profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>john.doe@example.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>+44 20 1234 5678</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>London, UK</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Applied 2 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CV Content */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  CV/Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{mockCandidate.cv_text}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Badge variant="secondary">New Application</Badge>
                
                <div className="space-y-2">
                  <Button className="w-full" variant="default">
                    Schedule Interview
                  </Button>
                  <Button className="w-full" variant="outline">
                    Send Message
                  </Button>
                  <Button className="w-full" variant="outline">
                    Download CV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium">Applied</div>
                  <div className="text-muted-foreground">2 days ago</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">CV Reviewed</div>
                  <div className="text-muted-foreground">1 day ago</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}