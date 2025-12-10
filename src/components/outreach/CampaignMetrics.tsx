import { useCampaignMetrics, CampaignMetrics as Metrics } from '@/hooks/outreach/useCampaignMetrics';
import { LinkedInLead } from '@/hooks/outreach/useLinkedInCampaignLeads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, UserCheck, Trophy, XCircle, TrendingUp, Percent } from 'lucide-react';

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
    },
    {
      title: 'New',
      value: metrics.newLeads,
      icon: Users,
      color: 'text-slate-400',
      bg: 'bg-slate-500/10',
    },
    {
      title: 'Conversations',
      value: metrics.conversationsInitiated,
      icon: MessageSquare,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Qualified',
      value: metrics.qualified,
      icon: UserCheck,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Won',
      value: metrics.won,
      icon: Trophy,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Lost',
      value: metrics.lost,
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      title: 'Reply Rate',
      value: `${metrics.replyRate}%`,
      icon: TrendingUp,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      title: 'Conversion',
      value: `${metrics.conversionRate}%`,
      icon: Percent,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {metricCards.map((metric) => (
        <Card key={metric.title} className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${metric.bg}`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold">{metric.value}</p>
                <p className="text-[10px] text-muted-foreground">{metric.title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
