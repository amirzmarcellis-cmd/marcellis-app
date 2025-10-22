import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Linkedin, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface LinkedInConnectionProps {
  linkedinId: string | null;
  onUpdate: () => void;
}

export function LinkedInConnection({ linkedinId, onUpdate }: LinkedInConnectionProps) {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-3xl font-light font-work tracking-tight">
          <Linkedin className="h-5 w-5 text-[#0A66C2]" />
          LinkedIn Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-light font-inter">Status:</span>
              {isConnected ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Not Connected
                </Badge>
              )}
            </div>
            {isConnected && (
              <p className="text-sm text-muted-foreground">
                Account ID: {linkedinId}
              </p>
            )}
          </div>
        </div>

        {!isConnected ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Connect your LinkedIn account to search for candidates and view profiles.
            </p>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="gap-2"
            >
              {isConnecting && <Loader2 className="h-4 w-4 animate-spin" />}
              <Linkedin className="h-4 w-4" />
              Connect LinkedIn Account
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleTest}
              disabled={isTesting}
              variant="outline"
              className="gap-2"
            >
              {isTesting && <Loader2 className="h-4 w-4 animate-spin" />}
              Test Connection
            </Button>
            <Button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              variant="destructive"
              className="gap-2"
            >
              {isDisconnecting && <Loader2 className="h-4 w-4 animate-spin" />}
              Disconnect
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
