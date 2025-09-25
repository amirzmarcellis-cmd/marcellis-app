import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import FileUpload from "@/components/upload/FileUpload";
import { MissionBackground } from "@/components/layout/MissionBackground";

const applicationSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  notes: z.string().optional(),
  jobApplied: z.string().min(1, "Job applied is required"),
  webhookUrl: z.string().url("Please enter a valid webhook URL").optional(),
});

type ApplicationForm = z.infer<typeof applicationSchema>;


export default function Apply() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cvFile, setCvFile] = useState<string>("");
  const [cvText, setCvText] = useState<string>("");
  const [jobName, setJobName] = useState<string>("");
  const [nextUserId, setNextUserId] = useState<string>("");
  const { toast } = useToast();
  const { id: jobId } = useParams();

  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      user_id: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      notes: "",
      jobApplied: "",
      webhookUrl: "",
    },
  });



  // Generate next user ID and fetch job details
  useEffect(() => {
    const initializeForm = async () => {
      try {
        // Generate next user ID first
        const userId = await generateNextUserId();
        setNextUserId(userId);
        form.setValue("user_id", userId);

        // Resolve job id from router params or URL path as a fallback
        const path = window.location.pathname;
        const pathMatch = path.match(/\/job\/([^/]+)\/apply/);
        const fallbackJobId = pathMatch?.[1];
        const resolvedJobId = jobId || fallbackJobId;
        console.log("Resolved jobId:", resolvedJobId, "pathname:", path);

        if (resolvedJobId) {
          const title = await fetchJobName(resolvedJobId);
          if (title) {
            setJobName(title);
            form.setValue("jobApplied", title, { shouldValidate: true });
          } else {
            // If job lookup fails, still set a sensible default to avoid validation error
            const defaultJobName = "Position Available";
            setJobName(defaultJobName);
            form.setValue("jobApplied", defaultJobName, { shouldValidate: true });
          }
        } else {
          // No job id in URL, treat as general application
          const defaultJobName = "General Application";
          setJobName(defaultJobName);
          form.setValue("jobApplied", defaultJobName, { shouldValidate: true });
        }
      } catch (error) {
        console.error("Error initializing form:", error);
        const defaultJobName = "General Application";
        setJobName(defaultJobName);
        form.setValue("jobApplied", defaultJobName, { shouldValidate: true });
      }
    };

    initializeForm();
  }, [form, jobId]);



  const generateNextUserId = async (): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from("CVs")
        .select("user_id")
        .like("user_id", "App%")
        .order("user_id", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const lastUserId = data[0].user_id;
        const match = lastUserId.match(/App(\d+)/);
        if (match) {
          const nextNumber = parseInt(match[1]) + 1;
          return `App${nextNumber.toString().padStart(4, '0')}`;
        }
      }
      
      return "App0001";
    } catch (error) {
      console.error("Error generating user ID:", error);
      return "App0001";
    }
  };

  const fetchJobName = async (jobId: string): Promise<string> => {
    try {
      console.log("Fetching job with ID:", jobId);
      const { data, error } = await supabase
        .from("Jobs")
        .select("job_title")
        .eq("job_id", jobId)
        .maybeSingle();

      if (error) {
        console.error("Supabase error fetching job:", error);
        return "";
      }
      
      if (!data) {
        console.warn("No job found with ID:", jobId);
        return "";
      }
      
      console.log("Job found successfully:", data);
      return data.job_title || "";
    } catch (error) {
      console.error("Error in fetchJobName:", error);
      return "";
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

      // Insert into CVs table with correct field mapping
      const { error: insertError } = await supabase
        .from("CVs")
        .insert([{
          user_id: cleanText(data.user_id),
          Firstname: cleanText(data.firstName),
          Lastname: cleanText(data.lastName),
          name: cleanText(`${data.firstName} ${data.lastName}`),
          email: cleanText(data.email),
          phone_number: cleanText(data.phoneNumber),
          cv_text: cleanText(cvText),
          cv_link: cleanText(cvFile)
        }]);

      if (insertError) {
        console.error("Insert failed:", insertError);
        throw insertError;
      }

      toast({
        title: "Application Submitted",
        description: "Thank you for your application. We will review it and get back to you soon.",
      });

      // Generate new user ID for next application
      const newUserId = await generateNextUserId();
      form.reset({
        user_id: newUserId,
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        notes: "",
        jobApplied: jobName,
        webhookUrl: "",
      });
      setNextUserId(newUserId);
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

  const triggerWebhook = async (webhookUrl: string, formData: any) => {
    try {
      console.log("Triggering webhook:", webhookUrl);
      
      // Format data to match the required structure
      const webhookPayload = [
        {
          "type": "INSERT",
          "table": "CVs", 
          "record": {
            "name": `${formData.firstName} ${formData.lastName}`,
            "email": formData.email,
            "cv_link": formData.cv_link,
            "cv_text": formData.cv_text,
            "user_id": formData.user_id,
            "Lastname": formData.lastName,
            "Firstname": formData.firstName,
            "phone_number": formData.phoneNumber
          },
          "schema": "public",
          "old_record": null
        }
      ];
      
      console.log("Webhook payload:", webhookPayload);
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify(webhookPayload),
      });

      toast({
        title: "Webhook Triggered",
        description: "CV data has been sent to your webhook in the required format.",
      });
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Webhook Error",
        description: "Failed to trigger webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (files: any[]) => {
    if (files.length > 0) {
      const fileUrl = files[0].file_url;
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

        // Trigger webhook if URL is provided
        const webhookUrl = form.getValues("webhookUrl");
        if (webhookUrl) {
          await triggerWebhook(webhookUrl, {
            user_id: form.getValues("user_id"),
            firstName: form.getValues("firstName"),
            lastName: form.getValues("lastName"),
            email: form.getValues("email"),
            phoneNumber: form.getValues("phoneNumber"),
            cv_link: fileUrl,
            cv_text: data?.text || 'CV uploaded - text extraction failed'
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
                  name="user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Auto-generated user ID" 
                          {...field} 
                          disabled
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your last name" {...field} />
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
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your phone number" {...field} />
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

                <div>
                  <Label className="text-sm font-medium">Upload your CV</Label>
                  <div className="mt-2">
                    <FileUpload
                      onFileUploaded={handleFileUpload}
                      accept=".pdf,.doc,.docx"
                      maxSizeMB={10}
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

                <FormField
                  control={form.control}
                  name="jobApplied"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Applied</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Auto-populated job title" 
                          {...field} 
                          disabled
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="webhookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webhook URL (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="url"
                          placeholder="https://hooks.zapier.com/hooks/catch/..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Enter your Zapier webhook URL to automatically send CV data when uploaded
                      </p>
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