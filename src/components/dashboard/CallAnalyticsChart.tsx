import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from "lucide-react"

const mockData = [
  { time: "9 AM", successful: 12, missed: 3, total: 15 },
  { time: "10 AM", successful: 18, missed: 2, total: 20 },
  { time: "11 AM", successful: 15, missed: 5, total: 20 },
  { time: "12 PM", successful: 8, missed: 2, total: 10 },
  { time: "1 PM", successful: 22, missed: 3, total: 25 },
  { time: "2 PM", successful: 19, missed: 6, total: 25 },
  { time: "3 PM", successful: 16, missed: 4, total: 20 },
  { time: "4 PM", successful: 14, missed: 1, total: 15 },
]

export function CallAnalyticsChart() {
  return (
    <Card className="bg-gradient-card backdrop-blur-sm border-border/50 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span>Call Performance Today</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={mockData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--card-foreground))'
              }}
            />
            <Bar 
              dataKey="successful" 
              fill="hsl(var(--success))" 
              name="Successful Calls"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="missed" 
              fill="hsl(var(--destructive))" 
              name="Missed Calls"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}