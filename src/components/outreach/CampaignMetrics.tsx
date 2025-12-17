import { useCampaignMetrics } from '@/hooks/outreach/useCampaignMetrics';
import { LinkedInLead } from '@/hooks/outreach/useLinkedInCampaignLeads';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageSquare, UserCheck, Trophy, XCircle, TrendingUp, Target } from 'lucide-react';
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
      title: 'In Conversation',
      value: metrics.conversationsInitiated,
      icon: MessageSquare,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'Qualified',
      value: metrics.qualified,
      icon: UserCheck,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'Won',
      value: metrics.won,
      icon: Trophy,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Lost',
      value: metrics.lost,
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
    },
    {
      title: 'Reply Rate',
      value: `${metrics.replyRate}%`,
      icon: TrendingUp,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
    },
    {
      title: 'Conversion',
      value: `${metrics.conversionRate}%`,
      icon: Target,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
      {metricCards.map((metric) => (
        <Card 
          key={metric.title} 
          className={cn(
            "bg-card/50 backdrop-blur-sm border",
            metric.borderColor
          )}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:gap-3">
              <div className={cn("p-1.5 sm:p-2 rounded-lg w-fit", metric.bg)}>
                <metric.icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", metric.color)} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold tracking-tight">{metric.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{metric.title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
