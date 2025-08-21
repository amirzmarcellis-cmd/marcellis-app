// @ts-nocheck
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, MapPin, Briefcase, Mail, Phone, Search, Filter, Eye, Download, Calendar, Clock, ExternalLink, Edit, UserPlus, Upload } from "lucide-react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"
import { HeroHeader } from "@/components/dashboard/HeroHeader"
import { CandidateDialog } from "@/components/candidates/CandidateDialog"
import { BulkCandidateUpload } from "@/components/candidates/BulkCandidateUpload"

interface Candidate {
  candidate_id: string
  first_name: string | null
  last_name: string | null
  Email: string | null
  phone_number: string | null
  Title: string | null
  Location: string | null
  Skills: string | null
  Experience: string | null
  current_company: string | null
  applied_for: string[] | null
  CV_Link: string | null
  cv_summary: string | null
  Education: string | null
  Language: string | null
  Certifications: string | null
  other_notes: string | null
  Timestamp: string | null
}

export default function Candidates() {
  const [searchTerm, setSearchTerm] = useState("")
  const [jobTitleFilter, setJobTitleFilter] = useState("all")
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [jobsCVs, setJobsCVs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    try {
      // Fetch CVs data with company filtering
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('CVs')
        .select('*')
        .order('Timestamp', { ascending: false })

      if (candidatesError) throw candidatesError

      // Fetch Jobs data with company filtering
      const { data: jobsData, error: jobsError } = await supabase
        .from('Jobs')
        .select('*')

      if (jobsError) throw jobsError

      // Fetch Jobs_CVs data with company filtering
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
    const fullName = `${candidate.first_name || ""} ${candidate.last_name || ""}`.trim()
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (candidate.Title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (candidate.Email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (candidate.Skills || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (candidate.candidate_id || "").toLowerCase().includes(searchTerm.toLowerCase())
    
    // Job title filter - check if candidate applied to jobs with this title
    let matchesJobTitle = true
    if (jobTitleFilter !== "all") {
      const candidateJobApplications = jobsCVs.filter(jc => jc.Candidate_ID === candidate.candidate_id)
      const candidateJobIds = candidateJobApplications.map(jc => jc.job_id)
      const candidateJobs = jobs.filter(job => candidateJobIds.includes(job.job_id))
      matchesJobTitle = candidateJobs.some(job => job.job_title === jobTitleFilter)
    }
    
    return matchesSearch && matchesJobTitle
  })

  const uniqueJobTitles = [...new Set(jobs.map(j => j.job_title).filter(Boolean))]

  const handleCallCandidate = async (candidateID: string) => {
    try {
      const candidate = candidates.find(c => c.candidate_id === candidateID)
      const jobID = Array.isArray(candidate?.applied_for) && candidate.applied_for.length > 0 
        ? candidate.applied_for[0] 
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

  const handleAddCandidate = () => {
    setSelectedCandidate(null)
    setDialogOpen(true)
  }

  const handleSaveCandidate = () => {
    setDialogOpen(false)
    setBulkUploadOpen(false)
    fetchCandidates() // Refresh the candidates list
  }

  return (
      <div className="space-y-6">
        <HeroHeader
          title="Candidates"
          subtitle="Manage your recruitment pipeline"
          actions={
            <div className="flex gap-2">
              <Button onClick={() => setBulkUploadOpen(true)} variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Add Multiple Candidates
              </Button>
              <Button onClick={handleAddCandidate} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add Candidate
              </Button>
            </div>
          }
        />

        {/* Filters */}
        <Card className="p-6 bg-card border-border dark:bg-gradient-card dark:backdrop-blur-glass">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, email, title, skills, or candidate ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-border"
              />
            </div>
            <Select value={jobTitleFilter} onValueChange={setJobTitleFilter}>
              <SelectTrigger className="w-[200px] bg-background/50 border-border">
                <SelectValue placeholder="Job Title" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                <SelectItem value="all">All Job Titles</SelectItem>
                {uniqueJobTitles.map(jobTitle => (
                  <SelectItem key={jobTitle} value={jobTitle}>{jobTitle}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Candidates Table */}
        <Card className="bg-card border-border dark:bg-gradient-card dark:backdrop-blur-glass shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Candidates ({filteredCandidates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="w-[250px]">Candidate</TableHead>
                    <TableHead className="w-[200px]">Position</TableHead>
                    <TableHead className="w-[150px]">Status</TableHead>
                    <TableHead className="w-[150px]">Location</TableHead>
                    <TableHead className="w-[120px]">Last Contact</TableHead>
                    <TableHead className="w-[150px] text-right">Actions</TableHead>
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
                      const fullName = `${candidate.first_name || ""} ${candidate.last_name || ""}`.trim()
                      const initials = `${candidate.first_name?.[0] || ""}${candidate.last_name?.[0] || ""}`
                      const skills = candidate.Skills ? candidate.Skills.split(',').map(s => s.trim()) : []
                      
                      return (
                        <TableRow key={candidate.candidate_id} className="border-border hover:bg-glass-primary transition-colors">
                          <TableCell className="max-w-[250px]">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarFallback className="bg-gradient-primary text-white text-sm">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate">{fullName || "N/A"}</div>
                                <div className="text-sm text-muted-foreground truncate">{candidate.Email || "N/A"}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <div className="flex items-center space-x-2">
                              <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{candidate.Title || "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[150px]">
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(candidate.applied_for) && candidate.applied_for.length > 0 
                                ? candidate.applied_for.slice(0, 2).map((jobId) => (
                                    <Badge key={jobId} variant="secondary" className="text-xs truncate max-w-[60px]">
                                      {jobId}
                                    </Badge>
                                  ))
                                : <Badge variant="secondary" className="text-xs">Not Applied</Badge>
                              }
                              {Array.isArray(candidate.applied_for) && candidate.applied_for.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{candidate.applied_for.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[150px]">
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{candidate.Location || "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[120px]">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm truncate">{candidate.Timestamp ? formatDate(candidate.Timestamp) : "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right max-w-[150px]">
                            <div className="flex justify-end space-x-1">
                              <Button variant="outline" size="sm" asChild title="View Candidate" className="h-8 px-2">
                                <Link to={`/candidate/${candidate.candidate_id}`}>
                                  <Eye className="w-3 h-3" />
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild title="Edit Candidate" className="h-8 px-2">
                                <Link to={`/candidate/edit/${candidate.candidate_id}`}>
                                  <Edit className="w-3 h-3" />
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <CandidateDialog
          candidate={selectedCandidate}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSaveCandidate}
          jobs={jobs}
        />

        <BulkCandidateUpload
          open={bulkUploadOpen}
          onOpenChange={setBulkUploadOpen}
          onSuccess={handleSaveCandidate}
        />
      </div>
  )
}