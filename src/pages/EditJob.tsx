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
import { ApiMultiSelect } from "@/components/ui/api-multi-select";

const europeanCountries = [
  "Albania",
  "Andorra",
  "Austria",
  "Azerbaijan",
  "Belgium",
  "Bosnia and Herzegovina",
  "United Kingdom",
  "Cyprus",
  "Denmark",
  "Croatia",
  "France",
  "Finland",
  "Netherlands",
  "Germany",
  "Georgia",
  "Estonia",
  "Greece",
  "Iceland",
  "Ireland",
  "Italy",
  "Kazakhstan",
  "Poland",
  "Portugal",
  "Romania",
  "Russia",
  "Malta",
  "Moldova",
  "Northern Ireland",
  "Norway",
  "Luxembourg",
  "Serbia",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Switzerland",
  "Sweden",
];

const arabianCountries = [
  "Algeria",
  "Bahrain",
  "Egypt",
  "Iraq",
  "Jordan",
  "Kuwait",
  "Lebanon",
  "Libya",
  "Morocco",
  "Oman",
  "Palestine",
  "Qatar",
  "Saudi Arabia",
  "Sudan",
  "Syria",
  "Tunisia",
  "United Arab Emirates",
  "Yemen",
];

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "United States",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Brazil",
  "United Kingdom",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Myanmar",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominican Republic",
  "Netherlands",
  "East Timor",
  "Ecuador",
  "Egypt",
  "United Arab Emirates",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Ethiopia",
  "Fiji",
  "Philippines",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea-Bissau",
  "Guinea",
  "Guyana",
  "Haiti",
  "Herzegovina",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Italy",
  "Ivory Coast",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Saint Kitts and Nevis",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "North Macedonia",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Morocco",
  "Lesotho",
  "Botswana",
  "Mozambique",
  "Namibia",
  "Nauru",
  "Nepal",
  "New Zealand",
  "Vanuatu",
  "Nicaragua",
  "Nigeria",
  "Niger",
  "North Korea",
  "Northern Ireland",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Lucia",
  "El Salvador",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Scotland",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Eswatini",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "Uruguay",
  "Uzbekistan",
  "Venezuela",
  "Vietnam",
  "Wales",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

const noticePeriods = ["Immediate", "7 Days", "14 Days", "30 Days", "60 Days", "90 Days"];

const contractLengths = [
  "1 Month",
  "2 Months",
  "3 Months",
  "6 Months",
  "9 Months",
  "12 Months",
  "18 Months",
  "24 Months",
];

const industriesList = [
  "Accounting",
  "Airlines / Aviation",
  "Alternative Dispute Resolution",
  "Alternative Medicine",
  "Animation",
  "Apparel & Fashion",
  "Architecture & Planning",
  "Arts & Crafts",
  "Automotive",
  "Aviation & Aerospace",
  "Banking",
  "Biotechnology",
  "Broadcast Media",
  "Building Materials",
  "Business Supplies & Equipment",
  "Capital Markets",
  "Chemicals",
  "Civic & Social Organization",
  "Civil Engineering",
  "Commercial Real Estate",
  "Computer & Network Security",
  "Computer Games",
  "Computer Hardware",
  "Computer Networking",
  "Computer Software",
  "Construction",
  "Consumer Electronics",
  "Consumer Goods",
  "Consumer Services",
  "Cosmetics",
  "Dairy",
  "Defense & Space",
  "Design",
  "E-Learning",
  "Education Management",
  "Electrical/Electronic Manufacturing",
  "Entertainment",
  "Environmental Services",
  "Events Services",
  "Executive Office",
  "Facilities Services",
  "Farming",
  "Financial Services",
  "Fine Art",
  "Fishery",
  "Food & Beverages",
  "Food Production",
  "Fund‐Raising",
  "Furniture",
  "Gambling & Casinos",
  "Glass, Ceramics & Concrete",
  "Government Administration",
  "Government Relations",
  "Graphic Design",
  "Health, Wellness and Fitness",
  "Higher Education",
  "Hospital & Health Care",
  "Hospitality",
  "Human Resources",
  "Import and Export",
  "Individual & Family Services",
  "Industrial Automation",
  "Information Services",
  "Information Technology & Services",
  "Insurance",
  "International Affairs",
  "International Trade & Development",
  "Internet",
  "Investment Banking",
  "Investment Management",
  "Judiciary",
  "Law Enforcement",
  "Law Practice",
  "Legal Services",
  "Legislative Office",
  "Leisure, Travel & Tourism",
  "Libraries",
  "Logistics & Supply Chain",
  "Luxury Goods & Jewelry",
  "Machinery",
  "Management Consulting",
  "Maritime",
  "Market Research",
  "Marketing & Advertising",
  "Mechanical or Industrial Engineering",
  "Media Production",
  "Medical Devices",
  "Medical Practice",
  "Mental Health Care",
  "Military",
  "Mining & Metals",
  "Motion Pictures & Film",
  "Museums & Institutions",
  "Music",
  "Nanotechnology",
  "Newspapers",
  "Nonprofit Organization Management",
  "Oil & Energy",
  "Online Media",
  "Outsourcing / Offshoring",
  "Package / Freight Delivery",
  "Packaging & Containers",
  "Paper & Forest Products",
  "Performing Arts",
  "Pharmaceuticals",
  "Photography",
  "Plastics",
  "Political Organization",
  "Primary / Secondary Education",
  "Printing",
  "Professional Training & Coaching",
  "Program Development",
  "Public Policy",
  "Public Relations & Communications",
  "Public Safety",
  "Publishing",
  "Real Estate",
  "Recreational Facilities & Services",
  "Religious Institutions",
  "Renewables & Environment",
  "Research",
  "Restaurants",
  "Retail",
  "Security & Investigations",
  "Semiconductors",
  "Shipbuilding",
  "Sporting Goods",
  "Sports",
  "Staffing & Recruiting",
  "Supermarkets",
  "Telecommunications",
  "Textiles",
  "Transportation / Trucking / Railroad",
  "Utilities",
  "Venture Capital & Private Equity",
  "Veterinary",
  "Warehousing",
  "Wholesale",
  "Wine & Spirits",
  "Wireless",
  "Writing & Editing",
];

interface JobData {
  job_id: string;
  job_title: string;
  job_description: string;
  industry?: string;
  headhunting_companies?: string;
  client_name: string;
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
  prefered_nationality?: string;
  Type: string;
  contract_length: string | null;
  Currency: string;
  gender_preference: string;
  itris_job_id?: string;
  group_id?: string;
  recruiter_id?: string;
  Job_difficulty?: number;
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
  const [preferedNationality, setPreferedNationality] = useState<string[]>([]);
  const [notPreferedNationality, setNotPreferedNationality] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ id: string; file_name: string; file_url: string; file_type: string; file_size: number }>
  >([]);
  const [groups, setGroups] = useState<Array<{ id: string; name: string; color: string | null }>>([]);
  const [recruiters, setRecruiters] = useState<Array<{ user_id: string; name: string; email: string }>>([]);
  const [isAmendMode, setIsAmendMode] = useState(false);
  const [currentTab, setCurrentTab] = useState("details");
  const [industries, setIndustries] = useState<string[]>([]);
  const [headhuntingCompanies, setHeadhuntingCompanies] = useState<string[]>([]);
  const [linkedInSearchEnabled, setLinkedInSearchEnabled] = useState(false);
  const [recruiterLinkedInId, setRecruiterLinkedInId] = useState<string | null>(null);
  const [formData, setFormData] = useState<JobData>({
    job_id: "",
    job_title: "",
    job_description: "",
    industry: "",
    headhunting_companies: "",
    client_name: "",
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
    gender_preference: "Any",
    itris_job_id: "",
    group_id: "",
    recruiter_id: "",
    Job_difficulty: 75,
  });

  useEffect(() => {
    if (id) {
      fetchJob();
    }
    fetchGroups();
    fetchRecruiters();
  }, [id]);

  // Fetch recruiter's LinkedIn ID when recruiter changes
  useEffect(() => {
    const fetchRecruiterLinkedInId = async () => {
      if (!formData.recruiter_id) {
        setRecruiterLinkedInId(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("linkedin_id")
          .eq("user_id", formData.recruiter_id)
          .single();

        if (error) throw error;
        setRecruiterLinkedInId(data?.linkedin_id || null);

        // Disable LinkedIn search if recruiter doesn't have LinkedIn ID
        if (!data?.linkedin_id) {
          setLinkedInSearchEnabled(false);
        }
      } catch (error) {
        console.error("Error fetching recruiter LinkedIn ID:", error);
        setRecruiterLinkedInId(null);
      }
    };

    fetchRecruiterLinkedInId();
  }, [formData.recruiter_id]);

  // Reset salary when currency changes to/from INR
  useEffect(() => {
    const currentSalary = salaryRange[0];

    if (formData.Currency === "INR" && currentSalary > 100000) {
      // Already in INR range, no need to reset
      return;
    }

    if (formData.Currency !== "INR" && currentSalary > 100000) {
      // Switching from INR to other currency with INR-range value
      setSalaryRange([10000]);
    } else if (formData.Currency === "INR" && currentSalary <= 100000) {
      // Switching to INR from other currency
      setSalaryRange([100000]);
    }
  }, [formData.Currency]);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase.from("groups").select("id, name, color").order("name");

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchRecruiters = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("user_id, name, email").order("name");

      if (error) throw error;
      setRecruiters(data || []);
    } catch (error) {
      console.error("Error fetching recruiters:", error);
    }
  };

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase.from("Jobs").select("*").eq("job_id", id).maybeSingle();

      if (error) {
        console.error("Error fetching job:", error);
        toast.error("Failed to load job details");
        return;
      }

      if (!data) {
        toast.error("Job not found");
        return;
      }

      if (data) {
        // Convert legacy text Job_difficulty values to numeric
        let difficultyValue = data.Job_difficulty;
        if (typeof difficultyValue === "string") {
          const legacyMap: Record<string, number> = { EASY: 75, MEDIUM: 80, HARD: 85 };
          difficultyValue = legacyMap[difficultyValue] || 75;
        }
        setFormData({ ...data, Job_difficulty: difficultyValue as number });
        setHasAssignment(!!data.assignment);
        setLinkedInSearchEnabled(data.linkedin_search_enabled || false);

        // Parse salary range
        const salaryStr = data.job_salary_range;
        if (salaryStr) {
          const salaryNum = parseInt(salaryStr.toString().replace(/[^\d]/g, ""));
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
        if (data.prefered_nationality) {
          setPreferedNationality(data.prefered_nationality.split(", ").filter(Boolean));
        }
        if (data.not_prefered_nationality) {
          setNotPreferedNationality(data.not_prefered_nationality.split(", ").filter(Boolean));
        }

        // Parse industries and headhunting companies
        if (data.industry) {
          setIndustries(data.industry.split(", ").filter(Boolean));
        }
        if (data.headhunting_companies) {
          setHeadhuntingCompanies(data.headhunting_companies.split(", ").filter(Boolean));
        }
      }
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
        prefered_nationality: preferedNationality.length > 0 ? preferedNationality.join(", ") : null,
        not_prefered_nationality: notPreferedNationality.length > 0 ? notPreferedNationality.join(", ") : null,
        industry: industries.join(", "),
        headhunting_companies: headhuntingCompanies.join(", "),
        contract_length: formData.Type === "Contract" ? formData.contract_length : null,
        assignment: hasAssignment ? formData.assignment : null,
        group_id: formData.group_id || null,
        linkedin_search_enabled: linkedInSearchEnabled,
        Job_difficulty: formData.Job_difficulty || 75,
      };

      const { error } = await supabase.from("Jobs").update(jobDataToUpdate).eq("job_id", id);

      if (error) throw error;

      toast.success("Job updated successfully!");
      navigate("/jobs");
    } catch (error) {
      console.error("Error updating job:", error);
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
      setUploadedFiles((prev) => [...prev, ...files]);
      toast("Files uploaded successfully", {
        description: `${files.length} file(s) uploaded to the job.`,
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-3 sm:p-4 md:p-6 pb-20 sm:pb-24 max-w-full overflow-x-hidden">
        <div className="text-center text-sm sm:text-base">Loading job details...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4 md:space-y-6 overflow-x-hidden pb-20 sm:pb-24">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 md:gap-4 min-w-0">
        <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 w-full min-w-0">
          <Button
            variant="ghost"
            onClick={() => navigate("/jobs")}
            className="flex items-center gap-2 h-11 sm:h-10 md:h-9 w-full sm:w-auto justify-start sm:justify-center min-h-[44px] sm:min-h-0"
          >
            <ArrowLeft className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm sm:text-base">Back to Jobs</span>
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light font-work tracking-tight break-words">
              Edit Job
            </h1>
            <p className="text-xs sm:text-sm md:text-base font-light font-inter text-muted-foreground mt-1">
              Update job posting details
            </p>
          </div>
        </div>
      </div>

      <Card className="mission-card w-full max-w-full overflow-hidden">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-lg sm:text-xl md:text-2xl font-light font-work tracking-tight break-words">
            Edit Job Posting
          </CardTitle>
          <CardDescription className="font-light font-inter text-xs sm:text-sm md:text-base mt-1">
            Update the job details and requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6 w-full min-w-0">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4 sm:space-y-5 md:space-y-6">
              <TabsList className="glass-card p-1 sm:p-1.5 w-full grid grid-cols-3 gap-1 h-auto">
                <TabsTrigger value="details" className="min-h-[44px] sm:min-h-[36px] text-xs sm:text-sm py-2.5">
                  Job Details
                </TabsTrigger>
                <TabsTrigger value="documents" className="min-h-[44px] sm:min-h-[36px] text-xs sm:text-sm py-2.5">
                  Documents
                </TabsTrigger>
                <TabsTrigger value="amend" className="min-h-[44px] sm:min-h-[36px] text-xs sm:text-sm py-2.5">
                  Ai Requirements
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-3 sm:space-y-4 md:space-y-6">
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 min-w-0">
                    <div className="space-y-1.5 sm:space-y-2 min-w-0">
                      <Label htmlFor="job_title" className="font-light font-inter text-xs sm:text-sm">
                        Job Title *
                      </Label>
                      <Input
                        id="job_title"
                        name="job_title"
                        value={formData.job_title}
                        onChange={handleInputChange}
                        placeholder="e.g., Senior Software Engineer"
                        required
                        className="h-11 sm:h-10 text-sm min-w-0 w-full"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2 min-w-0">
                      <Label htmlFor="itris_job_id" className="font-light font-inter text-xs sm:text-sm">
                        Itris ID
                      </Label>
                      <Input
                        id="itris_job_id"
                        name="itris_job_id"
                        value={formData.itris_job_id || ""}
                        onChange={handleInputChange}
                        placeholder="Enter Itris ID"
                        className="h-11 sm:h-10 text-sm min-w-0 w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 min-w-0">
                    <Label htmlFor="group" className="text-xs sm:text-sm">
                      Group
                    </Label>
                    <Select
                      value={formData.group_id || "none"}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, group_id: value === "none" ? "" : value }))
                      }
                    >
                      <SelectTrigger className="h-11 sm:h-10 text-sm min-w-0 w-full">
                        <SelectValue placeholder="Select a group (optional)" className="truncate" />
                      </SelectTrigger>
                      <SelectContent className="z-[60] bg-popover">
                        <SelectItem value="none">No Group</SelectItem>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: group.color || "#3B82F6" }}
                              />
                              <span className="truncate">{group.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 min-w-0">
                    <Label htmlFor="recruiter" className="text-xs sm:text-sm">
                      Assigned Recruiter
                    </Label>
                    <Select
                      value={formData.recruiter_id || "none"}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, recruiter_id: value === "none" ? "" : value }))
                      }
                    >
                      <SelectTrigger className="h-11 sm:h-10 text-sm min-w-0 w-full">
                        <SelectValue placeholder="Select a recruiter (optional)" className="truncate" />
                      </SelectTrigger>
                      <SelectContent className="z-[60] bg-popover">
                        <SelectItem value="none">No Recruiter</SelectItem>
                        {recruiters.map((recruiter) => (
                          <SelectItem key={recruiter.user_id} value={recruiter.user_id}>
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                              <span className="truncate">{recruiter.name || recruiter.email}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Job Difficulty */}
                  <div className="space-y-1.5 sm:space-y-2 min-w-0">
                    <Label htmlFor="jobDifficulty" className="text-xs sm:text-sm">
                      Job Difficulty
                    </Label>
                    <Select
                      value={formData.Job_difficulty?.toString() || "75"}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, Job_difficulty: parseInt(value) }))}
                    >
                      <SelectTrigger className="h-11 sm:h-10 text-sm min-w-0 w-full">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent className="z-[60] bg-popover">
                        <SelectItem value="75">A Job</SelectItem>
                        <SelectItem value="80">B Job</SelectItem>
                        <SelectItem value="85">C Job</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* LinkedIn Search Toggle - Prominent Feature */}
                  {formData.recruiter_id && (
                    <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 md:p-5 border-2 border-primary/30 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm min-w-0 max-w-full overflow-hidden">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0">
                        <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Label className="font-semibold text-sm sm:text-base">🔍 LinkedIn Search</Label>
                            {linkedInSearchEnabled && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-700 dark:text-green-400 rounded-full border border-green-500/30 flex-shrink-0">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                            Automatically search and find candidates on LinkedIn for this position
                          </p>
                        </div>
                        {recruiterLinkedInId ? (
                          <Switch
                            checked={linkedInSearchEnabled}
                            onCheckedChange={setLinkedInSearchEnabled}
                            className="sm:ml-4 flex-shrink-0"
                          />
                        ) : (
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => navigate("/settings")}
                            className="sm:ml-4 font-medium w-full sm:w-auto h-11 sm:h-9 min-h-[44px] sm:min-h-0"
                          >
                            Connect LinkedIn
                          </Button>
                        )}
                      </div>
                      {!recruiterLinkedInId && (
                        <div className="flex items-start gap-2 p-2.5 sm:p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <span className="text-amber-600 dark:text-amber-400 text-sm flex-shrink-0">⚠️</span>
                          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed break-words">
                            The assigned recruiter needs to connect their LinkedIn account first. Click "Connect
                            LinkedIn" to set it up.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

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
                    <Label>Industry</Label>
                    <ApiMultiSelect
                      value={industries}
                      onChange={setIndustries}
                      apiEndpoint="https://api4.unipile.com:13494/api/v1/linkedin/search/parameters?keywords={keywords}&type=INDUSTRY&account_id=TRe-JAwkQ-Kgoz27AwWxdw"
                      apiHeaders={{
                        "X-API-KEY": "CUtAWkNK.eM32jndkskOxhrUC5QqcgWntJWBZRNq9cGqH5jJXXe4=",
                        Accept: "application/json",
                      }}
                      placeholder="Select industries..."
                      searchPlaceholder="Search industries..."
                      emptyText="No industries found"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Headhunting Companies</Label>
                    <ApiMultiSelect
                      value={headhuntingCompanies}
                      onChange={setHeadhuntingCompanies}
                      apiEndpoint="https://api4.unipile.com:13494/api/v1/linkedin/search/parameters?keywords={keywords}&type=COMPANY&account_id=TRe-JAwkQ-Kgoz27AwWxdw"
                      apiHeaders={{
                        "X-API-KEY": "CUtAWkNK.eM32jndkskOxhrUC5QqcgWntJWBZRNq9cGqH5jJXXe4=",
                        Accept: "application/json",
                      }}
                      placeholder="Select companies..."
                      searchPlaceholder="Search companies..."
                      emptyText="No companies found"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Client Name</Label>
                    <ApiMultiSelect
                      value={formData.client_name ? [formData.client_name] : []}
                      onChange={(values) => {
                        setFormData((prev) => ({
                          ...prev,
                          client_name: values[values.length - 1] || "",
                        }));
                      }}
                      apiEndpoint="https://sofrxfgjptargppbepbi.supabase.co/rest/v1/clients?select=id,name&name=ilike.*{keywords}*&order=name.asc&limit=50"
                      apiHeaders={{
                        apikey:
                          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZnJ4ZmdqcHRhcmdwcGJlcGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDMxNzYsImV4cCI6MjA2OTg3OTE3Nn0._xVCMGu8VY2_JSs38wOdL7nG7EKpl3996heMiu33j9A",
                        Accept: "application/json",
                      }}
                      placeholder="Select client..."
                      searchPlaceholder="Search clients..."
                      emptyText="No clients found"
                      labelField="name"
                      isDatabase={true}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="job_location" className="text-sm sm:text-base">
                        Job Location
                      </Label>
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
                        max={formData.Currency === "INR" ? 10000000 : 100000}
                        min={1000}
                        step={formData.Currency === "INR" ? 10000 : 500}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>1,000</span>
                        <span>{formData.Currency === "INR" ? "10,000,000" : "100,000"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="notice_period" className="text-sm sm:text-base">
                        Notice Period
                      </Label>
                      <Select
                        value={formData.notice_period}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, notice_period: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select notice period" className="truncate" />
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
                      <Select
                        value={formData.Currency}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, Currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" className="truncate" />
                        </SelectTrigger>
                        <SelectContent className="z-[60] bg-popover">
                          <SelectItem value="AED">AED</SelectItem>
                          <SelectItem value="SAR">SAR</SelectItem>
                          <SelectItem value="QAR">QAR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="INR">INR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="gender_preference" className="text-sm sm:text-base">
                        Preferred Gender
                      </Label>
                      <Select
                        value={formData.gender_preference || "Any"}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, gender_preference: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred gender" className="truncate" />
                        </SelectTrigger>
                        <SelectContent className="z-[60] bg-popover">
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Any">Any</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Countries to Include</Label>
                      <Select
                        onValueChange={(value) => {
                          if (value === "European Countries") {
                            // Add all European countries that aren't already included
                            const newCountries = europeanCountries.filter(
                              (country) => !nationalityToInclude.includes(country),
                            );
                            setNationalityToInclude([...nationalityToInclude, ...newCountries]);
                          } else if (value === "Arabian Countries") {
                            // Add all Arabian countries that aren't already included
                            const newCountries = arabianCountries.filter(
                              (country) => !nationalityToInclude.includes(country),
                            );
                            setNationalityToInclude([...nationalityToInclude, ...newCountries]);
                          } else if (!nationalityToInclude.includes(value)) {
                            setNationalityToInclude([...nationalityToInclude, value]);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select countries to include..." className="truncate" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 z-[60] bg-popover">
                          <SelectItem value="European Countries" className="font-semibold text-primary">
                            🇪🇺 European Countries (Select All)
                          </SelectItem>
                          <SelectItem value="Arabian Countries" className="font-semibold text-primary">
                            🕌 Arabian Countries (Select All)
                          </SelectItem>
                          {countries
                            .filter((country) => !nationalityToInclude.includes(country))
                            .map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {nationalityToInclude.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 max-w-full overflow-x-hidden">
                          {nationalityToInclude.map((country) => (
                            <span
                              key={country}
                              className="inline-flex items-center px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm bg-primary/10 text-primary"
                            >
                              {country}
                              <button
                                type="button"
                                onClick={() => {
                                  setNationalityToInclude(nationalityToInclude.filter((n) => n !== country));
                                }}
                                className="ml-1 h-4 w-4 p-0.5 text-primary/60 hover:text-primary"
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
                      <Select
                        onValueChange={(value) => {
                          if (value === "European Countries") {
                            // Add all European countries that aren't already excluded
                            const newCountries = europeanCountries.filter(
                              (country) => !nationalityToExclude.includes(country),
                            );
                            setNationalityToExclude([...nationalityToExclude, ...newCountries]);
                          } else if (value === "Arabian Countries") {
                            // Add all Arabian countries that aren't already excluded
                            const newCountries = arabianCountries.filter(
                              (country) => !nationalityToExclude.includes(country),
                            );
                            setNationalityToExclude([...nationalityToExclude, ...newCountries]);
                          } else if (!nationalityToExclude.includes(value)) {
                            setNationalityToExclude([...nationalityToExclude, value]);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select countries to exclude..." className="truncate" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 z-[60] bg-popover">
                          <SelectItem value="European Countries" className="font-semibold text-destructive">
                            🇪🇺 European Countries (Select All)
                          </SelectItem>
                          <SelectItem value="Arabian Countries" className="font-semibold text-destructive">
                            🕌 Arabian Countries (Select All)
                          </SelectItem>
                          {countries
                            .filter((country) => !nationalityToExclude.includes(country))
                            .map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {nationalityToExclude.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 max-w-full overflow-x-hidden">
                          {nationalityToExclude.map((country) => (
                            <span
                              key={country}
                              className="inline-flex items-center px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm bg-destructive/10 text-destructive"
                            >
                              {country}
                              <button
                                type="button"
                                onClick={() => {
                                  setNationalityToExclude(nationalityToExclude.filter((n) => n !== country));
                                }}
                                className="ml-1 h-4 w-4 p-0.5 text-destructive/60 hover:text-destructive"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Nationality</Label>
                    <Select
                      onValueChange={(value) => {
                        if (value === "European Countries") {
                          const newCountries = europeanCountries.filter(
                            (country) => !preferedNationality.includes(country),
                          );
                          setPreferedNationality([...preferedNationality, ...newCountries]);
                        } else if (value === "Arabian Countries") {
                          const newCountries = arabianCountries.filter(
                            (country) => !preferedNationality.includes(country),
                          );
                          setPreferedNationality([...preferedNationality, ...newCountries]);
                        } else if (!preferedNationality.includes(value)) {
                          setPreferedNationality([...preferedNationality, value]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred nationalities..." className="truncate" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 z-[60] bg-popover">
                        <SelectItem value="European Countries" className="font-semibold text-primary">
                          🇪🇺 European Countries (Select All)
                        </SelectItem>
                        <SelectItem value="Arabian Countries" className="font-semibold text-primary">
                          🕌 Arabian Countries (Select All)
                        </SelectItem>
                        {countries
                          .filter((country) => !preferedNationality.includes(country))
                          .map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {preferedNationality.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 max-w-full overflow-x-hidden">
                        {preferedNationality.map((country) => (
                          <span
                            key={country}
                            className="inline-flex items-center px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30"
                          >
                            {country}
                            <button
                              type="button"
                              onClick={() => {
                                setPreferedNationality(preferedNationality.filter((n) => n !== country));
                              }}
                              className="ml-1 h-4 w-4 p-0.5 text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Not Preferred Nationality</Label>
                    <Select
                      onValueChange={(value) => {
                        if (value === "European Countries") {
                          const newCountries = europeanCountries.filter(
                            (country) => !notPreferedNationality.includes(country),
                          );
                          setNotPreferedNationality([...notPreferedNationality, ...newCountries]);
                        } else if (value === "Arabian Countries") {
                          const newCountries = arabianCountries.filter(
                            (country) => !notPreferedNationality.includes(country),
                          );
                          setNotPreferedNationality([...notPreferedNationality, ...newCountries]);
                        } else if (!notPreferedNationality.includes(value)) {
                          setNotPreferedNationality([...notPreferedNationality, value]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select not preferred nationalities..." className="truncate" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 z-[60] bg-popover">
                        <SelectItem value="European Countries" className="font-semibold text-primary">
                          🇪🇺 European Countries (Select All)
                        </SelectItem>
                        <SelectItem value="Arabian Countries" className="font-semibold text-primary">
                          🕌 Arabian Countries (Select All)
                        </SelectItem>
                        {countries
                          .filter((country) => !notPreferedNationality.includes(country))
                          .map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {notPreferedNationality.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 max-w-full overflow-x-hidden">
                        {notPreferedNationality.map((country) => (
                          <span
                            key={country}
                            className="inline-flex items-center px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30"
                          >
                            {country}
                            <button
                              type="button"
                              onClick={() => {
                                setNotPreferedNationality(notPreferedNationality.filter((n) => n !== country));
                              }}
                              className="ml-1 h-4 w-4 p-0.5 text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="Type" className="text-sm sm:text-base">
                        Job Type
                      </Label>
                      <Select
                        value={formData.Type}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, Type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" className="truncate" />
                        </SelectTrigger>
                        <SelectContent className="z-[60] bg-popover">
                          <SelectItem value="Permanent">Permanent</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.Type === "Contract" && (
                      <div className="space-y-2 sm:space-y-3">
                        <Label htmlFor="contract_length" className="text-sm sm:text-base">
                          Contract Length
                        </Label>
                        <Select
                          value={formData.contract_length || ""}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, contract_length: value }))}
                        >
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
                    <Switch id="hasAssignment" checked={hasAssignment} onCheckedChange={setHasAssignment} />
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

              <TabsContent value="amend" className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0">
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold break-words">Edit Job Requirements</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                        Edit all job requirements and descriptions. Changes will be reflected in AI Requirements.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Label htmlFor="amendMode" className="text-xs sm:text-sm">
                        Enable Editing
                      </Label>
                      <Switch id="amendMode" checked={isAmendMode} onCheckedChange={handleAmendToggle} />
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-6 border border-primary/20 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 min-w-0 max-w-full overflow-hidden">
                    <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-primary/10 rounded-md border border-primary/20">
                      <h4 className="font-semibold text-primary mb-1 text-sm sm:text-base">✏️ Editing Mode Active</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground break-words">
                        Edit the specific job requirements below and click 'Update Job Requirements' to save.
                      </p>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2 min-w-0">
                      <Label htmlFor="things_to_look_for" className="text-sm sm:text-base font-semibold">
                        🔍 Things to Look For
                      </Label>
                      <Textarea
                        id="things_to_look_for"
                        name="things_to_look_for"
                        value={formData.things_to_look_for}
                        onChange={handleInputChange}
                        placeholder="Enter specific things to look for in candidates..."
                        rows={4}
                        className="bg-background border-2 border-blue-300 focus:border-blue-500 transition-colors text-sm min-w-0 w-full resize-y"
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2 min-w-0">
                      <Label htmlFor="musttohave" className="text-sm sm:text-base font-semibold">
                        ⭐ Must Have Requirements
                      </Label>
                      <Textarea
                        id="musttohave"
                        name="musttohave"
                        value={formData.musttohave || ""}
                        onChange={handleInputChange}
                        placeholder="Enter critical skills and requirements..."
                        rows={4}
                        className="bg-background border-2 border-red-300 focus:border-red-500 transition-colors text-sm min-w-0 w-full resize-y"
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2 min-w-0">
                      <Label htmlFor="nicetohave" className="text-sm sm:text-base font-semibold">
                        💫 Nice to Have Requirements
                      </Label>
                      <Textarea
                        id="nicetohave"
                        name="nicetohave"
                        value={formData.nicetohave || ""}
                        onChange={handleInputChange}
                        placeholder="Enter preferred skills and bonuses..."
                        rows={4}
                        className="bg-background border-2 border-green-300 focus:border-green-500 transition-colors text-sm min-w-0 w-full resize-y"
                      />
                    </div>

                    <div className="flex justify-end pt-3 sm:pt-4 border-t border-primary/20">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-6 sm:px-8 py-2 font-semibold w-full sm:w-auto h-11 sm:h-10 text-sm min-h-[44px] sm:min-h-0"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Updating..." : "Update Job Requirements"}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 md:gap-4 pt-4 sm:pt-6 border-t border-border/30 min-w-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/jobs")}
                className="w-full sm:w-auto h-11 sm:h-10 text-sm min-h-[44px] sm:min-h-0"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="action-button bg-gradient-primary hover:shadow-glow w-full sm:w-auto h-11 sm:h-10 text-sm min-h-[44px] sm:min-h-0"
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
