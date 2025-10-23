import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface LinkedInConnectionModalProps {
  url: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LinkedInConnectionModal({
  url,
  open,
  onClose,
  onSuccess,
}: LinkedInConnectionModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!open) {
      setIsLoading(true);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !url) return;

    const handleMessage = (event: MessageEvent) => {
      console.log('Received message from iframe:', event.data);
      
      // Listen for our custom success message from the callback page
      if (event.data?.type === 'linkedin-auth-success') {
        const accountId = event.data.accountId;
        console.log('LinkedIn authentication successful, account ID:', accountId);
        
        // Small delay to let the user see the success message
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [open, url, onSuccess, onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Connect Your LinkedIn Account</DialogTitle>
          <DialogDescription>
            Complete the authentication process in the window below
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative w-full h-[600px] rounded-lg overflow-hidden border">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading authentication...</p>
              </div>
            </div>
          )}
          <iframe
            src={url}
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            onLoad={() => setIsLoading(false)}
            title="LinkedIn Authentication"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
