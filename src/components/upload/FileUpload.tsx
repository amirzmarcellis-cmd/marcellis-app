import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  entityType: string;
  entityId: string;
  accept?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  onUploadComplete?: (files: FileUploadResult[]) => void;
}

interface FileUploadResult {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  result?: FileUploadResult;
}

export default function FileUpload({
  entityType,
  entityId,
  accept = '.pdf,.doc,.docx,.txt',
  maxSize = 10,
  multiple = false,
  onUploadComplete
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    if (accept && accept !== '*') {
      const allowedTypes = accept.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.some(type => 
        type === fileExtension || 
        file.type.match(type.replace('*', '.*'))
      )) {
        return `File type not allowed. Accepted types: ${accept}`;
      }
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<FileUploadResult> => {
    // Simulate file upload progress (replace with actual upload logic)
    return new Promise((resolve, reject) => {
      const uploadId = Date.now().toString();
      
      // Update progress
      const progressInterval = setInterval(() => {
        setUploadingFiles(prev => 
          prev.map(f => 
            f.file === file 
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          )
        );
      }, 200);

      // Simulate upload completion
      setTimeout(async () => {
        clearInterval(progressInterval);
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          // For demo purposes, we'll create a mock file URL
          // In production, you'd upload to Supabase Storage or another service
          const mockFileUrl = `https://example.com/files/${uploadId}_${file.name}`;

          const fileData = {
            entity_type: entityType,
            entity_id: entityId,
            file_name: file.name,
            file_url: mockFileUrl,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: user.id
          };

          const { data, error } = await supabase
            .from('file_uploads')
            .insert([fileData])
            .select()
            .single();

          if (error) throw error;

          const result: FileUploadResult = {
            id: data.id,
            file_name: data.file_name,
            file_url: data.file_url,
            file_type: data.file_type,
            file_size: data.file_size
          };

          setUploadingFiles(prev => 
            prev.map(f => 
              f.file === file 
                ? { ...f, progress: 100, status: 'success', result }
                : f
            )
          );

          resolve(result);
        } catch (error) {
          setUploadingFiles(prev => 
            prev.map(f => 
              f.file === file 
                ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
                : f
            )
          );
          reject(error);
        }
      }, 2000);
    });
  };

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    if (!multiple && fileArray.length > 1) {
      toast({
        title: 'Error',
        description: 'Only one file is allowed',
        variant: 'destructive',
      });
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: 'Invalid File',
          description: `${file.name}: ${error}`,
          variant: 'destructive',
        });
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) return;

    // Add to uploading state
    const newUploadingFiles = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Upload files
    const results: FileUploadResult[] = [];
    for (const file of validFiles) {
      try {
        const result = await uploadFile(file);
        results.push(result);
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    // Notify completion
    if (results.length > 0 && onUploadComplete) {
      onUploadComplete(results);
    }

    toast({
      title: 'Upload Complete',
      description: `${results.length} file(s) uploaded successfully`,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (file: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== file));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card 
        className={`mission-control-panel border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Files</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop files here, or click to browse
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Accepted formats: {accept}</div>
              <div>Maximum size: {maxSize}MB {multiple ? '• Multiple files allowed' : '• Single file only'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index} className="mission-control-panel">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium truncate">
                        {uploadingFile.file.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {formatFileSize(uploadingFile.file.size)}
                        </Badge>
                        {uploadingFile.status === 'success' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {uploadingFile.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(uploadingFile.file);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {uploadingFile.status === 'uploading' && (
                      <Progress value={uploadingFile.progress} className="h-2" />
                    )}
                    
                    {uploadingFile.status === 'error' && (
                      <p className="text-xs text-red-500">{uploadingFile.error}</p>
                    )}
                    
                    {uploadingFile.status === 'success' && (
                      <p className="text-xs text-green-600">Upload complete</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}