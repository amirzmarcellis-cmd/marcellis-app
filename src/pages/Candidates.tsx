import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, MapPin, Briefcase, Mail, Phone, Search, Filter, Eye, Download, Calendar, Clock } from "lucide-react"
import { useState } from "react"

const candidates = [
  {
    id: "1",
    name: "Sarah Chen",
    position: "Senior Developer",
    location: "San Francisco, CA", 
    status: "interviewed",
    experience: "5+ years",
    email: "sarah.chen@email.com",
    phone: "+1 (555) 123-4567",
    skills: ["React", "TypeScript", "Node.js", "Python"],
    lastContact: "2024-01-15",
    callHistory: [
      { date: "2024-01-15", duration: "25 min", outcome: "Positive", notes: "Great technical skills, interested in role" },
      { date: "2024-01-10", duration: "15 min", outcome: "Scheduled", notes: "Initial screening call" }
    ],
    avatar: "/placeholder.svg"
  },
  {
    id: "2",
    name: "Mike Johnson", 
    position: "Product Manager",
    location: "New York, NY",
    status: "contacted",
    experience: "3+ years", 
    email: "mike.johnson@email.com",
    phone: "+1 (555) 987-6543",
    skills: ["Product Strategy", "Agile", "Analytics", "Leadership"],
    lastContact: "2024-01-12",
    callHistory: [
      { date: "2024-01-12", duration: "20 min", outcome: "Follow-up", notes: "Discussed role requirements" }
    ],
    avatar: "/placeholder.svg"
  },
  {
    id: "3",
    name: "Emily Davis",
    position: "UI/UX Designer",
    location: "Austin, TX",
    status: "screening",
    experience: "4+ years",
    email: "emily.davis@email.com", 
    phone: "+1 (555) 456-7890",
    skills: ["Figma", "Adobe Creative Suite", "User Research", "Prototyping"],
    lastContact: "2024-01-14",
    callHistory: [
      { date: "2024-01-14", duration: "30 min", outcome: "Positive", notes: "Excellent portfolio, cultural fit" }
    ],
    avatar: "/placeholder.svg"
  }
]

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "interviewed": return "default"
    case "screening": return "secondary" 
    case "contacted": return "outline"
    default: return "secondary"
  }
}

export default function Candidates() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter
    const matchesPosition = positionFilter === "all" || candidate.position === positionFilter
    
    return matchesSearch && matchesStatus && matchesPosition
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Candidates</h1>
          <p className="text-muted-foreground">Manage your recruitment pipeline</p>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-gradient-card backdrop-blur-glass border-glass-border">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search candidates..."
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
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-[180px] bg-background/50 border-glass-border">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="Senior Developer">Senior Developer</SelectItem>
                <SelectItem value="Product Manager">Product Manager</SelectItem>
                <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Candidates Table */}
        <Card className="bg-gradient-card backdrop-blur-glass border-glass-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Candidates ({filteredCandidates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-glass-border">
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map((candidate) => (
                  <TableRow key={candidate.id} className="border-glass-border hover:bg-glass-primary transition-colors">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={candidate.avatar} />
                          <AvatarFallback className="bg-gradient-primary text-white">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{candidate.name}</div>
                          <div className="text-sm text-muted-foreground">{candidate.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span>{candidate.position}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(candidate.status)} className="capitalize">
                        {candidate.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{candidate.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{candidate.lastContact}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl bg-gradient-card backdrop-blur-glass border-glass-border">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-3">
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src={candidate.avatar} />
                                  <AvatarFallback className="bg-gradient-primary text-white">
                                    {candidate.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h2 className="text-xl font-bold">{candidate.name}</h2>
                                  <p className="text-muted-foreground">{candidate.position}</p>
                                </div>
                              </DialogTitle>
                            </DialogHeader>
                            
                            <Tabs defaultValue="profile" className="w-full">
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="profile">Profile</TabsTrigger>
                                <TabsTrigger value="calls">Call History</TabsTrigger>
                                <TabsTrigger value="documents">Documents</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="profile" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <h3 className="font-semibold flex items-center gap-2">
                                      <Mail className="w-4 h-4" />
                                      Contact Information
                                    </h3>
                                    <p><strong>Email:</strong> {candidate.email}</p>
                                    <p><strong>Phone:</strong> {candidate.phone}</p>
                                    <p><strong>Location:</strong> {candidate.location}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <h3 className="font-semibold">Professional Details</h3>
                                    <p><strong>Experience:</strong> {candidate.experience}</p>
                                    <p><strong>Status:</strong> <Badge variant={getStatusBadgeVariant(candidate.status)}>{candidate.status}</Badge></p>
                                    <div>
                                      <strong>Skills:</strong>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {candidate.skills.map(skill => (
                                          <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="calls" className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  Call History
                                </h3>
                                <div className="space-y-3">
                                  {candidate.callHistory.map((call, index) => (
                                    <div key={index} className="p-4 rounded-lg bg-background/50 border border-glass-border">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="font-medium flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {call.date}
                                          </p>
                                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Duration: {call.duration}
                                          </p>
                                        </div>
                                        <Badge variant={call.outcome === "Positive" ? "default" : "secondary"}>
                                          {call.outcome}
                                        </Badge>
                                      </div>
                                      <p className="mt-2 text-sm">{call.notes}</p>
                                    </div>
                                  ))}
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="documents" className="space-y-4">
                                <div className="text-center py-8">
                                  <Download className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                  <h3 className="font-semibold">Documents</h3>
                                  <p className="text-muted-foreground">CV and portfolio documents will appear here</p>
                                  <Button className="mt-4" variant="outline">
                                    <Download className="w-4 h-4 mr-2" />
                                    Upload Document
                                  </Button>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" className="bg-gradient-primary hover:bg-gradient-primary/90">
                          Schedule Call
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}