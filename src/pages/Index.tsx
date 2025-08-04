import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Phone,
  Calendar,
  Activity,
  Target,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts"

const callTrendData = [
  { time: '00:00', calls: 45 },
  { time: '04:00', calls: 32 },
  { time: '08:00', calls: 67 },
  { time: '12:00', calls: 89 },
  { time: '16:00', calls: 124 },
  { time: '20:00', calls: 97 },
]

const weeklyCallData = [
  { day: 'Mon', calls: 234 },
  { day: 'Tue', calls: 189 },
  { day: 'Wed', calls: 267 },
  { day: 'Thu', calls: 223 },
  { day: 'Fri', calls: 298 },
  { day: 'Sat', calls: 156 },
  { day: 'Sun', calls: 134 },
]

const funnelData = [
  { name: 'Contacted', value: 1247, color: '#4ECDC4' },
  { name: 'Qualified', value: 456, color: '#45B7D1' },
  { name: 'Interview', value: 189, color: '#96CEB4' },
  { name: 'Hired', value: 47, color: '#FFEAA7' },
]

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">

        {/* Top Row - Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Total Calls Today */}
          <Card className="glass-card metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total calls today</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-foreground">1,200</span>
                    <span className="text-sm font-medium text-primary">+2.1%</span>
                  </div>
                  <div className="h-8 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={callTrendData.slice(0, 4)}>
                        <Line type="monotone" dataKey="calls" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Calls Week */}
          <Card className="glass-card metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total calls week</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-foreground">200</span>
                    <span className="text-sm font-medium text-primary">112k</span>
                  </div>
                  <div className="h-8 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyCallData.slice(0, 5)}>
                        <Bar dataKey="calls" fill="hsl(var(--primary))" radius={2} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="w-12 h-12 bg-accent-blue/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-accent-blue" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visitor Online */}
          <Card className="glass-card metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Visitor online</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-foreground">32</span>
                    <span className="text-sm font-medium text-success">+5</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span className="text-xs text-muted-foreground">Live calls in progress</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call Success Rate */}
          <Card className="glass-card metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Call success rate</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-foreground">72</span>
                    <span className="text-lg text-muted-foreground">%</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
                <div className="w-12 h-12 bg-accent-orange/10 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-accent-orange" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - Funnel & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Candidate Funnel */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Candidate funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={funnelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {funnelData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="text-sm font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Performance insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">AI caller success</span>
                  <span className="text-lg font-bold text-foreground">4.5</span>
                </div>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div
                      key={star}
                      className={`w-4 h-4 rounded-sm ${star <= 4 ? 'bg-primary' : star === 5 ? 'bg-primary/50' : 'bg-muted'}`}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Retention rate</span>
                  <span className="text-lg font-bold text-foreground">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Call quality score</span>
                  <span className="text-lg font-bold text-foreground">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Avg response time</span>
                  <span className="text-lg font-bold text-foreground">2.3s</span>
                </div>
                <Progress value={77} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Third Row - Weekly Performance */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Weekly performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyCallData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Bar dataKey="calls" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  )
}

export default Index
