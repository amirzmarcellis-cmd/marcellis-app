import { LinkedInLead } from '@/hooks/outreach/useLinkedInCampaignLeads';
import { useLinkedInLeadPipeline } from '@/hooks/outreach/useLinkedInLeadPipeline';
import { cn } from '@/lib/utils';
import { ThumbsUp, Link, MessageCircle, XCircle, CalendarCheck } from 'lucide-react';

interface PipelineStatusSummaryProps {
  leads: LinkedInLead[];
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  'post liked': ThumbsUp,
  'connection requested': Link,
  'conversation initiated': MessageCircle,
  'not interested': XCircle,
  'ready to schedule': CalendarCheck,
};

export function PipelineStatusSummary({ leads }: PipelineStatusSummaryProps) {
  const stages = useLinkedInLeadPipeline(leads);
  
  // Only show the 5 defined statuses
  const definedStatuses = ['post liked', 'connection requested', 'conversation initiated', 'not interested', 'ready to schedule'];
  const filteredStages = stages.filter(stage => definedStatuses.includes(stage.status));

  // Hide on mobile - the pipeline view already shows counts
  return (
    <div className="hidden sm:flex flex-wrap gap-2 sm:gap-3">
      {filteredStages.map((stage) => {
        const Icon = STATUS_ICONS[stage.status] || MessageCircle;
        return (
          <div
            key={stage.status}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
              "bg-card/50 backdrop-blur-sm border-border/50 hover:border-border",
              "min-w-[140px]"
            )}
          >
            <div className={cn("p-1.5 rounded-md", stage.color.replace('bg-', 'bg-').replace('500', '500/20'))}>
              <Icon className={cn("h-3.5 w-3.5", stage.color.replace('bg-', 'text-'))} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold leading-none">{stage.count}</p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">{stage.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
