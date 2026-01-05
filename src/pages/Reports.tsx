import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Ban, CalendarIcon, RefreshCw, X } from "lucide-react"
import { CandidateProgressionReport } from "@/components/reports/CandidateProgressionReport"
import { RejectedCandidatesReport } from "@/components/reports/RejectedCandidatesReport"
import { PipelineReport } from "@/components/reports/PipelineReport"
import { CallPerformanceReport } from "@/components/reports/CallPerformanceReport"
import { RecruiterLeaderboardReport } from "@/components/reports/RecruiterLeaderboardReport"
import { JobStatusReport } from "@/components/reports/JobStatusReport"
import { useUserRole } from "@/hooks/useUserRole"
import { useReportsData } from "@/hooks/useReportsData"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function Reports() {
  const { isAdmin } = useUserRole();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  
  const { pipeline, callPerformance, recruiters, jobStatus, isLoading, refetchAll } = useReportsData(dateRange);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light font-work tracking-tight text-foreground">Reports</h1>
          <p className="text-sm sm:text-base font-light font-inter text-muted-foreground">Live performance reports and analytics</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal flex-1 sm:flex-initial",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Filter by date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* Clear Date Filter */}
          {dateRange.from && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDateRange({})}
              className="h-10 w-10"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* Refresh Button */}
          <Button 
            variant="outline" 
            onClick={refetchAll}
            disabled={isLoading}
            className="font-light font-inter text-sm"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="standard" className="space-y-4 sm:space-y-6">
        <TabsList className="w-full sm:w-auto flex-wrap">
          <TabsTrigger value="standard" className="text-xs sm:text-sm">Live Reports</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="progression" className="text-xs sm:text-sm">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span className="hidden sm:inline">Candidate Progression</span>
              <span className="sm:hidden">Progression</span>
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="rejected" className="text-xs sm:text-sm">
              <Ban className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span className="hidden sm:inline">Rejected Candidates</span>
              <span className="sm:hidden">Rejected</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="standard" className="space-y-4 sm:space-y-6">
          {/* Pipeline Report */}
          <PipelineReport 
            data={pipeline.data} 
            isLoading={pipeline.isLoading} 
            dateRange={dateRange} 
          />

          {/* Call Performance Report */}
          <CallPerformanceReport 
            data={callPerformance.data} 
            isLoading={callPerformance.isLoading} 
            dateRange={dateRange} 
          />

          {/* Recruiter Leaderboard */}
          <RecruiterLeaderboardReport 
            data={recruiters.data} 
            isLoading={recruiters.isLoading} 
            dateRange={dateRange} 
          />

          {/* Job Status Overview */}
          <JobStatusReport 
            data={jobStatus.data} 
            isLoading={jobStatus.isLoading} 
          />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="progression">
            <CandidateProgressionReport />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="rejected">
            <RejectedCandidatesReport />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
