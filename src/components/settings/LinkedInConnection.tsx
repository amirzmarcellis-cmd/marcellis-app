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

      // First, call fetch-linkedin-account to check if the right account type was connected
      try {
        const { data: fetchResult, error: fetchError } = await supabase.functions.invoke('fetch-linkedin-account');
        
        if (fetchError || fetchResult?.wrongAccountType) {
          clearInterval(poll);
          setIsPolling(false);
          toast({
            title: 'Connection Failed',
            description: fetchResult?.error || 'Unable to connect LinkedIn account. A different account type was detected. Please contact support for assistance.',
            variant: 'destructive',
          });
          return;
        }
      } catch (fetchErr) {
        console.error('Error checking account type:', fetchErr);
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
      // Get user profile data before disconnecting
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data: profile } = await supabase
        .from('profiles')
        .select('linkedin_id, name')
        .eq('user_id', user.id)
        .single();

      // Send webhook notification before disconnecting
      if (profile?.linkedin_id) {
        try {
          await fetch('https://hook.eu2.make.com/j3c6idm38oapvf8xrba2jdlzua6y7d9b', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify([{
              linkedin_id: profile.linkedin_id,
              name: profile.name || user.email || 'Unknown'
            }])
          });
        } catch (webhookError) {
          console.error('Webhook notification error:', webhookError);
          // Continue with disconnect even if webhook fails
        }
      }

      // Proceed with disconnect
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
          <Button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            variant="destructive"
            className="gap-2"
          >
            {isDisconnecting && <Loader2 className="h-4 w-4 animate-spin" />}
            Disconnect
          </Button>
        )}
      </CardContent>
    </Card>
    </>
  );
}
