import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Linkedin, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface LinkedInConnectionProps {
  linkedinId: string | null;
  userName: string | null;
  onUpdate?: () => void;
}

export function LinkedInConnection({ linkedinId, userName, onUpdate }: LinkedInConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const { toast } = useToast();
  const popupWindow = useRef<Window | null>(null);
  const popupCheckInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (popupCheckInterval.current) {
        clearInterval(popupCheckInterval.current);
      }
      if (popupWindow.current && !popupWindow.current.closed) {
        popupWindow.current.close();
      }
    };
  }, []);

  const handleConnect = async () => {
    // Check if user has a name
    if (!userName || userName.trim() === '') {
      setShowNamePrompt(true);
      return;
    }

    setIsConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please log in to connect LinkedIn');
      }

      console.log('Initiating LinkedIn connection...');

      const { data, error } = await supabase.functions.invoke('linkedin-connect', {
        body: { action: 'initiate' }
      });

      if (error) throw error;

      console.log('Initiate response:', data);

      // Open popup window
      const width = 600;
      const height = 700;
      const left = Math.round((window.screen.width - width) / 2);
      const top = Math.round((window.screen.height - height) / 2);

      const popup = window.open(
        data.url,
        'LinkedIn Authentication',
        `width=${width},height=${height},left=${left},top=${top},` +
        `toolbar=no,menubar=no,location=no,status=no,scrollbars=yes,resizable=yes`
      );

      if (!popup) {
        throw new Error('Failed to open authentication window. Please allow popups for this site.');
      }

      popupWindow.current = popup;

      // Monitor popup and check status when it closes
      const interval = setInterval(async () => {
        if (popup.closed) {
          clearInterval(interval);
          console.log('Popup closed, checking connection status...');
          
          await checkConnectionStatus();
          setIsConnecting(false);
        }
      }, 500);

      popupCheckInterval.current = interval;

    } catch (error) {
      console.error('Error connecting LinkedIn:', error);
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      // Poll for up to 15 seconds (30 attempts * 500ms)
      for (let i = 0; i < 30; i++) {
        const { data, error } = await supabase.functions.invoke('linkedin-connect', {
          body: { action: 'check-status' }
        });

        if (error) throw error;

        console.log('Connection status:', data.status);

        if (data.status === 'completed') {
          toast({
            title: "LinkedIn Connected",
            description: "Your LinkedIn account has been successfully connected.",
          });
          onUpdate?.();
          return;
        }

        if (data.status === 'failed') {
          throw new Error(data.error_message || 'Connection failed');
        }

        // Wait 500ms before next check
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Timeout
      toast({
        title: "Verification Timeout",
        description: "Connection verification timed out. Please refresh the page to check status.",
        variant: "destructive",
      });

    } catch (error) {
      console.error('Error checking connection status:', error);
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your LinkedIn account?')) {
      return;
    }

    setIsDisconnecting(true);
    try {
      const { error } = await supabase.functions.invoke('linkedin-connect', {
        body: { action: 'disconnect' }
      });

      if (error) throw error;

      toast({
        title: "LinkedIn Disconnected",
        description: "Your LinkedIn account has been disconnected.",
      });
      onUpdate?.();

    } catch (error) {
      console.error('Error disconnecting LinkedIn:', error);
      toast({
        title: "Disconnection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const isConnected = !!linkedinId;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Linkedin className="h-5 w-5 text-[#0A66C2]" />
              <CardTitle>LinkedIn Connection</CardTitle>
            </div>
            {isConnected ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <XCircle className="h-3 w-3" />
                Not Connected
              </Badge>
            )}
          </div>
          <CardDescription>
            {isConnected
              ? 'Your LinkedIn account is connected and active.'
              : 'Connect your LinkedIn account to enable LinkedIn-based features.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected ? (
            <>
              <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 p-4 transition-all hover:border-primary/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Connected Account</p>
                    <p className="text-sm font-mono text-foreground break-all leading-relaxed">{linkedinId}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="w-full"
              >
                {isDisconnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  'Disconnect LinkedIn'
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-[#0A66C2] hover:bg-[#004182]"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Linkedin className="h-4 w-4" />
                  Connect LinkedIn Account
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Name prompt dialog */}
      <AlertDialog open={showNamePrompt} onOpenChange={setShowNamePrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Profile Name Required
            </AlertDialogTitle>
            <AlertDialogDescription>
              You need to set your display name in your profile before connecting LinkedIn. 
              This name is used to identify your LinkedIn connection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowNamePrompt(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => {
                const nameInput = document.getElementById('name');
                nameInput?.focus();
              }, 300);
            }}>
              Update Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
