import { useMemo } from 'react';
import { LinkedInLead } from './useLinkedInCampaignLeads';

export interface CampaignMetrics {
  totalLeads: number;
  newLeads: number;
  conversationsInitiated: number;
  manualTakeovers: number;
  qualified: number;
  won: number;
  lost: number;
  replyRate: number;
  conversionRate: number;
}

export function useCampaignMetrics(leads: LinkedInLead[]): CampaignMetrics {
  return useMemo(() => {
    const totalLeads = leads.length;
    
    const statusCounts = leads.reduce((acc, lead) => {
      const status = lead.status?.toLowerCase() || 'new';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const newLeads = statusCounts['new'] || 0;
    const conversationsInitiated = statusCounts['conversation initiated'] || 0;
    const manualTakeovers = statusCounts['manual takeover'] || 0;
    const qualified = statusCounts['qualified'] || 0;
    const won = statusCounts['won'] || 0;
    const lost = statusCounts['lost'] || 0;

    // Reply rate = leads with any status beyond 'new' / total leads
    const engagedLeads = totalLeads - newLeads;
    const replyRate = totalLeads > 0 ? (engagedLeads / totalLeads) * 100 : 0;

    // Conversion rate = won / total leads
    const conversionRate = totalLeads > 0 ? (won / totalLeads) * 100 : 0;

    return {
      totalLeads,
      newLeads,
      conversationsInitiated,
      manualTakeovers,
      qualified,
      won,
      lost,
      replyRate: Math.round(replyRate * 10) / 10,
      conversionRate: Math.round(conversionRate * 10) / 10,
    };
  }, [leads]);
}
