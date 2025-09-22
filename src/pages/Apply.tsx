import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  name: z.string().min(2, "Display name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  notes: z.string().optional(),
});

type ApplicationForm = z.infer<typeof applicationSchema>;


export default function Apply() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cvFile, setCvFile] = useState<string>("");
  const [cvText, setCvText] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      user_id: "",
      fullName: "",
      name: "",
      email: "",
      phoneNumber: "",
      notes: "",
    },
  });



  // Auto-populate name field when fullName changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "fullName" && value.fullName && !value.name) {
        form.setValue("name", value.fullName);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);



  const onSubmit = async (data: ApplicationForm) => {
    setIsSubmitting(true);
    
    try {
      // Function to clean text data and remove null characters
      const cleanText = (text: string) => {
        if (!text) return "";
        return text.replace(/\u0000/g, "").trim();
      };

      // Split full name into first and last name
      const nameParts = data.fullName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Insert into CVs table with correct field mapping
      const { error: insertError } = await supabase
        .from("CVs")
        .insert([{
          user_id: cleanText(data.user_id),
          Firstname: cleanText(firstName),
          Lastname: cleanText(lastName),
          name: cleanText(data.name),
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
                  name="user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your user ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your display name" {...field} />
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