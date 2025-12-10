import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const UNIPILE_API_KEY = import.meta.env.VITE_UNIPILE_API_KEY || '';
const UNIPILE_BASE_URL = 'https://api4.unipile.com:13494/api/v1';

export function useSendUnipileMessage() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ chatId, text }: { chatId: string; text: string }) => {
      if (!UNIPILE_API_KEY) {
        throw new Error('Unipile API key not configured');
      }

      const response = await fetch(`${UNIPILE_BASE_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-API-KEY': UNIPILE_API_KEY,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Unipile send message error:', errorText);
        throw new Error('Failed to send message');
      }

      return await response.json();
    },
    onSuccess: (_, variables) => {
      toast.success('Message sent!');
      queryClient.invalidateQueries({ queryKey: ['unipile-messages', variables.chatId] });
    },
    onError: (error: Error) => {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    },
  });

  return {
    sendMessage: mutation.mutateAsync,
    isSending: mutation.isPending,
  };
}
