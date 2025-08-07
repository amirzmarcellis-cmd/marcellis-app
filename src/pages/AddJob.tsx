import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AddJob() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    clientDescription: "",
    jobLocation: "",
    jobSalaryRange: "",
    assignment: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateJobId = async () => {
    try {
      const { data: jobs } = await supabase
        .from('Jobs')
        .select('"Job ID"')
        .order('"Job ID"', { ascending: false })
        .limit(1);

      if (jobs && jobs.length > 0) {
        const lastJobId = jobs[0]["Job ID"];
        const match = lastJobId.match(/DMS-J-(\d+)/);
        if (match) {
          const nextNumber = parseInt(match[1]) + 1;
          return `DMS-J-${nextNumber.toString().padStart(4, '0')}`;
        }
      }
      
      return "DMS-J-0001";
    } catch (error) {
      console.error('Error generating job ID:', error);
      return "DMS-J-0001";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.jobTitle || !formData.jobDescription) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const jobId = await generateJobId();
      
      const { error } = await supabase
        .from('Jobs')
        .insert({
          "Job ID": jobId,
          "Job Title": formData.jobTitle,
          "Job Description": formData.jobDescription,
          "Client Description": formData.clientDescription,
          "Job Location": formData.jobLocation,
          "Job Salary Range (ex: 15000 AED)": formData.jobSalaryRange,
          "assignment": formData.assignment ? "yes" : "no",
          "Timestamp": new Date().toISOString()
        });

      if (error) {
        console.error('Error creating job:', error);
        toast.error("Failed to create job");
        return;
      }
      
      toast.success("Job created successfully");
      navigate("/jobs");
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error("Failed to create job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/jobs")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
        <h1 className="text-3xl font-bold">Add New Job</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                placeholder="Enter job title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description *</Label>
              <Textarea
                id="jobDescription"
                value={formData.jobDescription}
                onChange={(e) => handleInputChange("jobDescription", e.target.value)}
                placeholder="Enter detailed job description"
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientDescription">Client Description</Label>
              <Textarea
                id="clientDescription"
                value={formData.clientDescription}
                onChange={(e) => handleInputChange("clientDescription", e.target.value)}
                placeholder="Enter client description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobLocation">Job Location</Label>
                <Input
                  id="jobLocation"
                  value={formData.jobLocation}
                  onChange={(e) => handleInputChange("jobLocation", e.target.value)}
                  placeholder="Enter job location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobSalaryRange">Job Salary Range</Label>
                <Input
                  id="jobSalaryRange"
                  value={formData.jobSalaryRange}
                  onChange={(e) => handleInputChange("jobSalaryRange", e.target.value)}
                  placeholder="e.g., 15000 AED"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="assignment"
                  checked={formData.assignment}
                  onCheckedChange={(value) => handleInputChange("assignment", value)}
                />
                <Label htmlFor="assignment">Include Assignment</Label>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Job"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/jobs")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}