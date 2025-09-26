import { useState, useEffect, useRef } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FileUpload from "@/components/upload/FileUpload";
import { MissionBackground } from "@/components/layout/MissionBackground";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileText } from "lucide-react";

const applicationSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  notes: z.string().optional(),
  jobApplied: z.string().min(1, "Job applied is required"),
});

type ApplicationForm = z.infer<typeof applicationSchema>;


interface UploadedFile {
  name: string;
  url: string;
  text?: string;
  isUploading?: boolean;
  uploadProgress?: number;
}

export default function Apply() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [jobName, setJobName] = useState<string>("");
  const [nextUserId, setNextUserId] = useState<string>("");
  const { toast } = useToast();
  const { id: jobId } = useParams();
  const hasTriggeredWebhookRef = useRef(false);

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
      // Get job_id from URL params
      const path = window.location.pathname;
      const pathMatch = path.match(/\/job\/([^/]+)\/apply/);
      const jobIdFromUrl = pathMatch?.[1] || "";

      // Only insert to database if no files were uploaded (files are handled separately)
      if (uploadedFiles.length === 0) {
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
            notes: cleanText(data.notes || ""),
            job_id: cleanText(jobIdFromUrl),
            cv_text: "",
            cv_link: ""
          }]);

        if (insertError) {
          console.error("Insert failed:", insertError);
          throw insertError;
        }

        toast({
          title: "Application Submitted",
          description: "Thank you for your application. We will review it and get back to you soon.",
        });
      } else {
        toast({
          title: "Form Saved",
          description: "Your form data has been saved. Please submit your files to complete the application.",
        });
      }

      // Build and trigger webhook once with JSON payload
      const validFiles = uploadedFiles.filter(file => file.url && file.url.startsWith('https://') && file.url.includes('supabase') && !file.isUploading);
      const webhookPayload = {
        type: "INSERT",
        table: "CVs",
        record: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          cv_link: validFiles.map(f => f.url).join(', '),
          cv_text: validFiles.map(f => f.text || '').join('\n'),
          user_id: data.user_id,
          Lastname: data.lastName,
          Firstname: data.firstName,
          phone_number: data.phoneNumber,
          notes: data.notes || "",
          job_id: jobIdFromUrl
        },
        schema: "public",
        old_record: null
      };
      await triggerWebhook(webhookPayload);

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
      });
      setNextUserId(newUserId);
      if (uploadedFiles.length === 0) {
        setUploadedFiles([]);
      }
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

  const triggerWebhook = async (data: any) => {
    // Ensure the webhook is only ever triggered once per page load
    if (hasTriggeredWebhookRef.current) {
      console.log("Webhook already triggered; skipping duplicate call.");
      return false;
    }

    const webhookUrl = "https://hook.eu2.make.com/8y6jctmrqnlahnh6dccxefvctwmfq134";
    try {
      console.log("Triggering webhook:", webhookUrl, "with data:", data);
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify(data),
      });
      // Mark as triggered only after a successful request
      hasTriggeredWebhookRef.current = true;
      return true;
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Webhook Error",
        description: "Failed to trigger webhook. Please check the URL and try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleFileUpload = async (files: any[]) => {
    if (files.length > 0) {
      // Show files instantly in UI with uploading state
      const instantFiles: UploadedFile[] = files.map(fileObj => ({
        name: fileObj.file_name,
        url: URL.createObjectURL(fileObj.file), // Temporary blob URL for instant display
        text: 'Processing...',
        isUploading: true,
        uploadProgress: 0
      }));
      
      setUploadedFiles(prev => [...prev, ...instantFiles]);
      
      // Automatically open the dialog after file upload
      setIsDialogOpen(true);
      
      // Process files in background
      for (let i = 0; i < files.length; i++) {
        const fileObj = files[i];
        const fileIndex = uploadedFiles.length + i;
        
        try {
          // Update progress to 25%
          setUploadedFiles(prev => prev.map((file, index) => 
            index === fileIndex ? { ...file, uploadProgress: 25 } : file
          ));

          // Generate unique filename with timestamp
          const timestamp = Date.now();
          const fileExtension = fileObj.file_name.split('.').pop();
          const uniqueFileName = `cv-${timestamp}-${Math.random().toString(36).substring(2, 6)}.${fileExtension}`;
          
          // Update progress to 50%
          setUploadedFiles(prev => prev.map((file, index) => 
            index === fileIndex ? { ...file, uploadProgress: 50 } : file
          ));

          // Upload file to Supabase storage using the actual File object
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('cvs')
            .upload(uniqueFileName, fileObj.file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            throw uploadError;
          }

          // Update progress to 75%
          setUploadedFiles(prev => prev.map((file, index) => 
            index === fileIndex ? { ...file, uploadProgress: 75 } : file
          ));

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('cvs')
            .getPublicUrl(uploadData.path);

          // Extract text from the uploaded CV using the public URL
          const { data, error } = await supabase.functions.invoke('extract-cv-text', {
            body: { fileUrl: publicUrl }
          });

          if (error) throw error;
          
          // Update the file entry with real URL and extracted text - completed
          setUploadedFiles(prev => prev.map((file, index) => 
            index === fileIndex ? {
              ...file,
              url: publicUrl,
              text: data?.text || 'Text extraction failed',
              isUploading: false,
              uploadProgress: 100
            } : file
          ));
        } catch (error) {
          console.error('Error processing CV:', error);
          // Update with error state but keep the file visible
          setUploadedFiles(prev => prev.map((file, index) => 
            index === fileIndex ? {
              ...file,
              text: 'Upload failed - using temporary file',
              isUploading: false,
              uploadProgress: 0
            } : file
          ));
        }
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitFiles = async () => {
    if (uploadedFiles.length === 0) return;
    
    const path = window.location.pathname;
    const pathMatch = path.match(/\/job\/([^/]+)\/apply/);
    const resolvedJobId = pathMatch?.[1] || "general";
    
    // Use the form's user_id that starts with App000
    const formUserId = form.getValues("user_id");
    
    // All files uploaded; proceeding to finalize without triggering webhook
    
    // If there are still uploading files, wait for them to complete
    const stillUploading = uploadedFiles.some(file => file.isUploading);
    if (stillUploading) {
      // Don't show error, just wait for uploads to complete
      return;
    }
    
    toast({
      title: "Files submitted",
      description: "Your files have been attached to your application.",
    });
    setIsDialogOpen(false);
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
                    {uploadedFiles.length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          {uploadedFiles.length} file(s) uploaded
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button type="button" variant="outline" className="w-full">
                              <FileText className="h-4 w-4 mr-2" />
                              View Uploaded Files
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Uploaded Files</DialogTitle>
                              <DialogDescription>
                                Manage your uploaded CV files
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                {uploadedFiles.map((file, index) => (
                                  <div
                                    key={index}
                                    className="flex flex-col space-y-2 p-3 bg-muted rounded-lg"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4" />
                                        <span className="text-sm font-medium truncate">
                                          {file.name}
                                        </span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(index)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    {file.isUploading && (
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                          <span>Uploading...</span>
                                          <span>{file.uploadProgress}%</span>
                                        </div>
                                        <Progress value={file.uploadProgress} className="h-2" />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              
                              <div className="flex space-x-2">
                                <FileUpload
                                  onFileUploaded={handleFileUpload}
                                  accept=".pdf,.doc,.docx"
                                  maxSizeMB={10}
                                />
                              </div>
                              
                              <Button 
                                type="button"
                                onClick={handleSubmitFiles}
                                className="w-full"
                                disabled={uploadedFiles.length === 0}
                              >
                                Submit Files
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ) : (
                      <FileUpload
                        onFileUploaded={handleFileUpload}
                        accept=".pdf,.doc,.docx"
                        maxSizeMB={10}
                      />
                    )}
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