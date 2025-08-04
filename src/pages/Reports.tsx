import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Calendar, BarChart3 } from "lucide-react"

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
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Generate and download performance reports</p>
          </div>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Generate New Report
          </Button>
        </div>

        <div className="grid gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-medium transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {report.type === "Performance" && <BarChart3 className="w-5 h-5 text-primary" />}
                    {report.type === "Analytics" && <BarChart3 className="w-5 h-5 text-primary" />}
                    {report.type === "Operations" && <FileText className="w-5 h-5 text-primary" />}
                    {report.type === "Financial" && <FileText className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
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
      </div>
    </DashboardLayout>
  )
}