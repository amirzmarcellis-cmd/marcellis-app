import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, Calendar, BarChart3, Clock } from "lucide-react"
import { CandidateProgressionReport } from "@/components/reports/CandidateProgressionReport"
import { useUserRole } from "@/hooks/useUserRole"

const reports = [
  {
    id: "1",
    title: "Weekly Performance Report",
    description: "Comprehensive overview of AI caller performance metrics",
    type: "Performance",
    lastGenerated: "2024-01-15",
    format: "PDF",
    status: "ready"
  },
  {
    id: "2", 
    title: "Candidate Pipeline Analysis",
    description: "Detailed breakdown of recruitment pipeline and conversion rates",
    type: "Analytics",
    lastGenerated: "2024-01-14",
    format: "Excel",
    status: "ready"
  },
  {
    id: "3",
    title: "Monthly Call Volume Report", 
    description: "Call statistics, duration analysis, and success metrics",
    type: "Operations",
    lastGenerated: "2024-01-12",
    format: "PDF",
    status: "generating"
  },
  {
    id: "4",
    title: "ROI and Cost Analysis",
    description: "Return on investment analysis for AI recruitment campaigns",
    type: "Financial",
    lastGenerated: "2024-01-10",
    format: "Excel", 
    status: "ready"
  }
]

export default function Reports() {
  const { isAdmin } = useUserRole();

  return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light font-work tracking-tight text-foreground">Reports</h1>
            <p className="text-sm sm:text-base font-light font-inter text-muted-foreground">Generate and download performance reports</p>
          </div>
          <Button className="font-light font-inter text-sm w-full sm:w-auto">
            <FileText className="w-4 h-4 mr-2" />
            Generate New Report
          </Button>
        </div>

        <Tabs defaultValue="standard" className="space-y-4 sm:space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="standard" className="text-xs sm:text-sm">Standard Reports</TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="progression" className="text-xs sm:text-sm">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                <span className="hidden sm:inline">Candidate Progression</span>
                <span className="sm:hidden">Progression</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="standard" className="space-y-3 sm:space-y-4 lg:space-y-6">
            <div className="grid gap-3 sm:gap-4 lg:gap-6">
              {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-medium transition-shadow">
                  <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0 pb-3 sm:pb-4 p-4 sm:p-6">
                    <div className="flex items-start sm:items-center space-x-3 w-full sm:w-auto">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {report.type === "Performance" && <BarChart3 className="w-5 h-5 text-primary" />}
                        {report.type === "Analytics" && <BarChart3 className="w-5 h-5 text-primary" />}
                        {report.type === "Operations" && <FileText className="w-5 h-5 text-primary" />}
                        {report.type === "Financial" && <FileText className="w-5 h-5 text-primary" />}
                      </div>
                  <div>
                    <CardTitle className="text-2xl font-light font-work">{report.title}</CardTitle>
                    <CardDescription className="font-light font-inter">{report.description}</CardDescription>
                  </div>
                    </div>
                    <Badge variant={report.status === "ready" ? "default" : "secondary"}>
                      {report.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Generated: {report.lastGenerated}</span>
                        </div>
                        <Badge variant="outline">{report.type}</Badge>
                        <Badge variant="outline">{report.format}</Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" disabled={report.status !== "ready"}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Automated Reports</CardTitle>
                <CardDescription>Schedule regular report generation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Automated Reporting</h3>
                  <p className="text-sm">Set up automated report generation and delivery schedules</p>
                  <Button className="mt-4" variant="outline">
                    Configure Automation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="progression">
              <CandidateProgressionReport />
            </TabsContent>
          )}
        </Tabs>
      </div>
  )
}