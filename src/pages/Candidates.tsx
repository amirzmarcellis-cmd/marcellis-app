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
import { User, MapPin, Briefcase, Mail, Phone, Search, Filter, Eye, Download, Calendar, Clock, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

interface Candidate {
  "Cadndidate_ID": string
  "First Name": string | null
  "Last Name": string | null
  "Email": string | null
  "Phone Number": string | null
  "Title": string | null
  "Location": string | null
  "Skills": string | null
  "Experience": string | null
  "Current Company": string | null
  "Applied for": string | null
  "CV_Link": string | null
  "CV Summary": string | null
  "Education": string | null
  "Language": string | null
  "Certifications": string | null
  "Other Notes": string | null
  "Timestamp": string | null
}

export default function Candidates() {
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState("all")
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('CVs')
        .select('*')
        .order('Timestamp', { ascending: false })

      if (error) throw error
      setCandidates(data || [])
    } catch (error) {
      console.error('Error fetching candidates:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCandidates = candidates.filter(candidate => {
    const fullName = `${candidate["First Name"] || ""} ${candidate["Last Name"] || ""}`.trim()
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (candidate.Title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (candidate.Email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (candidate.Skills || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPosition = positionFilter === "all" || (candidate["Applied for"] || "").includes(positionFilter)
    
    return matchesSearch && matchesPosition
  })

  const uniquePositions = [...new Set(candidates.map(c => c["Applied for"]).filter(Boolean))]

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
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-[180px] bg-background/50 border-glass-border">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {uniquePositions.map(position => (
                  <SelectItem key={position} value={position}>{position}</SelectItem>
                ))}
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading candidates...
                    </TableCell>
                  </TableRow>
                ) : filteredCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No candidates found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCandidates.map((candidate) => {
                    const fullName = `${candidate["First Name"] || ""} ${candidate["Last Name"] || ""}`.trim()
                    const initials = `${candidate["First Name"]?.[0] || ""}${candidate["Last Name"]?.[0] || ""}`
                    const skills = candidate.Skills ? candidate.Skills.split(',').map(s => s.trim()) : []
                    
                    return (
                      <TableRow key={candidate["Cadndidate_ID"]} className="border-glass-border hover:bg-glass-primary transition-colors">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-gradient-primary text-white">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{fullName || "N/A"}</div>
                              <div className="text-sm text-muted-foreground">{candidate.Email || "N/A"}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                            <span>{candidate.Title || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {candidate["Applied for"] || "Not Applied"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{candidate.Location || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{candidate.Timestamp ? new Date(candidate.Timestamp).toLocaleDateString() : "N/A"}</span>
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
                                      <AvatarFallback className="bg-gradient-primary text-white">
                                        {initials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h2 className="text-xl font-bold">{fullName}</h2>
                                      <p className="text-muted-foreground">{candidate.Title}</p>
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
                                        <p><strong>Email:</strong> {candidate.Email || "N/A"}</p>
                                        <p><strong>Phone:</strong> {candidate["Phone Number"] || "N/A"}</p>
                                        <p><strong>Location:</strong> {candidate.Location || "N/A"}</p>
                                        <p><strong>Current Company:</strong> {candidate["Current Company"] || "N/A"}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <h3 className="font-semibold">Professional Details</h3>
                                        <p><strong>Experience:</strong> {candidate.Experience || "N/A"}</p>
                                        <p><strong>Education:</strong> {candidate.Education || "N/A"}</p>
                                        <p><strong>Language:</strong> {candidate.Language || "N/A"}</p>
                                        <p><strong>Certifications:</strong> {candidate.Certifications || "N/A"}</p>
                                        <div>
                                          <strong>Skills:</strong>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {skills.map((skill, index) => (
                                              <Badge key={index} variant="secondary" className="text-xs">{skill}</Badge>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    {candidate["CV Summary"] && (
                                      <div className="space-y-2">
                                        <h3 className="font-semibold">CV Summary</h3>
                                        <p className="text-sm text-muted-foreground">{candidate["CV Summary"]}</p>
                                      </div>
                                    )}
                                    {candidate["Other Notes"] && (
                                      <div className="space-y-2">
                                        <h3 className="font-semibold">Other Notes</h3>
                                        <p className="text-sm text-muted-foreground">{candidate["Other Notes"]}</p>
                                      </div>
                                    )}
                                  </TabsContent>
                                  
                                  <TabsContent value="calls" className="space-y-4">
                                    <h3 className="font-semibold flex items-center gap-2">
                                      <Phone className="w-4 h-4" />
                                      Call History
                                    </h3>
                                    <div className="text-center py-8">
                                      <Phone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                      <p className="text-muted-foreground">No call history available</p>
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="documents" className="space-y-4">
                                    <div className="space-y-4">
                                      <h3 className="font-semibold flex items-center gap-2">
                                        <Download className="w-4 h-4" />
                                        Documents
                                      </h3>
                                      {candidate.CV_Link ? (
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-glass-border">
                                          <div className="flex items-center space-x-3">
                                            <Download className="w-8 h-8 text-primary" />
                                            <div>
                                              <p className="font-medium">CV Document</p>
                                              <p className="text-sm text-muted-foreground">Curriculum Vitae</p>
                                            </div>
                                          </div>
                                          <Button variant="outline" size="sm" asChild>
                                            <a href={candidate.CV_Link} target="_blank" rel="noopener noreferrer">
                                              <ExternalLink className="w-4 h-4 mr-2" />
                                              View
                                            </a>
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="text-center py-8">
                                          <Download className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                          <p className="text-muted-foreground">No documents available</p>
                                        </div>
                                      )}
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
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}