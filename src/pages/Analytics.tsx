import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CallAnalyticsChart } from "@/components/dashboard/CallAnalyticsChart"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { TrendingUp, TrendingDown, Phone, Users, Clock, Target } from "lucide-react"

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights and performance metrics</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Calls"
            value="1,247"
            change="+12.5%"
            changeType="positive"
            icon={Phone}
          />
          <MetricCard
            title="Success Rate"
            value="68.4%"
            change="+3.2%"
            changeType="positive"
            icon={Target}
          />
          <MetricCard
            title="Avg Call Duration"
            value="4:32"
            change="-0.8%"
            changeType="negative"
            icon={Clock}
          />
          <MetricCard
            title="Candidates Reached"
            value="852"
            change="+8.1%"
            changeType="positive"
            icon={Users}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Call Volume Trends</CardTitle>
              <CardDescription>Hourly call distribution over the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <CallAnalyticsChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>Key metrics breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Connection Rate</span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold">72.3%</span>
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Conversion Rate</span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold">24.8%</span>
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Follow-up Rate</span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold">89.1%</span>
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">No Answer Rate</span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold">18.2%</span>
                  <TrendingDown className="w-4 h-4 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}