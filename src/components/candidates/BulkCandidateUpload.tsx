// @ts-nocheck
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, X, Check, AlertCircle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  cvUrl?: string;
  candidateId?: string;
  error?: string;
}

interface BulkCandidateUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BulkCandidateUpload({ open, onOpenChange, onSuccess }: BulkCandidateUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const generateCandidateId = async () => {
    try {
      // Get all existing candidate IDs that follow the DMS-C-XXXX pattern
      const { data: candidates, error } = await supabase
        .from('CVs')
        .select('candidate_id')
        .like('candidate_id', 'DMS-C-%')
        .order('candidate_id', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 6145; // Default starting number if no candidates exist

      if (candidates && candidates.length > 0) {
        // Extract the number from the last candidate ID (e.g., "DMS-C-6144" -> 6144)
        const lastId = candidates[0].candidate_id;
        const match = lastId.match(/DMS-C-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      return `DMS-C-${nextNumber}`;
    } catch (error) {
      console.error('Error generating candidate ID:', error);
      // Fallback to timestamp-based ID if query fails
      return `DMS-C-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    }
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    // Validate file types and sizes
    const validFiles = selectedFiles.filter(file => {
      if (file.type !== 'application/pdf' && !file.type.includes('document')) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a valid CV format. Please upload PDF or document files.`,
          variant: "destructive",
        });
        return false;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File Too Large",
          description: `${file.name} is larger than 10MB. Please choose a smaller file.`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
    }));

    setFiles(prev => [...prev, ...newFiles]);
    
    // Clear the input
    event.target.value = '';
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadSingleFile = async (fileData: UploadedFile): Promise<UploadedFile> => {
    try {
      const fileExt = fileData.file.name.split('.').pop();
      const fileName = `cv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(filePath, fileData.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('cvs')
        .getPublicUrl(filePath);

      // Generate candidate ID
      const candidateId = await generateCandidateId();

      // Create candidate record
      const candidateData = {
        candidate_id: candidateId,
        CV_Link: publicUrl,
        Timestamp: new Date().toISOString(),
        // Extract potential name from filename (basic attempt)
        first_name: fileData.file.name.replace(/\.[^/.]+$/, "").split(/[-_\s]/)[0] || null,
        last_name: fileData.file.name.replace(/\.[^/.]+$/, "").split(/[-_\s]/)[1] || null,
      };

      const { error: insertError } = await supabase
        .from('CVs')
        .insert([candidateData]);

      if (insertError) throw insertError;

      return {
        ...fileData,
        status: 'success',
        cvUrl: publicUrl,
        candidateId,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        ...fileData,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  };

  const handleBulkUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select CV files to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    let successCount = 0;
    let errorCount = 0;

    // Process files one by one to avoid overwhelming the server
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Update file status to uploading
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'uploading' } : f
      ));

      // Upload the file
      const result = await uploadSingleFile(file);

      // Update file with result
      setFiles(prev => prev.map(f => 
        f.id === file.id ? result : f
      ));

      if (result.status === 'success') {
        successCount++;
      } else {
        errorCount++;
      }

      // Update progress
      setProgress(((i + 1) / files.length) * 100);
    }

    setUploading(false);

    // Show completion toast
    if (successCount > 0) {
      toast({
        title: "Upload Complete",
        description: `${successCount} candidates uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}.`,
      });
      
      if (errorCount === 0) {
        onSuccess();
        // Reset for next use
        setTimeout(() => {
          setFiles([]);
          setProgress(0);
          onOpenChange(false);
        }, 2000);
      }
    } else {
      toast({
        title: "Upload Failed",
        description: "No candidates were uploaded successfully.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return <FileText className="w-4 h-4 text-muted-foreground" />;
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return 'border-border';
      case 'uploading':
        return 'border-primary bg-primary/5';
      case 'success':
        return 'border-green-500 bg-green-50 dark:bg-green-950/20';
      case 'error':
        return 'border-red-500 bg-red-50 dark:bg-red-950/20';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Users className="h-5 w-5 text-primary" />
            <span>Add Multiple Candidates</span>
          </DialogTitle>
          <DialogDescription>
            Upload multiple CV files at once to quickly add candidates to your pipeline.
            Each CV will create a new candidate record with a unique ID.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Selection */}
          <Card className="mission-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Select CV Files
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulkUpload">Upload CV Files</Label>
                <Input
                  id="bulkUpload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  multiple
                  onChange={handleFileSelection}
                  className="bg-background/50"
                  disabled={uploading}
                />
                <p className="text-sm text-muted-foreground">
                  Select multiple PDF or document files (max 10MB each). 
                  Files will be uploaded to public storage and candidate records will be created automatically.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* File List */}
          {files.length > 0 && (
            <Card className="mission-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Selected Files ({files.length})</span>
                  {uploading && (
                    <div className="flex items-center gap-2 text-sm">
                      <span>{Math.round(progress)}%</span>
                      <Progress value={progress} className="w-20" />
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${getStatusColor(file.status)}`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {getStatusIcon(file.status)}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{file.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                            {file.candidateId && ` • ID: ${file.candidateId}`}
                          </p>
                          {file.error && (
                            <p className="text-xs text-red-500 mt-1">{file.error}</p>
                          )}
                        </div>
                      </div>
                      {!uploading && file.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkUpload}
              disabled={files.length === 0 || uploading}
              className="gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload {files.length} CV{files.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}