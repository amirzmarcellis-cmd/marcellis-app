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
  // Calculate counts for each stage
  const getCounts = () => {
    const longlist = candidates.length;
    
    // Debug: log all candidate scores to understand the data
    const allScores = candidates.map(c => ({
      id: c["Candidate_ID"],
      score: c["Success Score"],
      parsedScore: parseInt(c["Success Score"] || "0")
    }));
    
    console.log('Total candidates:', candidates.length);
    console.log('All candidate scores:', allScores);
    
    // Count by contacted status
    const firstNoAnswer = candidates.filter(c => c["contacted"] === "1st No Answer").length;
    const secondNoAnswer = candidates.filter(c => c["contacted"] === "2nd No Answer").length;
    const thirdNoAnswer = candidates.filter(c => c["contacted"] === "3rd No Answer").length;
    const contacted = candidates.filter(c => c["contacted"] === "Contacted").length;
    
    // Low scored (contacted status is "Low Scored")
    const lowScored = candidates.filter(c => c["contacted"] === "Low Scored").length;
    
    // Debug: log low scored calculation
    const lowScoredCandidates = candidates.filter(c => c["contacted"] === "Low Scored");
    console.log('Low scored candidates:', lowScored, 'Sample:', lowScoredCandidates.slice(0, 5).map(c => ({
      id: c["Candidate_ID"],
      contacted: c["contacted"]
    })));
    
    // Shortlist (score >= 74)
    const shortlist = candidates.filter(c => {
      const score = parseInt(c["success_score"] || "0");
      return score >= 74;
    }).length;
    
    // Tasked (contacted status is "Tasked")
    const tasked = candidates.filter(c => c["contacted"] === "Tasked").length;
    console.log('Tasked calculation:', { tasked, total: candidates.length, taskedCandidates: candidates.filter(c => c["contacted"] === "Tasked") });
    
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
    { name: "Longlist", count: counts.longlist, bgColor: "bg-blue-600", textColor: "text-black dark:text-white" },
    { name: "1st No Answer", count: counts.firstNoAnswer, bgColor: "bg-orange-500", textColor: "text-black dark:text-white" },
    { name: "2nd No Answer", count: counts.secondNoAnswer, bgColor: "bg-orange-600", textColor: "text-black dark:text-white" },
    { name: "3rd No Answer", count: counts.thirdNoAnswer, bgColor: "bg-orange-700", textColor: "text-black dark:text-white" },
    { name: "Contacted", count: counts.contacted, bgColor: "bg-green-600", textColor: "text-black dark:text-white" },
    { name: "Low Scored", count: counts.lowScored, bgColor: "bg-red-600", textColor: "text-black dark:text-white" },
    { name: "Shortlist", count: counts.shortlist, bgColor: "bg-emerald-600", textColor: "text-black dark:text-white" },
    { name: "Tasked", count: counts.tasked, bgColor: "bg-purple-600", textColor: "text-black dark:text-white" },
    { name: "Hired", count: counts.hired, bgColor: "bg-amber-500", textColor: "text-black dark:text-white" }
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