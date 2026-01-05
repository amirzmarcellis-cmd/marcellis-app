import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, TrendingUp, Users, CheckCircle, XCircle, Send } from "lucide-react";
import { PipelineMetrics } from "@/hooks/useReportsData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format } from "date-fns";

interface PipelineReportProps {
  data: PipelineMetrics | undefined;
  isLoading: boolean;
  dateRange: { from?: Date; to?: Date };
}

export function PipelineReport({ data, isLoading, dateRange }: PipelineReportProps) {
  const funnelData = data ? [
    { stage: 'Longlisted', count: data.totalLonglisted, fill: 'hsl(var(--primary))' },
    { stage: 'Shortlisted', count: data.shortlisted, fill: 'hsl(var(--chart-2))' },
    { stage: 'Called', count: data.called, fill: 'hsl(var(--chart-3))' },
    { stage: 'Submitted', count: data.submitted, fill: 'hsl(var(--chart-4))' },
    { stage: 'Rejected', count: data.rejected, fill: 'hsl(var(--destructive))' },
  ] : [];

  const exportToCSV = () => {
    if (!data) return;
    
    const headers = ['Stage', 'Count'];
    const rows = [
      ['Longlisted', data.totalLonglisted.toString()],
      ['Shortlisted', data.shortlisted.toString()],
      ['Called', data.called.toString()],
      ['Submitted', data.submitted.toString()],
      ['Rejected', data.rejected.toString()],
      ['', ''],
      ['Conversion Rate', `${data.conversionRate.toFixed(1)}%`],
      ['Shortlist Rate', `${data.shortlistRate.toFixed(1)}%`],
    ];
    
    let filename = 'pipeline-report';
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-light font-work">Recruitment Pipeline</CardTitle>
            <CardDescription className="font-light font-inter">Conversion funnel and bottleneck analysis</CardDescription>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={exportToCSV} disabled={!data}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Longlisted</span>
            </div>
            <div className="text-2xl font-semibold">{data?.totalLonglisted || 0}</div>
          </div>
          <div className="p-4 border rounded-lg bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs">Shortlisted</span>
            </div>
            <div className="text-2xl font-semibold">{data?.shortlisted || 0}</div>
          </div>
          <div className="p-4 border rounded-lg bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Send className="w-4 h-4" />
              <span className="text-xs">Submitted</span>
            </div>
            <div className="text-2xl font-semibold">{data?.submitted || 0}</div>
          </div>
          <div className="p-4 border rounded-lg bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <XCircle className="w-4 h-4" />
              <span className="text-xs">Rejected</span>
            </div>
            <div className="text-2xl font-semibold">{data?.rejected || 0}</div>
          </div>
        </div>

        {/* Conversion Rates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="text-sm text-muted-foreground">Conversion Rate</div>
            <div className="text-3xl font-semibold text-primary">{data?.conversionRate.toFixed(1) || 0}%</div>
            <div className="text-xs text-muted-foreground mt-1">Longlisted → Submitted</div>
          </div>
          <div className="p-4 border rounded-lg bg-gradient-to-br from-chart-2/5 to-chart-2/10">
            <div className="text-sm text-muted-foreground">Shortlist Rate</div>
            <div className="text-3xl font-semibold" style={{ color: 'hsl(var(--chart-2))' }}>{data?.shortlistRate.toFixed(1) || 0}%</div>
            <div className="text-xs text-muted-foreground mt-1">Longlisted → Shortlisted</div>
          </div>
        </div>

        {/* Funnel Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="stage" width={80} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
