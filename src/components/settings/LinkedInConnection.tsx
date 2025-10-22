import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Linkedin, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

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
  const [isTesting, setIsTesting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-connect', {
        body: { action: 'initiate' },
      });

      if (error) throw error;

      if (data?.url) {
        // Open LinkedIn OAuth in a popup
        const popup = window.open(data.url, 'LinkedIn Connection', 'width=600,height=700');
        
        // Poll for popup closure or success
        const checkPopup = setInterval(async () => {
          if (popup?.closed) {
            clearInterval(checkPopup);
            // Refresh profile to check if connected
            onUpdate();
            setIsConnecting(false);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('LinkedIn connect error:', error);
      toast({
        title: 'Connection failed',
        description: 'Failed to connect LinkedIn account. Please try again.',
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

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-test-connection');

      if (error) throw error;

      if (data?.success) {
        toast({
          title: 'Connection verified',
          description: 'Your LinkedIn connection is working properly.',
        });
      } else {
        throw new Error(data?.error || 'Connection test failed');
      }
    } catch (error) {
      console.error('LinkedIn test error:', error);
      toast({
        title: 'Connection test failed',
        description: 'Your LinkedIn connection may have expired. Please reconnect.',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const isConnected = !!linkedinId;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Linkedin className="h-4 w-4 text-[#0A66C2]" />
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
            <Linkedin className="h-3 w-3" />
            Connect LinkedIn
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            onClick={handleTest}
            disabled={isTesting}
            variant="outline"
            size="sm"
            className="gap-2 h-8"
          >
            {isTesting && <Loader2 className="h-3 w-3 animate-spin" />}
            Test Connection
          </Button>
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
        </div>
      )}
    </div>
  );
}
