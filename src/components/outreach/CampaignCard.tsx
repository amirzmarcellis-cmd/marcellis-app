import { Campaign } from '@/hooks/outreach/useCampaigns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Play, Pause, Users, MapPin, Building2, MessageSquare, User } from 'lucide-react';
import { format } from 'date-fns';

interface CampaignCardProps {
  campaign: Campaign;
  leadCount?: number;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
  onToggleStatus: (campaign: Campaign) => void;
  onClick: (campaign: Campaign) => void;
}

export function CampaignCard({ campaign, leadCount = 0, onEdit, onDelete, onToggleStatus, onClick }: CampaignCardProps) {
  const statusColor = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  }[campaign.status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';

  return (
    <Card 
      className="group hover:border-primary/50 transition-all cursor-pointer bg-card/50 backdrop-blur-sm"
      onClick={() => onClick(campaign)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{campaign.campaign_name}</CardTitle>
            <p className="text-xs text-muted-foreground">
              Created {format(new Date(campaign.created_time), 'MMM d, yyyy')}
              {campaign.owner_name && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {campaign.owner_name}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={statusColor}>
              {campaign.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(campaign); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleStatus(campaign); }}>
                  {campaign.status === 'active' ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete(campaign); }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {campaign.keywords && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {campaign.keywords.split(',').slice(0, 2).join(', ')}
            </span>
          )}
          {campaign.locations && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {campaign.locations.split(',').slice(0, 2).join(', ')}
            </span>
          )}
          {campaign.industries && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {campaign.industries.split(',').slice(0, 2).join(', ')}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{leadCount}</span>
            <span className="text-muted-foreground">leads</span>
          </div>
          {campaign.enable_followups && (
            <Badge variant="secondary" className="text-xs">
              {campaign.followup_messages?.length || 0} follow-ups
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
