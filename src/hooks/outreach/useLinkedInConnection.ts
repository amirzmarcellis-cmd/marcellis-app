import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useLinkedInConnection() {
  const queryClient = useQueryClient();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Fetch connection status from profile
  const { data: connectionData, isLoading, isFetching, refetch: refetchConnection } = useQuery({
    queryKey: ['linkedin-connection'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isConnected: false, linkedInId: null, name: null };

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('linkedin_id, name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return { isConnected: false, linkedInId: null, name: null };
      }

      return {
        isConnected: !!profile?.linkedin_id,
        linkedInId: profile?.linkedin_id || null,
        name: profile?.name || null,
      };
    },
    staleTime: 30000, // Cache for 30 seconds to prevent unnecessary refetches
  });

  // Initiate LinkedIn connection - get auth URL
  const initiateConnection = useCallback(async (): Promise<string | null> => {
    setIsAuthenticating(true);
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-connect', {
        body: { action: 'connect' },
      });

      if (error) {
        console.error('Error initiating connection:', error);
        toast.error('Failed to initiate LinkedIn connection');
        setIsAuthenticating(false);
        return null;
      }

      return data?.authUrl || null;
    } catch (err) {
      console.error('Error initiating connection:', err);
      toast.error('Failed to initiate LinkedIn connection');
      setIsAuthenticating(false);
      return null;
    }
  }, []);

  // Fetch LinkedIn account after auth completes
  const fetchLinkedInAccountMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-linkedin-account');
      
      if (error) {
        throw new Error(error.message || 'Failed to fetch LinkedIn account');
      }
      
      return data;
    },
    onSuccess: (data) => {
      setIsAuthenticating(false);
      if (data?.connected) {
        toast.success('LinkedIn account connected successfully!');
        queryClient.invalidateQueries({ queryKey: ['linkedin-connection'] });
      }
    },
    onError: (error: Error) => {
      setIsAuthenticating(false);
      console.error('Error fetching LinkedIn account:', error);
      // Don't show error toast - connection might still be processing
    },
  });

  // Disconnect LinkedIn account
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('disconnect-linkedin-account');
      
      if (error) {
        throw new Error(error.message || 'Failed to disconnect LinkedIn account');
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success('LinkedIn account disconnected');
      queryClient.invalidateQueries({ queryKey: ['linkedin-connection'] });
    },
    onError: (error: Error) => {
      console.error('Error disconnecting LinkedIn:', error);
      toast.error('Failed to disconnect LinkedIn account');
    },
  });

  // Only show "not connected" if we have loaded data and it's explicitly not connected
  // During loading/fetching, preserve previous state or show loading
  const isActuallyConnected = connectionData?.isConnected ?? false;

  return {
    isConnected: isActuallyConnected,
    linkedInId: connectionData?.linkedInId ?? null,
    isLoading: isLoading || (isFetching && !connectionData), // Show loading during initial fetch
    isAuthenticating,
    isDisconnecting: disconnectMutation.isPending,
    initiateConnection,
    fetchLinkedInAccount: fetchLinkedInAccountMutation.mutateAsync,
    disconnectLinkedIn: disconnectMutation.mutateAsync,
    refetchConnection,
    setIsAuthenticating,
  };
}
