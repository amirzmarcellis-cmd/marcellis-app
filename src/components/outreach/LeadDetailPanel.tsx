import { useState } from 'react';
import { LinkedInLead } from '@/hooks/outreach/useLinkedInCampaignLeads';
import { ChatPanel } from './ChatPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { X, Building2, Mail, Phone, Linkedin, Save, MessageSquare, User, FileText, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface LeadDetailPanelProps {
  lead: LinkedInLead | null;
  onClose: () => void;
  onUpdateLead: (leadId: string, data: Partial<LinkedInLead>) => void;
  isUpdating?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'conversation initiated', label: 'Conversation Initiated' },
  { value: 'manual takeover', label: 'Manual Takeover' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

export function LeadDetailPanel({ lead, onClose, onUpdateLead, isUpdating }: LeadDetailPanelProps) {
  const [notes, setNotes] = useState(lead?.notes || '');
  const [status, setStatus] = useState(lead?.status || 'new');
  const [hasChanges, setHasChanges] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setHasChanges(true);
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!lead) return;
    onUpdateLead(lead.id, { status, notes });
    setHasChanges(false);
  };

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!lead) {
    return (
      <Card className="h-full flex items-center justify-center bg-card/50 backdrop-blur-sm">
        <p className="text-muted-foreground">Select a lead to view details</p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-card backdrop-blur-sm overflow-hidden border-l border-border shadow-2xl">
      <CardHeader className="pb-2 border-b border-border shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {getInitials(lead.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{lead.full_name || 'Unknown'}</CardTitle>
              <p className="text-sm text-muted-foreground">{lead.company_name || 'No company'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {lead.linkedin_id && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => window.open(`https://linkedin.com/in/${lead.linkedin_id}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <Tabs defaultValue="details" className="h-full flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4">
            <TabsTrigger value="details" className="gap-2">
              <User className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 overflow-auto p-4 mt-0">
            <div className="space-y-4">
              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Contact Information</h4>
                
                {lead.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
                  </div>
                )}
                
                {lead.phone_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${lead.phone_number}`} className="hover:underline">{lead.phone_number}</a>
                  </div>
                )}
                
                {lead.company_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.company_name}</span>
                    {lead.company_size && (
                      <Badge variant="secondary" className="text-xs">{lead.company_size}</Badge>
                    )}
                  </div>
                )}
                
                {lead.linkedin_id && (
                  <div className="flex items-center gap-2 text-sm">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`https://linkedin.com/in/${lead.linkedin_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-primary"
                    >
                      View Profile
                    </a>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Details</h4>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Source:</span>
                    <Badge variant="outline" className="ml-2">{lead.source || 'LinkedIn'}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline" className="ml-2">{lead.lead_type || 'Lead'}</Badge>
                  </div>
                  {lead.service && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Service:</span>
                      <span className="ml-2">{lead.service}</span>
                    </div>
                  )}
                  {lead.action_date && !isNaN(new Date(lead.action_date).getTime()) && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Added:</span>
                      <span className="ml-2">{format(new Date(lead.action_date), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </div>

              {hasChanges && (
                <Button onClick={handleSave} disabled={isUpdating} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="flex-1 overflow-hidden mt-0">
            <div className="h-full">
              <ChatPanel lead={lead} />
            </div>
          </TabsContent>

          <TabsContent value="notes" className="flex-1 overflow-auto p-4 mt-0">
            <div className="space-y-4 h-full flex flex-col">
              <Textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Add notes about this lead..."
                className="flex-1 min-h-[200px] resize-none"
              />
              {hasChanges && (
                <Button onClick={handleSave} disabled={isUpdating}>
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Saving...' : 'Save Notes'}
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
