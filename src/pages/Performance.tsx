import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Star, Award, TrendingUp, Target } from "lucide-react"

const performanceMetrics = [
  {
    metric: "Call Quality Score",
    value: 4.7,
    maxValue: 5,
    percentage: 94,
    trend: "+0.3",
    icon: Star
  },
  {
    metric: "Response Rate",
    value: 73,
    maxValue: 100,
    percentage: 73,
    trend: "+5.2%",
    icon: Target
  },
  {
    metric: "Lead Conversion",
    value: 28,
    maxValue: 100,
    percentage: 28,
    trend: "+2.1%",
    icon: Award
  },
  {
    metric: "Follow-up Success",
    value: 89,
    maxValue: 100,
    percentage: 89,
    trend: "+1.8%",
    icon: TrendingUp
  }
]

const topPerformers = [
  { name: "AI Assistant Alpha", score: 98, calls: 342, success: 76 },
  { name: "AI Assistant Beta", score: 95, calls: 289, success: 71 },
  { name: "AI Assistant Gamma", score: 92, calls: 267, success: 68 },
  { name: "AI Assistant Delta", score: 88, calls: 198, success: 62 }
]

export default function Performance() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Performance</h1>
          <p className="text-muted-foreground">AI caller performance metrics and insights</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {performanceMetrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metric.metric === "Call Quality Score" ? `${metric.value}/5` : `${metric.value}%`}
                </div>
                <div className="space-y-2">
                  <Progress value={metric.percentage} className="w-full" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">vs last month</span>
                    <Badge variant="secondary" className="text-success">
                      {metric.trend}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing AI Callers</CardTitle>
              <CardDescription>Ranked by overall performance score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-amber-600' : 'bg-slate-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{performer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {performer.calls} calls • {performer.success}% success
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">{performer.score}/100</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>Key findings and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border border-success/20 bg-success/5">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <h4 className="font-medium text-success">Strong Performance</h4>
                    <p className="text-sm text-muted-foreground">
                      Call quality scores have improved by 8% this month, indicating better conversation quality.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-start space-x-3">
                  <Target className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-primary">Optimization Opportunity</h4>
                    <p className="text-sm text-muted-foreground">
                      Response rates vary by time of day. Consider optimizing call scheduling for peak hours.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-muted bg-muted/20">
                <div className="flex items-start space-x-3">
                  <Award className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Recommendation</h4>
                    <p className="text-sm text-muted-foreground">
                      Deploy top-performing AI models to handle high-priority candidate calls.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}