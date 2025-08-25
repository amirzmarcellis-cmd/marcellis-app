import { useState } from 'react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, Video } from "lucide-react";
import { useProfile } from '@/hooks/useProfile';

export default function Interviews() {
  const { isAdmin } = useProfile();
  const [loading, setLoading] = useState(false);

  // Mock interview data
  const mockInterviews = [
    {
      id: 1,
      candidateName: "John Doe",
      jobTitle: "Senior Developer",
      scheduledDate: "2024-01-20 14:00",
      status: "scheduled",
      type: "video"
    },
    {
      id: 2,
      candidateName: "Jane Smith", 
      jobTitle: "Product Manager",
      scheduledDate: "2024-01-21 10:00",
      status: "scheduled",
      type: "phone"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Interviews</h1>
            <p className="text-muted-foreground">Manage and schedule candidate interviews</p>
          </div>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Video className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Video Calls</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockInterviews.map((interview) => (
                <div key={interview.id} className="flex items-center justify-between p-4 rounded-lg border bg-secondary/30">
                  <div className="space-y-1">
                    <h3 className="font-medium">{interview.candidateName}</h3>
                    <p className="text-sm text-muted-foreground">{interview.jobTitle}</p>
                    <p className="text-sm text-muted-foreground">{interview.scheduledDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                      {interview.status}
                    </span>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}