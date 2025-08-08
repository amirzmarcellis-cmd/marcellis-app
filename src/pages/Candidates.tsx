import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, MapPin, Briefcase, Mail, Phone, Search, Filter, Eye, Download, Calendar, Clock, ExternalLink, Edit } from "lucide-react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

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
  "Applied for": string[] | null
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
  const [jobTitleFilter, setJobTitleFilter] = useState("all")
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [jobsCVs, setJobsCVs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    try {
      // Fetch CVs data
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('CVs')
        .select('*')
        .order('Timestamp', { ascending: false })

      if (candidatesError) throw candidatesError

      // Fetch Jobs data
      const { data: jobsData, error: jobsError } = await supabase
        .from('Jobs')
        .select('*')

      if (jobsError) throw jobsError

      // Fetch Jobs_CVs data
      const { data: jobsCVsData, error: jobsCVsError } = await supabase
        .from('Jobs_CVs')
        .select('*')

      if (jobsCVsError) throw jobsCVsError

      setCandidates(candidatesData || [])
      setJobs(jobsData || [])
      setJobsCVs(jobsCVsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
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
    
    // Job title filter - check if candidate applied to jobs with this title
    let matchesJobTitle = true
    if (jobTitleFilter !== "all") {
      const candidateJobApplications = jobsCVs.filter(jc => jc["Candidate_ID"] === candidate["Cadndidate_ID"])
      const candidateJobIds = candidateJobApplications.map(jc => jc["Job ID"])
      const candidateJobs = jobs.filter(job => candidateJobIds.includes(job["Job ID"]))
      matchesJobTitle = candidateJobs.some(job => job["Job Title"] === jobTitleFilter)
    }
    
    return matchesSearch && matchesJobTitle
  })

  const uniqueJobTitles = [...new Set(jobs.map(j => j["Job Title"]).filter(Boolean))]

  const handleCallCandidate = async (candidateID: string) => {
    try {
      const candidate = candidates.find(c => c["Cadndidate_ID"] === candidateID)
      const jobID = Array.isArray(candidate?.["Applied for"]) && candidate["Applied for"].length > 0 
        ? candidate["Applied for"][0] 
        : ""
      
      const response = await fetch('https://hook.eu2.make.com/i3owa6dmu1mstug4tsfb0dnhhjfh4arj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateID,
          jobID
        }),
      })

      if (response.ok) {
        toast.success("Call initiated successfully!")
      } else {
        toast.error("Failed to initiate call")
      }
    } catch (error) {
      console.error('Error calling candidate:', error)
      toast.error("Failed to initiate call")
    }
  }

  return (
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
            <Select value={jobTitleFilter} onValueChange={setJobTitleFilter}>
              <SelectTrigger className="w-[200px] bg-background/50 border-glass-border">
                <SelectValue placeholder="Job Title" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Job Titles</SelectItem>
                {uniqueJobTitles.map(jobTitle => (
                  <SelectItem key={jobTitle} value={jobTitle}>{jobTitle}</SelectItem>
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
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(candidate["Applied for"]) && candidate["Applied for"].length > 0 
                              ? candidate["Applied for"].map((jobId) => (
                                  <Badge key={jobId} variant="secondary" className="capitalize text-xs">
                                    {jobId}
                                  </Badge>
                                ))
                              : <Badge variant="secondary" className="capitalize">Not Applied</Badge>
                            }
                          </div>
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
                            <span>{candidate.Timestamp ? formatDate(candidate.Timestamp) : "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button variant="outline" size="sm" asChild title="View Candidate">
                              <Link to={`/candidate/${candidate["Cadndidate_ID"]}`}>
                                👁️
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild title="Edit Candidate">
                              <Link to={`/candidate/edit/${candidate["Cadndidate_ID"]}`}>
                                ✏️
                              </Link>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleCallCandidate(candidate["Cadndidate_ID"])}
                              title="Call Candidate"
                            >
                              📞
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
  )
}