import { useState } from 'react';
import { Campaign, useCampaigns } from '@/hooks/outreach/useCampaigns';
import { useLinkedInCampaignLeads } from '@/hooks/outreach/useLinkedInCampaignLeads';
import { CampaignCard } from './CampaignCard';
import { CampaignDialog } from './CampaignDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface CampaignListProps {
  onSelectCampaign: (campaign: Campaign) => void;
}

export function CampaignList({ onSelectCampaign }: CampaignListProps) {
  const { campaigns, isLoading, createCampaign, updateCampaign, deleteCampaign, isCreating, isUpdating, isDeleting } = useCampaigns();
  const { leads } = useLinkedInCampaignLeads();
  
  // Calculate lead counts per campaign (case-insensitive)
  const leadCounts = leads.reduce((acc, lead) => {
    const campaignName = (lead.campaign_name || '').toLowerCase().trim();
    acc[campaignName] = (acc[campaignName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Helper to get lead count with case-insensitive matching
  const getLeadCount = (campaignName: string | null) => {
    const key = (campaignName || '').toLowerCase().trim();
    return leadCounts[key] || 0;
  };
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.campaign_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = () => {
    setEditingCampaign(null);
    setDialogOpen(true);
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setDialogOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (editingCampaign) {
        await updateCampaign({ id: editingCampaign.id, updates: data });
        toast({ title: 'Campaign updated successfully' });
      } else {
        await createCampaign(data);
        toast({ title: 'Campaign created successfully' });
      }
      setDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error saving campaign', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deletingCampaign) return;
    try {
      await deleteCampaign(deletingCampaign.id);
      toast({ title: 'Campaign deleted successfully' });
      setDeletingCampaign(null);
    } catch (error) {
      toast({ title: 'Error deleting campaign', variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    try {
      await updateCampaign({ id: campaign.id, updates: { status: newStatus } });
      toast({ title: `Campaign ${newStatus === 'active' ? 'activated' : 'paused'}` });
    } catch (error) {
      toast({ title: 'Error updating campaign status', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No campaigns found</p>
          <Button variant="link" onClick={handleCreate}>
            Create your first campaign
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              leadCount={getLeadCount(campaign.campaign_name)}
              onEdit={handleEdit}
              onDelete={setDeletingCampaign}
              onToggleStatus={handleToggleStatus}
              onClick={onSelectCampaign}
            />
          ))}
        </div>
      )}

      <CampaignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        campaign={editingCampaign}
        onSave={handleSave}
        isLoading={isCreating || isUpdating}
      />

      <AlertDialog open={!!deletingCampaign} onOpenChange={() => setDeletingCampaign(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCampaign?.campaign_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
