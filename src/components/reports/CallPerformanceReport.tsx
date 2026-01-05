import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Phone, Mic, TrendingUp, TrendingDown } from "lucide-react";
import { CallPerformanceMetrics } from "@/hooks/useReportsData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format } from "date-fns";

interface CallPerformanceReportProps {
  data: CallPerformanceMetrics | undefined;
  isLoading: boolean;
  dateRange: { from?: Date; to?: Date };
}

export function CallPerformanceReport({ data, isLoading, dateRange }: CallPerformanceReportProps) {
  const exportToCSV = () => {
    if (!data) return;
    
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Calls', data.totalCalls.toString()],
      ['Calls with Recordings', data.callsWithRecordings.toString()],
      ['Average AI Score', data.avgAiScore.toString()],
      ['Average CV Score', data.avgCvScore.toString()],
      ['Average Comm Score', data.avgCommScore.toString()],
      ['High Scorers (75+)', data.highScorers.toString()],
      ['Low Scorers (<50)', data.lowScorers.toString()],
    ];
    
    let filename = 'call-performance-report';
    if (dateRange.from) {
      filename += `_${format(dateRange.from, 'yyyy-MM-dd')}`;
      if (dateRange.to) filename += `_to_${format(dateRange.to, 'yyyy-MM-dd')}`;
    }
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartColors = ['hsl(var(--destructive))', 'hsl(var(--chart-4))', 'hsl(var(--chart-2))', 'hsl(var(--primary))'];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Phone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-light font-work">Call Performance</CardTitle>
            <CardDescription className="font-light font-inter">AI caller effectiveness and score analysis</CardDescription>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={exportToCSV} disabled={!data}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Call Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Phone className="w-4 h-4" />
              <span className="text-xs">Total Calls</span>
            </div>
            <div className="text-2xl font-semibold">{data?.totalCalls || 0}</div>
          </div>
          <div className="p-4 border rounded-lg bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Mic className="w-4 h-4" />
              <span className="text-xs">With Recordings</span>
            </div>
            <div className="text-2xl font-semibold">{data?.callsWithRecordings || 0}</div>
          </div>
          <div className="p-4 border rounded-lg bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs">High Scorers</span>
            </div>
            <div className="text-2xl font-semibold text-green-500">{data?.highScorers || 0}</div>
          </div>
          <div className="p-4 border rounded-lg bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-xs">Low Scorers</span>
            </div>
            <div className="text-2xl font-semibold text-red-500">{data?.lowScorers || 0}</div>
          </div>
        </div>

        {/* Average Scores */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg text-center">
            <div className="text-sm text-muted-foreground mb-2">Avg AI Score</div>
            <div className="text-4xl font-bold text-primary">{data?.avgAiScore || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">After call evaluation</div>
          </div>
          <div className="p-4 border rounded-lg text-center">
            <div className="text-sm text-muted-foreground mb-2">Avg CV Score</div>
            <div className="text-4xl font-bold" style={{ color: 'hsl(var(--chart-2))' }}>{data?.avgCvScore || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Resume quality</div>
          </div>
          <div className="p-4 border rounded-lg text-center">
            <div className="text-sm text-muted-foreground mb-2">Avg Comm Score</div>
            <div className="text-4xl font-bold" style={{ color: 'hsl(var(--chart-3))' }}>{data?.avgCommScore || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Communication ability</div>
          </div>
        </div>

        {/* Score Distribution Chart */}
        <div>
          <h4 className="text-sm font-medium mb-3">Score Distribution</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.scoreDistribution || []}>
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {(data?.scoreDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
