import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Campaign {
  id: number;
  campaign_id: string;
  campaign_name: string;
  industries: string | null;
  locations: string | null;
  companies: string | null;
  keywords: string | null;
  opener_message: string | null;
  document_url: string | null;
  status: string;
  enable_followups: boolean | null;
  followup_days: number | null;
  followup_messages: string[] | null;
  campaign_created_by: string | null;
  last_updated_by: string | null;
  created_time: string;
  updated_time: string;
}

export interface CreateCampaignInput {
  campaign_name: string;
  industries?: Array<{ id: string; label: string }>;
  locations?: Array<{ id: string; label: string }>;
  companies?: Array<{ id: string; label: string }>;
  keywords?: string;
  opener_message?: string;
  document?: File;
  enable_followups?: boolean;
  followup_days?: number[];
  followup_messages?: string[];
}

export function useCampaigns() {
  const queryClient = useQueryClient();

  // Fetch all campaigns
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['linkedin-campaigns'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('linkedin_campaigns')
        .select('*')
        .order('created_time', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
        throw error;
      }

      return data as Campaign[];
    },
  });

  // Create campaign mutation
  const createMutation = useMutation({
    mutationFn: async (input: CreateCampaignInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check for duplicate campaign name
      const { data: existingCampaign } = await supabase
        .from('linkedin_campaigns')
        .select('id')
        .eq('campaign_name', input.campaign_name)
        .maybeSingle();

      if (existingCampaign) {
        throw new Error('A campaign with this name already exists. Please choose a different name.');
      }

      let documentUrl: string | null = null;

      // Upload document if provided
      if (input.document) {
        const fileExt = input.document.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('campaign-documents')
          .upload(fileName, input.document);

        if (uploadError) {
          console.error('Error uploading document:', uploadError);
          throw new Error('Failed to upload document');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('campaign-documents')
          .getPublicUrl(fileName);

        documentUrl = publicUrl;
      }

      // Insert campaign - cast to any to bypass strict type checking since table schema may differ
      const insertPayload = {
        campaign_name: input.campaign_name,
        industries: input.industries?.map(i => i.label).join(', ') || null,
        locations: input.locations?.map(l => l.label).join(', ') || null,
        companies: input.companies?.map(c => c.label).join(', ') || null,
        keywords: input.keywords || null,
        opener_message: input.opener_message || null,
        document_url: documentUrl,
        status: 'active',
        enable_followups: input.enable_followups || false,
        followup_days: input.followup_days?.[0] || null,
        followup_messages: input.followup_messages || null,
        campaign_created_by: user.id,
        last_updated_by: user.id,
      };

      const { data, error } = await supabase
        .from('linkedin_campaigns')
        .insert(insertPayload as any)
        .select()
        .single();

      if (error) {
        console.error('Error creating campaign:', error);
        // Check for unique constraint violation
        if (error.code === '23505') {
          throw new Error('A campaign with this name already exists. Please choose a different name.');
        }
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Campaign created successfully!');
      queryClient.invalidateQueries({ queryKey: ['linkedin-campaigns'] });
    },
    onError: (error: Error) => {
      console.error('Error creating campaign:', error);
      toast.error(error.message || 'Failed to create campaign');
    },
  });

  // Update campaign mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Campaign> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check for duplicate campaign name (excluding current campaign)
      if (updates.campaign_name) {
        const { data: existingCampaign } = await supabase
          .from('linkedin_campaigns')
          .select('id')
          .eq('campaign_name', updates.campaign_name)
          .neq('id', id)
          .maybeSingle();

        if (existingCampaign) {
          throw new Error('A campaign with this name already exists. Please choose a different name.');
        }
      }

      // Build update object with only valid fields
      const updatePayload: Record<string, any> = {
        last_updated_by: user.id,
        updated_time: new Date().toISOString(),
      };

      // Copy over valid update fields
      if (updates.campaign_name !== undefined) updatePayload.campaign_name = updates.campaign_name;
      if (updates.industries !== undefined) updatePayload.industries = updates.industries;
      if (updates.locations !== undefined) updatePayload.locations = updates.locations;
      if (updates.companies !== undefined) updatePayload.companies = updates.companies;
      if (updates.keywords !== undefined) updatePayload.keywords = updates.keywords;
      if (updates.opener_message !== undefined) updatePayload.opener_message = updates.opener_message;
      if (updates.document_url !== undefined) updatePayload.document_url = updates.document_url;
      if (updates.status !== undefined) updatePayload.status = updates.status;
      if (updates.enable_followups !== undefined) updatePayload.enable_followups = updates.enable_followups;
      if (updates.followup_days !== undefined) updatePayload.followup_days = updates.followup_days;
      if (updates.followup_messages !== undefined) updatePayload.followup_messages = updates.followup_messages;

      const { data, error } = await supabase
        .from('linkedin_campaigns')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating campaign:', error);
        // Check for unique constraint violation
        if (error.code === '23505') {
          throw new Error('A campaign with this name already exists. Please choose a different name.');
        }
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Campaign updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['linkedin-campaigns'] });
    },
    onError: (error: Error) => {
      console.error('Error updating campaign:', error);
      toast.error(error.message || 'Failed to update campaign');
    },
  });

  // Delete campaign mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('linkedin_campaigns')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting campaign:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Campaign deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['linkedin-campaigns'] });
    },
    onError: (error: Error) => {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    },
  });

  return {
    campaigns,
    isLoading,
    createCampaign: createMutation.mutateAsync,
    updateCampaign: updateMutation.mutateAsync,
    deleteCampaign: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
