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
import { Upload, X, FileText, CheckCircle2, AlertCircle } from "lucide-react";

const applicationSchema = z.object({
  firstName: z.string().min(1, "First name is required").min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(1, "Last name is required").min(2, "Last name must be at least 2 characters"),
  phoneNumber: z.string().min(1, "Phone number is required").min(10, "Please enter a valid phone number"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  jobApplied: z.string().min(1, "Job applied is required"),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

interface UploadedFile {
  id: string;
  name: string;
  storageUrl: string;
  text?: string;
  status: 'uploading' | 'uploaded' | 'failed';
  uploadProgress?: number;
}

export default function Apply() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [jobName, setJobName] = useState<string>("");
  const [submittedUserId, setSubmittedUserId] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { id: jobId } = useParams();

  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      jobApplied: "",
    },
  });

  // Fetch job details on mount
  useEffect(() => {
    const initializeForm = async () => {
      try {
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
            const defaultJobName = "Position Available";
            setJobName(defaultJobName);
            form.setValue("jobApplied", defaultJobName, { shouldValidate: true });
          }
        } else {
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
    if (uploadedFiles.length === 0) {
      toast({
        title: "CV Required",
        description: "Please upload at least one CV file to submit your application.",
        variant: "destructive",
      });
      return;
    }

    const stillUploading = uploadedFiles.some(file => file.status === 'uploading');
    if (stillUploading) {
      toast({
        title: "Upload in Progress",
        description: "Please wait for all files to finish uploading before submitting.",
        variant: "destructive",
      });
      return;
    }

    const validFiles = uploadedFiles.filter(file => 
      file.status === 'uploaded' && file.storageUrl
    );

    if (validFiles.length === 0) {
      toast({
        title: "Upload Failed",
        description: "No CVs were successfully uploaded. Please try uploading your files again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const path = window.location.pathname;
      const pathMatch = path.match(/\/job\/([^/]+)\/apply/);
      const jobIdFromUrl = pathMatch?.[1] || "";

      const cleanText = (text: string) => {
        if (!text) return "";
        return text
          .replace(/\u0000/g, "")
          .replace(/[\u0001-\u0008\u000B-\u001F\u007F-\u009F]/g, "")
          .normalize("NFC")
          .trim();
      };

      const firstName = cleanText(data.firstName);
      const lastName = cleanText(data.lastName);
      const fullName = lastName ? `${firstName} ${lastName}` : firstName;
      
      const payload = {
        Firstname: firstName,
        Lastname: lastName || null,
        name: fullName,
        email: cleanText(data.email),
        phone_number: cleanText(data.phoneNumber),
        job_id: cleanText(jobIdFromUrl),
        cv_text: cleanText(validFiles.map(f => f.text || '').join('\n')),
        cv_links: validFiles.map(f => f.storageUrl),
      };

      const { data: fnRes, error: fnError } = await supabase.functions.invoke('submit_application', {
        body: payload,
      });

      if (fnError || (fnRes && (fnRes as any).error)) {
        const message = fnError?.message || (fnRes as any)?.error || 'Unknown error';
        console.error('Submit application failed:', message);
        throw new Error(message);
      }

      const userId = (fnRes as any)?.user_id || "Unknown";
      setSubmittedUserId(userId);

      console.log("Application submitted successfully");
      
      toast({
        title: "Application Submitted",
        description: `Your application has been submitted successfully! Your application ID is: ${userId}`,
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
    if (files.length === 0) return;

    // Create files with stable IDs upfront
    const newFiles: UploadedFile[] = files.map(fileObj => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: fileObj.file_name,
      storageUrl: '',
      text: 'Processing...',
      status: 'uploading' as const,
      uploadProgress: 0
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsDialogOpen(true);
    
    // Helper: update file by stable ID (immune to array reordering)
    const updateFile = (fileId: string, updates: Partial<UploadedFile>) => {
      setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, ...updates } : f));
    };

    for (let i = 0; i < files.length; i++) {
      const fileObj = files[i];
      const fileId = newFiles[i].id;
      
      try {
        updateFile(fileId, { uploadProgress: 25 });

        const timestamp = Date.now();
        const fileExtension = fileObj.file_name.split('.').pop();
        const uniqueFileName = `cv-${timestamp}-${Math.random().toString(36).substring(2, 6)}.${fileExtension}`;
        
        updateFile(fileId, { uploadProgress: 50 });

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('cvs')
          .upload(uniqueFileName, fileObj.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('cvs')
          .getPublicUrl(uploadData.path);

        console.log('CV upload succeeded:', { fileId, fileName: uniqueFileName, publicUrl });

        // Mark as uploaded IMMEDIATELY — this file is now submittable
        updateFile(fileId, {
          storageUrl: publicUrl,
          text: 'Text extraction pending',
          status: 'uploaded',
          uploadProgress: 100
        });

        // Text extraction is non-fatal
        try {
          const extractResult = await supabase.functions.invoke('extract-cv-text', {
            body: { fileUrl: publicUrl }
          });
          const extractedText = extractResult?.data?.text;
          if (extractedText) {
            updateFile(fileId, { text: extractedText });
          }
        } catch (extractError) {
          console.warn('Text extraction failed (non-fatal):', extractError);
        }
      } catch (error) {
        console.error('Error uploading CV:', error);
        updateFile(fileId, {
          storageUrl: '',
          text: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          status: 'failed',
          uploadProgress: 0
        });
        
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${fileObj.file_name}. Please try again.`,
          variant: "destructive",
        });
      }
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const successCount = uploadedFiles.filter(f => f.status === 'uploaded').length;
  const hasValidFiles = successCount > 0;
  const isAnyUploading = uploadedFiles.some(f => f.status === 'uploading');

  if (isSubmitted) {
    return (
      <MissionBackground>
        <div className="min-h-screen p-4 relative z-10 flex items-center justify-center">
          <Dialog open={true}>
            <DialogContent className="max-w-lg">
              <DialogHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <DialogTitle className="text-5xl font-light font-work tracking-tight text-center">Thank You!</DialogTitle>
                <DialogDescription className="text-center text-base font-light font-inter">
                  Your application has been submitted successfully. We will review it and get back to you soon.
                  {submittedUserId && (
                    <span className="block mt-3 font-medium text-primary">
                      Your Application ID: {submittedUserId}
                    </span>
                  )}
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
                          {successCount > 0 
                            ? `${successCount} file(s) ready` 
                            : isAnyUploading 
                              ? 'Uploading...' 
                              : 'No files uploaded successfully'}
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
                                {uploadedFiles.map((file) => (
                                  <div
                                    key={file.id}
                                    className="flex flex-col space-y-2 p-3 bg-muted rounded-lg"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        {file.status === 'uploaded' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                                        {file.status === 'failed' && <AlertCircle className="h-4 w-4 text-destructive" />}
                                        {file.status === 'uploading' && <FileText className="h-4 w-4" />}
                                        <span className="text-sm font-medium truncate">
                                          {file.name}
                                        </span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(file.id)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    {file.status === 'uploading' && (
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                          <span>Uploading...</span>
                                          <span>{file.uploadProgress}%</span>
                                        </div>
                                        <Progress value={file.uploadProgress} className="h-2" />
                                      </div>
                                    )}
                                    {file.status === 'failed' && (
                                      <p className="text-xs text-destructive">Upload failed — please remove and try again.</p>
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
                  disabled={isSubmitting || !hasValidFiles || isAnyUploading}
                >
                  {isSubmitting 
                    ? "Submitting..." 
                    : isAnyUploading 
                      ? "Uploading CV..." 
                      : !hasValidFiles 
                        ? "Please Upload CV First" 
                        : "Submit Application"}
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
