import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { CampaignList, LeadTable, LeadPipeline, LeadDetailPanel, CampaignMetricsDisplay } from '@/components/outreach';
import { Campaign } from '@/hooks/outreach/useCampaigns';
import { useLinkedInCampaignLeads, LinkedInLead } from '@/hooks/outreach/useLinkedInCampaignLeads';
import { useUpdateLinkedInCampaignLead } from '@/hooks/outreach/useUpdateLinkedInCampaignLead';
import { useDeleteLinkedInCampaignLead } from '@/hooks/outreach/useDeleteLinkedInCampaignLead';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, LayoutGrid, Table, Kanban } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AIOutreach() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedLead, setSelectedLead] = useState<LinkedInLead | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table');
  const [deletingLead, setDeletingLead] = useState<LinkedInLead | null>(null);

  // Get all leads and filter by campaign if one is selected
  const { leads: allLeads, isLoading: leadsLoading } = useLinkedInCampaignLeads();
  const leads = selectedCampaign 
    ? allLeads.filter(lead => lead.campaign_name === selectedCampaign.campaign_name)
    : allLeads;
  const { updateLead, isUpdating } = useUpdateLinkedInCampaignLead();
  const { deleteLead, isDeleting } = useDeleteLinkedInCampaignLead();

  const handleSelectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setSelectedLead(null);
  };

  const handleBackToCampaigns = () => {
    setSelectedCampaign(null);
    setSelectedLead(null);
  };

  const handleSelectLead = (lead: LinkedInLead) => {
    setSelectedLead(lead);
  };

  const handleCloseLead = () => {
    setSelectedLead(null);
  };

  const handleUpdateLead = async (leadId: string, data: Partial<LinkedInLead>) => {
    try {
      await updateLead({ id: leadId, updates: data });
      toast({ title: 'Lead updated successfully' });
    } catch (error) {
      toast({ title: 'Error updating lead', variant: 'destructive' });
    }
  };

  const handleUpdateStatus = async (leadId: string, status: string) => {
    await handleUpdateLead(leadId, { status });
  };

  const handleDeleteLead = async () => {
    if (!deletingLead) return;
    try {
      await deleteLead(deletingLead.id);
      toast({ title: 'Lead deleted successfully' });
      setDeletingLead(null);
      if (selectedLead?.id === deletingLead.id) {
        setSelectedLead(null);
      }
    } catch (error) {
      toast({ title: 'Error deleting lead', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {selectedCampaign && (
              <Button variant="ghost" size="icon" onClick={handleBackToCampaigns}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {selectedCampaign ? selectedCampaign.campaign_name : 'AI Outreach'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedCampaign 
                  ? `Manage leads for ${selectedCampaign.campaign_name}`
                  : 'Manage your LinkedIn outreach campaigns'
                }
              </p>
            </div>
          </div>
          
          {selectedCampaign && (
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <Table className="h-4 w-4 mr-1" />
                Table
              </Button>
              <Button
                variant={viewMode === 'pipeline' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('pipeline')}
              >
                <Kanban className="h-4 w-4 mr-1" />
                Pipeline
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        {!selectedCampaign ? (
          <CampaignList onSelectCampaign={handleSelectCampaign} />
        ) : (
          <div className="space-y-4">
            {/* Metrics */}
            <CampaignMetricsDisplay leads={leads} />

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Lead List/Pipeline */}
              <div className={selectedLead ? 'lg:col-span-2' : 'lg:col-span-3'}>
                {viewMode === 'table' ? (
                  <LeadTable
                    leads={leads}
                    isLoading={leadsLoading}
                    onSelectLead={handleSelectLead}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={setDeletingLead}
                  />
                ) : (
                  <LeadPipeline
                    leads={leads}
                    onSelectLead={handleSelectLead}
                  />
                )}
              </div>

              {/* Lead Detail Panel */}
              {selectedLead && (
                <div className="lg:col-span-1 h-[600px]">
                  <LeadDetailPanel
                    lead={selectedLead}
                    onClose={handleCloseLead}
                    onUpdateLead={handleUpdateLead}
                    isUpdating={isUpdating}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Lead Confirmation */}
        <AlertDialog open={!!deletingLead} onOpenChange={() => setDeletingLead(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Lead</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingLead?.full_name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteLead} disabled={isDeleting} className="bg-destructive text-destructive-foreground">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
