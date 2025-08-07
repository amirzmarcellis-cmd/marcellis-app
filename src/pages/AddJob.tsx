import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    hasAssignment: false,
    assignmentLink: "",
    noticePeriod: "",
    nationalityToInclude: "",
    nationalityToExclude: "",
    type: "",
    contractLength: "",
    currency: ""
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
          "assignment": formData.hasAssignment ? formData.assignmentLink : null,
          "Notice Period": formData.noticePeriod,
          "Nationality to include": formData.nationalityToInclude,
          "Nationality to Exclude": formData.nationalityToExclude,
          "Type": formData.type,
          "Contract Length": formData.type === "Contract" ? formData.contractLength : null,
          "Currency": formData.currency,
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
                  placeholder="eg., 15000"
                />
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="noticePeriod">Notice Period</Label>
                <Input
                  id="noticePeriod"
                  value={formData.noticePeriod}
                  onChange={(e) => handleInputChange("noticePeriod", e.target.value)}
                  placeholder="Number of days"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AED">AED</SelectItem>
                    <SelectItem value="SAR">SAR</SelectItem>
                    <SelectItem value="QAR">QAR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nationalityToInclude">Nationality to Include</Label>
                <Input
                  id="nationalityToInclude"
                  value={formData.nationalityToInclude}
                  onChange={(e) => handleInputChange("nationalityToInclude", e.target.value)}
                  placeholder="e.g., UAE, Saudi Arabia"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationalityToExclude">Nationality to Exclude</Label>
                <Input
                  id="nationalityToExclude"
                  value={formData.nationalityToExclude}
                  onChange={(e) => handleInputChange("nationalityToExclude", e.target.value)}
                  placeholder="e.g., India, Pakistan"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Job Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Permanent">Permanent</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.type === "Contract" && (
                <div className="space-y-2">
                  <Label htmlFor="contractLength">Contract Length</Label>
                  <Input
                    id="contractLength"
                    value={formData.contractLength}
                    onChange={(e) => handleInputChange("contractLength", e.target.value)}
                    placeholder="e.g., 6 months, 1 year"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasAssignment"
                  checked={formData.hasAssignment}
                  onCheckedChange={(value) => handleInputChange("hasAssignment", value)}
                />
                <Label htmlFor="hasAssignment">Has Assignment?</Label>
              </div>
              
              {formData.hasAssignment && (
                <div className="space-y-2">
                  <Label htmlFor="assignmentLink">Assignment Link</Label>
                  <Input
                    id="assignmentLink"
                    value={formData.assignmentLink}
                    onChange={(e) => handleInputChange("assignmentLink", e.target.value)}
                    placeholder="Enter assignment link"
                  />
                </div>
              )}
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