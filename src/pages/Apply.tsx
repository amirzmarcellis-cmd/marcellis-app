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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FileUpload from "@/components/upload/FileUpload";
import { MissionBackground } from "@/components/layout/MissionBackground";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileText } from "lucide-react";

const applicationSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  firstName: z.string().min(1, "First name is required").min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(1, "Last name is required").min(2, "Last name must be at least 2 characters"),
  phoneNumber: z.string().min(1, "Phone number is required").min(10, "Please enter a valid phone number"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
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
  const [isSubmitted, setIsSubmitted] = useState(false);
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
      // Get all existing App IDs to find the highest number
      const { data, error } = await supabase
        .from("CVs")
        .select("user_id")
        .like("user_id", "App%")
        .order("user_id", { ascending: false });

      if (error) throw error;

      let nextNumber = 1;
      
      if (data && data.length > 0) {
        // Extract all numbers and find the maximum
        const numbers = data
          .map(item => {
            const match = item.user_id.match(/App(\d+)/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter(num => num > 0);
        
        if (numbers.length > 0) {
          nextNumber = Math.max(...numbers) + 1;
        }
      }
      
      // Keep incrementing until we find an available ID
      let attempts = 0;
      while (attempts < 100) {
        const candidateId = `App${nextNumber.toString().padStart(4, '0')}`;
        
        // Check if this ID exists
        const { data: existing } = await supabase
          .from("CVs")
          .select("user_id")
          .eq("user_id", candidateId)
          .maybeSingle();
        
        if (!existing) {
          return candidateId;
        }
        
        nextNumber++;
        attempts++;
      }
      
      // Fallback to timestamp-based ID if we can't find a free sequential one
      return `App${Date.now().toString().slice(-4)}`;
    } catch (error) {
      console.error("Error generating user ID:", error);
      return `App${Date.now().toString().slice(-4)}`;
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
    // Validate that at least one CV file is uploaded
    if (uploadedFiles.length === 0) {
      toast({
        title: "CV Required",
        description: "Please upload at least one CV file to submit your application.",
        variant: "destructive",
      });
      return;
    }

    // Check if any files are still uploading
    const stillUploading = uploadedFiles.some(file => file.isUploading);
    if (stillUploading) {
      toast({
        title: "Upload in Progress",
        description: "Please wait for all files to finish uploading before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get job_id from URL params
      const path = window.location.pathname;
      const pathMatch = path.match(/\/job\/([^/]+)\/apply/);
      const jobIdFromUrl = pathMatch?.[1] || "";

      // Function to clean text data and remove null characters
      const cleanText = (text: string) => {
        if (!text) return "";
        // Remove null bytes and most control characters that Postgres text cannot store
        return text
          .replace(/\u0000/g, "")
          .replace(/[\u0001-\u0008\u000B-\u001F\u007F-\u009F]/g, "")
          .normalize("NFC")
          .trim();
      };

      // Get all valid files (uploaded and processed)
      const validFiles = uploadedFiles.filter(file => 
        file.url && file.url.startsWith('https://') && !file.isUploading
      );

      // Insert into CVs table - this will automatically trigger the Supabase webhook
      const firstName = cleanText(data.firstName);
      const lastName = cleanText(data.lastName);
      const fullName = lastName ? `${firstName} ${lastName}` : firstName;
      
      const { error: insertError } = await supabase
        .from("CVs")
        .insert([{
          user_id: cleanText(data.user_id),
          Firstname: firstName,
          Lastname: lastName || null,
          name: fullName,
          email: cleanText(data.email),
          phone_number: cleanText(data.phoneNumber),
          notes: "",
          job_id: cleanText(jobIdFromUrl),
          cv_text: cleanText(validFiles.map(f => f.text || '').join('\n')),
          cv_link: validFiles.map(f => f.url).join(', ')
        }]);

      if (insertError) {
        console.error("Insert failed:", insertError);
        throw insertError;
      }

      console.log("Application submitted successfully - Supabase webhook will be triggered automatically");
      
      toast({
        title: "Application Submitted",
        description: `Your application has been submitted with User ID: ${data.user_id}`,
      });

      setIsSubmitted(true);
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


  if (isSubmitted) {
    return (
      <MissionBackground>
        <div className="min-h-screen p-4 relative z-10 flex items-center justify-center">
          <Dialog open={true}>
            <DialogContent className="max-w-lg">
              <DialogHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <DialogTitle className="text-5xl font-light font-work tracking-tight text-center">Thank You!</DialogTitle>
                <DialogDescription className="text-center text-base font-light font-inter">
                  Your application has been submitted successfully. We will review it and get back to you soon.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6 text-center">
                <p className="text-base font-light font-inter text-muted-foreground">
                  We appreciate your interest in joining our team.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </MissionBackground>
    );
  }

  return (
    <MissionBackground>
      <div className="min-h-screen p-4 relative z-10">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-light font-work tracking-tight text-center">Job Application</CardTitle>
            <CardDescription className="text-center font-light font-inter">
              Please fill out the form below to apply for a position with us.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* User ID is auto-generated and hidden from applicants */}

                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your first name" {...field} required />
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
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your last name" {...field} required />
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
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your phone number" {...field} required />
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
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label className="text-sm font-medium">Upload your CV *</Label>
                  <p className="text-xs text-muted-foreground mt-1">At least one CV file is required to submit your application</p>
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
                  disabled={isSubmitting || uploadedFiles.length === 0}
                >
                  {isSubmitting ? "Submitting..." : uploadedFiles.length === 0 ? "Please Upload CV First" : "Submit Application"}
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