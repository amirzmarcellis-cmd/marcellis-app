import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UnipileAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface UnipileMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  text: string;
  created_at: string;
  is_sender: number | boolean;
  attachments?: UnipileAttachment[];
}

export function useUnipileMessages(chatId: string | null, enabled: boolean = true) {
  const { data: messages = [], isLoading, error, refetch } = useQuery({
    queryKey: ['unipile-messages', chatId],
    queryFn: async () => {
      if (!chatId) return [];

      const { data, error } = await supabase.functions.invoke('fetch-unipile-messages', {
        body: { 
          action: 'get_messages', 
          chatId 
        }
      });

      if (error) {
        console.error('Error fetching messages:', error);
        throw new Error('Failed to fetch messages');
      }

      if (data?.error) {
        console.error('Unipile messages error:', data.error);
        throw new Error(data.error);
      }

      console.log('Unipile messages response:', data);
      return (data?.messages || []) as UnipileMessage[];
    },
    enabled: enabled && !!chatId,
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  return {
    messages,
    isLoading,
    error,
    refetch,
  };
}
