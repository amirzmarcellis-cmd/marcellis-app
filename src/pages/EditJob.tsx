import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import FileUpload from "@/components/upload/FileUpload";

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

interface JobData {
  "Job ID": string;
  "Job Title": string;
  "Job Description": string;
  "Client Description": string;
  "Job Location": string;
  "Job Salary Range (ex: 15000 AED)": string;
  "Things to look for": string;
  "JD Summary": string;
  musttohave?: string;
  nicetohave?: string;
  "assignment": string;
  "Processed": string;
  "Notice Period": string;
  "Nationality to include": string;
  "Nationality to Exclude": string;
  "Type": string;
  "Contract Length": string | null;
  "Currency": string;
}

export default function EditJob() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasAssignment, setHasAssignment] = useState(false);
  const [salaryRange, setSalaryRange] = useState([10000]);
  const [nationalityToInclude, setNationalityToInclude] = useState<string[]>([]);
  const [nationalityToExclude, setNationalityToExclude] = useState<string[]>([]);
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
    musttohave: "",
    nicetohave: "",
    "assignment": "",
    "Processed": "Yes",
    "Notice Period": "",
    "Nationality to include": "",
    "Nationality to Exclude": "",
    "Type": "",
    "Contract Length": "",
    "Currency": ""
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
        
        // Parse salary range
        const salaryStr = data["Job Salary Range (ex: 15000 AED)"];
        if (salaryStr) {
          const salaryNum = parseInt(salaryStr.replace(/[^\d]/g, ''));
          if (!isNaN(salaryNum)) {
            setSalaryRange([salaryNum]);
          }
        }
        
        // Parse nationality arrays
        if (data["Nationality to include"]) {
          setNationalityToInclude(data["Nationality to include"].split(", ").filter(Boolean));
        }
        if (data["Nationality to Exclude"]) {
          setNationalityToExclude(data["Nationality to Exclude"].split(", ").filter(Boolean));
        }
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error("Failed to load job details");
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
      toast.error("Please fill in all required fields");
      setSaving(false);
      return;
    }

    try {
      const jobDataToUpdate = {
        ...formData,
        "Job Salary Range (ex: 15000 AED)": salaryRange[0].toString(),
        "Nationality to include": nationalityToInclude.join(", "),
        "Nationality to Exclude": nationalityToExclude.join(", "),
        "Contract Length": formData["Type"] === "Contract" ? formData["Contract Length"] : null,
        assignment: hasAssignment ? formData.assignment : null
      };

      const { error } = await supabase
        .from('Jobs')
        .update(jobDataToUpdate)
        .eq('Job ID', id);

      if (error) throw error;

      toast.success("Job updated successfully!");
      navigate("/jobs");
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error("Failed to update job");
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
                <div className="space-y-6">
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
                    <Label htmlFor="Job Description">Job Description *</Label>
                    <Textarea
                      id="Job Description"
                      name="Job Description"
                      value={formData["Job Description"]}
                      onChange={handleInputChange}
                      rows={6}
                      placeholder="Enter detailed job description"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="Client Description">Client Description</Label>
                    <Textarea
                      id="Client Description"
                      name="Client Description"
                      value={formData["Client Description"]}
                      onChange={handleInputChange}
                      placeholder="Enter client description"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="Job Location">Job Location</Label>
                      <Input
                        id="Job Location"
                        name="Job Location"
                        value={formData["Job Location"]}
                        onChange={handleInputChange}
                        placeholder="Enter job location"
                      />
                    </div>
                    <div className="space-y-4">
                      <Label>Salary: {salaryRange[0].toLocaleString()}</Label>
                      <Slider
                        value={salaryRange}
                        onValueChange={setSalaryRange}
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
                      <Label htmlFor="Notice Period">Notice Period</Label>
                      <Select value={formData["Notice Period"]} onValueChange={(value) => setFormData(prev => ({ ...prev, "Notice Period": value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select notice period" />
                        </SelectTrigger>
                        <SelectContent className="z-[60] bg-popover">
                          {noticePeriods.map((period) => (
                            <SelectItem key={period} value={period}>
                              {period}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Currency">Currency</Label>
                      <Select value={formData["Currency"]} onValueChange={(value) => setFormData(prev => ({ ...prev, "Currency": value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent className="z-[60] bg-popover">
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
                        if (!nationalityToInclude.includes(value)) {
                          setNationalityToInclude([...nationalityToInclude, value]);
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select countries to include..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 z-[60] bg-popover">
                          {countries.filter(country => 
                            !nationalityToInclude.includes(country)
                          ).map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {nationalityToInclude.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {nationalityToInclude.map((country) => (
                            <span
                              key={country}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                            >
                              {country}
                              <button
                                type="button"
                                onClick={() => {
                                  setNationalityToInclude(nationalityToInclude.filter((n) => n !== country));
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
                        if (!nationalityToExclude.includes(value)) {
                          setNationalityToExclude([...nationalityToExclude, value]);
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select countries to exclude..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 z-[60] bg-popover">
                          {countries.filter(country => 
                            !nationalityToExclude.includes(country)
                          ).map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {nationalityToExclude.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {nationalityToExclude.map((country) => (
                            <span
                              key={country}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-destructive/10 text-destructive"
                            >
                              {country}
                              <button
                                type="button"
                                onClick={() => {
                                  setNationalityToExclude(nationalityToExclude.filter((n) => n !== country));
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
                      <Label htmlFor="Type">Job Type</Label>
                      <Select value={formData["Type"]} onValueChange={(value) => setFormData(prev => ({ ...prev, "Type": value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent className="z-[60] bg-popover">
                          <SelectItem value="Permanent">Permanent</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {formData["Type"] === "Contract" && (
                      <div className="space-y-2">
                        <Label htmlFor="Contract Length">Contract Length</Label>
                        <Select value={formData["Contract Length"]} onValueChange={(value) => setFormData(prev => ({ ...prev, "Contract Length": value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select contract length" />
                          </SelectTrigger>
                          <SelectContent className="z-[60] bg-popover">
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
                </div>


                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasAssignment"
                      checked={hasAssignment}
                      onCheckedChange={setHasAssignment}
                    />
                    <Label htmlFor="hasAssignment">Has Assignment?</Label>
                  </div>
                  
                  {hasAssignment && (
                    <div className="space-y-2">
                      <Label htmlFor="assignment">Assignment Link</Label>
                      <Input
                        id="assignment"
                        name="assignment"
                        value={formData.assignment}
                        onChange={handleInputChange}
                        placeholder="Enter assignment link"
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
