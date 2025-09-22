import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FileUpload from '@/components/upload/FileUpload';

interface Candidate {
  user_id?: string;
  name?: string;
  email?: string;
  phone_number?: string;
  cv_text?: string;
  Lastname?: string;
  Firstname?: string;
  cv_link?: string;
}

interface CandidateDialogProps {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  jobs: any[];
}

export function CandidateDialog({ candidate, open, onOpenChange, onSave, jobs }: CandidateDialogProps) {
  const [formData, setFormData] = useState<Candidate>({
    user_id: '',
    name: '',
    email: '',
    phone_number: '',
    cv_text: '',
    Lastname: '',
    Firstname: '',
    cv_link: ''
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState('');
  

  useEffect(() => {
    if (candidate) {
      setFormData(candidate);
      if (candidate.cv_link) {
        setCvUrl(candidate.cv_link);
      }
    } else {
      setFormData({
        user_id: '',
        name: '',
        email: '',
        phone_number: '',
        cv_text: '',
        Lastname: '',
        Firstname: '',
        cv_link: ''
      });
      setCvFile(null);
      setCvUrl('');
    }
  }, [candidate, open]);

  const generateCandidateId = async () => {
    try {
      // Get all existing user IDs and find the highest number
      const { data: existingCandidates, error } = await supabase
        .from('CVs')
        .select('user_id')
        .order('user_id', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (existingCandidates && existingCandidates.length > 0) {
        const lastId = existingCandidates[0].user_id;
        const match = lastId.match(/CAND-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      return `CAND-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating candidate ID:', error);
      return `CAND-${Date.now()}`;
    }
  };

  const handleFileUpload = async (files: any[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setUploading(true);

    try {
      // Convert blob URL to actual file for upload
      let actualFile: File;
      
      if (file.file_url.startsWith('blob:')) {
        // Handle blob URL by converting to File
        const response = await fetch(file.file_url);
        const blob = await response.blob();
        actualFile = new File([blob], file.file_name, { type: file.file_type });
      } else {
        actualFile = file;
      }

      const fileExt = file.file_name.split('.').pop();
      const fileName = `cv-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(filePath, actualFile);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('cvs')
          .getPublicUrl(filePath);

        setCvUrl(publicUrl);
        setFormData(prev => ({ ...prev, cv_link: publicUrl }));
        toast.success("CV uploaded successfully");
      } else {
        console.error('Upload error:', uploadError);
        toast.error("Failed to upload CV");
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error("Failed to upload CV");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      let candidateId = formData.user_id;
      
      if (!candidateId) {
        candidateId = await generateCandidateId();
      }

      const candidateData = {
        user_id: candidateId,
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        cv_text: formData.cv_text,
        Lastname: formData.Lastname,
        Firstname: formData.Firstname,
        cv_link: cvUrl || formData.cv_link
      };

      if (candidate) {
        // Update existing candidate
        const { error } = await supabase
          .from('CVs')
          .update(candidateData)
          .eq('user_id', candidate.user_id);

        if (error) throw error;
        toast.success("Candidate updated successfully");
      } else {
        // Create new candidate
        const { error } = await supabase
          .from('CVs')
          .insert([candidateData]);

        if (error) throw error;
        toast.success("Candidate created successfully");
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving candidate:', error);
      toast.error("Failed to save candidate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{candidate ? 'Edit Candidate' : 'Add New Candidate'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Candidate Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user_id">User ID</Label>
                <Input
                  id="user_id"
                  value={formData.user_id}
                  onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                  placeholder="Enter user ID (leave empty to auto-generate)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="firstname">First Name</Label>
                <Input
                  id="firstname"
                  value={formData.Firstname}
                  onChange={(e) => setFormData({...formData, Firstname: e.target.value})}
                  placeholder="Enter first name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastname">Last Name</Label>
                <Input
                  id="lastname"
                  value={formData.Lastname}
                  onChange={(e) => setFormData({...formData, Lastname: e.target.value})}
                  placeholder="Enter last name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">CV Upload</h3>
            
            <FileUpload
              onFileUploaded={handleFileUpload}
              accept=".pdf,.doc,.docx"
              maxSizeMB={5}
            />
            
            {(cvUrl || formData.cv_link) && (
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Uploaded CV:</p>
                <a 
                  href={cvUrl || formData.cv_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View CV Document
                </a>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cv_text">CV Text/Notes</Label>
              <Textarea
                id="cv_text"
                value={formData.cv_text}
                onChange={(e) => setFormData({...formData, cv_text: e.target.value})}
                placeholder="Additional CV text or notes"
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || uploading}>
            {loading ? 'Saving...' : 'Save Candidate'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}