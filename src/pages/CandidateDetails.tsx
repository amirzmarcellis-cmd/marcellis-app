import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Phone, Mail, MapPin, Calendar, FileText, Star, Clock } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

// Using any type to avoid TypeScript complexity with quoted property names

export default function CandidateDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchCandidate(id)
    }
  }, [id])

  const fetchCandidate = async (candidateId: string) => {
    try {
      const { data, error } = await supabase
        .from('CVs')
        .select('*')
        .eq('candidate_id', candidateId)
        .maybeSingle()

      if (error) throw error
      setCandidate(data)
    } catch (error) {
      console.error('Error fetching candidate:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    )
  }

  if (!candidate) {
    return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <h2 className="text-2xl font-bold text-muted-foreground">Candidate not found</h2>
          <Button onClick={() => navigate('/candidates')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Candidates
          </Button>
        </div>
    )
  }

  const renderExperience = (experience: string) => {
    if (!experience) return <p className="text-muted-foreground">No experience data available</p>

    // Try to parse as JSON array first, if it fails, treat as text
    let experienceData;
    try {
      experienceData = JSON.parse(experience);
      if (!Array.isArray(experienceData)) {
        throw new Error('Not an array');
      }
    } catch {
      // If parsing fails, treat as plain text
      return (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {experience}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {experienceData.map((exp: any, index: number) => (
          <Card key={index} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{exp.title || exp.position || 'Position not specified'}</CardTitle>
                  <CardDescription className="text-base font-medium">
                    {exp.company || 'Company not specified'}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="ml-2">
                  {exp.start_date && exp.end_date 
                    ? `${exp.start_date} - ${exp.end_date}`
                    : exp.duration || 'Duration not specified'
                  }
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {exp.details || exp.description || 'No details available'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/candidates')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Candidates
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-3xl font-bold">Candidate Details</h1>
          </div>
        </div>

        {/* Candidate Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-6">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-2xl">
                  {`${(candidate["First Name"] || candidate.first_name || "")} ${(candidate["Last Name"] || candidate.last_name || "")}`.trim().split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{`${(candidate["First Name"] || candidate.first_name || "")} ${(candidate["Last Name"] || candidate.last_name || "")}`.trim()}</h2>
                    <p className="text-lg text-muted-foreground">{candidate.Title}</p>
                  </div>
                  <Badge 
                    variant="outline"
                    className="text-sm px-3 py-1"
                  >
                    {candidate["Applied for"] || (Array.isArray(candidate.applied_for) ? candidate.applied_for.join(', ') : candidate.applied_for) || "N/A"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-6 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {candidate.Email}
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {candidate["Phone Number"] || candidate.phone_number}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {candidate.Location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Current Company: {candidate["Current Company"] || candidate.current_company || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{candidate.Email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{candidate["Phone Number"]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{candidate.Location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Applied for:</span>
                    <Badge variant="outline">
                      {candidate["Applied for"] || "N/A"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Professional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Title:</span>
                    <span>{candidate.Title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Company:</span>
                    <span>{candidate["Current Company"] || candidate.current_company || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Candidate ID:</span>
                    <span className="font-mono text-sm">{candidate.candidate_id || candidate.Cadndidate_ID}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {candidate.Skills ? (
                    candidate.Skills.split(',').map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill.trim()}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No skills listed</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Work Experience
                </CardTitle>
                <CardDescription>
                  Professional background and career history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderExperience(candidate.Experience)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.CV_Link ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Curriculum Vitae</p>
                          <p className="text-sm text-muted-foreground">PDF Document</p>
                        </div>
                      </div>
                      <Button asChild>
                        <a href={candidate.CV_Link} target="_blank" rel="noopener noreferrer">
                          View CV
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No documents available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}