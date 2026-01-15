import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardMetrics {
  pipelineVelocity: {
    currentCount: number;
    previousCount: number;
    percentageChange: number;
  };
  avgTimeToHire: {
    days: number | null;
  };
  shortlistRate: {
    rate: number;
    highScoreCount: number;
    totalCount: number;
  };
  fillRate: {
    filledJobs: number;
    totalJobs: number;
    percentage: number;
  };
}

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // 1. Pipeline Velocity: Count candidates shortlisted in last 30 days vs previous 30 days
  const [currentPeriod, previousPeriod] = await Promise.all([
    supabase
      .from("Jobs_CVs")
      .select("shortlisted_at", { count: "exact", head: true })
      .gte("shortlisted_at", thirtyDaysAgo.toISOString())
      .not("shortlisted_at", "is", null),
    supabase
      .from("Jobs_CVs")
      .select("shortlisted_at", { count: "exact", head: true })
      .gte("shortlisted_at", sixtyDaysAgo.toISOString())
      .lt("shortlisted_at", thirtyDaysAgo.toISOString())
      .not("shortlisted_at", "is", null),
  ]);

  const currentCount = currentPeriod.count ?? 0;
  const previousCount = previousPeriod.count ?? 0;
  const percentageChange =
    previousCount > 0
      ? Math.round(((currentCount - previousCount) / previousCount) * 100)
      : currentCount > 0
      ? 100
      : 0;

  // 2. Avg Time to Hire: For candidates with contacted = 'Submitted', calculate avg(shortlisted_at - longlisted_at)
  const { data: hiredCandidates } = await supabase
    .from("Jobs_CVs")
    .select("shortlisted_at, longlisted_at")
    .eq("contacted", "Submitted")
    .not("shortlisted_at", "is", null)
    .not("longlisted_at", "is", null);

  let avgDays: number | null = null;
  if (hiredCandidates && hiredCandidates.length > 0) {
    const totalDays = hiredCandidates.reduce((sum, candidate) => {
      const shortlistDate = new Date(candidate.shortlisted_at);
      const longlistDate = new Date(candidate.longlisted_at);
      const diffDays = Math.abs(
        (shortlistDate.getTime() - longlistDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + diffDays;
    }, 0);
    avgDays = Math.round((totalDays / hiredCandidates.length) * 10) / 10;
  }

  // 3. Shortlist Rate: Candidates with after_call_score >= 75 / total candidates
  const [highScoreResult, totalResult] = await Promise.all([
    supabase
      .from("Jobs_CVs")
      .select("after_call_score", { count: "exact", head: true })
      .gte("after_call_score", 75),
    supabase
      .from("Jobs_CVs")
      .select("recordid", { count: "exact", head: true }),
  ]);

  const highScoreCount = highScoreResult.count ?? 0;
  const totalCandidatesCount = totalResult.count ?? 0;
  const shortlistRate =
    totalCandidatesCount > 0
      ? Math.round((highScoreCount / totalCandidatesCount) * 1000) / 10
      : 0;

  // 4. Fill Rate: Jobs with status = 'Complete', 'Completed', 'Filled', or 'Closed' / total jobs
  const [filledJobsResult, totalJobsResult] = await Promise.all([
    supabase
      .from("Jobs")
      .select("job_id", { count: "exact", head: true })
      .in("status", ["Complete", "Completed", "Filled", "Closed"]),
    supabase
      .from("Jobs")
      .select("job_id", { count: "exact", head: true }),
  ]);

  const filledJobs = filledJobsResult.count ?? 0;
  const totalJobs = totalJobsResult.count ?? 0;
  const fillPercentage =
    totalJobs > 0 ? Math.round((filledJobs / totalJobs) * 100) : 0;

  return {
    pipelineVelocity: {
      currentCount,
      previousCount,
      percentageChange,
    },
    avgTimeToHire: {
      days: avgDays,
    },
    shortlistRate: {
      rate: shortlistRate,
      highScoreCount,
      totalCount: totalCandidatesCount,
    },
    fillRate: {
      filledJobs,
      totalJobs,
      percentage: fillPercentage,
    },
  };
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: fetchDashboardMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
