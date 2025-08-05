import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, MapPin, Calendar, DollarSign, Users, FileText, Clock, Target, Phone, Mail, Star, Search, Filter } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

// Using any type to avoid TypeScript complexity with quoted property names

export default function JobDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState<any[]>([])
  const [candidatesLoading, setCandidatesLoading] = useState(true)
  const [nameFilter, setNameFilter] = useState("")
  const [emailFilter, setEmailFilter] = useState("")
  const [phoneFilter, setPhoneFilter] = useState("")
  const [scoreFilter, setScoreFilter] = useState("all")
  const [contactedFilter, setContactedFilter] = useState("all")

  useEffect(() => {
    if (id) {
      fetchJob(id)
      fetchCandidates(id)
    }
  }, [id])

  const fetchJob = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('Jobs')
        .select('*')
        .eq('Job ID', jobId)
        .single()

      if (error) throw error
      
      if (data) {
        setJob(data)
      } else {
        setJob(null)
      }
    } catch (error) {
      console.error('Error fetching job:', error)
      setJob(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchCandidates = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('Jobs_CVs')
        .select('*')
        .eq('Job ID', jobId)
        .order('callid', { ascending: false })

      if (error) throw error
      setCandidates(data || [])
    } catch (error) {
      console.error('Error fetching candidates:', error)
      setCandidates([])
    } finally {
      setCandidatesLoading(false)
    }
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    )
  }

  if (!job) {
    return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <h2 className="text-2xl font-bold text-muted-foreground">Job not found</h2>
          <Button onClick={() => navigate('/jobs')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
    )
  }

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default'
      case 'closed':
        return 'destructive'
      case 'draft':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getScoreBadge = (score: string | null) => {
    if (!score || score === "0" || score === "") return null
    
    const numScore = parseInt(score)
    if (numScore >= 75) {
      return <Badge className="bg-green-500 text-white">{score} High</Badge>
    } else if (numScore >= 50) {
      return <Badge className="bg-blue-500 text-white">{score} Moderate</Badge>
    } else {
      return <Badge className="bg-red-500 text-white">{score} Poor</Badge>
    }
  }

  // Filtered candidates based on all filters
  const filteredCandidates = candidates.filter(candidate => {
    const nameMatch = !nameFilter || (candidate["Candidate Name"] || "").toLowerCase().includes(nameFilter.toLowerCase())
    const emailMatch = !emailFilter || (candidate["Candidate Email"] || "").toLowerCase().includes(emailFilter.toLowerCase())
    const phoneMatch = !phoneFilter || (candidate["Candidate Phone Number"] || "").includes(phoneFilter)
    
    let scoreMatch = true
    if (scoreFilter !== "all") {
      const score = parseInt(candidate["Success Score"] || "0")
      switch (scoreFilter) {
        case "high":
          scoreMatch = score >= 75
          break
        case "moderate":
          scoreMatch = score >= 50 && score < 75
          break
        case "poor":
          scoreMatch = score > 0 && score < 50
          break
        case "none":
          scoreMatch = score === 0 || !candidate["Success Score"]
          break
      }
    }
    
    let contactedMatch = true
    if (contactedFilter !== "all") {
      const contacted = candidate["Contacted"] || ""
      contactedMatch = contactedFilter === "contacted" 
        ? contacted && contacted !== "Not contacted"
        : !contacted || contacted === "Not contacted"
    }
    
    return nameMatch && emailMatch && phoneMatch && scoreMatch && contactedMatch
  })

  const uniqueContactedStatuses = [...new Set(candidates.map(c => c["Contacted"]).filter(Boolean))]

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/jobs')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-3xl font-bold">Job Details</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              View Candidates
            </Button>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Edit Job
            </Button>
          </div>
        </div>

        {/* Job Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{job["Job Title"]}</h2>
                <p className="text-lg text-muted-foreground">{job["Client Description"] || "Client Description"}</p>
              </div>
              <Badge variant="outline" className="text-sm px-3 py-1">
                {job.Processed === "true" ? "Processed" : "Pending"}
              </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{job["Job Location"]}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>{job["Job Salary Range (ex: 15000 AED)"]}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Posted: {job.Timestamp}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="candidates">Contacted Candidates</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Job ID:</span>
                    <span className="font-mono text-sm">{job["Job ID"]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Client:</span>
                    <span>{job["Client Description"] || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{job["Job Location"]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline">
                      {job.Processed === "true" ? "Processed" : "Pending"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Timeline & Compensation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Salary Range:</span>
                    <span className="font-medium">{job["Job Salary Range (ex: 15000 AED)"]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posted Date:</span>
                    <span>{job.Timestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">JD Summary:</span>
                    <span>{job["JD Summary"] || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="description" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Job Description
                </CardTitle>
                <CardDescription>
                  Detailed overview of the role and responsibilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {job["Job Description"] || "No description available for this position."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Requirements & Qualifications
                </CardTitle>
                <CardDescription>
                  Skills, experience, and qualifications needed for this role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Things to look for:</h4>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {job["Things to look for"] || "No specific criteria listed."}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Evaluation Criteria:</h4>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {job["Criteria to evaluate by"] || "No evaluation criteria specified."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

           <TabsContent value="candidates" className="space-y-4">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center">
                   <Users className="w-5 h-5 mr-2" />
                   Contacted Candidates ({filteredCandidates.length} of {candidates.length})
                 </CardTitle>
                 <CardDescription>
                   Candidates who have been contacted for this position
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 {candidatesLoading ? (
                   <div className="flex items-center justify-center py-8">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                   </div>
                 ) : candidates.length === 0 ? (
                   <div className="text-center py-8">
                     <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                     <h3 className="text-lg font-semibold mb-2">No candidates contacted yet</h3>
                     <p className="text-muted-foreground">Start reaching out to potential candidates for this position</p>
                   </div>
                 ) : (
                   <>
                     {/* Filters */}
                     <Card className="p-4 mb-4 bg-muted/50">
                       <div className="flex items-center gap-2 mb-3">
                         <Filter className="w-4 h-4" />
                         <h4 className="font-medium">Filters</h4>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                         <div className="relative">
                           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                           <Input
                             placeholder="Filter by name..."
                             value={nameFilter}
                             onChange={(e) => setNameFilter(e.target.value)}
                             className="pl-10 h-8"
                           />
                         </div>
                         <Input
                           placeholder="Filter by email..."
                           value={emailFilter}
                           onChange={(e) => setEmailFilter(e.target.value)}
                           className="h-8"
                         />
                         <Input
                           placeholder="Filter by phone..."
                           value={phoneFilter}
                           onChange={(e) => setPhoneFilter(e.target.value)}
                           className="h-8"
                         />
                         <Select value={scoreFilter} onValueChange={setScoreFilter}>
                           <SelectTrigger className="h-8">
                             <SelectValue placeholder="Score" />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="all">All Scores</SelectItem>
                             <SelectItem value="high">High (75+)</SelectItem>
                             <SelectItem value="moderate">Moderate (50-74)</SelectItem>
                             <SelectItem value="poor">Poor (1-49)</SelectItem>
                             <SelectItem value="none">No Score</SelectItem>
                           </SelectContent>
                         </Select>
                         <Select value={contactedFilter} onValueChange={setContactedFilter}>
                           <SelectTrigger className="h-8">
                             <SelectValue placeholder="Status" />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="all">All Status</SelectItem>
                             <SelectItem value="contacted">Contacted</SelectItem>
                             <SelectItem value="not-contacted">Not Contacted</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                     </Card>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {filteredCandidates.map((candidate, index) => (
                      <Link 
                        key={index} 
                        to={`/call-log?candidate=${candidate["Candidate_ID"]}&job=${id}`}
                        className="block"
                      >
                        <Card className="border border-border/50 hover:border-primary/50 transition-colors cursor-pointer hover:shadow-lg">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold">{candidate["Candidate Name"] || "Unknown"}</h4>
                                  <p className="text-sm text-muted-foreground">{candidate["Candidate_ID"]}</p>
                                </div>
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                {candidate["Candidate Email"] && (
                                  <div className="flex items-center text-muted-foreground">
                                    <Mail className="w-4 h-4 mr-2" />
                                    <span className="truncate">{candidate["Candidate Email"]}</span>
                                  </div>
                                )}
                                
                                {candidate["Candidate Phone Number"] && (
                                  <div className="flex items-center text-muted-foreground">
                                    <Phone className="w-4 h-4 mr-2" />
                                    <span>{candidate["Candidate Phone Number"]}</span>
                                  </div>
                                )}
                              </div>

                              {candidate["Summary"] && (
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                  {candidate["Summary"]}
                                </p>
                              )}

                              <div className="flex items-center justify-between pt-2 border-t">
                                <span className="text-sm text-muted-foreground">
                                  {candidate["Contacted"] || "Not contacted"}
                                </span>
                                {getScoreBadge(candidate["Success Score"])}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                     ))}
                   </div>
                   </>
                 )}
               </CardContent>
             </Card>
           </TabsContent>
        </Tabs>
      </div>
  )
}