import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Download, Trophy, Medal, Award } from "lucide-react";
import { RecruiterMetrics } from "@/hooks/useReportsData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface RecruiterLeaderboardReportProps {
  data: RecruiterMetrics[] | undefined;
  isLoading: boolean;
  dateRange: { from?: Date; to?: Date };
}

export function RecruiterLeaderboardReport({ data, isLoading, dateRange }: RecruiterLeaderboardReportProps) {
  const formatHours = (hours: number | null) => {
    if (hours === null) return '-';
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (index === 1) return <Medal className="w-4 h-4 text-gray-400" />;
    if (index === 2) return <Award className="w-4 h-4 text-amber-600" />;
    return <span className="w-4 h-4 text-center text-muted-foreground text-sm">{index + 1}</span>;
  };

  const getPerformanceBadge = (rate: number) => {
    if (rate >= 20) return <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">Top Performer</Badge>;
    if (rate >= 10) return <Badge variant="secondary">Good</Badge>;
    if (rate < 5) return <Badge variant="outline" className="text-muted-foreground">Needs Improvement</Badge>;
    return null;
  };

  const exportToCSV = () => {
    if (!data || data.length === 0) return;
    
    const headers = ['Rank', 'Recruiter', 'Total Candidates', 'Shortlisted', 'Submitted', 'Submission Rate', 'Avg Time to Submit'];
    const rows = data.map((r, i) => [
      (i + 1).toString(),
      r.recruiter_name,
      r.totalCandidates.toString(),
      r.shortlisted.toString(),
      r.submitted.toString(),
      `${r.submissionRate.toFixed(1)}%`,
      formatHours(r.avgTimeToSubmit),
    ]);
    
    let filename = 'recruiter-leaderboard';
    if (dateRange.from) {
      filename += `_${format(dateRange.from, 'yyyy-MM-dd')}`;
      if (dateRange.to) filename += `_to_${format(dateRange.to, 'yyyy-MM-dd')}`;
    }
    
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
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
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-light font-work">Recruiter Leaderboard</CardTitle>
            <CardDescription className="font-light font-inter">Individual performance rankings</CardDescription>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={exportToCSV} disabled={!data || data.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Recruiter</TableHead>
                  <TableHead className="text-center">Candidates</TableHead>
                  <TableHead className="text-center">Shortlisted</TableHead>
                  <TableHead className="text-center">Submitted</TableHead>
                  <TableHead className="text-center">Rate</TableHead>
                  <TableHead className="text-center">Avg Time</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, 10).map((recruiter, index) => (
                  <TableRow key={recruiter.recruiter_id} className={index < 3 ? 'bg-primary/5' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-center justify-center">
                        {getRankIcon(index)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{recruiter.recruiter_name}</TableCell>
                    <TableCell className="text-center">{recruiter.totalCandidates}</TableCell>
                    <TableCell className="text-center">{recruiter.shortlisted}</TableCell>
                    <TableCell className="text-center font-semibold">{recruiter.submitted}</TableCell>
                    <TableCell className="text-center">
                      <span className={recruiter.submissionRate >= 15 ? 'text-green-500' : ''}>
                        {recruiter.submissionRate.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {formatHours(recruiter.avgTimeToSubmit)}
                    </TableCell>
                    <TableCell>
                      {getPerformanceBadge(recruiter.submissionRate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No recruiter data available for the selected period</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
