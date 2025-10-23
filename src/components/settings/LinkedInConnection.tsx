import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Linkedin, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { LinkedInConnectionModal } from './LinkedInConnectionModal';

interface LinkedInConnectionProps {
  linkedinId: string | null;
  onUpdate: () => void;
}

export function LinkedInConnection({ linkedinId, onUpdate }: LinkedInConnectionProps) {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [connectionUrl, setConnectionUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const origin = window.location.origin;
      
      const { data, error } = await supabase.functions.invoke('linkedin-connect', {
        body: { origin },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('LinkedIn connect response:', data);

      if (data?.url) {
        // Open URL in modal iframe instead of redirecting
        setConnectionUrl(data.url);
        setShowModal(true);
        setIsConnecting(false);
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('LinkedIn connect error:', error);
      toast({
        title: 'Connection failed',
        description: error.message || 'Failed to connect LinkedIn account. Please try again.',
        variant: 'destructive',
      });
      setIsConnecting(false);
    }
  };

  const pollForLinkedInId = async () => {
    setIsPolling(true);
    const maxAttempts = 10; // Poll for 10 seconds
    let attempts = 0;

    const poll = setInterval(async () => {
      attempts++;
      
      // Refetch the profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        clearInterval(poll);
        setIsPolling(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('linkedin_id')
        .eq('user_id', user.id)
        .single();

      if (profile?.linkedin_id) {
        clearInterval(poll);
        setIsPolling(false);
        toast({
          title: 'LinkedIn Connected',
          description: `Account ID: ${profile.linkedin_id}`,
        });
        onUpdate(); // Refresh the UI
      } else if (attempts >= maxAttempts) {
        clearInterval(poll);
        setIsPolling(false);
        toast({
          title: 'Connection in progress',
          description: 'Your account is being connected. Please refresh the page in a moment.',
        });
      }
    }, 1000); // Check every second
  };

  const handleConnectionSuccess = () => {
    // Start polling for the LinkedIn ID
    pollForLinkedInId();
    setShowModal(false);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setConnectionUrl(null);
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
    <>
      <LinkedInConnectionModal
        url={connectionUrl || ''}
        open={showModal}
        onClose={handleModalClose}
        onSuccess={handleConnectionSuccess}
      />
      
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
    </>
  );
}
