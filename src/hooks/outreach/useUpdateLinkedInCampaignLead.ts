import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LinkedInLead } from './useLinkedInCampaignLeads';

export function useUpdateLinkedInCampaignLead() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LinkedInLead> }) => {
      const { data, error } = await supabase
        .from('linkedin_campaigns_leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating lead:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linkedin-campaign-leads'] });
    },
    onError: (error: Error) => {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead');
    },
  });

  return {
    updateLead: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
