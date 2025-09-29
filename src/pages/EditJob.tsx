// @ts-nocheck
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
  "1 Month",
  "2 Months",
  "3 Months",
  "6 Months", 
  "9 Months",
  "12 Months",
  "18 Months",
  "24 Months"
];

interface JobData {
  job_id: string;
  job_title: string;
  job_description: string;
  client_description: string;
  job_location: string;
  job_salary_range: string;
  things_to_look_for: string;
  jd_summary: string;
  musttohave?: string;
  nicetohave?: string;
  assignment: string;
  Processed: string;
  notice_period: string;
  nationality_to_include: string;
  nationality_to_exclude: string;
  Type: string;
  contract_length: string | null;
  Currency: string;
  itris_job_id?: string;
  group_id?: string;
  recruiter_id?: string;
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
  const [groups, setGroups] = useState<Array<{id: string, name: string, color: string | null}>>([]);
  const [recruiters, setRecruiters] = useState<Array<{user_id: string, name: string, email: string}>>([]);
  const [isAmendMode, setIsAmendMode] = useState(false);
  const [currentTab, setCurrentTab] = useState("details");
  const [formData, setFormData] = useState<JobData>({
    job_id: "",
    job_title: "",
    job_description: "",
    client_description: "",
    job_location: "",
    job_salary_range: "",
    things_to_look_for: "",
    jd_summary: "",
    musttohave: "",
    nicetohave: "",
    assignment: "",
    Processed: "Yes",
    notice_period: "",
    nationality_to_include: "",
    nationality_to_exclude: "",
    Type: "",
    contract_length: "",
    Currency: "",
    itris_job_id: "",
    group_id: "",
    recruiter_id: ""
  });

  useEffect(() => {
    if (id) {
      fetchJob();
    }
    fetchGroups();
    fetchRecruiters();
  }, [id]);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, color')
        .order('name');

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchRecruiters = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .order('name');

      if (error) throw error;
      setRecruiters(data || []);
    } catch (error) {
      console.error('Error fetching recruiters:', error);
    }
  };

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from('Jobs')
        .select('*')
        .eq('job_id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching job:', error);
        toast.error("Failed to load job details");
        return;
      }
      
      if (!data) {
        toast.error("Job not found");
        return;
      }
      
      if (data) {
        setFormData(data);
        setHasAssignment(!!data.assignment);
        
        // Parse salary range
        const salaryStr = data.job_salary_range;
        if (salaryStr) {
          const salaryNum = parseInt(salaryStr.toString().replace(/[^\d]/g, ''));
          if (!isNaN(salaryNum)) {
            setSalaryRange([salaryNum]);
          }
        }
        
        // Parse nationality arrays
        if (data.nationality_to_include) {
          setNationalityToInclude(data.nationality_to_include.split(", ").filter(Boolean));
        }
        if (data.nationality_to_exclude) {
          setNationalityToExclude(data.nationality_to_exclude.split(", ").filter(Boolean));
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
    if (!formData.job_title || !formData.job_description) {
      toast.error("Please fill in all required fields");
      setSaving(false);
      return;
    }

    try {
      const jobDataToUpdate = {
        ...formData,
        job_salary_range: salaryRange[0].toString(),
        nationality_to_include: nationalityToInclude.join(", "),
        nationality_to_exclude: nationalityToExclude.join(", "),
        contract_length: formData.Type === "Contract" ? formData.contract_length : null,
        assignment: hasAssignment ? formData.assignment : null,
        group_id: formData.group_id || null
      };

      const { error } = await supabase
        .from('Jobs')
        .update(jobDataToUpdate)
        .eq('job_id', id);

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

  const handleAmendToggle = () => {
    setIsAmendMode(!isAmendMode);
    if (!isAmendMode) {
      setCurrentTab("amend");
    }
  };

  const handleFileUpload = async (files: any[]) => {
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
      toast("Files uploaded successfully", {
        description: `${files.length} file(s) uploaded to the job.`
      });
    }
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
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
              <TabsList className="glass-card">
                <TabsTrigger value="details">Job Details</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="amend">Amend</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="job_title">Job Title *</Label>
                      <Input
                        id="job_title"
                        name="job_title"
                        value={formData.job_title}
                        onChange={handleInputChange}
                        placeholder="e.g., Senior Software Engineer"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="itris_job_id">Itris ID</Label>
                      <Input
                        id="itris_job_id"
                        name="itris_job_id"
                        value={formData.itris_job_id || ""}
                        onChange={handleInputChange}
                        placeholder="Enter Itris ID"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group">Group</Label>
                    <Select value={formData.group_id || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, group_id: value === "none" ? "" : value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group (optional)" />
                      </SelectTrigger>
                      <SelectContent className="z-[60] bg-popover">
                        <SelectItem value="none">No Group</SelectItem>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: group.color || "#3B82F6" }}
                              />
                              {group.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recruiter">Assigned Recruiter</Label>
                    <Select value={formData.recruiter_id || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, recruiter_id: value === "none" ? "" : value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a recruiter (optional)" />
                      </SelectTrigger>
                      <SelectContent className="z-[60] bg-popover">
                        <SelectItem value="none">No Recruiter</SelectItem>
                        {recruiters.map((recruiter) => (
                          <SelectItem key={recruiter.user_id} value={recruiter.user_id}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary"/>
                              {recruiter.name || recruiter.email}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job_description">Job Description *</Label>
                    <Textarea
                      id="job_description"
                      name="job_description"
                      value={formData.job_description}
                      onChange={handleInputChange}
                      rows={6}
                      placeholder="Enter detailed job description"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client_description">Client Description</Label>
                    <Textarea
                      id="client_description"
                      name="client_description"
                      value={formData.client_description}
                      onChange={handleInputChange}
                      placeholder="Enter client description"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="job_location">Job Location</Label>
                      <Input
                        id="job_location"
                        name="job_location"
                        value={formData.job_location}
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
                      <Label htmlFor="notice_period">Notice Period</Label>
                      <Select value={formData.notice_period} onValueChange={(value) => setFormData(prev => ({ ...prev, notice_period: value }))}>
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
                      <Select value={formData.Currency} onValueChange={(value) => setFormData(prev => ({ ...prev, Currency: value }))}>
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
                      <Select value={formData.Type} onValueChange={(value) => setFormData(prev => ({ ...prev, Type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent className="z-[60] bg-popover">
                          <SelectItem value="Permanent">Permanent</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {formData.Type === "Contract" && (
                      <div className="space-y-2">
                        <Label htmlFor="contract_length">Contract Length</Label>
                        <Select value={formData.contract_length || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, contract_length: value }))}>
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
                      entityId={formData.job_id}
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

              <TabsContent value="amend" className="space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">AI Requirements Amendment</h3>
                      <p className="text-sm text-muted-foreground">
                        Toggle amend mode to edit AI requirements
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="amendMode">Amend AI</Label>
                      <Switch
                        id="amendMode"
                        checked={isAmendMode}
                        onCheckedChange={handleAmendToggle}
                      />
                    </div>
                  </div>

                  {isAmendMode && (
                    <div className="space-y-6 p-4 border border-primary/20 rounded-lg bg-primary/5">
                      <div className="space-y-2">
                        <Label htmlFor="musttohave">Must Have Requirements</Label>
                        <Textarea
                          id="musttohave"
                          name="musttohave"
                          value={formData.musttohave || ""}
                          onChange={handleInputChange}
                          placeholder="Enter critical skills and requirements"
                          rows={4}
                          className="bg-background/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nicetohave">Nice to Have Requirements</Label>
                        <Textarea
                          id="nicetohave"
                          name="nicetohave"
                          value={formData.nicetohave || ""}
                          onChange={handleInputChange}
                          placeholder="Enter preferred skills and bonuses"
                          rows={4}
                          className="bg-background/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="jd_summary">JD Summary</Label>
                        <Textarea
                          id="jd_summary"
                          name="jd_summary"
                          value={formData.jd_summary}
                          onChange={handleInputChange}
                          placeholder="Enter job description summary"
                          rows={3}
                          className="bg-background/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="things_to_look_for">Things to Look For</Label>
                        <Textarea
                          id="things_to_look_for"
                          name="things_to_look_for"
                          value={formData.things_to_look_for}
                          onChange={handleInputChange}
                          placeholder="Enter specific things to look for in candidates"
                          rows={3}
                          className="bg-background/50"
                        />
                      </div>
                    </div>
                  )}

                  {!isAmendMode && (
                    <div className="space-y-4 p-4 border border-border/30 rounded-lg bg-muted/20">
                      <div className="space-y-2">
                        <h4 className="font-medium text-primary">Must Have Requirements</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {formData.musttohave || "No must-have requirements specified."}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-primary">Nice to Have Requirements</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {formData.nicetohave || "No nice-to-have requirements specified."}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-primary">JD Summary</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {formData.jd_summary || "No summary provided."}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-primary">Things to Look For</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {formData.things_to_look_for || "No specific criteria provided."}
                        </p>
                      </div>
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
