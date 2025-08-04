import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, PhoneCall, Clock, User } from "lucide-react"

const activeCalls = [
  {
    id: "1",
    candidateName: "Sarah Chen",
    position: "Senior Developer",
    duration: "00:03:45",
    status: "in-progress",
    priority: "high"
  },
  {
    id: "2", 
    candidateName: "Mike Johnson",
    position: "Product Manager",
    duration: "00:01:20",
    status: "connecting",
    priority: "medium"
  },
  {
    id: "3",
    candidateName: "Emily Davis",
    position: "UI/UX Designer", 
    duration: "00:07:12",
    status: "in-progress",
    priority: "low"
  }
]

export default function Calls() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Active Calls</h1>
          <p className="text-muted-foreground">Monitor and manage ongoing recruitment calls</p>
        </div>

        <div className="grid gap-4">
          {activeCalls.map((call) => (
            <Card key={call.id} className="hover:shadow-medium transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{call.candidateName}</CardTitle>
                    <CardDescription>{call.position}</CardDescription>
                  </div>
                </div>
                <Badge variant={call.priority === "high" ? "destructive" : call.priority === "medium" ? "default" : "secondary"}>
                  {call.priority}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-mono">{call.duration}</span>
                    </div>
                    <Badge variant={call.status === "in-progress" ? "default" : "secondary"}>
                      {call.status}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <PhoneCall className="w-4 h-4 mr-2" />
                      Join
                    </Button>
                    <Button variant="destructive" size="sm">
                      End Call
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}