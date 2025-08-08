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

const nationalities = [
  "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Antiguans", "Argentinean", "Armenian", "Australian",
  "Austrian", "Azerbaijani", "Bahamian", "Bahraini", "Bangladeshi", "Barbadian", "Barbudans", "Batswana", "Belarusian", "Belgian",
  "Belizean", "Beninese", "Bhutanese", "Bolivian", "Bosnian", "Brazilian", "British", "Bruneian", "Bulgarian", "Burkinabe",
  "Burmese", "Burundian", "Cambodian", "Cameroonian", "Canadian", "Cape Verdean", "Central African", "Chadian", "Chilean", "Chinese",
  "Colombian", "Comoran", "Congolese", "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech", "Danish", "Djibouti",
  "Dominican", "Dutch", "East Timorese", "Ecuadorean", "Egyptian", "Emirian", "Equatorial Guinean", "Eritrean", "Estonian", "Ethiopian",
  "Fijian", "Filipino", "Finnish", "French", "Gabonese", "Gambian", "Georgian", "German", "Ghanaian", "Greek",
  "Grenadian", "Guatemalan", "Guinea-Bissauan", "Guinean", "Guyanese", "Haitian", "Herzegovinian", "Honduran", "Hungarian", "Icelander",
  "Indian", "Indonesian", "Iranian", "Iraqi", "Irish", "Israeli", "Italian", "Ivorian", "Jamaican", "Japanese",
  "Jordanian", "Kazakhstani", "Kenyan", "Kittian and Nevisian", "Kuwaiti", "Kyrgyz", "Laotian", "Latvian", "Lebanese", "Liberian",
  "Libyan", "Liechtensteiner", "Lithuanian", "Luxembourger", "Macedonian", "Malagasy", "Malawian", "Malaysian", "Maldivan", "Malian",
  "Maltese", "Marshallese", "Mauritanian", "Mauritian", "Mexican", "Micronesian", "Moldovan", "Monacan", "Mongolian", "Moroccan",
  "Mosotho", "Motswana", "Mozambican", "Namibian", "Nauruan", "Nepalese", "New Zealander", "Ni-Vanuatu", "Nicaraguan", "Nigerian",
  "Nigerien", "North Korean", "Northern Irish", "Norwegian", "Omani", "Pakistani", "Palauan", "Panamanian", "Papua New Guinean", "Paraguayan",
  "Peruvian", "Polish", "Portuguese", "Qatari", "Romanian", "Russian", "Rwandan", "Saint Lucian", "Salvadoran", "Samoan",
  "San Marinese", "Sao Tomean", "Saudi", "Scottish", "Senegalese", "Serbian", "Seychellois", "Sierra Leonean", "Singaporean", "Slovakian",
  "Slovenian", "Solomon Islander", "Somali", "South African", "South Korean", "Spanish", "Sri Lankan", "Sudanese", "Surinamer", "Swazi",
  "Swedish", "Swiss", "Syrian", "Taiwanese", "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan", "Trinidadian or Tobagonian",
  "Tunisian", "Turkish", "Tuvaluan", "Ugandan", "Ukrainian", "Uruguayan", "Uzbekistani", "Venezuelan", "Vietnamese", "Welsh",
  "Yemenite", "Zambian", "Zimbabwean"
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
          "Job Salary Range (ex: 15000 AED)": formData.jobSalaryRange[0].toString(),
          "assignment": formData.hasAssignment ? formData.assignmentLink : null,
          "Notice Period": formData.noticePeriod,
          "Nationality to include": formData.nationalityToInclude.join(", "),
          "Nationality to Exclude": formData.nationalityToExclude.join(", "),
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
              <div className="space-y-4">
                <Label htmlFor="jobSalaryRange">Salary Range: {formData.jobSalaryRange[0].toLocaleString()}</Label>
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
                <Label>Nationality to Include</Label>
                <Select onValueChange={(value) => {
                  const currentInclude = formData.nationalityToInclude || [];
                  if (!currentInclude.includes(value)) {
                    handleInputChange("nationalityToInclude", [...currentInclude, value]);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select nationality to include..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {nationalities.filter(nationality => 
                      !(formData.nationalityToInclude || []).includes(nationality)
                    ).map((nationality) => (
                      <SelectItem key={nationality} value={nationality}>
                        {nationality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(formData.nationalityToInclude || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(formData.nationalityToInclude || []).map((nationality) => (
                      <span
                        key={nationality}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                      >
                        {nationality}
                        <button
                          type="button"
                          onClick={() => {
                            const currentInclude = formData.nationalityToInclude || [];
                            const updated = currentInclude.filter((n) => n !== nationality);
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
                <Label>Nationality to Exclude</Label>
                <Select onValueChange={(value) => {
                  const currentExclude = formData.nationalityToExclude || [];
                  if (!currentExclude.includes(value)) {
                    handleInputChange("nationalityToExclude", [...currentExclude, value]);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select nationality to exclude..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {nationalities.filter(nationality => 
                      !(formData.nationalityToExclude || []).includes(nationality)
                    ).map((nationality) => (
                      <SelectItem key={nationality} value={nationality}>
                        {nationality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(formData.nationalityToExclude || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(formData.nationalityToExclude || []).map((nationality) => (
                      <span
                        key={nationality}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-destructive/10 text-destructive"
                      >
                        {nationality}
                        <button
                          type="button"
                          onClick={() => {
                            const currentExclude = formData.nationalityToExclude || [];
                            const updated = currentExclude.filter((n) => n !== nationality);
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