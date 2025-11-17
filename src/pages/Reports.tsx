import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, FileText, Calendar, BarChart3, Clock } from "lucide-react"
import { CandidateProgressionReport } from "@/components/reports/CandidateProgressionReport"
import { useUserRole } from "@/hooks/useUserRole"
import { useState } from "react"

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
  const [selectedReport, setSelectedReport] = useState<typeof reports[0] | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
                    <Badge variant={report.status === "ready" ? "default" : "secondary"} className="self-start sm:self-auto">
                      {report.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs sm:text-sm">Generated: {report.lastGenerated}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">{report.type}</Badge>
                        <Badge variant="outline" className="text-xs">{report.format}</Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" disabled={report.status !== "ready"} className="w-full sm:w-auto">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full sm:w-auto"
                          onClick={() => {
                            setSelectedReport(report);
                            setIsDetailsOpen(true);
                          }}
                        >
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

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-light font-work">
                {selectedReport?.title}
              </DialogTitle>
              <DialogDescription className="font-light font-inter">
                {selectedReport?.description}
              </DialogDescription>
            </DialogHeader>
            
            {selectedReport && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Type</div>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline">{selectedReport.type}</Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Format</div>
                    <div className="mt-1">
                      <Badge variant="outline">{selectedReport.format}</Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <div className="mt-1">
                      <Badge variant={selectedReport.status === "ready" ? "default" : "secondary"}>
                        {selectedReport.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Last Generated</div>
                    <div className="mt-1 text-sm">{selectedReport.lastGenerated}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Report Details</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground">
                      {selectedReport.type === "Performance" && 
                        "This report provides a comprehensive overview of AI caller performance metrics including call success rates, average call duration, conversation quality scores, and key performance indicators over the past week."
                      }
                      {selectedReport.type === "Analytics" && 
                        "Detailed analysis of the recruitment pipeline showing candidate progression through each stage, conversion rates, bottlenecks, and recommendations for optimization."
                      }
                      {selectedReport.type === "Operations" && 
                        "Statistical breakdown of call volumes by time period, duration analysis, peak calling hours, success metrics, and operational efficiency indicators."
                      }
                      {selectedReport.type === "Financial" && 
                        "Comprehensive ROI analysis showing cost per hire, campaign expenses, time-to-fill metrics, and overall return on investment for AI-driven recruitment campaigns."
                      }
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Key Metrics</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 border rounded-lg">
                      <div className="text-2xl font-semibold">
                        {selectedReport.type === "Performance" ? "94%" : 
                         selectedReport.type === "Analytics" ? "67%" :
                         selectedReport.type === "Operations" ? "1,234" :
                         "$45K"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {selectedReport.type === "Performance" ? "Success Rate" : 
                         selectedReport.type === "Analytics" ? "Conversion Rate" :
                         selectedReport.type === "Operations" ? "Total Calls" :
                         "Total Savings"}
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-2xl font-semibold">
                        {selectedReport.type === "Performance" ? "8.5m" : 
                         selectedReport.type === "Analytics" ? "450" :
                         selectedReport.type === "Operations" ? "12m" :
                         "15d"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {selectedReport.type === "Performance" ? "Avg Duration" : 
                         selectedReport.type === "Analytics" ? "Candidates" :
                         selectedReport.type === "Operations" ? "Avg Duration" :
                         "Time to Fill"}
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg col-span-2 sm:col-span-1">
                      <div className="text-2xl font-semibold">
                        {selectedReport.type === "Performance" ? "4.8/5" : 
                         selectedReport.type === "Analytics" ? "23%" :
                         selectedReport.type === "Operations" ? "87%" :
                         "320%"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {selectedReport.type === "Performance" ? "Quality Score" : 
                         selectedReport.type === "Analytics" ? "Drop-off Rate" :
                         selectedReport.type === "Operations" ? "Utilization" :
                         "ROI"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                  <Button 
                    className="flex-1"
                    disabled={selectedReport.status !== "ready"}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsDetailsOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  )
}