import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LinkedInLead {
  id: string;
  full_name: string | null;
  linkedin_id: string | null;
  campaign_name: string | null;
  status: string | null;
  action_date: string | null;
  company_name: string | null;
  company_size: string | null;
  email: string | null;
  phone_number: string | null;
  unipile_user_id: string | null;
  invitation_id: string | null;
  chat_id: string | null;
  thread_id: string | null;
  notes: string | null;
  source: string | null;
  lead_type: string | null;
  call_recording: string | null;
  service: string | null;
  created_by: string | null;
}

export function useLinkedInCampaignLeads() {
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading, error, refetch } = useQuery({
    queryKey: ['linkedin-campaign-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('linkedin_campaigns_leads')
        .select('*')
        .order('action_date', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }

      return data as LinkedInLead[];
    },
  });

  const invalidateLeads = () => {
    queryClient.invalidateQueries({ queryKey: ['linkedin-campaign-leads'] });
  };

  return {
    leads,
    isLoading,
    error,
    refetch,
    invalidateLeads,
  };
}
