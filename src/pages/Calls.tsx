import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Phone, PhoneCall, Clock, User, Search, Calendar, Filter } from "lucide-react"
import { useState } from "react"

const allCalls = [
  {
    id: "1",
    candidateName: "Sarah Chen",
    position: "Senior Developer",
    duration: "00:25:30",
    status: "completed",
    outcome: "positive",
    date: "2024-01-15",
    time: "14:30",
    notes: "Great technical discussion, moving to next round",
    avatar: "/placeholder.svg"
  },
  {
    id: "2", 
    candidateName: "Mike Johnson",
    position: "Product Manager",
    duration: "00:18:45",
    status: "completed",
    outcome: "follow-up",
    date: "2024-01-15",
    time: "11:00",
    notes: "Need to clarify salary expectations",
    avatar: "/placeholder.svg"
  },
  {
    id: "3",
    candidateName: "Emily Davis",
    position: "UI/UX Designer", 
    duration: "00:32:15",
    status: "completed",
    outcome: "positive",
    date: "2024-01-14",
    time: "16:45",
    notes: "Excellent portfolio presentation",
    avatar: "/placeholder.svg"
  },
  {
    id: "4",
    candidateName: "David Wilson",
    position: "Backend Engineer",
    duration: "00:15:20",
    status: "missed",
    outcome: "reschedule",
    date: "2024-01-14",
    time: "09:30",
    notes: "Candidate was unavailable",
    avatar: "/placeholder.svg"
  },
  {
    id: "5",
    candidateName: "Lisa Zhang",
    position: "Data Scientist",
    duration: "00:28:10",
    status: "completed",
    outcome: "negative",
    date: "2024-01-13",
    time: "13:15",
    notes: "Skills don't match requirements",
    avatar: "/placeholder.svg"
  }
]

const activeCalls = [
  {
    id: "a1",
    candidateName: "Alex Rodriguez",
    position: "Full Stack Developer",
    duration: "00:05:30",
    status: "in-progress",
    priority: "high",
    avatar: "/placeholder.svg"
  },
  {
    id: "a2", 
    candidateName: "Maria Garcia",
    position: "DevOps Engineer",
    duration: "00:02:15",
    status: "connecting",
    priority: "medium",
    avatar: "/placeholder.svg"
  }
]

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "completed": return "default"
    case "in-progress": return "default"
    case "missed": return "destructive"
    case "connecting": return "secondary"
    default: return "secondary"
  }
}

const getOutcomeBadgeVariant = (outcome: string) => {
  switch (outcome) {
    case "positive": return "default"
    case "negative": return "destructive"
    case "follow-up": return "secondary"
    case "reschedule": return "outline"
    default: return "secondary"
  }
}

export default function Calls() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [outcomeFilter, setOutcomeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const filteredCalls = allCalls.filter(call => {
    const matchesSearch = call.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || call.status === statusFilter
    const matchesOutcome = outcomeFilter === "all" || call.outcome === outcomeFilter
    const matchesDate = dateFilter === "all" || 
                       (dateFilter === "today" && call.date === "2024-01-15") ||
                       (dateFilter === "yesterday" && call.date === "2024-01-14") ||
                       (dateFilter === "week" && ["2024-01-13", "2024-01-14", "2024-01-15"].includes(call.date))
    
    return matchesSearch && matchesStatus && matchesOutcome && matchesDate
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Call Center</h1>
          <p className="text-muted-foreground">Monitor active calls and review call history</p>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active Calls</TabsTrigger>
            <TabsTrigger value="history">Call History</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <Card className="bg-gradient-card backdrop-blur-glass border-glass-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PhoneCall className="w-5 h-5" />
                  Active Calls ({activeCalls.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {activeCalls.map((call) => (
                    <Card key={call.id} className="bg-gradient-card backdrop-blur-glass border-glass-border hover:shadow-glow transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={call.avatar} />
                              <AvatarFallback className="bg-gradient-primary text-white">
                                {call.candidateName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{call.candidateName}</h3>
                              <p className="text-sm text-muted-foreground">{call.position}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-mono">{call.duration}</span>
                                <Badge variant={getStatusBadgeVariant(call.status)}>
                                  {call.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={call.priority === "high" ? "destructive" : call.priority === "medium" ? "default" : "secondary"}>
                              {call.priority} priority
                            </Badge>
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
                  {activeCalls.length === 0 && (
                    <div className="text-center py-8">
                      <Phone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold">No Active Calls</h3>
                      <p className="text-muted-foreground">All agents are currently available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {/* Filters */}
            <Card className="p-6 bg-gradient-card backdrop-blur-glass border-glass-border">
              <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search calls..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background/50 border-glass-border"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] bg-background/50 border-glass-border">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                  <SelectTrigger className="w-[150px] bg-background/50 border-glass-border">
                    <SelectValue placeholder="Outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Outcomes</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="reschedule">Reschedule</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[130px] bg-background/50 border-glass-border">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Call History Table */}
            <Card className="bg-gradient-card backdrop-blur-glass border-glass-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Call History ({filteredCalls.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-glass-border">
                      <TableHead>Candidate</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCalls.map((call) => (
                      <TableRow key={call.id} className="border-glass-border hover:bg-glass-primary transition-colors">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={call.avatar} />
                              <AvatarFallback className="bg-gradient-primary text-white text-xs">
                                {call.candidateName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{call.candidateName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{call.position}</TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{call.date}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">{call.time}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{call.duration}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(call.status)}>
                            {call.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getOutcomeBadgeVariant(call.outcome)}>
                            {call.outcome}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="text-sm text-muted-foreground truncate">{call.notes}</p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}