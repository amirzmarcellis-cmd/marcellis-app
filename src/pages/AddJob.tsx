// @ts-nocheck
// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Check, ChevronsUpDown, Plus, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ApiMultiSelect } from "@/components/ui/api-multi-select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";


const europeanCountries = [
  "Albania", "Andorra", "Austria", "Azerbaijan", "Belgium", "Bosnia and Herzegovina", 
  "United Kingdom", "Cyprus", "Denmark", "Croatia", "France", "Finland", "Netherlands", 
  "Germany", "Georgia", "Estonia", "Greece", "Iceland", "Ireland", "Italy", "Kazakhstan", 
  "Poland", "Portugal", "Romania", "Russia", "Malta", "Moldova", "Northern Ireland", 
  "Norway", "Luxembourg", "Serbia", "Slovakia", "Slovenia", "Spain", "Switzerland", "Sweden"
];

const arabianCountries = [
  "Algeria", "Bahrain", "Egypt", "Iraq", "Jordan", "Kuwait", "Lebanon", "Libya", 
  "Morocco", "Oman", "Palestine", "Qatar", "Saudi Arabia", "Sudan", "Syria", 
  "Tunisia", "United Arab Emirates", "Yemen"
];

const countries = [
  "Afghanistan", "Albania", "Algeria", "United States", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia",
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
  "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Brazil", "United Kingdom", "Brunei", "Bulgaria", "Burkina Faso",
  "Myanmar", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China",
  "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti",
  "Dominican Republic", "Netherlands", "East Timor", "Ecuador", "Egypt", "United Arab Emirates", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia",
  "Fiji", "Philippines", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece",
  "Grenada", "Guatemala", "Guinea-Bissau", "Guinea", "Guyana", "Haiti", "Herzegovina", "Honduras", "Hungary", "Iceland",
  "India", "Indonesia", "Iran", "Iraq", "Ireland", "Italy", "Ivory Coast", "Jamaica", "Japan",
  "Jordan", "Kazakhstan", "Kenya", "Saint Kitts and Nevis", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Liberia",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "North Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
  "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Morocco",
  "Lesotho", "Botswana", "Mozambique", "Namibia", "Nauru", "Nepal", "New Zealand", "Vanuatu", "Nicaragua", "Nigeria",
  "Niger", "North Korea", "Northern Ireland", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay",
  "Peru", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Lucia", "El Salvador", "Samoa",
  "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", "Suriname", "Eswatini",
  "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago",
  "Tunisia", "Turkey", "Tuvalu", "Uganda", "Ukraine", "Uruguay", "Uzbekistan", "Venezuela", "Vietnam",
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

const industries = [
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
  "Writing & Editing"
];

export default function AddJob() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { isAdmin, isManager, isTeamLeader } = useUserRole();
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    industries: [] as string[],
    headhuntingCompanies: [] as string[],
    companiesToExclude: [] as string[],
    clientId: "",
    clientName: "",
    clientDescription: "",
    jobLocation: "",
    jobSalaryRange: [10000] as number[],
    hasAssignment: false,
    assignmentLink: "",
    noticePeriod: "",
    nationalityToInclude: [] as string[],
    nationalityToExclude: [] as string[],
    preferedNationality: [] as string[],
    notPreferedNationality: [] as string[],
    type: "",
    contractLength: "",
    currency: "",
    itrisId: "",
    groupId: "",
    recruiterId: ""
  });
  const [newHeadhuntingUrl, setNewHeadhuntingUrl] = useState("");
  const [groups, setGroups] = useState<Array<{id: string, name: string, color: string | null}>>([]);
  const [recruiters, setRecruiters] = useState<Array<{user_id: string, name: string, email: string}>>([]);
  const [clients, setClients] = useState<Array<{id: string, name: string, description: string | null}>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [industryPopoverOpen, setIndustryPopoverOpen] = useState(false);
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false);
  const [addClientDialogOpen, setAddClientDialogOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: "", description: "" });
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [optionalFieldsOpen, setOptionalFieldsOpen] = useState(false);
  const [selectedOptionalFields, setSelectedOptionalFields] = useState<string[]>([]);
  const [linkedInSearchEnabled, setLinkedInSearchEnabled] = useState(false);
  const [recruiterLinkedInId, setRecruiterLinkedInId] = useState<string | null>(null);

  useEffect(() => {
    // Auto-assign recruiter to current user for team members if not selected
    const isTeamMember = !(isAdmin || isManager || isTeamLeader);
    if (profile?.user_id && isTeamMember && !formData.recruiterId) {
      setFormData(prev => ({ ...prev, recruiterId: profile.user_id }));
    }
  }, [profile?.user_id, isAdmin, isManager, isTeamLeader]);

  useEffect(() => {
    fetchGroups();
    fetchRecruiters();
    fetchClients();
  }, [profile?.user_id]);

  // Fetch recruiter's LinkedIn ID when recruiter changes
  useEffect(() => {
    const fetchRecruiterLinkedInId = async () => {
      if (!formData.recruiterId) {
        setRecruiterLinkedInId(null);
        setLinkedInSearchEnabled(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('linkedin_id')
          .eq('user_id', formData.recruiterId)
          .single();

        if (error) throw error;
        setRecruiterLinkedInId(data?.linkedin_id || null);
        
        // Disable LinkedIn search if recruiter doesn't have LinkedIn ID
        if (!data?.linkedin_id) {
          setLinkedInSearchEnabled(false);
        }
      } catch (error) {
        console.error('Error fetching recruiter LinkedIn ID:', error);
        setRecruiterLinkedInId(null);
        setLinkedInSearchEnabled(false);
      }
    };

    fetchRecruiterLinkedInId();
  }, [formData.recruiterId]);

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
      // Show all users to everyone (both team leaders and regular members)
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

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, description')
        .order('name');

      if (error) throw error;
      
      // Deduplicate clients by name (case-insensitive)
      const uniqueClients = (data || []).reduce((acc: Array<{id: string, name: string, description: string | null}>, current) => {
        const duplicate = acc.find(
          client => client.name.toLowerCase().trim() === current.name.toLowerCase().trim()
        );
        if (!duplicate) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      setClients(uniqueClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleAddClient = async () => {
    if (!newClientData.name.trim()) {
      toast.error("Client name is required");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: newClientData.name,
          description: newClientData.description || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Client added successfully");
      setClients([...clients, data]);
      setFormData({ ...formData, clientId: data.id, clientName: data.name, clientDescription: data.description || "" });
      setNewClientData({ name: "", description: "" });
      setAddClientDialogOpen(false);
      setClientPopoverOpen(false);
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error("Failed to add client");
    }
  };

  const autoSaveNationality = useCallback(async (field: string, value: string[]) => {
    // Only auto-save if we have a job_id (after initial creation)
    if (!currentJobId) return;

    try {
      const fieldMap = {
        'nationalityToInclude': 'nationality_to_include',
        'nationalityToExclude': 'nationality_to_exclude',
        'preferedNationality': 'prefered_nationality',
        'notPreferedNationality': 'not_prefered_nationality'
      };

      const dbField = fieldMap[field];
      if (!dbField) return;

      // Set to null if array is empty, otherwise join with comma
      const dbValue = value.length > 0 ? value.join(", ") : null;

      const { error } = await supabase
        .from('Jobs')
        .update({ [dbField]: dbValue })
        .eq('job_id', currentJobId);

      if (error) {
        console.error('Error auto-saving nationality:', error);
      } else {
        toast.success("Saved automatically", { duration: 1000 });
      }
    } catch (error) {
      console.error('Error auto-saving:', error);
    }
  }, [currentJobId]);

  const handleInputChange = (field: string, value: string | boolean | number[] | string[]) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Reset salary when currency changes to/from INR
      if (field === 'currency') {
        const oldCurrency = prev.currency;
        const newCurrency = value as string;
        
        if (oldCurrency !== newCurrency) {
          // If switching to INR, reset to a reasonable INR default
          if (newCurrency === 'INR') {
            newData.jobSalaryRange = [100000];
          } 
          // If switching from INR to other currencies, reset to standard default
          else if (oldCurrency === 'INR') {
            newData.jobSalaryRange = [10000];
          }
        }
      }
      
      return newData;
    });

    // Auto-save nationality fields with debounce
    if (['nationalityToInclude', 'nationalityToExclude', 'preferedNationality'].includes(field)) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        autoSaveNationality(field, value as string[]);
      }, 1000);
    }
  };

  const generateJobId = async () => {
    const slug = profile?.slug || 'me';
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      // Get the highest existing job number for this slug
      const { data: existingJobs } = await supabase
        .from('Jobs')
        .select('job_id')
        .like('job_id', `${slug}-j-%`)
        .order('job_id', { ascending: false })
        .limit(1);
      
      let nextNumber = 1;
      if (existingJobs && existingJobs.length > 0) {
        const lastJobId = existingJobs[0].job_id;
        const match = lastJobId.match(/-j-(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }
      
      const paddedNumber = nextNumber.toString().padStart(4, '0');
      const newJobId = `${slug}-j-${paddedNumber}`;
      
      // Check if this ID already exists
      const { data: duplicateCheck } = await supabase
        .from('Jobs')
        .select('job_id')
        .eq('job_id', newJobId)
        .limit(1);
      
      if (!duplicateCheck || duplicateCheck.length === 0) {
        return newJobId;
      }
      
      attempts++;
    }
    
    // Fallback to timestamp-based ID if we can't find a unique sequential number
    const timestamp = Date.now().toString().slice(-6);
    return `${slug}-j-${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all mandatory fields
    if (!formData.jobTitle.trim()) {
      toast.error("Job Title is required");
      return;
    }
    if (!formData.recruiterId) {
      toast.error("Assigned Recruiter is required");
      return;
    }
    if (!formData.jobDescription.trim()) {
      toast.error("Job Description is required");
      return;
    }
    if (!formData.clientId) {
      toast.error("Client is required");
      return;
    }
    if (!formData.jobLocation.trim()) {
      toast.error("Job Location is required");
      return;
    }
    if (!formData.noticePeriod) {
      toast.error("Notice Period is required");
      return;
    }
    if (!formData.jobSalaryRange[0] || formData.jobSalaryRange[0] < 1000) {
      toast.error("Valid Salary is required");
      return;
    }
    if (!formData.currency) {
      toast.error("Currency is required");
      return;
    }
    if (!formData.type) {
      toast.error("Job Type is required");
      return;
    }
    if (formData.type === "Contract" && !formData.contractLength) {
      toast.error("Contract Length is required for contract positions");
      return;
    }
    if (!formData.itrisId.trim()) {
      toast.error("Itris ID is required");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const jobId = await generateJobId();
      const isTeamMember = !(isAdmin || isManager || isTeamLeader);
      const recruiterIdToSave = formData.recruiterId || (isTeamMember ? profile?.user_id : null);
      console.log('Creating job with recruiter_id:', recruiterIdToSave, 'for user_id:', profile?.user_id);
      
      const { error } = await supabase
        .from('Jobs')
        .insert({
          job_id: jobId,
          job_title: formData.jobTitle.trim(),
          job_description: formData.jobDescription.trim(),
          industry: formData.industries.length > 0 ? formData.industries.join(", ") : null,
          headhunting_companies: formData.headhuntingCompanies.length > 0 ? formData.headhuntingCompanies.join(", ") : null,
          companies_to_exclude: formData.companiesToExclude.length > 0 ? formData.companiesToExclude.join(", ") : null,
          client_id: formData.clientId,
          client_name: formData.clientName.trim() || null,
          client_description: formData.clientDescription ? formData.clientDescription.trim() : null,
          job_location: formData.jobLocation.trim(),
          job_salary_range: formData.jobSalaryRange[0],
          assignment: formData.hasAssignment && formData.assignmentLink ? formData.assignmentLink.trim() : null,
          notice_period: formData.noticePeriod,
          nationality_to_include: formData.nationalityToInclude.length > 0 ? formData.nationalityToInclude.join(", ") : null,
          nationality_to_exclude: formData.nationalityToExclude.length > 0 ? formData.nationalityToExclude.join(", ") : null,
          prefered_nationality: formData.preferedNationality.length > 0 ? formData.preferedNationality.join(", ") : null,
          not_prefered_nationality: formData.notPreferedNationality.length > 0 ? formData.notPreferedNationality.join(", ") : null,
          Type: formData.type,
          contract_length: formData.type === "Contract" && formData.contractLength ? formData.contractLength : null,
          Currency: formData.currency,
          itris_job_id: formData.itrisId ? formData.itrisId.trim() : null,
          group_id: formData.groupId || null,
          recruiter_id: recruiterIdToSave,
          status: 'Active',
          Processed: 'Yes',
          Timestamp: new Date().toISOString(),
          linkedin_search_enabled: linkedInSearchEnabled
        });

      if (error) {
        console.error('Error creating job:', error);
        toast.error(`Failed to create job: ${error.message}`);
        return;
      }
      
      // Set the current job ID to enable auto-save for future changes
      setCurrentJobId(jobId);
      
      toast.success("Job created successfully");
      navigate("/jobs");
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error("Failed to create job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const optionalFieldOptions = [
    { id: "industry", label: "Industry" },
    { id: "headhunting", label: "Headhunting Companies" },
    { id: "companies_exclude", label: "Companies to Exclude" },
    { id: "locations_include", label: "Locations to Include" },
    { id: "locations_exclude", label: "Locations to Exclude" },
    { id: "preferred_nationality", label: "Preferred Nationality" },
    { id: "not_preferred_nationality", label: "Not Preferred Nationality" },
    { id: "assignment", label: "Assignment Link" },
  ];

  const toggleOptionalField = (fieldId: string) => {
    setSelectedOptionalFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/jobs")}
          className="mb-4 font-light"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
        <h1 className="text-5xl font-light font-work tracking-tight">Add New Job</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mandatory Fields Section */}
        <Card className="border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10">
            <CardTitle className="text-2xl font-light font-work tracking-tight flex items-center gap-2">
              <span className="text-primary">*</span> Mandatory Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Row 1: Job Title, ITRIS ID, Group */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="font-medium flex items-center gap-1">
                  Job Title <span className="text-primary">*</span>
                </Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                  placeholder="Enter job title"
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itrisId" className="font-medium">Itris ID</Label>
                <Input
                  id="itrisId"
                  value={formData.itrisId}
                  onChange={(e) => handleInputChange("itrisId", e.target.value)}
                  placeholder="Enter Itris ID"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group" className="font-medium">Group</Label>
                <Select value={formData.groupId || "none"} onValueChange={(value) => handleInputChange("groupId", value === "none" ? "" : value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
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
            </div>

            {/* Row 2: Assigned Recruiter */}
            <div className="space-y-2">
              <Label htmlFor="recruiter" className="font-medium flex items-center gap-1">
                Assigned Recruiter <span className="text-primary">*</span>
              </Label>
              <Select value={formData.recruiterId || "none"} onValueChange={(value) => handleInputChange("recruiterId", value === "none" ? "" : value)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a recruiter" />
                </SelectTrigger>
                <SelectContent>
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

            {/* LinkedIn Search Toggle - Prominent Feature */}
            {formData.recruiterId && (
              <div className="space-y-3 p-5 border-2 border-primary/30 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Label className="font-semibold text-base">🔍 LinkedIn Search</Label>
                      {linkedInSearchEnabled && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-700 dark:text-green-400 rounded-full border border-green-500/30">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Automatically search and find candidates on LinkedIn for this position
                    </p>
                  </div>
                  {recruiterLinkedInId ? (
                    <Switch
                      checked={linkedInSearchEnabled}
                      onCheckedChange={setLinkedInSearchEnabled}
                      className="ml-4"
                    />
                  ) : (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => navigate("/settings")}
                      className="ml-4 font-medium"
                    >
                      Connect LinkedIn
                    </Button>
                  )}
                </div>
                {!recruiterLinkedInId && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <span className="text-amber-600 dark:text-amber-400 text-sm">⚠️</span>
                    <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                      The assigned recruiter needs to connect their LinkedIn account first. Click "Connect LinkedIn" to set it up.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Row 3: Job Description */}
            <div className="space-y-2">
              <Label htmlFor="jobDescription" className="font-medium flex items-center gap-1">
                Job Description <span className="text-primary">*</span>
              </Label>
              <Textarea
                id="jobDescription"
                value={formData.jobDescription}
                onChange={(e) => handleInputChange("jobDescription", e.target.value)}
                placeholder="Enter detailed job description"
                rows={5}
                required
                className="resize-none"
              />
            </div>

            {/* Row 4: Client */}
            <div className="space-y-2">
              <Label className="font-medium flex items-center gap-1">
                Client <span className="text-primary">*</span>
              </Label>
              <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={clientPopoverOpen}
                    className="w-full justify-between h-11 px-4 bg-background hover:bg-accent/5 border-border/50 rounded-lg"
                  >
                    {formData.clientId ? (
                      <span className="font-medium truncate">
                        {clients.find((c) => c.id === formData.clientId)?.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground font-normal">Select client...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover/95 backdrop-blur-xl border-border/50 shadow-lg" align="start">
                  <Command className="bg-transparent">
                    <CommandInput 
                      placeholder="Search clients..." 
                      className="h-12 border-b border-border/50 text-sm"
                    />
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                        No client found.
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="__add_new__"
                          onSelect={() => {
                            setAddClientDialogOpen(true);
                            setClientPopoverOpen(false);
                          }}
                          className="border-b border-border/30 py-3 cursor-pointer data-[selected=true]:bg-accent/50"
                        >
                          <Plus className="mr-3 h-4 w-4 text-primary" />
                          <span className="font-medium">Add New Client</span>
                        </CommandItem>
                        {clients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={client.name}
                            onSelect={() => {
                              handleInputChange("clientId", client.id);
                              handleInputChange("clientName", client.name);
                              handleInputChange("clientDescription", client.description || "");
                              setClientPopoverOpen(false);
                            }}
                            className="py-3 cursor-pointer data-[selected=true]:bg-accent/50 border-b border-border/10 last:border-0"
                          >
                            <Check
                              className={cn(
                                "mr-3 h-4 w-4 text-primary",
                                formData.clientId === client.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-foreground truncate">{client.name}</div>
                              {client.description && (
                                <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                  {client.description}
                                </div>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {formData.clientId && formData.clientDescription && (
                <div className="px-3 py-2 rounded-lg bg-accent/20 border border-border/30">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {formData.clientDescription}
                  </p>
                </div>
              )}
            </div>

            {/* Row 5: Job Location and Salary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobLocation" className="font-medium flex items-center gap-1">
                  Job Location <span className="text-primary">*</span>
                </Label>
                <Input
                  id="jobLocation"
                  value={formData.jobLocation}
                  onChange={(e) => handleInputChange("jobLocation", e.target.value)}
                  placeholder="Enter job location"
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobSalaryRange" className="font-medium flex items-center gap-1">
                  Salary: {formData.jobSalaryRange[0].toLocaleString()} <span className="text-primary">*</span>
                </Label>
                <Slider
                  value={formData.jobSalaryRange}
                  onValueChange={(value) => handleInputChange("jobSalaryRange", value)}
                  max={formData.currency === "INR" ? 10000000 : 100000}
                  min={1000}
                  step={formData.currency === "INR" ? 10000 : 500}
                  className="w-full mt-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1,000</span>
                  <span>{formData.currency === "INR" ? "10,000,000" : "100,000"}</span>
                </div>
              </div>
            </div>

            {/* Row 6: Notice Period, Currency, Job Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="noticePeriod" className="font-medium flex items-center gap-1">
                  Notice Period <span className="text-primary">*</span>
                </Label>
                <Select value={formData.noticePeriod} onValueChange={(value) => handleInputChange("noticePeriod", value)}>
                  <SelectTrigger className="h-11">
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
                <Label htmlFor="currency" className="font-medium flex items-center gap-1">
                  Currency <span className="text-primary">*</span>
                </Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AED">AED</SelectItem>
                    <SelectItem value="SAR">SAR</SelectItem>
                    <SelectItem value="QAR">QAR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="font-medium flex items-center gap-1">
                  Job Type <span className="text-primary">*</span>
                </Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Permanent">Permanent</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contract Length (conditional) */}
            {formData.type === "Contract" && (
              <div className="space-y-2">
                <Label htmlFor="contractLength" className="font-medium">Contract Length</Label>
                <Select value={formData.contractLength} onValueChange={(value) => handleInputChange("contractLength", value)}>
                  <SelectTrigger className="h-11">
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
          </CardContent>
        </Card>

        {/* Optional Fields Section */}
        <Card>
          <CardHeader>
            <Collapsible open={optionalFieldsOpen} onOpenChange={setOptionalFieldsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-between p-0 hover:bg-transparent"
                >
                  <CardTitle className="text-2xl font-light font-work tracking-tight">
                    Optional Fields
                  </CardTitle>
                  <ChevronDown className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    optionalFieldsOpen && "rotate-180"
                  )} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Select which optional fields you want to fill in:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {optionalFieldOptions.map((option) => (
                      <Button
                        key={option.id}
                        type="button"
                        variant={selectedOptionalFields.includes(option.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleOptionalField(option.id)}
                        className="rounded-full"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardHeader>
          
          {selectedOptionalFields.length > 0 && (
            <CardContent className="space-y-6 pt-0">
              {selectedOptionalFields.includes("industry") && (
                <div className="space-y-2 p-4 border border-border/50 rounded-lg bg-accent/5">
                  <Label className="font-medium">Industry</Label>
                  <ApiMultiSelect
                    value={formData.industries}
                    onChange={(value) => handleInputChange("industries", value)}
                    apiEndpoint="https://api4.unipile.com:13494/api/v1/linkedin/search/parameters?keywords={keywords}&type=INDUSTRY&account_id=TRe-JAwkQ-Kgoz27AwWxdw"
                    apiHeaders={{
                      "X-API-KEY": "CUtAWkNK.eM32jndkskOxhrUC5QqcgWntJWBZRNq9cGqH5jJXXe4=",
                      "Accept": "application/json"
                    }}
                    placeholder="Select industries..."
                    searchPlaceholder="Type to search industries..."
                    emptyText="Type to search for industries"
                  />
                  <p className="text-xs text-muted-foreground italic mt-2">
                    Note: This will affect the candidate longlist
                  </p>
                </div>
              )}

              {selectedOptionalFields.includes("headhunting") && (
                <div className="space-y-2 p-4 border border-border/50 rounded-lg bg-accent/5">
                  <Label className="font-medium">Headhunting Companies</Label>
                  <ApiMultiSelect
                    value={formData.headhuntingCompanies}
                    onChange={(value) => handleInputChange("headhuntingCompanies", value)}
                    apiEndpoint="https://api4.unipile.com:13494/api/v1/linkedin/search/parameters?keywords={keywords}&type=COMPANY&account_id=TRe-JAwkQ-Kgoz27AwWxdw"
                    apiHeaders={{
                      "X-API-KEY": "CUtAWkNK.eM32jndkskOxhrUC5QqcgWntJWBZRNq9cGqH5jJXXe4=",
                      "Accept": "application/json"
                    }}
                    placeholder="Select headhunting companies..."
                    searchPlaceholder="Type to search companies..."
                    emptyText="Type to search for companies"
                  />
                  <p className="text-xs text-muted-foreground italic mt-2">
                    Note: This will affect the candidate longlist
                  </p>
                </div>
              )}

              {selectedOptionalFields.includes("companies_exclude") && (
                <div className="space-y-2 p-4 border border-border/50 rounded-lg bg-accent/5">
                  <Label className="font-medium">Companies to Exclude</Label>
                  <ApiMultiSelect
                    value={formData.companiesToExclude}
                    onChange={(value) => handleInputChange("companiesToExclude", value)}
                    apiEndpoint="https://api4.unipile.com:13494/api/v1/linkedin/search/parameters?keywords={keywords}&type=COMPANY&account_id=TRe-JAwkQ-Kgoz27AwWxdw"
                    apiHeaders={{
                      "X-API-KEY": "CUtAWkNK.eM32jndkskOxhrUC5QqcgWntJWBZRNq9cGqH5jJXXe4=",
                      "Accept": "application/json"
                    }}
                    placeholder="Select companies to exclude..."
                    searchPlaceholder="Type to search companies..."
                    emptyText="Type to search for companies"
                  />
                  <p className="text-xs text-muted-foreground italic mt-2">
                    Note: This will affect the candidate longlist
                  </p>
                </div>
              )}

              {selectedOptionalFields.includes("locations_include") && (
                <div className="space-y-2 p-4 border border-border/50 rounded-lg bg-accent/5">
                  <Label className="font-medium">Locations to Include</Label>
                  <Select onValueChange={(value) => {
                    const currentInclude = formData.nationalityToInclude || [];
                    if (value === "European Countries") {
                      const newCountries = europeanCountries.filter(country => !currentInclude.includes(country));
                      handleInputChange("nationalityToInclude", [...currentInclude, ...newCountries]);
                    } else if (value === "Arabian Countries") {
                      const newCountries = arabianCountries.filter(country => !currentInclude.includes(country));
                      handleInputChange("nationalityToInclude", [...currentInclude, ...newCountries]);
                    } else if (!currentInclude.includes(value)) {
                      handleInputChange("nationalityToInclude", [...currentInclude, value]);
                    }
                  }}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select countries to include..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="European Countries" className="font-semibold text-primary">
                        🇪🇺 European Countries (Select All)
                      </SelectItem>
                      <SelectItem value="Arabian Countries" className="font-semibold text-primary">
                        🕌 Arabian Countries (Select All)
                      </SelectItem>
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
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                        >
                          {country}
                          <button
                            type="button"
                            onClick={() => {
                              const currentInclude = formData.nationalityToInclude || [];
                              const updated = currentInclude.filter((n) => n !== country);
                              handleInputChange("nationalityToInclude", updated);
                            }}
                            className="ml-1 hover:bg-primary/20 rounded-full w-4 h-4 flex items-center justify-center text-primary font-bold transition-colors"
                            aria-label={`Remove ${country}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground italic mt-2">
                    Note: This will affect the candidate longlist
                  </p>
                </div>
              )}

              {selectedOptionalFields.includes("locations_exclude") && (
                <div className="space-y-2 p-4 border border-border/50 rounded-lg bg-accent/5">
                  <Label className="font-medium">Locations to Exclude</Label>
                  <Select onValueChange={(value) => {
                    const currentExclude = formData.nationalityToExclude || [];
                    if (value === "European Countries") {
                      const newCountries = europeanCountries.filter(country => !currentExclude.includes(country));
                      handleInputChange("nationalityToExclude", [...currentExclude, ...newCountries]);
                    } else if (value === "Arabian Countries") {
                      const newCountries = arabianCountries.filter(country => !currentExclude.includes(country));
                      handleInputChange("nationalityToExclude", [...currentExclude, ...newCountries]);
                    } else if (!currentExclude.includes(value)) {
                      handleInputChange("nationalityToExclude", [...currentExclude, value]);
                    }
                  }}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select countries to exclude..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="European Countries" className="font-semibold text-destructive">
                        🇪🇺 European Countries (Select All)
                      </SelectItem>
                      <SelectItem value="Arabian Countries" className="font-semibold text-destructive">
                        🕌 Arabian Countries (Select All)
                      </SelectItem>
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
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-destructive/10 text-destructive border border-destructive/20"
                        >
                          {country}
                          <button
                            type="button"
                            onClick={() => {
                              const currentExclude = formData.nationalityToExclude || [];
                              const updated = currentExclude.filter((n) => n !== country);
                              handleInputChange("nationalityToExclude", updated);
                            }}
                            className="ml-1 hover:bg-destructive/20 rounded-full w-4 h-4 flex items-center justify-center text-destructive font-bold transition-colors"
                            aria-label={`Remove ${country}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground italic mt-2">
                    Note: This will affect the candidate longlist
                  </p>
                </div>
              )}

              {selectedOptionalFields.includes("preferred_nationality") && (
                <div className="space-y-2 p-4 border border-border/50 rounded-lg bg-accent/5">
                  <Label className="font-medium">Preferred Nationality</Label>
                  <Select onValueChange={(value) => {
                    const currentPrefered = formData.preferedNationality || [];
                    if (value === "European Countries") {
                      const newCountries = europeanCountries.filter(country => !currentPrefered.includes(country));
                      handleInputChange("preferedNationality", [...currentPrefered, ...newCountries]);
                    } else if (value === "Arabian Countries") {
                      const newCountries = arabianCountries.filter(country => !currentPrefered.includes(country));
                      handleInputChange("preferedNationality", [...currentPrefered, ...newCountries]);
                    } else if (!currentPrefered.includes(value)) {
                      handleInputChange("preferedNationality", [...currentPrefered, value]);
                    }
                  }}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select preferred nationalities..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="European Countries" className="font-semibold text-primary">
                        🇪🇺 European Countries (Select All)
                      </SelectItem>
                      <SelectItem value="Arabian Countries" className="font-semibold text-primary">
                        🕌 Arabian Countries (Select All)
                      </SelectItem>
                      {countries.filter(country => 
                        !(formData.preferedNationality || []).includes(country)
                      ).map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(formData.preferedNationality || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(formData.preferedNationality || []).map((country) => (
                        <span
                          key={country}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30"
                        >
                          {country}
                          <button
                            type="button"
                            onClick={() => {
                              const currentPrefered = formData.preferedNationality || [];
                              const updated = currentPrefered.filter((n) => n !== country);
                              handleInputChange("preferedNationality", updated);
                            }}
                            className="ml-1 hover:bg-green-500/30 rounded-full w-4 h-4 flex items-center justify-center text-green-700 dark:text-green-300 font-bold transition-colors"
                            aria-label={`Remove ${country}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground italic mt-2">
                    Note: This will affect the candidate longlist
                  </p>
                </div>
              )}

              {selectedOptionalFields.includes("not_preferred_nationality") && (
                <div className="space-y-2 p-4 border border-border/50 rounded-lg bg-accent/5">
                  <Label className="font-medium">Not Preferred Nationality</Label>
                  <Select onValueChange={(value) => {
                    const currentNotPrefered = formData.notPreferedNationality || [];
                    if (value === "European Countries") {
                      const newCountries = europeanCountries.filter(country => !currentNotPrefered.includes(country));
                      handleInputChange("notPreferedNationality", [...currentNotPrefered, ...newCountries]);
                    } else if (value === "Arabian Countries") {
                      const newCountries = arabianCountries.filter(country => !currentNotPrefered.includes(country));
                      handleInputChange("notPreferedNationality", [...currentNotPrefered, ...newCountries]);
                    } else if (!currentNotPrefered.includes(value)) {
                      handleInputChange("notPreferedNationality", [...currentNotPrefered, value]);
                    }
                  }}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select not preferred nationalities..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="European Countries" className="font-semibold text-primary">
                        🇪🇺 European Countries (Select All)
                      </SelectItem>
                      <SelectItem value="Arabian Countries" className="font-semibold text-primary">
                        🕌 Arabian Countries (Select All)
                      </SelectItem>
                      {countries.filter(country => 
                        !(formData.notPreferedNationality || []).includes(country)
                      ).map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(formData.notPreferedNationality || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(formData.notPreferedNationality || []).map((country) => (
                        <span
                          key={country}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30"
                        >
                          {country}
                          <button
                            type="button"
                            onClick={() => {
                              const currentNotPrefered = formData.notPreferedNationality || [];
                              const updated = currentNotPrefered.filter((n) => n !== country);
                              handleInputChange("notPreferedNationality", updated);
                            }}
                            className="ml-1 hover:bg-red-500/30 rounded-full w-4 h-4 flex items-center justify-center text-red-700 dark:text-red-300 font-bold transition-colors"
                            aria-label={`Remove ${country}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground italic mt-2">
                    Note: This will affect the candidate longlist
                  </p>
                </div>
              )}

              {selectedOptionalFields.includes("assignment") && (
                <div className="space-y-2 p-4 border border-border/50 rounded-lg bg-accent/5">
                  <div className="flex items-center space-x-2 mb-2">
                    <Switch
                      id="hasAssignment"
                      checked={formData.hasAssignment}
                      onCheckedChange={(value) => handleInputChange("hasAssignment", value)}
                    />
                    <Label htmlFor="hasAssignment" className="font-medium">Has Assignment?</Label>
                  </div>
                  
                  {formData.hasAssignment && (
                    <>
                      <Label htmlFor="assignmentLink">Assignment Link</Label>
                      <Input
                        id="assignmentLink"
                        value={formData.assignmentLink}
                        onChange={(e) => handleInputChange("assignmentLink", e.target.value)}
                        placeholder="Enter assignment link"
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground italic mt-2">
                        Note: This will affect the candidate longlist
                      </p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Client Dialog */}
        <Dialog open={addClientDialogOpen} onOpenChange={setAddClientDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-work">Add New Client</DialogTitle>
              <DialogDescription className="font-light">
                Add a new client to your database
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newClientName" className="font-light">Client Name *</Label>
                <Input
                  id="newClientName"
                  value={newClientData.name}
                  onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                  placeholder="Enter client name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newClientDescription" className="font-light">Description</Label>
                <Textarea
                  id="newClientDescription"
                  value={newClientData.description}
                  onChange={(e) => setNewClientData({ ...newClientData, description: e.target.value })}
                  placeholder="Enter client description"
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAddClientDialogOpen(false);
                    setNewClientData({ name: "", description: "" });
                  }}
                  className="font-light"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAddClient}
                  className="font-light"
                >
                  Add Client
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Submit Buttons */}
        <div className="flex gap-4 pb-6">
          <Button type="submit" disabled={isSubmitting} size="lg" className="px-8">
            {isSubmitting ? "Creating..." : "Create Job"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/jobs")} size="lg" className="px-8">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}