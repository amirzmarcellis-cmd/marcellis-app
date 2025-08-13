// @ts-nocheck
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Candidate {
  Cadndidate_ID: string;
  "First Name": string | null;
  "Last Name": string | null;
  Email: string | null;
  "Phone Number": string | null;
  Title: string | null;
  Location: string | null;
  "Current Company": string | null;
  Skills: string | null;
  "Applied for": string[] | null;
  "CV Summary": string | null;
  Experience: string | null;
  Education: string | null;
  Certifications: string | null;
  Language: string | null;
  Linkedin: string | null;
  CV_Link: string | null;
  Timestamp: string | null;
}

interface CandidateDialogProps {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  jobs: any[];
}

export function CandidateDialog({ candidate, open, onOpenChange, onSave, jobs }: CandidateDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    title: "",
    location: "",
    currentCompany: "",
    skills: "",
    appliedFor: [],
    cvSummary: "",
    experience: "",
    education: "",
    certifications: "",
    language: "",
    linkedin: "",
    status: "Not Reached",
    source: "Direct Apply",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (candidate) {
      setFormData({
        firstName: candidate["First Name"] || "",
        lastName: candidate["Last Name"] || "",
        email: candidate.Email || "",
        phone: candidate["Phone Number"] || "",
        title: candidate.Title || "",
        location: candidate.Location || "",
        currentCompany: candidate["Current Company"] || "",
        skills: candidate.Skills || "",
        appliedFor: candidate["Applied for"] || [],
        cvSummary: candidate["CV Summary"] || "",
        experience: candidate.Experience || "",
        education: candidate.Education || "",
        certifications: candidate.Certifications || "",
        language: candidate.Language || "",
        linkedin: candidate.Linkedin || "",
        status: "Not Reached", // Default since we don't have this field yet
        source: "Direct Apply", // Default since we don't have this field yet
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        title: "",
        location: "",
        currentCompany: "",
        skills: "",
        appliedFor: [],
        cvSummary: "",
        experience: "",
        education: "",
        certifications: "",
        language: "",
        linkedin: "",
        status: "Not Reached",
        source: "Direct Apply",
      });
    }
  }, [candidate, open]);

  const generateCandidateId = () => {
    return `CAND-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  };

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Validation Error",
        description: "First name and last name are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const candidateData = {
        Cadndidate_ID: candidate?.Cadndidate_ID || generateCandidateId(),
        "First Name": formData.firstName,
        "Last Name": formData.lastName,
        Email: formData.email,
        "Phone Number": formData.phone,
        Title: formData.title,
        Location: formData.location,
        "Current Company": formData.currentCompany,
        Skills: formData.skills,
        "Applied for": formData.appliedFor.length > 0 ? formData.appliedFor : null,
        "CV Summary": formData.cvSummary,
        Experience: formData.experience,
        Education: formData.education,
        Certifications: formData.certifications,
        Language: formData.language,
        Linkedin: formData.linkedin,
        Timestamp: candidate?.Timestamp || new Date().toISOString(),
      };

      if (candidate) {
        // Update existing candidate
        const { error } = await supabase
          .from('CVs')
          .update(candidateData)
          .eq('Cadndidate_ID', candidate.Cadndidate_ID);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Candidate updated successfully",
        });
      } else {
        // Create new candidate
        const { error } = await supabase
          .from('CVs')
          .insert([candidateData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Candidate added successfully",
        });
      }

      onSave();
    } catch (error) {
      console.error('Error saving candidate:', error);
      toast({
        title: "Error",
        description: "Failed to save candidate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Users className="h-5 w-5 text-primary" />
            <span>{candidate ? "Edit Candidate" : "Add New Candidate"}</span>
          </DialogTitle>
          <DialogDescription>
            {candidate ? "Update candidate information and status" : "Add a new candidate to your pipeline"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Personal Information */}
          <Card className="mission-card">
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Doe"
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john.doe@example.com"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+971 50 123 4567"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/johndoe"
                  className="bg-background/50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="mission-card">
            <CardHeader>
              <CardTitle className="text-lg">Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Senior Software Engineer"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentCompany">Current Company</Label>
                <Input
                  id="currentCompany"
                  value={formData.currentCompany}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentCompany: e.target.value }))}
                  placeholder="Tech Corp"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Dubai, UAE"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appliedFor">Applied for Jobs</Label>
                <div className="space-y-2">
                  <Select 
                    value="" 
                    onValueChange={(value) => {
                      if (value && !formData.appliedFor.includes(value)) {
                        setFormData(prev => ({ 
                          ...prev, 
                          appliedFor: [...prev.appliedFor, value] 
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Add a job..." />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs
                        .filter(job => !formData.appliedFor.includes(job["Job ID"]))
                        .map((job) => (
                          <SelectItem key={job["Job ID"]} value={job["Job ID"]}>
                            {job["Job Title"]} (ID: {job["Job ID"]})
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  
                  {formData.appliedFor.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.appliedFor.map((jobId) => {
                        const job = jobs.find(j => j["Job ID"] === jobId);
                        return (
                          <Badge 
                            key={jobId} 
                            variant="secondary" 
                            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                appliedFor: prev.appliedFor.filter(id => id !== jobId)
                              }));
                            }}
                          >
                            {job ? job["Job Title"] : jobId} ×
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Reached">Not Reached</SelectItem>
                      <SelectItem value="Called">Called</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="Interviewed">Interviewed</SelectItem>
                      <SelectItem value="Hired">Hired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select value={formData.source} onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Job Board">Job Board</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Direct Apply">Direct Apply</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Experience */}
          <Card className="mission-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Skills & Experience</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Textarea
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="React, TypeScript, Node.js, AWS"
                  className="bg-background/50 min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Languages</Label>
                <Textarea
                  id="language"
                  value={formData.language}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                  placeholder="English (Fluent), Arabic (Native)"
                  className="bg-background/50 min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="5+ years in software development..."
                  className="bg-background/50 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Textarea
                  id="education"
                  value={formData.education}
                  onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                  placeholder="Computer Science degree..."
                  className="bg-background/50 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications</Label>
                <Textarea
                  id="certifications"
                  value={formData.certifications}
                  onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
                  placeholder="AWS Certified, Google Cloud..."
                  className="bg-background/50 min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvSummary">CV Summary</Label>
                <Textarea
                  id="cvSummary"
                  value={formData.cvSummary}
                  onChange={(e) => setFormData(prev => ({ ...prev, cvSummary: e.target.value }))}
                  placeholder="Brief summary of the candidate..."
                  className="bg-background/50 min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-border/30">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className="action-button bg-gradient-primary">
            {loading ? "Saving..." : candidate ? "Update Candidate" : "Add Candidate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}