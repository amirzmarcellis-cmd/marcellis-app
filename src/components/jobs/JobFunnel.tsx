import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface JobFunnelProps {
  candidates: any[];
  jobAssignment?: string | null;
}

export function JobFunnel({ candidates, jobAssignment }: JobFunnelProps) {
  // Calculate counts for each funnel stage
  const getCounts = () => {
    // Only count candidates that are actually longlisted (have longlisted_at value)
    const longlistedCandidates = candidates.filter(c => c.longlisted_at != null);
    const longlist = longlistedCandidates.length;
    
    // Count by contacted status (only from longlisted candidates)
    const firstNoAnswer = longlistedCandidates.filter(c => c["contacted"] === "1st No Answer").length;
    const secondNoAnswer = longlistedCandidates.filter(c => c["contacted"] === "2nd No Answer").length;
    const thirdNoAnswer = longlistedCandidates.filter(c => c["contacted"] === "3rd No Answer").length;
    const contacted = longlistedCandidates.filter(c => c["contacted"] === "Contacted").length;
    
    // Low scored (contacted status is "Low Scored")
    const lowScored = longlistedCandidates.filter(c => c["contacted"] === "Low Scored").length;
    
    // Shortlist (score >= 74)
    const shortlist = longlistedCandidates.filter(c => {
      const score = parseInt(c["after_call_score"] || "0");
      return score >= 74;
    }).length;
    
    // Submitted (candidates with submitted status)
    const submitted = longlistedCandidates.filter(c => c["contacted"] === "Submitted").length;
    
    // Rejected (candidates with rejected status)
    const rejected = longlistedCandidates.filter(c => c["contacted"] === "Rejected").length;
    
    return {
      longlist,
      firstNoAnswer,
      secondNoAnswer,
      thirdNoAnswer,
      contacted,
      lowScored,
      shortlist,
      submitted,
      rejected
    };
  };

  const counts = getCounts();
  
  // Organize stages into two rows
  const firstRowStages = [
    { name: "Longlist", count: counts.longlist, bgColor: "bg-blue-600", textColor: "text-white" },
    { name: "Shortlist", count: counts.shortlist, bgColor: "bg-emerald-600", textColor: "text-white" },
    { name: "Contacted", count: counts.contacted, bgColor: "bg-green-600", textColor: "text-white" }
  ];

  const secondRowStages = [
    { name: "Low Scored", count: counts.lowScored, bgColor: "bg-red-600", textColor: "text-white" },
    { name: "Submitted", count: counts.submitted, bgColor: "bg-purple-600", textColor: "text-white" },
    { name: "Rejected", count: counts.rejected, bgColor: "bg-gray-600", textColor: "text-white" }
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Job Funnel</CardTitle>
          <Badge variant="outline" className="text-xs">
            {candidates.length} Total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Two-row funnel layout */}
        <div className="space-y-3">
          {/* First row: Longlist, Shortlist, Contacted */}
          <div className="flex items-center justify-center space-x-2">
            {firstRowStages.map((stage, index) => (
              <div key={stage.name} className="flex items-center space-x-2">
                <div className="flex flex-col items-center space-y-1 min-w-0">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold", stage.bgColor, stage.textColor)}>
                    {stage.count}
                  </div>
                  <span className="text-xs text-center text-muted-foreground truncate">
                    {stage.name}
                  </span>
                </div>
                {index < firstRowStages.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
          
          {/* Second row: Low Scored, Submitted, Rejected */}
          <div className="flex items-center justify-center space-x-2">
            {secondRowStages.map((stage, index) => (
              <div key={stage.name} className="flex items-center space-x-2">
                <div className="flex flex-col items-center space-y-1 min-w-0">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold", stage.bgColor, stage.textColor)}>
                    {stage.count}
                  </div>
                  <span className="text-xs text-center text-muted-foreground truncate">
                    {stage.name}
                  </span>
                </div>
                {index < secondRowStages.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}