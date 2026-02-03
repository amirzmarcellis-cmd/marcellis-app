import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface JobFunnelProps {
  candidates: any[];
  jobAssignment?: string | null;
}

export function JobFunnel({ candidates, jobAssignment }: JobFunnelProps) {
  const isMobile = useIsMobile();
  
  // Memoize the counts calculation to avoid recalculating on every render
  const counts = useMemo(() => {
    // Count all candidates regardless of source (unified with job card)
    const longlistedCandidates = candidates;
    
    const longlist = longlistedCandidates.length;
    
    // Use reduce for better performance with single pass through data
    const statusCounts = longlistedCandidates.reduce((acc, c) => {
      const contacted = c["contacted"];
      const score = parseInt(c["after_call_score"] || "0");
      
      switch (contacted) {
        case "1st No Answer":
          acc.firstNoAnswer++;
          break;
        case "2nd No Answer":
          acc.secondNoAnswer++;
          break;
        case "3rd No Answer":
          acc.thirdNoAnswer++;
          break;
        case "Contacted":
          acc.contacted++;
          break;
        case "Low Scored":
          acc.lowScored++;
          break;
        case "Submitted":
          acc.submitted++;
          break;
        case "Rejected":
          acc.rejected++;
          break;
      }
      
      // Count shortlist candidates (score >= 75) - unified definition
      // Exclude candidates with "Shortlisted from Similar jobs" status
      if (score >= 75 && contacted !== "Shortlisted from Similar jobs") {
        acc.shortlist++;
      }
      
      return acc;
    }, {
      firstNoAnswer: 0,
      secondNoAnswer: 0,
      thirdNoAnswer: 0,
      contacted: 0,
      lowScored: 0,
      submitted: 0,
      rejected: 0,
      shortlist: 0
    });

    return {
      longlist,
      ...statusCounts
    };
  }, [candidates]);

  // Memoize stages array
  const allStages = useMemo(() => [
    { name: "Longlist", count: counts.longlist, bgColor: "bg-blue-600", textColor: "text-black dark:text-white" },
    { name: "1st No Answer", count: counts.firstNoAnswer, bgColor: "bg-orange-500", textColor: "text-black dark:text-white" },
    { name: "2nd No Answer", count: counts.secondNoAnswer, bgColor: "bg-orange-600", textColor: "text-black dark:text-white" },
    { name: "3rd No Answer", count: counts.thirdNoAnswer, bgColor: "bg-orange-700", textColor: "text-black dark:text-white" },
    { name: "Contacted", count: counts.contacted, bgColor: "bg-green-600", textColor: "text-black dark:text-white" },
    { name: "Low Scored", count: counts.lowScored, bgColor: "bg-red-600", textColor: "text-black dark:text-white" },
    { name: "Shortlist", count: counts.shortlist, bgColor: "bg-emerald-600", textColor: "text-black dark:text-white" },
    { name: "Submitted", count: counts.submitted, bgColor: "bg-purple-600", textColor: "text-black dark:text-white" }
  ], [counts]);

  // Mobile view shows only key stages
  const mobileStages = useMemo(() => [
    { name: "Longlist", count: counts.longlist, bgColor: "bg-blue-600", textColor: "text-black dark:text-white" },
    { name: "Shortlist", count: counts.shortlist, bgColor: "bg-emerald-600", textColor: "text-black dark:text-white" },
    { name: "Submitted", count: counts.submitted, bgColor: "bg-purple-600", textColor: "text-black dark:text-white" }
  ], [counts]);

  const stages = isMobile ? mobileStages : allStages;

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
        <div className="flex flex-wrap md:flex-nowrap items-center justify-start md:justify-between gap-3 md:gap-2 mb-4 w-full">
          {stages.map((stage, index) => (
            <div key={stage.name} className="flex items-center gap-2 sm:gap-2">
              <div className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-0 flex-1">
                <div className={cn("w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold", stage.bgColor, stage.textColor)}>
                  {stage.count}
                </div>
                <span className="text-[10px] sm:text-xs text-center text-muted-foreground line-clamp-2 w-full leading-tight">
                  {stage.name}
                </span>
              </div>
              {index < stages.length - 1 && (
                <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0 hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}