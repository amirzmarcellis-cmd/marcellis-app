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
  'post liked': { label: 'Post Liked', color: 'bg-sky-500', order: 1 },
  'connection requested': { label: 'Connection Requested', color: 'bg-cyan-500', order: 2 },
  'conversation initiated': { label: 'Conversation Initiated', color: 'bg-blue-500', order: 3 },
  'not interested': { label: 'Not Interested', color: 'bg-red-500', order: 4 },
  'ready to schedule': { label: 'Ready to Schedule', color: 'bg-emerald-500', order: 5 },
};

// Get config for a status, with fallback for unknown statuses
const getStatusConfig = (status: string): { label: string; color: string; order: number } => {
  const normalized = status.toLowerCase().trim();
  if (STATUS_CONFIG[normalized]) {
    return STATUS_CONFIG[normalized];
  }
  // Return a fallback for unknown statuses
  return { label: status, color: 'bg-gray-500', order: 100 };
};

export function useLinkedInLeadPipeline(leads: LinkedInLead[]): PipelineStage[] {
  return useMemo(() => {
    const totalLeads = leads.length;
    
    // Build status counts including any unknown statuses
    const statusCounts = leads.reduce((acc, lead) => {
      const status = lead.status?.toLowerCase().trim() || 'new';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Collect all unique statuses (known + unknown)
    const allStatuses = new Set([...Object.keys(STATUS_CONFIG), ...Object.keys(statusCounts)]);
    
    // Build stages for all statuses
    const stages = Array.from(allStatuses).map(status => {
      const config = getStatusConfig(status);
      const count = statusCounts[status] || 0;
      return {
        status,
        label: config.label,
        count,
        percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0,
        color: config.color,
      };
    });

    // Sort by order (known statuses first, then unknown at the end)
    return stages.sort((a, b) => {
      const orderA = getStatusConfig(a.status).order;
      const orderB = getStatusConfig(b.status).order;
      return orderA - orderB;
    });
  }, [leads]);
}
