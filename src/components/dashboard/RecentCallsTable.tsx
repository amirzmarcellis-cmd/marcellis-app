import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Clock, User, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface Call {
  id: string
  candidateName: string
  position: string
  duration: string
  status: "completed" | "missed" | "scheduled"
  outcome: "interested" | "not-interested" | "follow-up" | "pending"
  timestamp: string
}

const mockCalls: Call[] = [
  {
    id: "1",
    candidateName: "Sarah Johnson",
    position: "Senior Frontend Developer",
    duration: "8:45",
    status: "completed",
    outcome: "interested",
    timestamp: "2 minutes ago"
  },
  {
    id: "2",
    candidateName: "Michael Chen",
    position: "DevOps Engineer",
    duration: "12:30",
    status: "completed",
    outcome: "follow-up",
    timestamp: "15 minutes ago"
  },
  {
    id: "3",
    candidateName: "Emily Rodriguez",
    position: "Product Manager",
    duration: "6:20",
    status: "completed",
    outcome: "not-interested",
    timestamp: "32 minutes ago"
  },
  {
    id: "4",
    candidateName: "David Park",
    position: "UX Designer",
    duration: "0:00",
    status: "missed",
    outcome: "pending",
    timestamp: "1 hour ago"
  },
  {
    id: "5",
    candidateName: "Lisa Thompson",
    position: "Backend Developer",
    duration: "14:15",
    status: "completed",
    outcome: "interested",
    timestamp: "2 hours ago"
  }
]

export function RecentCallsTable() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-success" />
      case "missed":
        return <XCircle className="w-4 h-4 text-destructive" />
      case "scheduled":
        return <Clock className="w-4 h-4 text-warning" />
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "interested":
        return <Badge className="bg-success/10 text-success border-success/20">Interested</Badge>
      case "not-interested":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Not Interested</Badge>
      case "follow-up":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Follow-up</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <Card className="bg-gradient-card backdrop-blur-sm border-border/50 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Phone className="w-5 h-5 text-primary" />
          <span>Recent Calls</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockCalls.map((call) => (
            <div
              key={call.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors duration-200"
            >
              <div className="flex items-center space-x-4">
                {getStatusIcon(call.status)}
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-foreground">{call.candidateName}</p>
                    {getOutcomeBadge(call.outcome)}
                  </div>
                  <p className="text-sm text-muted-foreground">{call.position}</p>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3" />
                  <span>{call.duration}</span>
                </div>
                <p className="text-xs">{call.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}