// @ts-nocheck
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface JobRecord {
  "Job ID": string;
  "Job Title": string | null;
  "Job Description": string | null;
  "Client Description": string | null;
  "Job Location": string | null;
  "Job Salary Range (ex: 15000 AED)": string | null;
  "Processed": string | null;
  "Things to look for": string | null;
  "JD Summary": string | null;
  musttohave?: string | null;
  nicetohave?: string | null;
  Timestamp: string | null;
}

interface JobDialogProps {
  job: JobRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function JobDialog({ job, open, onOpenChange, onSave }: JobDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    clientDescription: "",
    location: "",
    salaryRange: "",
    thingsToLookFor: "",
    summary: "",
    musttohave: "",
    nicetohave: "",
    status: "No",
  });
  const [loading, setLoading] = useState(false);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.job_title || "",
        description: job.job_description || "",
        clientDescription: job.client_description || "",
        location: job.job_location || "",
        salaryRange: job.job_salary_range || "",
        thingsToLookFor: job.things_to_look_for || "",
        summary: job.jd_summary || "",
        musttohave: job.musttohave || "",
        nicetohave: job.nicetohave || "",
        status: job["Processed"] || "No",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        clientDescription: "",
        location: "",
        salaryRange: "",
        thingsToLookFor: "",
        summary: "",
        musttohave: "",
        nicetohave: "",
        status: "No",
      });
    }
    setJdFile(null);
  }, [job, open]);

  const generateJobId = () => {
    // Generate ID in format DMS-J-0004
    const timestamp = Date.now().toString().slice(-4);
    return `DMS-J-${timestamp}`;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setJdFile(file);
      // You could process the file here to extract job description
      toast({
        title: "File uploaded",
        description: `${file.name} has been selected for processing`,
      });
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Job title is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const jobData = {
        job_id: (job as any)?.job_id || generateJobId(),
        job_title: formData.title,
        job_description: formData.description,
        client_description: formData.clientDescription,
        job_location: formData.location,
        job_salary_range: formData.salaryRange,
        Processed: formData.status,
        things_to_look_for: formData.thingsToLookFor,
        jd_summary: formData.summary,
        musttohave: formData.musttohave,
        nicetohave: formData.nicetohave,
        Timestamp: (job as any)?.Timestamp || new Date().toISOString(),
      };

      if (job) {
        // Update existing job
        const { error } = await supabase
          .from('Jobs')
          .update(jobData)
          .eq('job_id', (job as any).job_id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Job updated successfully",
        });
      } else {
        // Create new job
        const { error } = await supabase
          .from('Jobs')
          .insert([jobData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Job created successfully",
        });
      }

      onSave();
    } catch (error) {
      console.error('Error saving job:', error);
      toast({
        title: "Error",
        description: "Failed to save job",
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
            <Briefcase className="h-5 w-5 text-primary" />
            <span>{job ? "Edit Job" : "Create New Job"}</span>
          </DialogTitle>
          <DialogDescription>
            {job ? "Update job details and requirements" : "Create a new job posting with detailed requirements"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Basic Information */}
          <Card className="mission-card">
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Senior Software Engineer"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Dubai, UAE / Remote"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salary Range</Label>
                <Input
                  id="salary"
                  value={formData.salaryRange}
                  onChange={(e) => setFormData(prev => ({ ...prev, salaryRange: e.target.value }))}
                  placeholder="e.g., 15000-20000 AED"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Client Description</Label>
                <Textarea
                  id="client"
                  value={formData.clientDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientDescription: e.target.value }))}
                  placeholder="Describe the client company"
                  className="bg-background/50 min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Proceed</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="mission-card">
            <CardHeader>
              <CardTitle className="text-lg">Job Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Job Description</Label>
                <div className="border-2 border-dashed border-border/50 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="jd-upload"
                  />
                  <label htmlFor="jd-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {jdFile ? jdFile.name : "Click to upload JD file or drag and drop"}
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, TXT up to 10MB</p>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed job description, responsibilities, and requirements"
                  className="bg-background/50 min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">JD Summary</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief summary of the job"
                  className="bg-background/50 min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Requirements & Criteria */}
          <Card className="mission-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Requirements</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="thingsToLookFor">Things to Look For</Label>
                <Textarea
                  id="thingsToLookFor"
                  value={formData.thingsToLookFor}
                  onChange={(e) => setFormData(prev => ({ ...prev, thingsToLookFor: e.target.value }))}
                  placeholder="Key skills, experience, and qualifications to prioritize"
                  className="bg-background/50 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="musttohave">Must have</Label>
                <Textarea
                  id="musttohave"
                  value={formData.musttohave}
                  onChange={(e) => setFormData(prev => ({ ...prev, musttohave: e.target.value }))}
                  placeholder="Critical skills and requirements"
                  className="bg-background/50 min-h-[100px]"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="nicetohave">Nice to Have</Label>
                <Textarea
                  id="nicetohave"
                  value={formData.nicetohave}
                  onChange={(e) => setFormData(prev => ({ ...prev, nicetohave: e.target.value }))}
                  placeholder="Preferred skills and bonuses"
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
          <Button onClick={handleSave} disabled={loading} className="action-button bg-gradient-primary">
            {loading ? "Saving..." : job ? "Update Job" : "Create Job"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}