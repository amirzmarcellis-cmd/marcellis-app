import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface JobFunnelProps {
  candidates: any[];
  jobAssignment?: string | null;
}

export function JobFunnel({ candidates, jobAssignment }: JobFunnelProps) {
  // Calculate counts for each stage
  const getCounts = () => {
    const longlist = candidates.length;
    
    // Count by contacted status
    const firstNoAnswer = candidates.filter(c => c["Contacted"] === "1st No Answer").length;
    const secondNoAnswer = candidates.filter(c => c["Contacted"] === "2nd No Answer").length;
    const thirdNoAnswer = candidates.filter(c => c["Contacted"] === "3rd No Answer").length;
    const contacted = candidates.filter(c => c["Contacted"] === "Contacted").length;
    
    // Low scored (score < 50)
    const lowScored = candidates.filter(c => {
      const score = parseInt(c["Success Score"] || "0");
      return score > 0 && score < 50;
    }).length;
    
    // Shortlist (score >= 74)
    const shortlist = candidates.filter(c => {
      const score = parseInt(c["Success Score"] || "0");
      return score >= 74;
    }).length;
    
    // Tasked (if there's an assignment - this would need to be tracked separately)
    const tasked = candidates.filter(c => c["assignment_completed"] === true).length; // Placeholder
    
    // Hired (this would need to be tracked separately)
    const hired = candidates.filter(c => c["hired"] === true).length; // Placeholder
    
    return {
      longlist,
      firstNoAnswer,
      secondNoAnswer,
      thirdNoAnswer,
      contacted,
      lowScored,
      shortlist,
      tasked,
      hired
    };
  };

  const counts = getCounts();
  
  const stages = [
    { name: "Longlist", count: counts.longlist, color: "bg-blue-500" },
    { name: "1st No Answer", count: counts.firstNoAnswer, color: "bg-orange-400" },
    { name: "2nd No Answer", count: counts.secondNoAnswer, color: "bg-orange-500" },
    { name: "3rd No Answer", count: counts.thirdNoAnswer, color: "bg-orange-600" },
    { name: "Contacted", count: counts.contacted, color: "bg-green-500" },
    { name: "Low Scored", count: counts.lowScored, color: "bg-red-500" },
    { name: "Shortlist", count: counts.shortlist, color: "bg-emerald-500" },
    ...(jobAssignment ? [{ name: "Tasked", count: counts.tasked, color: "bg-purple-500" }] : []),
    { name: "Hired", count: counts.hired, color: "bg-primary" }
  ];

  const getWidthPercentage = (count: number) => {
    const maxCount = Math.max(...stages.map(s => s.count));
    if (maxCount === 0) return 10; // Minimum width for visibility
    return Math.max(10, (count / maxCount) * 100);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Job Funnel</span>
          <Badge variant="outline" className="text-xs">
            {candidates.length} Total Candidates
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.map((stage, index) => (
          <div key={stage.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", stage.color)} />
                <span className="text-sm font-medium">{stage.name}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {stage.count}
              </Badge>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={cn("h-2 rounded-full transition-all duration-300", stage.color)}
                style={{ width: `${getWidthPercentage(stage.count)}%` }}
              />
            </div>
            
            {/* Arrow connector (except for last item) */}
            {index < stages.length - 1 && (
              <div className="flex justify-center py-1">
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        
        {/* Summary stats */}
        <div className="mt-6 pt-4 border-t border-border grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-foreground">Conversion Rate</div>
            <div className="text-muted-foreground">
              {counts.longlist > 0 ? Math.round((counts.shortlist / counts.longlist) * 100) : 0}%
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-foreground">Contact Rate</div>
            <div className="text-muted-foreground">
              {counts.longlist > 0 ? Math.round((counts.contacted / counts.longlist) * 100) : 0}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}