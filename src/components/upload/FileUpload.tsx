import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileUploaded?: (files: any[]) => void;
  accept?: string;
  maxSizeMB?: number;
}

export default function FileUpload({ onFileUploaded, accept = "*/*", maxSizeMB = 10 }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    
    // Mock file upload for demo
    const mockFiles = files.map(file => ({
      file_name: file.name,
      file_url: URL.createObjectURL(file),
      file_type: file.type,
      file_size: file.size
    }));
    
    onFileUploaded?.(mockFiles);
  };

  return (
    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
      <p className="text-sm font-medium mb-2">Click to upload files</p>
      <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
        Choose Files
      </Button>
    </div>
  );
}