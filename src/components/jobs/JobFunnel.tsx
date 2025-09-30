import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface JobFunnelProps {
  candidates: any[];
  jobAssignment?: string | null;
}

export function JobFunnel({ candidates, jobAssignment }: JobFunnelProps) {
  // Memoize the counts calculation to avoid recalculating on every render
  const counts = useMemo(() => {
    // Only count Itris and LinkedIn candidates (matching AI Longlist tab logic)
    const longlistedCandidates = candidates.filter(c => {
      const source = (c["Source"] || c.source || "").toLowerCase();
      return source.includes("itris") || source.includes("linkedin");
    });
    
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
      
      // Count shortlist candidates (score >= 74)
      if (score >= 74) {
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
  const stages = useMemo(() => [
    { name: "Longlist", count: counts.longlist, bgColor: "bg-blue-600", textColor: "text-black dark:text-white" },
    { name: "1st No Answer", count: counts.firstNoAnswer, bgColor: "bg-orange-500", textColor: "text-black dark:text-white" },
    { name: "2nd No Answer", count: counts.secondNoAnswer, bgColor: "bg-orange-600", textColor: "text-black dark:text-white" },
    { name: "3rd No Answer", count: counts.thirdNoAnswer, bgColor: "bg-orange-700", textColor: "text-black dark:text-white" },
    { name: "Contacted", count: counts.contacted, bgColor: "bg-green-600", textColor: "text-black dark:text-white" },
    { name: "Low Scored", count: counts.lowScored, bgColor: "bg-red-600", textColor: "text-black dark:text-white" },
    { name: "Shortlist", count: counts.shortlist, bgColor: "bg-emerald-600", textColor: "text-black dark:text-white" },
    { name: "Submitted", count: counts.submitted, bgColor: "bg-purple-600", textColor: "text-black dark:text-white" }
  ], [counts]);

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