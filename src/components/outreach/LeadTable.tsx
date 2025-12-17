import { useState } from 'react';
import { LinkedInLead } from '@/hooks/outreach/useLinkedInCampaignLeads';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Filter, MoreVertical, MessageSquare, Trash2, ExternalLink, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface LeadTableProps {
  leads: LinkedInLead[];
  isLoading?: boolean;
  onSelectLead: (lead: LinkedInLead) => void;
  onUpdateStatus: (leadId: string, status: string) => void;
  onDelete: (lead: LinkedInLead) => void;
}

const STATUS_OPTIONS = [
  { value: 'post liked', label: 'Post Liked', color: 'bg-sky-500/20 text-sky-400' },
  { value: 'connection requested', label: 'Connection Requested', color: 'bg-cyan-500/20 text-cyan-400' },
  { value: 'conversation initiated', label: 'Conversation Initiated', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'not interested', label: 'Not Interested', color: 'bg-red-500/20 text-red-400' },
  { value: 'ready to schedule', label: 'Ready to Schedule', color: 'bg-emerald-500/20 text-emerald-400' },
];

export function LeadTable({ leads, isLoading, onSelectLead, onUpdateStatus, onDelete }: LeadTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string | null) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status?.toLowerCase());
    return (
      <Badge variant="outline" className={statusOption?.color || 'bg-slate-500/20 text-slate-400'}>
        {statusOption?.label || status || 'New'}
      </Badge>
    );
  };

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 max-w-xs" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-full">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No leads found
          </div>
        ) : (
          filteredLeads.map(lead => (
            <div
              key={lead.id}
              className="p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onSelectLead(lead)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getInitials(lead.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{lead.full_name || 'Unknown'}</p>
                    {lead.company_name && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3 shrink-0" />
                        <span className="truncate">{lead.company_name}</span>
                      </div>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectLead(lead); }}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Messages
                    </DropdownMenuItem>
                    {lead.linkedin_id && (
                      <DropdownMenuItem onClick={(e) => { 
                        e.stopPropagation(); 
                        window.open(`https://linkedin.com/in/${lead.linkedin_id}`, '_blank');
                      }}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View LinkedIn
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={(e) => { e.stopPropagation(); onDelete(lead); }}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                {getStatusBadge(lead.status)}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {lead.source || 'LinkedIn'}
                  </Badge>
                  {lead.chat_id && (
                    <MessageSquare className="h-4 w-4 text-primary" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block rounded-md border border-border overflow-hidden">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[40%]">Lead</TableHead>
              <TableHead className="w-[20%]">Status</TableHead>
              <TableHead className="w-[15%]">Source</TableHead>
              <TableHead className="w-[15%]">Conversations</TableHead>
              <TableHead className="w-[10%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No leads found
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map(lead => (
                <TableRow 
                  key={lead.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onSelectLead(lead)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(lead.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{lead.full_name || 'Unknown'}</p>
                        {lead.email && (
                          <p className="text-xs text-muted-foreground">{lead.email}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(lead.status)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {lead.source || 'LinkedIn'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {lead.chat_id ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLead(lead);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectLead(lead); }}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View Messages
                        </DropdownMenuItem>
                        {lead.linkedin_id && (
                          <DropdownMenuItem onClick={(e) => { 
                            e.stopPropagation(); 
                            window.open(`https://linkedin.com/in/${lead.linkedin_id}`, '_blank');
                          }}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View LinkedIn
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); onDelete(lead); }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
