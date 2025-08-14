// @ts-nocheck
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, FileText } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

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
}

export default function EditCandidate() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [candidate, setCandidate] = useState<Candidate | null>(null)

  useEffect(() => {
    if (id) {
      fetchCandidate()
    }
  }, [id])

  const fetchCandidate = async () => {
    try {
      const { data, error } = await supabase
        .from('CVs')
        .select('*')
        .eq('candidate_id', id)
        .maybeSingle()

      if (error) throw error
      setCandidate(data)
    } catch (error) {
      console.error('Error fetching candidate:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch candidate details',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!candidate) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from('CVs')
        .update(candidate)
        .eq('candidate_id', id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Candidate profile updated successfully',
      })
      
      navigate('/candidates')
    } catch (error) {
      console.error('Error updating candidate:', error)
      toast({
        title: 'Error',
        description: 'Failed to update candidate profile',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof Candidate, value: string | string[]) => {
    if (candidate) {
      setCandidate({ ...candidate, [field]: value })
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

  if (!candidate) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-muted-foreground">Candidate not found</h2>
          <Button onClick={() => navigate('/candidates')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Candidates
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/candidates')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Edit Candidate
              </h1>
              <p className="text-muted-foreground">
                {candidate.first_name} {candidate.last_name}
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary hover:bg-gradient-primary/90">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="bg-gradient-card backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={candidate.first_name || ""}
                    onChange={(e) => updateField("first_name", e.target.value)}
                    className="bg-background/50 border-glass-border"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={candidate.last_name || ""}
                    onChange={(e) => updateField("last_name", e.target.value)}
                    className="bg-background/50 border-glass-border"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="title" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Job Title
                </Label>
                <Input
                  id="title"
                  value={candidate.Title || ""}
                  onChange={(e) => updateField("Title", e.target.value)}
                  className="bg-background/50 border-glass-border"
                />
              </div>

              <div>
                <Label htmlFor="currentCompany">Current Company</Label>
                <Input
                  id="currentCompany"
                  value={candidate.current_company || ""}
                  onChange={(e) => updateField("current_company", e.target.value)}
                  className="bg-background/50 border-glass-border"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-gradient-card backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={candidate.Email || ""}
                  onChange={(e) => updateField("Email", e.target.value)}
                  className="bg-background/50 border-glass-border"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={candidate.phone_number || ""}
                  onChange={(e) => updateField("phone_number", e.target.value)}
                  className="bg-background/50 border-glass-border"
                />
              </div>

              <div>
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={candidate.Location || ""}
                  onChange={(e) => updateField("Location", e.target.value)}
                  className="bg-background/50 border-glass-border"
                />
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={candidate.Language || ""}
                  onChange={(e) => updateField("Language", e.target.value)}
                  className="bg-background/50 border-glass-border"
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="bg-gradient-card backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="skills">Skills</Label>
                <Textarea
                  id="skills"
                  value={candidate.Skills || ""}
                  onChange={(e) => updateField("Skills", e.target.value)}
                  placeholder="Enter skills separated by commas"
                  className="bg-background/50 border-glass-border"
                />
              </div>

              <div>
                <Label htmlFor="experience">Experience</Label>
                <Textarea
                  id="experience"
                  value={candidate.Experience || ""}
                  onChange={(e) => updateField("Experience", e.target.value)}
                  className="bg-background/50 border-glass-border"
                />
              </div>

              <div>
                <Label htmlFor="appliedFor">Applied For Jobs</Label>
                <div className="space-y-2">
                  <Input
                    value={Array.isArray(candidate.applied_for) ? candidate.applied_for.join(", ") : (candidate.applied_for || "")}
                    onChange={(e) => {
                      const value = e.target.value;
                      const jobIds = value.split(',').map(id => id.trim()).filter(id => id);
                      updateField("applied_for", jobIds);
                    }}
                    placeholder="Enter job IDs separated by commas"
                    className="bg-background/50 border-glass-border"
                  />
                  <p className="text-sm text-muted-foreground">
                    Multiple job IDs can be separated by commas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education & Certifications */}
          <Card className="bg-gradient-card backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education & Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="education" className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Education
                </Label>
                <Textarea
                  id="education"
                  value={candidate.Education || ""}
                  onChange={(e) => updateField("Education", e.target.value)}
                  className="bg-background/50 border-glass-border"
                />
              </div>

              <div>
                <Label htmlFor="certifications" className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Certifications
                </Label>
                <Textarea
                  id="certifications"
                  value={candidate.Certifications || ""}
                  onChange={(e) => updateField("Certifications", e.target.value)}
                  className="bg-background/50 border-glass-border"
                />
              </div>

              <div>
                <Label htmlFor="cvLink">CV Link</Label>
                <Input
                  id="cvLink"
                  value={candidate.CV_Link || ""}
                  onChange={(e) => updateField("CV_Link", e.target.value)}
                  className="bg-background/50 border-glass-border"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="lg:col-span-2 bg-gradient-card backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cvSummary">CV Summary</Label>
                <Textarea
                  id="cvSummary"
                  value={candidate.cv_summary || ""}
                  onChange={(e) => updateField("cv_summary", e.target.value)}
                  rows={4}
                  className="bg-background/50 border-glass-border"
                />
              </div>

              <div>
                <Label htmlFor="otherNotes">Other Notes</Label>
                <Textarea
                  id="otherNotes"
                  value={candidate.other_notes || ""}
                  onChange={(e) => updateField("other_notes", e.target.value)}
                  rows={3}
                  className="bg-background/50 border-glass-border"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}