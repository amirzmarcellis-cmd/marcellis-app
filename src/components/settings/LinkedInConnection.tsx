import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { LinkedInLogo } from '@/components/ui/LinkedInLogo';

interface LinkedInConnectionProps {
  linkedinId?: string | null;
  onUpdate?: () => void;
}

export function LinkedInConnection({ linkedinId: propLinkedinId, onUpdate: propOnUpdate }: LinkedInConnectionProps) {
  const { profile, refetch } = useProfile();
  const linkedinId = propLinkedinId ?? profile?.linkedin_id;
  const onUpdate = propOnUpdate ?? refetch;
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [accountId, setAccountId] = useState('');
  const popupWindow = useRef<Window | null>(null);
  const popupCheckInterval = useRef<NodeJS.Timeout | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('You must be logged in to connect LinkedIn. Please refresh the page and try again.');
      }

      console.log('Session check passed, initiating LinkedIn connection...');

      const { data, error } = await supabase.functions.invoke('linkedin-connect', {
        body: { action: 'initiate' },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.url) {
        setAccountId(data.account_id);
        
        // Open centered popup window
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
          throw new Error('Popup blocked. Please allow popups for this site.');
        }

        popupWindow.current = popup;

        // Poll to check if popup is closed
        popupCheckInterval.current = setInterval(() => {
          if (popup.closed) {
            if (popupCheckInterval.current) {
              clearInterval(popupCheckInterval.current);
            }
            handleAuthComplete();
          }
        }, 500);
      }
    } catch (error) {
      console.error('LinkedIn connect error:', error);
      toast({
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Failed to connect LinkedIn account. Please try again.',
        variant: 'destructive',
      });
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const { error } = await supabase.functions.invoke('linkedin-connect', {
        body: { action: 'disconnect' },
      });

      if (error) throw error;

      toast({
        title: 'Disconnected',
        description: 'LinkedIn account has been disconnected.',
      });
      onUpdate();
    } catch (error) {
      console.error('LinkedIn disconnect error:', error);
      toast({
        title: 'Disconnect failed',
        description: 'Failed to disconnect LinkedIn account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleAuthComplete = async () => {
    // Verify and save the LinkedIn connection
    if (accountId) {
      try {
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke('linkedin-connect', {
          body: { action: 'verify', code: accountId },
        });

        if (verifyError) {
          console.error('Verification error:', verifyError);
          toast({
            title: 'Connection failed',
            description: 'Failed to verify LinkedIn connection. Please try again.',
            variant: 'destructive',
          });
        } else if (verifyData?.success) {
          toast({
            title: 'Connected',
            description: 'LinkedIn account connected successfully.',
          });
        }
      } catch (error) {
        console.error('Verification error:', error);
      }
    }
    
    // Refresh profile to check if connected
    onUpdate();
    setIsConnecting(false);
  };

  // Cleanup on unmount
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

  const isConnected = !!linkedinId;

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <LinkedInLogo size={20} className="drop-shadow-lg" />
              <div className="absolute -inset-1 bg-[#0A66C2]/20 blur-md rounded-full -z-10" />
            </div>
            <span className="text-sm font-medium">LinkedIn Integration</span>
          </div>
          {isConnected ? (
            <Badge variant="default" className="gap-1 h-6 text-xs">
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1 h-6 text-xs">
              <XCircle className="h-3 w-3" />
              Not Connected
            </Badge>
          )}
        </div>

        {!isConnected ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Connect your LinkedIn account to search for candidates
            </p>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              size="sm"
              className="gap-2 h-8"
            >
              {isConnecting && <Loader2 className="h-3 w-3 animate-spin" />}
              <LinkedInLogo size={14} />
              Connect LinkedIn
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            variant="destructive"
            size="sm"
            className="gap-2 h-8"
          >
            {isDisconnecting && <Loader2 className="h-3 w-3 animate-spin" />}
            Disconnect
          </Button>
        )}
      </div>
    </>
  );
}
