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
import { Users, Upload, FileText, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompanyContext } from '@/contexts/CompanyContext';

interface Candidate {
  candidate_id: string;
  first_name: string | null;
  last_name: string | null;
  Email: string | null;
  phone_number: string | null;
  Title: string | null;
  Location: string | null;
  current_company: string | null;
  Skills: string | null;
  applied_for: string[] | null;
  cv_summary: string | null;
  Experience: string | null;
  Education: string | null;
  Certifications: string | null;
  Language: string | null;
  Linkedin: string | null;
  CV_Link: string | null;
  Timestamp: string | null;
  CandidateStatus: string | null;
  cv_text: string | null;
  other_notes: string | null;
  done_questions: string | null;
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
    experience: "",
    education: "",
    certifications: "",
    language: "",
    linkedin: "",
    candidateStatus: "",
    otherNotes: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState("");
  const { toast } = useToast();
  const { currentCompany } = useCompanyContext();

  useEffect(() => {
    if (candidate) {
      setFormData({
        firstName: candidate.first_name || "",
        lastName: candidate.last_name || "",
        email: candidate.Email || "",
        phone: candidate.phone_number || "",
        title: candidate.Title || "",
        location: candidate.Location || "",
        currentCompany: candidate.current_company || "",
        skills: candidate.Skills || "",
        appliedFor: candidate.applied_for || [],
        experience: candidate.Experience || "",
        education: candidate.Education || "",
        certifications: candidate.Certifications || "",
        language: candidate.Language || "",
        linkedin: candidate.Linkedin || "",
        candidateStatus: candidate.CandidateStatus || "",
        otherNotes: candidate.other_notes || "",
      });
      setCvUrl(candidate.CV_Link || "");
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
        experience: "",
        education: "",
        certifications: "",
        language: "",
        linkedin: "",
        candidateStatus: "",
        otherNotes: "",
      });
      setCvUrl("");
      setCvFile(null);
    }
  }, [candidate, open]);

  const generateCandidateId = async () => {
    if (!currentCompany?.id) return "COMPANY-C-0001";
    
    try {
      const subdomain = currentCompany.subdomain?.toUpperCase() || 'COMPANY';
      // Get all existing candidate IDs for this company that follow the subdomain pattern
      const { data: candidates, error } = await supabase
        .from('CVs')
        .select('candidate_id')
        .eq('company_id', currentCompany.id)
        .like('candidate_id', `${subdomain}-C-%`)
        .order('candidate_id', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1; // Default starting number if no candidates exist

      if (candidates && candidates.length > 0) {
        // Extract the number from the last candidate ID (e.g., "OCEAN-C-0001" -> 1)
        const lastId = candidates[0].candidate_id;
        const match = lastId.match(new RegExp(`${subdomain}-C-(\\d+)`));
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      return `${subdomain}-C-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating candidate ID:', error);
      const subdomain = currentCompany.subdomain?.toUpperCase() || 'COMPANY';
      // Fallback to timestamp-based ID if query fails
      return `${subdomain}-C-${Date.now().toString().slice(-4)}`;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.type.includes('document')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or document file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setCvFile(file);
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `cv-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cvs')
        .getPublicUrl(filePath);

      setCvUrl(publicUrl);
      
      toast({
        title: "Success",
        description: "CV uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload CV file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!cvUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "CV upload is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const candidateData = {
        candidate_id: candidate?.candidate_id || await generateCandidateId(),
        first_name: formData.firstName || null,
        last_name: formData.lastName || null,
        Email: formData.email || null,
        phone_number: formData.phone || null,
        Title: formData.title || null,
        Location: formData.location || null,
        current_company: formData.currentCompany || null,
        Skills: formData.skills || null,
        applied_for: formData.appliedFor.length > 0 ? formData.appliedFor : null,
        Experience: formData.experience || null,
        Education: formData.education || null,
        Certifications: formData.certifications || null,
        Language: formData.language || null,
        Linkedin: formData.linkedin || null,
        CV_Link: cvUrl,
        CandidateStatus: formData.candidateStatus || null,
        other_notes: formData.otherNotes || null,
        Timestamp: candidate?.Timestamp || new Date().toISOString(),
        company_id: currentCompany?.id, // Always include the current company ID
      };

      if (candidate) {
        // Update existing candidate
        const { error } = await supabase
          .from('CVs')
          .update(candidateData)
          .eq('candidate_id', candidate.candidate_id);

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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto glass-card">
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
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
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

              <div className="space-y-2">
                <Label htmlFor="candidateStatus">Candidate Status</Label>
                <Select value={formData.candidateStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, candidateStatus: value }))}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select status" />
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
                        .filter(job => !formData.appliedFor.includes(job.job_id))
                        .map((job) => (
                          <SelectItem key={job.job_id} value={job.job_id}>
                            {job.job_title} (ID: {job.job_id})
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  
                  {formData.appliedFor.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.appliedFor.map((jobId) => {
                        const job = jobs.find(j => j.job_id === jobId);
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
                            {job ? job.job_title : jobId} <X className="w-3 h-3 ml-1" />
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CV Upload Section */}
          <Card className="mission-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                CV Upload & Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cvUpload">Upload CV *</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      id="cvUpload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="bg-background/50"
                      disabled={uploading}
                    />
                  </div>
                  {uploading && (
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Uploading...</span>
                    </div>
                  )}
                </div>
                {cvUrl && (
                  <div className="text-sm text-muted-foreground">
                    CV uploaded: <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View CV</a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>


          {/* Notes Section */}
          <Card className="mission-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="otherNotes">Other Notes</Label>
                <Textarea
                  id="otherNotes"
                  value={formData.otherNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, otherNotes: e.target.value }))}
                  placeholder="Any additional notes about the candidate..."
                  className="bg-background/50 min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-border/30">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || uploading} className="action-button bg-gradient-primary">
            {loading ? "Saving..." : candidate ? "Update Candidate" : "Add Candidate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}