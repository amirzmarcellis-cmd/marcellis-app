import { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FormSection } from '@/components/ui/form-section';
import { DragDropUpload } from '@/components/ui/drag-drop-upload';
import { VariableHint } from '@/components/ui/variable-hint';
import { Campaign } from '@/hooks/outreach/useCampaigns';
import { 
  Plus, X, Megaphone, Target, MessageSquare, 
  ChevronDown, MapPin, Building2, Building, Search,
  Loader2, Clock, PenLine, Send
} from 'lucide-react';
import { LinkedInSearchSelect, SearchSelectItem } from './LinkedInSearchSelect';
import { cn } from '@/lib/utils';

interface FormData {
  campaign_name: string;
  keywords: string;
  locations: SearchSelectItem[];
  industries: SearchSelectItem[];
  companies: SearchSelectItem[];
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

// Helper to parse comma-separated string to SearchSelectItem array
const parseToItems = (str: string | null | undefined): SearchSelectItem[] => {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean).map(label => ({
    id: label,
    label
  }));
};

export function CampaignDialog({ open, onOpenChange, campaign, onSave, isLoading }: CampaignDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    campaign_name: '',
    keywords: '',
    locations: [],
    industries: [],
    companies: [],
    opener_message: '',
    document: null,
    enable_followups: false,
    followup_days: 3,
    followup_messages: [],
  });

  const [followupsOpen, setFollowupsOpen] = useState(false);
  const openerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (campaign) {
      setFormData({
        campaign_name: campaign.campaign_name || '',
        keywords: campaign.keywords || '',
        locations: parseToItems(campaign.locations),
        industries: parseToItems(campaign.industries),
        companies: parseToItems(campaign.companies),
        opener_message: campaign.opener_message || '',
        document: null,
        enable_followups: campaign.enable_followups || false,
        followup_days: campaign.followup_days || 3,
        followup_messages: campaign.followup_messages || [],
      });
      setFollowupsOpen(campaign.enable_followups || false);
    } else {
      setFormData({
        campaign_name: '',
        keywords: '',
        locations: [],
        industries: [],
        companies: [],
        opener_message: '',
        document: null,
        enable_followups: false,
        followup_days: 3,
        followup_messages: [],
      });
      setFollowupsOpen(false);
    }
  }, [campaign, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transformedData = {
      campaign_name: formData.campaign_name,
      keywords: formData.keywords,
      locations: formData.locations,
      industries: formData.industries,
      companies: formData.companies,
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

  const insertVariable = (variable: string) => {
    if (openerRef.current) {
      const textarea = openerRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = 
        formData.opener_message.substring(0, start) + 
        variable + 
        formData.opener_message.substring(end);
      setFormData(prev => ({ ...prev, opener_message: newValue }));
      // Focus and set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col p-0 gap-0 bg-background border-l border-border/50">
        {/* Sticky Header */}
        <SheetHeader className="flex-shrink-0 px-6 py-4 border-b border-border/50 bg-card/30">
          <SheetTitle className="flex items-center gap-3 text-xl font-light">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Megaphone className="h-5 w-5" />
            </div>
            <span>{campaign ? 'Edit Campaign' : 'Create Campaign'}</span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            {campaign ? 'Edit your LinkedIn outreach campaign settings' : 'Create a new LinkedIn outreach campaign'}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <form id="campaign-form" onSubmit={handleSubmit} className="space-y-6 p-6">
            
            {/* Section 1: Campaign Details */}
            <FormSection icon={PenLine} title="Campaign Details">
              {/* Hero Input for Campaign Name */}
              <div className="space-y-2">
                <Label htmlFor="campaign_name" className="text-sm font-medium text-foreground/80">
                  Campaign Name *
                </Label>
                <Input
                  id="campaign_name"
                  value={formData.campaign_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaign_name: e.target.value }))}
                  placeholder="Give your campaign a memorable name"
                  required
                  className={cn(
                    "h-12 text-lg font-light bg-background/50 border-border/50",
                    "focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                    "placeholder:text-muted-foreground/50"
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords" className="text-sm font-medium text-foreground/80">
                  Keywords
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                    placeholder="e.g., Sales Manager, VP Sales, Business Development"
                    className="pl-10 h-11 bg-background/50 border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                  />
                </div>
              </div>
            </FormSection>

            {/* Section 2: Targeting Criteria */}
            <FormSection icon={Target} title="Targeting Criteria" description="Define your ideal audience">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LinkedInSearchSelect
                  type="LOCATION"
                  value={formData.locations}
                  onChange={(locations) => setFormData(prev => ({ ...prev, locations }))}
                  placeholder="Search locations..."
                  icon={MapPin}
                  label="Locations"
                />
                <LinkedInSearchSelect
                  type="INDUSTRY"
                  value={formData.industries}
                  onChange={(industries) => setFormData(prev => ({ ...prev, industries }))}
                  placeholder="Search industries..."
                  icon={Building2}
                  label="Industries"
                />
              </div>
              <LinkedInSearchSelect
                type="COMPANY"
                value={formData.companies}
                onChange={(companies) => setFormData(prev => ({ ...prev, companies }))}
                placeholder="Search companies..."
                icon={Building}
                label="Companies"
              />
            </FormSection>

            {/* Section 3: Messaging */}
            <FormSection icon={MessageSquare} title="Messaging" description="Craft your outreach message">
              <div className="space-y-3">
                <Label htmlFor="opener_message" className="text-sm font-medium text-foreground/80">
                  Opener Message *
                </Label>
                <Textarea
                  ref={openerRef}
                  id="opener_message"
                  value={formData.opener_message}
                  onChange={(e) => setFormData(prev => ({ ...prev, opener_message: e.target.value }))}
                  placeholder="Hi {first_name}, I noticed your experience at {company}..."
                  rows={5}
                  required
                  className={cn(
                    "bg-background/50 border-border/50 resize-none",
                    "focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                    "placeholder:text-muted-foreground/50"
                  )}
                />
                <VariableHint 
                  variables={['first_name', 'last_name', 'company']}
                  onInsert={insertVariable}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/80">
                  Attachment (Optional)
                </Label>
                <DragDropUpload
                  accept=".pdf,.doc,.docx"
                  value={formData.document}
                  onChange={(file) => setFormData(prev => ({ ...prev, document: file }))}
                />
              </div>

              {/* Follow-ups Collapsible */}
              <Collapsible 
                open={followupsOpen} 
                onOpenChange={(open) => {
                  setFollowupsOpen(open);
                  setFormData(prev => ({ ...prev, enable_followups: open }));
                }}
                className="rounded-lg border border-border/50 bg-background/30"
              >
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between p-4 text-left transition-colors",
                      "hover:bg-primary/5 rounded-lg"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Follow-up Messages</p>
                        <p className="text-xs text-muted-foreground">Automatically send follow-ups</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={followupsOpen}
                        onCheckedChange={(checked) => {
                          setFollowupsOpen(checked);
                          setFormData(prev => ({ ...prev, enable_followups: checked }));
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <ChevronDown className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        followupsOpen && "rotate-180"
                      )} />
                    </div>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 space-y-4">
                  <div className="h-px bg-border/50" />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-foreground/80">
                        Days between follow-ups
                      </Label>
                      <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {formData.followup_days} days
                      </span>
                    </div>
                    <Slider
                      value={[formData.followup_days]}
                      onValueChange={([value]) => setFormData(prev => ({ ...prev, followup_days: value }))}
                      min={1}
                      max={14}
                      step={1}
                      className="py-2"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-foreground/80">
                        Messages ({formData.followup_messages.length}/5)
                      </Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addFollowupMessage}
                        disabled={formData.followup_messages.length >= 5}
                        className="h-8 gap-1.5 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Message
                      </Button>
                    </div>
                    
                    {formData.followup_messages.length === 0 && (
                      <div className="text-center py-6 border border-dashed border-border/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">No follow-up messages yet</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">Click "Add Message" to create one</p>
                      </div>
                    )}
                    
                    {formData.followup_messages.map((msg, index) => (
                      <div key={index} className="flex gap-2 animate-fade-in">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary mt-2">
                          {index + 1}
                        </div>
                        <Textarea
                          value={msg}
                          onChange={(e) => updateFollowupMessage(index, e.target.value)}
                          placeholder={`Follow-up message ${index + 1}`}
                          rows={2}
                          className="flex-1 bg-background/50 border-border/50 resize-none focus:ring-2 focus:ring-primary/20"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFollowupMessage(index)}
                          className="h-8 w-8 shrink-0 mt-1 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </FormSection>
          </form>
        </div>

        {/* Sticky Footer */}
        <SheetFooter className="flex-shrink-0 px-6 py-4 border-t border-border/50 bg-card/30">
          <div className="flex w-full items-center justify-end gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="campaign-form"
                disabled={isLoading}
                className="px-6 gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {campaign ? 'Update Campaign' : 'Create Campaign'}
                  </>
                )}
              </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
