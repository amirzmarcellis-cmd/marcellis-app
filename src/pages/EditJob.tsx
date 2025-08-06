import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import FileUpload from "@/components/upload/FileUpload";

interface JobData {
  "Job ID": string;
  "Job Title": string;
  "Job Description": string;
  "Client Description": string;
  "Job Location": string;
  "Job Salary Range (ex: 15000 AED)": string;
  "Things to look for": string;
  "JD Summary": string;
  "Criteria to evaluate by": string;
  "assignment": string;
  "Processed": string;
}

export default function EditJob() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasAssignment, setHasAssignment] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; file_name: string; file_url: string; file_type: string; file_size: number }>>([]);
  
  const [formData, setFormData] = useState<JobData>({
    "Job ID": "",
    "Job Title": "",
    "Job Description": "",
    "Client Description": "",
    "Job Location": "",
    "Job Salary Range (ex: 15000 AED)": "",
    "Things to look for": "",
    "JD Summary": "",
    "Criteria to evaluate by": "",
    "assignment": "",
    "Processed": "Yes"
  });

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from('Jobs')
        .select('*')
        .eq('Job ID', id)
        .single();

      if (error) throw error;
      
      if (data) {
        setFormData(data);
        setHasAssignment(!!data.assignment);
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Basic validation
    if (!formData["Job Title"] || !formData["Job Description"]) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required fields (Job Title and Job Description)",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    try {
      const jobDataToUpdate = {
        ...formData,
        assignment: hasAssignment ? formData.assignment : null
      };

      const { error } = await supabase
        .from('Jobs')
        .update(jobDataToUpdate)
        .eq('Job ID', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job updated successfully!",
      });

      navigate("/jobs");
    } catch (error) {
      console.error('Error updating job:', error);
      toast({
        title: "Error",
        description: "Failed to update job",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (files: Array<{ id: string; file_name: string; file_url: string; file_type: string; file_size: number }>) => {
    setUploadedFiles(files);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading job details...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/jobs")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Jobs</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-glow">Edit Job</h1>
            <p className="text-muted-foreground">Update job posting details</p>
          </div>
        </div>
      </div>

      <Card className="mission-card">
        <CardHeader>
          <CardTitle>Edit Job Posting</CardTitle>
          <CardDescription>
            Update the job details and requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="details" className="space-y-6">
              <TabsList className="glass-card">
                <TabsTrigger value="details">Job Details</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="Job Title">Job Title *</Label>
                    <Input
                      id="Job Title"
                      name="Job Title"
                      value={formData["Job Title"]}
                      onChange={handleInputChange}
                      placeholder="e.g., Senior Software Engineer"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="Client Description">Company</Label>
                    <Input
                      id="Client Description"
                      name="Client Description"
                      value={formData["Client Description"]}
                      onChange={handleInputChange}
                      placeholder="Company name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="Job Location">Location</Label>
                    <Input
                      id="Job Location"
                      name="Job Location"
                      value={formData["Job Location"]}
                      onChange={handleInputChange}
                      placeholder="e.g., Dubai, UAE"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="Job Salary Range (ex: 15000 AED)">Salary Range</Label>
                    <Input
                      id="Job Salary Range (ex: 15000 AED)"
                      name="Job Salary Range (ex: 15000 AED)"
                      value={formData["Job Salary Range (ex: 15000 AED)"]}
                      onChange={handleInputChange}
                      placeholder="e.g., 15000 - 20000 AED"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Job Description">Job Description *</Label>
                  <Textarea
                    id="Job Description"
                    name="Job Description"
                    value={formData["Job Description"]}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Detailed job description..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Things to look for">Things to Look For</Label>
                  <Textarea
                    id="Things to look for"
                    name="Things to look for"
                    value={formData["Things to look for"]}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Key skills and qualifications to look for in candidates..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Criteria to evaluate by">Evaluation Criteria</Label>
                  <Textarea
                    id="Criteria to evaluate by"
                    name="Criteria to evaluate by"
                    value={formData["Criteria to evaluate by"]}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="How to evaluate candidates..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="JD Summary">Job Summary</Label>
                  <Textarea
                    id="JD Summary"
                    name="JD Summary"
                    value={formData["JD Summary"]}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Brief summary of the job..."
                  />
                </div>

                <div className="space-y-4 p-4 border border-border/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasAssignment"
                      checked={hasAssignment}
                      onCheckedChange={setHasAssignment}
                    />
                    <Label htmlFor="hasAssignment" className="text-sm font-medium">
                      Has Assignment?
                    </Label>
                  </div>
                  
                  {hasAssignment && (
                    <div className="space-y-2">
                      <Label htmlFor="assignment">Assignment Link</Label>
                      <Input
                        id="assignment"
                        name="assignment"
                        value={formData.assignment}
                        onChange={handleInputChange}
                        placeholder="https://example.com/assignment"
                        type="url"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Upload Related Documents</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload any additional documents related to this job posting
                    </p>
                    <FileUpload
                      onUploadComplete={handleFileUpload}
                      entityType="job"
                      entityId={formData["Job ID"]}
                      multiple={true}
                    />
                  </div>
                  
                  {uploadedFiles.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Uploaded Files:</h4>
                      <ul className="space-y-1">
                        {uploadedFiles.map((file, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            {file.file_name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-4 pt-6 border-t border-border/30">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/jobs")}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="action-button bg-gradient-primary hover:shadow-glow"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Updating..." : "Update Job"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}