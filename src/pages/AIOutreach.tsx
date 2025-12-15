import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { CampaignList, LeadTable, LeadPipeline, LeadDetailPanel, CampaignMetricsDisplay } from '@/components/outreach';
import { Campaign } from '@/hooks/outreach/useCampaigns';
import { useLinkedInCampaignLeads, LinkedInLead } from '@/hooks/outreach/useLinkedInCampaignLeads';
import { useUpdateLinkedInCampaignLead } from '@/hooks/outreach/useUpdateLinkedInCampaignLead';
import { useDeleteLinkedInCampaignLead } from '@/hooks/outreach/useDeleteLinkedInCampaignLead';
import { useLinkedInConnection } from '@/hooks/outreach/useLinkedInConnection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, LayoutGrid, Table, Kanban, Linkedin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AIOutreach() {
  const navigate = useNavigate();
  const { isConnected, isLoading: connectionLoading } = useLinkedInConnection();
  
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedLead, setSelectedLead] = useState<LinkedInLead | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table');
  const [deletingLead, setDeletingLead] = useState<LinkedInLead | null>(null);

  // Get all leads and filter by campaign if one is selected (case-insensitive)
  const { leads: allLeads, isLoading: leadsLoading } = useLinkedInCampaignLeads();
  const leads = selectedCampaign 
    ? allLeads.filter(lead => 
        lead.campaign_name?.toLowerCase().trim() === selectedCampaign.campaign_name?.toLowerCase().trim()
      )
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

  // Loading state while checking connection
  if (connectionLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="flex justify-center items-center min-h-[400px]">
            <Skeleton className="h-64 w-full max-w-md rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show connection prompt if not connected
  if (!isConnected) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">AI Outreach</h1>
            <p className="text-sm text-muted-foreground">
              Manage your LinkedIn outreach campaigns
            </p>
          </div>
          
          <div className="flex justify-center items-center min-h-[400px]">
            <Card className="w-full max-w-md bg-card/50 backdrop-blur border-border/50">
              <CardContent className="flex flex-col items-center text-center p-8 space-y-6">
                <div className="w-16 h-16 rounded-full bg-[#0A66C2]/10 flex items-center justify-center">
                  <Linkedin className="h-8 w-8 text-[#0A66C2]" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Connect Your LinkedIn Account</h2>
                  <p className="text-muted-foreground text-sm">
                    To use AI Outreach, you need to connect your LinkedIn account. This allows you to search for candidates, send messages, and manage your outreach campaigns.
                  </p>
                </div>
                
                <Button 
                  onClick={() => navigate('/settings')}
                  className="bg-[#0A66C2] hover:bg-[#004182] text-white"
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  Connect LinkedIn Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
            <div>
              {/* Lead List/Pipeline */}
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

            {/* Lead Detail Panel - Full Screen Overlay */}
            {selectedLead && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
                  onClick={handleCloseLead}
                />
                {/* Panel */}
                <div className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 animate-slide-in-right">
                  <LeadDetailPanel
                    lead={selectedLead}
                    onClose={handleCloseLead}
                    onUpdateLead={handleUpdateLead}
                    isUpdating={isUpdating}
                  />
                </div>
              </>
            )}
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
