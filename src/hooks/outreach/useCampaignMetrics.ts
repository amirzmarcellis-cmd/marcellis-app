import { useMemo } from 'react';
import { LinkedInLead } from './useLinkedInCampaignLeads';

export interface CampaignMetrics {
  totalLeads: number;
  replyRate: number;
}

const ENGAGED_STATUSES = [
  'active',
  'ready_to_schedule',
  'not_interested',
  'needs_follow_up',
  'qualifying',
  'providing_value',
];

export function useCampaignMetrics(leads: LinkedInLead[]): CampaignMetrics {
  return useMemo(() => {
    const totalLeads = leads.length;
    
    const engagedLeads = leads.filter(lead => {
      const status = lead.status?.toLowerCase() || '';
      return ENGAGED_STATUSES.includes(status);
    }).length;

    const replyRate = totalLeads > 0 ? (engagedLeads / totalLeads) * 100 : 0;

    return {
      totalLeads,
      replyRate: Math.round(replyRate * 10) / 10,
    };
  }, [leads]);
}
