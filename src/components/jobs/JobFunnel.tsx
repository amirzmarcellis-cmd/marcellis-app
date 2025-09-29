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
    
    return {
      longlist,
      firstNoAnswer,
      secondNoAnswer,
      thirdNoAnswer,
      contacted,
      lowScored,
      shortlist,
      submitted
    };
  };

  const counts = getCounts();
  
  const stages = [
    { name: "Longlist", count: counts.longlist, bgColor: "bg-blue-600", textColor: "text-black dark:text-white" },
    { name: "1st No Answer", count: counts.firstNoAnswer, bgColor: "bg-orange-500", textColor: "text-black dark:text-white" },
    { name: "2nd No Answer", count: counts.secondNoAnswer, bgColor: "bg-orange-600", textColor: "text-black dark:text-white" },
    { name: "3rd No Answer", count: counts.thirdNoAnswer, bgColor: "bg-orange-700", textColor: "text-black dark:text-white" },
    { name: "Contacted", count: counts.contacted, bgColor: "bg-green-600", textColor: "text-black dark:text-white" },
    { name: "Low Scored", count: counts.lowScored, bgColor: "bg-red-600", textColor: "text-black dark:text-white" },
    { name: "Shortlist", count: counts.shortlist, bgColor: "bg-emerald-600", textColor: "text-black dark:text-white" },
    { name: "Submitted", count: counts.submitted, bgColor: "bg-purple-600", textColor: "text-black dark:text-white" }
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
        {/* Horizontal funnel layout */}
        <div className="flex items-center justify-between space-x-2 mb-4">
          {stages.map((stage, index) => (
            <div key={stage.name} className="flex items-center space-x-2">
              <div className="flex flex-col items-center space-y-1 min-w-0 flex-1">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold", stage.bgColor, stage.textColor)}>
                  {stage.count}
                </div>
                <span className="text-xs text-center text-muted-foreground truncate w-full">
                  {stage.name}
                </span>
              </div>
              {index < stages.length - 1 && (
                <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}