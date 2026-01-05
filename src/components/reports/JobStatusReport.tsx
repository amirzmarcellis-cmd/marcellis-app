import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Briefcase, Zap, Users } from "lucide-react";
import { JobStatusMetrics } from "@/hooks/useReportsData";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface JobStatusReportProps {
  data: JobStatusMetrics | undefined;
  isLoading: boolean;
}

export function JobStatusReport({ data, isLoading }: JobStatusReportProps) {
  const exportToCSV = () => {
    if (!data) return;
    
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Jobs', data.totalJobs.toString()],
      ['Active Jobs', data.activeJobs.toString()],
      ['Sourcing Jobs', data.sourcingJobs.toString()],
      ['Recruiting Jobs', data.recruitingJobs.toString()],
      ['Auto-Dial Enabled', data.autoDialJobs.toString()],
      ['Avg Candidates per Job', data.avgCandidatesPerJob.toString()],
      ['', ''],
      ['--- Status Breakdown ---', ''],
      ...data.statusBreakdown.map(s => [s.status, s.count.toString()]),
    ];
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'job-status-report.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-light font-work">Job Status Overview</CardTitle>
            <CardDescription className="font-light font-inter">Active jobs and progress tracking</CardDescription>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={exportToCSV} disabled={!data}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Job Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Briefcase className="w-4 h-4" />
              <span className="text-xs">Total Jobs</span>
            </div>
            <div className="text-2xl font-semibold">{data?.totalJobs || 0}</div>
          </div>
          <div className="p-4 border rounded-lg bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="w-4 h-4 text-green-500" />
              <span className="text-xs">Active Jobs</span>
            </div>
            <div className="text-2xl font-semibold text-green-500">{data?.activeJobs || 0}</div>
          </div>
          <div className="p-4 border rounded-lg bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-xs">Auto-Dial Enabled</span>
            </div>
            <div className="text-2xl font-semibold text-blue-500">{data?.autoDialJobs || 0}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.statusBreakdown || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ status, count }) => `${status}: ${count}`}
                  labelLine={false}
                >
                  {(data?.statusBreakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Additional Stats */}
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-medium">Candidate Distribution</span>
              </div>
              <div className="text-3xl font-bold">{data?.avgCandidatesPerJob || 0}</div>
              <div className="text-sm text-muted-foreground">Average candidates per job</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg text-center">
                <div className="text-lg font-semibold">{data?.sourcingJobs || 0}</div>
                <div className="text-xs text-muted-foreground">Sourcing</div>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <div className="text-lg font-semibold">{data?.recruitingJobs || 0}</div>
                <div className="text-xs text-muted-foreground">Recruiting</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
