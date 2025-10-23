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
      <Card className="relative overflow-hidden border-[#0A66C2]/20 bg-gradient-to-br from-[#0A66C2]/5 via-card/50 to-card/30">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0A66C2]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#0A66C2]/5 rounded-full blur-2xl" />
        
        <CardHeader className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A66C2] shadow-lg shadow-[#0A66C2]/20">
                <Linkedin className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">LinkedIn</CardTitle>
                <CardDescription className="mt-1">
                  Professional network integration
                </CardDescription>
              </div>
            </div>
            {isConnected ? (
              <Badge className="gap-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
                <CheckCircle className="h-3.5 w-3.5" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1.5">
                <XCircle className="h-3.5 w-3.5" />
                Inactive
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-4">
          {isConnected ? (
            <>
              <div className="group relative overflow-hidden rounded-2xl border border-[#0A66C2]/20 bg-gradient-to-br from-[#0A66C2]/10 via-[#0A66C2]/5 to-transparent p-5 transition-all duration-300 hover:border-[#0A66C2]/40 hover:shadow-lg hover:shadow-[#0A66C2]/10">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0A66C2]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider">Connected Account</p>
                    </div>
                    <p className="text-sm font-mono text-foreground/90 break-all leading-relaxed pl-3.5">{linkedinId}</p>
                  </div>
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
              >
                {isDisconnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Disconnect Account
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/50 p-4 border border-border/50">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect your LinkedIn account to unlock professional networking features and seamless integration.
                </p>
              </div>
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full h-12 bg-[#0A66C2] hover:bg-[#004182] text-white shadow-lg shadow-[#0A66C2]/20 hover:shadow-xl hover:shadow-[#0A66C2]/30 transition-all duration-300"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Linkedin className="h-5 w-5" />
                    Connect LinkedIn Account
                  </>
                )}
              </Button>
            </div>
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
