import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useDeleteLinkedInCampaignLead() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('linkedin_campaigns_leads')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting lead:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Lead deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['linkedin-campaign-leads'] });
    },
    onError: (error: Error) => {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    },
  });

  return {
    deleteLead: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
}
