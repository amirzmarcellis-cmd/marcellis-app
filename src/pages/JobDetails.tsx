import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, MapPin, Calendar, DollarSign, Users, FileText, Clock, Target, Phone, Mail, Star } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

// Using any type to avoid TypeScript complexity with quoted property names

export default function JobDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState<any[]>([])
  const [candidatesLoading, setCandidatesLoading] = useState(true)

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
                  Contacted Candidates ({candidates.length})
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {candidates.map((candidate, index) => (
                      <Card key={index} className="border border-border/50 hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{candidate["Candidate Name"] || "Unknown"}</h4>
                                <p className="text-sm text-muted-foreground">{candidate["Candidate_ID"]}</p>
                              </div>
                              {candidate["Success Score"] && (
                                <Badge variant="outline" className="text-xs">
                                  <Star className="w-3 h-3 mr-1" />
                                  {candidate["Success Score"]}
                                </Badge>
                              )}
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
                              <Badge variant={candidate["Contacted"] === "Yes" ? "default" : "secondary"}>
                                {candidate["Contacted"] === "Yes" ? "Contacted" : "Not Contacted"}
                              </Badge>
                              
                              {candidate["Relatable CV?"] && (
                                <Badge variant={candidate["Relatable CV?"] === "Yes" ? "default" : "destructive"}>
                                  {candidate["Relatable CV?"] === "Yes" ? "Relevant" : "Not Relevant"}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}