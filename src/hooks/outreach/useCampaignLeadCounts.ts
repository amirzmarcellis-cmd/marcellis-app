import { useMemo } from 'react';
import { LinkedInLead } from './useLinkedInCampaignLeads';

export interface CampaignLeadCount {
  campaignName: string;
  count: number;
}

export function useCampaignLeadCounts(leads: LinkedInLead[]): CampaignLeadCount[] {
  return useMemo(() => {
    const counts = leads.reduce((acc, lead) => {
      const campaignName = lead.campaign_name || 'Unknown Campaign';
      acc[campaignName] = (acc[campaignName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([campaignName, count]) => ({ campaignName, count }))
      .sort((a, b) => b.count - a.count);
  }, [leads]);
}
