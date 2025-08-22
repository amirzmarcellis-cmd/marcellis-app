// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompanyContext } from '@/contexts/CompanyContext';

const countries = [
  "Afghanistan", "Albania", "Algeria", "United States", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia",
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
  "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Brazil", "United Kingdom", "Brunei", "Bulgaria", "Burkina Faso",
  "Myanmar", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China",
  "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti",
  "Dominican Republic", "Netherlands", "East Timor", "Ecuador", "Egypt", "United Arab Emirates", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia",
  "Fiji", "Philippines", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece",
  "Grenada", "Guatemala", "Guinea-Bissau", "Guinea", "Guyana", "Haiti", "Herzegovina", "Honduras", "Hungary", "Iceland",
  "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan",
  "Jordan", "Kazakhstan", "Kenya", "Saint Kitts and Nevis", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Liberia",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "North Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
  "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Morocco",
  "Lesotho", "Botswana", "Mozambique", "Namibia", "Nauru", "Nepal", "New Zealand", "Vanuatu", "Nicaragua", "Nigeria",
  "Niger", "North Korea", "Northern Ireland", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay",
  "Peru", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Lucia", "El Salvador", "Samoa",
  "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Scotland", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", "Suriname", "Eswatini",
  "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago",
  "Tunisia", "Turkey", "Tuvalu", "Uganda", "Ukraine", "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Wales",
  "Yemen", "Zambia", "Zimbabwe"
];

const noticePeriods = [
  "Immediate",
  "7 Days",
  "14 Days", 
  "30 Days",
  "60 Days",
  "90 Days"
];

const contractLengths = [
  "3 Months",
  "6 Months", 
  "9 Months",
  "12 Months",
  "18 Months",
  "24 Months"
];

export default function AddJob() {
  const navigate = useNavigate();
  const { currentCompany } = useCompanyContext();
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    clientDescription: "",
    jobLocation: "",
    jobSalaryRange: [10000] as number[],
    hasAssignment: false,
    assignmentLink: "",
    noticePeriod: "",
    nationalityToInclude: [] as string[],
    nationalityToExclude: [] as string[],
    type: "",
    contractLength: "",
    currency: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | boolean | number[] | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateJobId = async () => {
    try {
      const { data: jobs } = await supabase
        .from('Jobs')
        .select('job_id')
        .order('job_id', { ascending: false })
        .limit(1);

      if (jobs && jobs.length > 0) {
        const lastJobId = jobs[0]["job_id"];
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
          job_id: jobId,
          job_title: formData.jobTitle,
          job_description: formData.jobDescription,
          client_description: formData.clientDescription,
          job_location: formData.jobLocation,
          job_salary_range: formData.jobSalaryRange[0].toString(),
          assignment: formData.hasAssignment ? formData.assignmentLink : null,
          notice_period: formData.noticePeriod,
          nationality_to_include: formData.nationalityToInclude.join(", "),
          nationality_to_exclude: formData.nationalityToExclude.join(", "),
          Type: formData.type,
          contract_length: formData.type === "Contract" ? formData.contractLength : null,
          Currency: formData.currency,
          company_id: currentCompany?.id,
          Timestamp: new Date().toISOString()
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
              <div className="space-y-4">
                <Label htmlFor="jobSalaryRange">Salary: {formData.jobSalaryRange[0].toLocaleString()}</Label>
                <Slider
                  value={formData.jobSalaryRange}
                  onValueChange={(value) => handleInputChange("jobSalaryRange", value)}
                  max={100000}
                  min={1000}
                  step={500}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1,000</span>
                  <span>100,000</span>
                </div>
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="noticePeriod">Notice Period</Label>
                <Select value={formData.noticePeriod} onValueChange={(value) => handleInputChange("noticePeriod", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select notice period" />
                  </SelectTrigger>
                  <SelectContent>
                    {noticePeriods.map((period) => (
                      <SelectItem key={period} value={period}>
                        {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label>Countries to Include</Label>
                <Select onValueChange={(value) => {
                  const currentInclude = formData.nationalityToInclude || [];
                  if (!currentInclude.includes(value)) {
                    handleInputChange("nationalityToInclude", [...currentInclude, value]);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select countries to include..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {countries.filter(country => 
                      !(formData.nationalityToInclude || []).includes(country)
                    ).map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(formData.nationalityToInclude || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(formData.nationalityToInclude || []).map((country) => (
                      <span
                        key={country}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                      >
                        {country}
                        <button
                          type="button"
                          onClick={() => {
                            const currentInclude = formData.nationalityToInclude || [];
                            const updated = currentInclude.filter((n) => n !== country);
                            handleInputChange("nationalityToInclude", updated);
                          }}
                          className="ml-1 text-primary/60 hover:text-primary"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Countries to Exclude</Label>
                <Select onValueChange={(value) => {
                  const currentExclude = formData.nationalityToExclude || [];
                  if (!currentExclude.includes(value)) {
                    handleInputChange("nationalityToExclude", [...currentExclude, value]);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select countries to exclude..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {countries.filter(country => 
                      !(formData.nationalityToExclude || []).includes(country)
                    ).map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(formData.nationalityToExclude || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(formData.nationalityToExclude || []).map((country) => (
                      <span
                        key={country}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-destructive/10 text-destructive"
                      >
                        {country}
                        <button
                          type="button"
                          onClick={() => {
                            const currentExclude = formData.nationalityToExclude || [];
                            const updated = currentExclude.filter((n) => n !== country);
                            handleInputChange("nationalityToExclude", updated);
                          }}
                          className="ml-1 text-destructive/60 hover:text-destructive"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
                  <Select value={formData.contractLength} onValueChange={(value) => handleInputChange("contractLength", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contract length" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractLengths.map((length) => (
                        <SelectItem key={length} value={length}>
                          {length}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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