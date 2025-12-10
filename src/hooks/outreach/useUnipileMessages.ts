import { useQuery } from '@tanstack/react-query';

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

const UNIPILE_API_KEY = import.meta.env.VITE_UNIPILE_API_KEY || '';
const UNIPILE_BASE_URL = 'https://api4.unipile.com:13494/api/v1';

export function useUnipileMessages(chatId: string | null, enabled: boolean = true) {
  const { data: messages = [], isLoading, error, refetch } = useQuery({
    queryKey: ['unipile-messages', chatId],
    queryFn: async () => {
      if (!chatId) return [];

      // Direct API call to Unipile
      const response = await fetch(`${UNIPILE_BASE_URL}/chats/${chatId}/messages`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-API-KEY': UNIPILE_API_KEY,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Unipile messages error:', errorText);
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      console.log('Unipile messages response:', data);

      // Transform messages to standard format
      const items = data.items || data.messages || data || [];
      return items.map((msg: any) => ({
        id: msg.id,
        chat_id: msg.chat_id || chatId,
        sender_id: msg.sender_id || msg.from_attendee_id,
        text: msg.text || msg.body || msg.content || '',
        created_at: msg.created_at || msg.timestamp,
        is_sender: msg.is_sender ?? msg.from_me ?? false,
        attachments: msg.attachments || [],
      })) as UnipileMessage[];
    },
    enabled: enabled && !!chatId && !!UNIPILE_API_KEY,
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  return {
    messages,
    isLoading,
    error,
    refetch,
  };
}
