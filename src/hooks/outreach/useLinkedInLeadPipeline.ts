import { useMemo } from 'react';
import { LinkedInLead } from './useLinkedInCampaignLeads';

export interface PipelineStage {
  status: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; order: number }> = {
  'new': { label: 'New', color: 'bg-slate-500', order: 1 },
  'conversation initiated': { label: 'Conversation Initiated', color: 'bg-blue-500', order: 2 },
  'manual takeover': { label: 'Manual Takeover', color: 'bg-purple-500', order: 3 },
  'qualified': { label: 'Qualified', color: 'bg-amber-500', order: 4 },
  'won': { label: 'Won', color: 'bg-emerald-500', order: 5 },
  'lost': { label: 'Lost', color: 'bg-red-500', order: 6 },
};

export function useLinkedInLeadPipeline(leads: LinkedInLead[]): PipelineStage[] {
  return useMemo(() => {
    const totalLeads = leads.length;
    
    if (totalLeads === 0) {
      return Object.entries(STATUS_CONFIG)
        .sort((a, b) => a[1].order - b[1].order)
        .map(([status, config]) => ({
          status,
          label: config.label,
          count: 0,
          percentage: 0,
          color: config.color,
        }));
    }

    const statusCounts = leads.reduce((acc, lead) => {
      const status = lead.status?.toLowerCase() || 'new';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(STATUS_CONFIG)
      .sort((a, b) => a[1].order - b[1].order)
      .map(([status, config]) => {
        const count = statusCounts[status] || 0;
        return {
          status,
          label: config.label,
          count,
          percentage: Math.round((count / totalLeads) * 100),
          color: config.color,
        };
      });
  }, [leads]);
}
