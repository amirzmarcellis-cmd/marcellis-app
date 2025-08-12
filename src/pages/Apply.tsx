import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import FileUpload from "@/components/upload/FileUpload";
import { MissionBackground } from "@/components/layout/MissionBackground";
const applicationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  jobApplied: z.string().min(1, "Please select a job"),
  portfolioLink: z.string().optional().or(z.literal("")).refine((val) => !val || z.string().url().safeParse(val).success, "Please enter a valid URL"),
  agencyExperience: z.string().min(1, "Please specify your agency experience"),
  overallExperience: z.string().min(1, "Please specify your overall experience"),
  salaryExpectations: z.string().min(1, "Please enter your salary expectations"),
  noticePeriod: z.string().min(1, "Please enter your notice period"),
  currentLocation: z.string().min(1, "Please select your current location"),
  notes: z.string().optional(),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

interface Job {
  "Job ID": string;
  "Job Title": string;
  "Job Location": string;
}

const countries = [
  "United Arab Emirates",
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];

export default function Apply() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cvFile, setCvFile] = useState<string>("");
  const [cvText, setCvText] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: "",
      title: "",
      phoneNumber: "",
      email: "",
      jobApplied: "",
      portfolioLink: "",
      agencyExperience: "",
      overallExperience: "",
      salaryExpectations: "",
      noticePeriod: "",
      currentLocation: "",
      notes: "",
    },
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("Jobs")
        .select('"Job ID", "Job Title", "Job Location"')
        .order('"Job Title"');

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load available jobs",
        variant: "destructive",
      });
    }
  };

  const generateCandidateId = async (): Promise<string> => {
    try {
      // Get the latest candidate ID to determine the next number
      const { data, error } = await supabase
        .from("CVs")
        .select('"Cadndidate_ID"')
        .like('"Cadndidate_ID"', 'DMS-C-%')
        .order('"Cadndidate_ID"', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 659; // Starting number
      if (data && data.length > 0) {
        const lastId = data[0]["Cadndidate_ID"];
        const match = lastId.match(/DMS-C-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      return `DMS-C-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating candidate ID:', error);
      // Fallback to timestamp-based ID
      return `DMS-C-${Date.now().toString().slice(-4)}`;
    }
  };

  const onSubmit = async (data: ApplicationForm) => {
    setIsSubmitting(true);
    
    try {
      // Function to clean text data and remove null characters
      const cleanText = (text: string) => {
        if (!text) return "";
        return text.replace(/\u0000/g, "").trim();
      };

      // Generate a proper candidate ID
      const candidateId = await generateCandidateId();
      
      const cvData = {
        "Cadndidate_ID": candidateId,
        "Title": cleanText(data.title),
        "First Name": cleanText(data.fullName.split(" ")[0] || ""),
        "Last Name": cleanText(data.fullName.split(" ").slice(1).join(" ") || ""),
        "Phone Number": cleanText(data.phoneNumber),
        "Email": cleanText(data.email),
        "Applied for": [data.jobApplied],
        "CV_Link": cleanText(cvFile),
        "cv_text": cleanText(cvText),
        "Linkedin": cleanText(data.portfolioLink || ""),
        "Other Notes": cleanText(data.notes || ""),
        "Timestamp": new Date().toISOString(),
        "Experience": cleanText(`Agency: ${data.agencyExperience}, Overall: ${data.overallExperience}`),
        "Location": cleanText(data.currentLocation),
        "CV Summary": cleanText(`Salary Expectations: ${data.salaryExpectations} AED/month, Notice Period: ${data.noticePeriod} days`),
      };

      const { error } = await supabase
        .from("CVs")
        .insert([cvData]);

      if (error) throw error;

      toast({
        title: "Application Submitted",
        description: "Thank you for your application. We will review it and get back to you soon.",
      });

      form.reset();
      setCvFile("");
      setCvText("");
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (files: any[]) => {
    if (files.length > 0) {
      const fileUrl = files[0].file_url; // Correct property name
      setCvFile(fileUrl);
      
      // Extract text from the uploaded CV
      try {
        const { data, error } = await supabase.functions.invoke('extract-cv-text', {
          body: { fileUrl }
        });

        if (error) throw error;
        
        if (data?.text) {
          setCvText(data.text);
          toast({
            title: "CV Text Extracted",
            description: "CV text has been automatically extracted and will be saved.",
          });
        }
      } catch (error) {
        console.error('Error extracting CV text:', error);
        setCvText('CV uploaded - text extraction failed');
        toast({
          title: "Text Extraction Notice",
          description: "CV uploaded successfully, but text extraction failed. Manual review may be needed.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <MissionBackground>
      <div className="min-h-screen p-4 relative z-10">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Job Application</CardTitle>
            <CardDescription className="text-center">
              Please fill out the form below to apply for a position with us.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Digital Marketing Specialist" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (ex. 971558884444)</FormLabel>
                      <FormControl>
                        <Input placeholder="971558884444" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobApplied"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Applied</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a job position" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {jobs.map((job) => (
                            <SelectItem key={job["Job ID"]} value={job["Job ID"]}>
                              {job["Job Title"]} - {job["Job Location"]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="portfolioLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio Link (Behance, Dribbble, YouTube, Website, Google Drive, etc.)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://your-portfolio.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agencyExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How many years of experience do you have working in a marketing or creative agency?</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 3 years" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="overallExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How many years of professional experience do you have in this role overall?</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 5 years" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryExpectations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Expectations (AED/month)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 8000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="noticePeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notice Period (in Days)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Where are you currently located?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your current country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-background z-50">
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label className="text-sm font-medium">Upload your CV</Label>
                  <div className="mt-2">
                    <FileUpload
                      entityType="application"
                      entityId="temp"
                      accept=".pdf,.doc,.docx"
                      maxSize={10}
                      onUploadComplete={handleFileUpload}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional information you'd like to share..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
    </MissionBackground>
  );
}