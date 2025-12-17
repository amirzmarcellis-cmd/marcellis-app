import { LinkedInLead } from '@/hooks/outreach/useLinkedInCampaignLeads';
import { useLinkedInLeadPipeline, PipelineStage } from '@/hooks/outreach/useLinkedInLeadPipeline';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';

interface LeadPipelineProps {
  leads: LinkedInLead[];
  onSelectLead: (lead: LinkedInLead) => void;
}

export function LeadPipeline({ leads, onSelectLead }: LeadPipelineProps) {
  const stages = useLinkedInLeadPipeline(leads);
  const activeStages = stages.filter(s => s.count > 0);
  const totalLeads = leads.length;

  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => (lead.status?.toLowerCase().trim() || 'new') === status);
  };

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Overview Bar */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Lead Journey</span>
            </div>
            <span className="text-sm text-muted-foreground">{totalLeads} leads total</span>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {/* Progress Bar */}
          {totalLeads > 0 ? (
            <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-muted/30">
              {activeStages.map((stage) => (
                <div
                  key={stage.status}
                  className={cn(stage.color, 'transition-all duration-300')}
                  style={{ width: `${Math.max(stage.percentage, 5)}%` }}
                  title={`${stage.label}: ${stage.count} (${stage.percentage}%)`}
                />
              ))}
            </div>
          ) : (
            <div className="h-3 rounded-full bg-muted/30" />
          )}
          
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
            {stages.filter(s => s.count > 0).map(stage => (
              <div key={stage.status} className="flex items-center gap-2 text-sm">
                <div className={cn('w-2.5 h-2.5 rounded-full', stage.color)} />
                <span className="text-muted-foreground">{stage.label}</span>
                <span className="font-semibold">{stage.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Kanban Columns - Stack vertically on mobile, grid on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
      {totalLeads === 0 && (
        <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
          <div className="text-center space-y-2">
            <Users className="h-10 w-10 mx-auto opacity-50" />
            <p>No leads in this campaign yet</p>
          </div>
        </div>
      )}
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
    <div className="w-full">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-full">
        {/* Column Header */}
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center gap-2">
            <div className={cn('w-1 h-5 rounded-full', stage.color)} />
            <span className="text-sm font-medium flex-1 text-left">{stage.label}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {stage.count}
            </span>
          </div>
        </CardHeader>
        
        {/* Lead Cards */}
        <CardContent className="p-2 pt-0">
          <ScrollArea className="h-[320px]">
            <div className="space-y-2 pr-2">
              {leads.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  No leads in this stage yet
                </p>
              ) : (
                leads.map(lead => (
                  <div
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="p-3 rounded-lg border border-border/50 bg-background/60 hover:bg-muted/50 hover:border-border cursor-pointer transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                          {getInitials(lead.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 space-y-1 text-left">
                        <p className="text-sm font-medium leading-tight truncate group-hover:text-primary transition-colors">
                          {lead.full_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
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
    </div>
  );
}
