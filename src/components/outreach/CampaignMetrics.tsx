import { useCampaignMetrics } from '@/hooks/outreach/useCampaignMetrics';
import { LinkedInLead } from '@/hooks/outreach/useLinkedInCampaignLeads';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignMetricsProps {
  leads: LinkedInLead[];
}

export function CampaignMetricsDisplay({ leads }: CampaignMetricsProps) {
  const metrics = useCampaignMetrics(leads);

  const metricCards = [
    {
      title: 'Total Leads',
      value: metrics.totalLeads,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Reply Rate',
      value: `${metrics.replyRate}%`,
      icon: TrendingUp,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-2">
      {metricCards.map((metric) => (
        <div
          key={metric.title}
          className={cn(
            "flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg border transition-all",
            "bg-card/50 backdrop-blur-sm border-border/50 hover:border-border"
          )}
        >
          <div className={cn("p-1 sm:p-1.5 rounded-md shrink-0", metric.bg)}>
            <metric.icon className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", metric.color)} />
          </div>
          <div className="min-w-0">
            <p className="text-base sm:text-lg font-bold leading-none">{metric.value}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate mt-0.5">{metric.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
