import { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { HeroHeader } from "@/components/dashboard/HeroHeader";
import { BentoKpis } from "@/components/dashboard/BentoKpis";
import { ActivityTicker } from "@/components/dashboard/ActivityTicker";
import { CallAnalyticsChart } from "@/components/dashboard/CallAnalyticsChart";
import { RecentCallsTable } from "@/components/dashboard/RecentCallsTable";
import { QuickActionsDock } from "@/components/dashboard/QuickActionsDock";
import { RadarCard } from "@/components/dashboard/RadarCard";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
// DashboardSkeleton removed - not needed for simplified dashboard
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from '@/hooks/useProfile';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { Building2, Users, Briefcase, Phone, Calendar, Activity } from "lucide-react";

interface DashboardStats {
  totalCandidates: number;
  totalJobs: number;
  activeJobs: number;
  applications: number;
  shortlisted: number;
  interviewed: number;
}

interface Interview {
  intid: string;
  candidate_id: string;
  job_id: string;
  scheduled_date: string;
  status: string;
  CVs?: { Firstname: string; Lastname: string };
  Jobs?: { job_title: string };
}

export default function Index() {
  const { profile, isAdmin } = useProfile();
  const { logActivity } = useActivityLogger();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalCandidates: 0,
    totalJobs: 0,
    activeJobs: 0,
    applications: 0,
    shortlisted: 0,
    interviewed: 0
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [recentInterviews, setRecentInterviews] = useState<Interview[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Simplified dashboard - using mock data since we don't have the full schema
    loadMockData();
  }, []);

  const loadMockData = async () => {
    setLoading(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock stats
    setStats({
      totalCandidates: 156,
      totalJobs: 12,
      activeJobs: 8,
      applications: 89,
      shortlisted: 24,
      interviewed: 8
    });

    // Mock recent applications
    setRecentApplications([
      { id: 1, name: "John Doe", position: "Senior Developer", date: "2024-01-15" },
      { id: 2, name: "Jane Smith", position: "Product Manager", date: "2024-01-14" },
      { id: 3, name: "Mike Johnson", position: "UX Designer", date: "2024-01-13" }
    ]);

    // Mock chart data
    const mockChartData = Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6-i));
      return {
        date: date.toISOString().split('T')[0],
        applications: Math.floor(Math.random() * 20) + 5,
        shortlisted: Math.floor(Math.random() * 8) + 2,
        interviewed: Math.floor(Math.random() * 4) + 1
      };
    });
    setChartData(mockChartData);

    setLoading(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-secondary rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-secondary rounded"></div>
            <div className="h-24 bg-secondary rounded"></div>
            <div className="h-24 bg-secondary rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Welcome back, {profile?.name || "User"}!</h1>
          <p className="text-muted-foreground">Here's what's happening today</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Candidates</p>
                  <p className="text-2xl font-bold">{stats.totalCandidates}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold">{stats.activeJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p className="text-2xl font-bold">{stats.applications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Analytics chart will be displayed here</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div>
                        <div className="font-medium">{app.name}</div>
                        <div className="text-sm text-muted-foreground">{app.position}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{app.date}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Quick action buttons will be displayed here</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}