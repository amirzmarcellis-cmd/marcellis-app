import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, MapPin, Calendar, DollarSign, Users, FileText, Clock, Target } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

// Using any type to avoid TypeScript complexity with quoted property names

export default function JobDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchJob(id)
    }
  }, [id])

  const fetchJob = async (jobId: string) => {
    try {
      setJob({
        "Job ID": jobId,
        "Job Title": "Loading...",
        "Client Description": "Loading...", 
        "Job Location": "Loading...",
        "Job Salary Range (ex: 15000 AED)": "Loading...",
        "Job Description": "Loading...",
        "Things to look for": "Loading...",
        "Criteria to evaluate by": "Loading...",
        "JD Summary": "Loading...",
        Processed: "false",
        Timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error fetching job:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <h2 className="text-2xl font-bold text-muted-foreground">Job not found</h2>
          <Button onClick={() => navigate('/jobs')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </DashboardLayout>
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
    <DashboardLayout>
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
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
        </Tabs>
      </div>
    </DashboardLayout>
  )
}