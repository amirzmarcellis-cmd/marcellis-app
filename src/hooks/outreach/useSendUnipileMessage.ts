import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useSendUnipileMessage() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ chatId, text }: { chatId: string; text: string }) => {
      const { data, error } = await supabase.functions.invoke('fetch-unipile-messages', {
        body: { 
          action: 'send_message', 
          chatId, 
          message: text 
        }
      });

      if (error) {
        console.error('Error sending message:', error);
        throw new Error('Failed to send message');
      }

      if (data?.error) {
        console.error('Unipile send message error:', data.error);
        throw new Error(data.error);
      }

      return data;
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
