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
    const firstNoAnswer = candidates.filter(c => c["Contacted"] === "1st No Answer").length;
    const secondNoAnswer = candidates.filter(c => c["Contacted"] === "2nd No Answer").length;
    const thirdNoAnswer = candidates.filter(c => c["Contacted"] === "3rd No Answer").length;
    const contacted = candidates.filter(c => c["Contacted"] === "Contacted").length;
    
    // Low scored (score >= 1 and < 50) - Debug this calculation
    const lowScoredCandidates = candidates.filter(c => {
      const score = parseInt(c["Success Score"] || "0");
      return score >= 1 && score < 50;
    });
    const lowScored = lowScoredCandidates.length;
    
    // Debug: log low scored calculation
    console.log('Low scored candidates:', lowScoredCandidates.length, 'Sample:', lowScoredCandidates.slice(0, 5).map(c => ({
      id: c["Candidate_ID"],
      score: c["Success Score"],
      parsedScore: parseInt(c["Success Score"] || "0")
    })));
    
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
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium", stage.color)}>
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
        
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border text-sm">
          <div className="text-center">
            <div className="font-medium text-foreground">Conversion</div>
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