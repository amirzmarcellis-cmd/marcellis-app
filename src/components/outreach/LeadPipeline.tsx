import { LinkedInLead } from '@/hooks/outreach/useLinkedInCampaignLeads';
import { useLinkedInLeadPipeline, PipelineStage } from '@/hooks/outreach/useLinkedInLeadPipeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface LeadPipelineProps {
  leads: LinkedInLead[];
  onSelectLead: (lead: LinkedInLead) => void;
}

export function LeadPipeline({ leads, onSelectLead }: LeadPipelineProps) {
  const stages = useLinkedInLeadPipeline(leads);

  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => (lead.status?.toLowerCase() || 'new') === status);
  };

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-4">
      {/* Pipeline Overview */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pipeline Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
            {stages.map((stage, index) => (
              <div
                key={stage.status}
                className={cn(
                  stage.color,
                  'flex items-center justify-center text-xs font-medium transition-all',
                  stage.percentage > 0 ? 'min-w-[40px]' : 'w-0'
                )}
                style={{ width: `${Math.max(stage.percentage, stage.count > 0 ? 10 : 0)}%` }}
                title={`${stage.label}: ${stage.count} (${stage.percentage}%)`}
              >
                {stage.percentage >= 15 && stage.count}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            {stages.map(stage => (
              <div key={stage.status} className="flex items-center gap-2 text-sm">
                <div className={cn('w-3 h-3 rounded-full', stage.color)} />
                <span className="text-muted-foreground">{stage.label}:</span>
                <span className="font-medium">{stage.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Kanban View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stages.map(stage => (
          <PipelineColumn
            key={stage.status}
            stage={stage}
            leads={getLeadsByStatus(stage.status)}
            onSelectLead={onSelectLead}
            getInitials={getInitials}
          />
        ))}
      </div>
    </div>
  );
}

interface PipelineColumnProps {
  stage: PipelineStage;
  leads: LinkedInLead[];
  onSelectLead: (lead: LinkedInLead) => void;
  getInitials: (name: string | null) => string;
}

function PipelineColumn({ stage, leads, onSelectLead, getInitials }: PipelineColumnProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm min-h-[300px]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded-full', stage.color)} />
            <CardTitle className="text-sm font-medium">{stage.label}</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {stage.count}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-[250px]">
          <div className="space-y-2">
            {leads.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No leads</p>
            ) : (
              leads.map(lead => (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="p-2 rounded-lg border border-border bg-background/50 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                        {getInitials(lead.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lead.full_name || 'Unknown'}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {lead.company_name || 'No company'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
