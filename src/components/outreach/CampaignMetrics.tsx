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
    <div className="grid grid-cols-2 gap-2 sm:gap-3">
      {metricCards.map((metric) => (
        <Card 
          key={metric.title} 
          className={cn(
            "bg-card/50 backdrop-blur-sm border min-w-0",
            metric.borderColor
          )}
        >
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex flex-col gap-1.5 sm:gap-3">
              <div className={cn("p-1.5 rounded-lg w-fit", metric.bg)}>
                <metric.icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", metric.color)} />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold tracking-tight">{metric.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{metric.title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
