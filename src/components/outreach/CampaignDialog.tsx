import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Campaign } from '@/hooks/outreach/useCampaigns';
import { Plus, X, Upload } from 'lucide-react';

interface FormData {
  campaign_name: string;
  keywords: string;
  locations: string;
  industries: string;
  companies: string;
  opener_message: string;
  document: File | null;
  enable_followups: boolean;
  followup_days: number;
  followup_messages: string[];
}

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: Campaign | null;
  onSave: (data: any) => void;
  isLoading?: boolean;
}

export function CampaignDialog({ open, onOpenChange, campaign, onSave, isLoading }: CampaignDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    campaign_name: '',
    keywords: '',
    locations: '',
    industries: '',
    companies: '',
    opener_message: '',
    document: null,
    enable_followups: false,
    followup_days: 3,
    followup_messages: [],
  });

  useEffect(() => {
    if (campaign) {
      setFormData({
        campaign_name: campaign.campaign_name || '',
        keywords: campaign.keywords || '',
        locations: campaign.locations || '',
        industries: campaign.industries || '',
        companies: campaign.companies || '',
        opener_message: campaign.opener_message || '',
        document: null,
        enable_followups: campaign.enable_followups || false,
        followup_days: campaign.followup_days || 3,
        followup_messages: campaign.followup_messages || [],
      });
    } else {
      setFormData({
        campaign_name: '',
        keywords: '',
        locations: '',
        industries: '',
        companies: '',
        opener_message: '',
        document: null,
        enable_followups: false,
        followup_days: 3,
        followup_messages: [],
      });
    }
  }, [campaign, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Transform string fields to the expected format
    const transformedData = {
      campaign_name: formData.campaign_name,
      keywords: formData.keywords,
      locations: formData.locations ? formData.locations.split(',').map(l => ({ id: l.trim(), label: l.trim() })) : [],
      industries: formData.industries ? formData.industries.split(',').map(i => ({ id: i.trim(), label: i.trim() })) : [],
      companies: formData.companies ? formData.companies.split(',').map(c => ({ id: c.trim(), label: c.trim() })) : [],
      opener_message: formData.opener_message,
      document: formData.document || undefined,
      enable_followups: formData.enable_followups,
      followup_days: [formData.followup_days],
      followup_messages: formData.followup_messages,
    };
    
    onSave(transformedData);
  };

  const addFollowupMessage = () => {
    setFormData(prev => ({
      ...prev,
      followup_messages: [...prev.followup_messages, ''],
    }));
  };

  const updateFollowupMessage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      followup_messages: prev.followup_messages.map((msg, i) => i === index ? value : msg),
    }));
  };

  const removeFollowupMessage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      followup_messages: prev.followup_messages.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, document: file }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{campaign ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaign_name">Campaign Name *</Label>
            <Input
              id="campaign_name"
              value={formData.campaign_name}
              onChange={(e) => setFormData(prev => ({ ...prev, campaign_name: e.target.value }))}
              placeholder="Enter campaign name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                placeholder="e.g., Sales Manager, VP Sales"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locations">Locations</Label>
              <Input
                id="locations"
                value={formData.locations}
                onChange={(e) => setFormData(prev => ({ ...prev, locations: e.target.value }))}
                placeholder="e.g., Dubai, Saudi Arabia"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industries">Industries</Label>
              <Input
                id="industries"
                value={formData.industries}
                onChange={(e) => setFormData(prev => ({ ...prev, industries: e.target.value }))}
                placeholder="e.g., Technology, Finance"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companies">Companies</Label>
              <Input
                id="companies"
                value={formData.companies}
                onChange={(e) => setFormData(prev => ({ ...prev, companies: e.target.value }))}
                placeholder="e.g., Google, Microsoft"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="opener_message">Opener Message *</Label>
            <Textarea
              id="opener_message"
              value={formData.opener_message}
              onChange={(e) => setFormData(prev => ({ ...prev, opener_message: e.target.value }))}
              placeholder="Hi {first_name}, I noticed your experience in..."
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              Use {'{first_name}'}, {'{last_name}'}, {'{company}'} as placeholders
            </p>
          </div>

          <div className="space-y-2">
            <Label>Document (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="document-upload"
              />
              <label 
                htmlFor="document-upload"
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-md cursor-pointer hover:bg-muted transition-colors"
              >
                <Upload className="h-4 w-4" />
                {formData.document ? formData.document.name : 'Choose file'}
              </label>
              {formData.document && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setFormData(prev => ({ ...prev, document: null }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Follow-ups</Label>
                <p className="text-xs text-muted-foreground">Automatically send follow-up messages</p>
              </div>
              <Switch
                checked={formData.enable_followups}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_followups: checked }))}
              />
            </div>

            {formData.enable_followups && (
              <>
                <div className="space-y-2">
                  <Label>Days between follow-ups: {formData.followup_days}</Label>
                  <Slider
                    value={[formData.followup_days]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, followup_days: value }))}
                    min={1}
                    max={14}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Follow-up Messages</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addFollowupMessage}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {formData.followup_messages.map((msg, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        value={msg}
                        onChange={(e) => updateFollowupMessage(index, e.target.value)}
                        placeholder={`Follow-up message ${index + 1}`}
                        rows={2}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFollowupMessage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : campaign ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
