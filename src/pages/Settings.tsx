import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, User, Bell, Shield, AlertTriangle, Lock } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { LinkedInConnection } from '@/components/settings/LinkedInConnection';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { Badge } from '@/components/ui/badge';

export default function Settings() {
  const { profile, updateProfile, refetch } = useProfile();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    slug: '',
    notifications: true,
    automaticDial: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        slug: profile.slug || 'me',
        notifications: true,
        automaticDial: false,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        name: formData.name,
        slug: formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      });

      toast({
        title: 'Settings updated',
        description: 'Your settings have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6 pb-20 sm:pb-24 max-w-full overflow-x-hidden">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light font-work tracking-tight break-words">Settings</h1>
      </div>

      {/* Profile Settings */}
      <Card className="max-w-full overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-light font-work tracking-tight">
            <User className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 min-w-0">
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="name" className="font-light text-sm">Display Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                className="h-11 sm:h-12 text-sm min-w-0 w-full"
              />
            </div>
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="email" className="font-light text-sm">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted h-11 sm:h-12 text-sm min-w-0 w-full"
              />
            </div>
          </div>
          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="slug" className="text-sm font-light">Company Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              placeholder="Enter company slug (e.g., 'me', 'acme')"
              pattern="[a-z0-9-]+"
              className="h-11 sm:h-12 text-sm min-w-0 w-full"
            />
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
              This slug will be used for job IDs. Example: if slug is "me", job IDs will be "me-j-0001"
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className="w-full sm:w-auto h-11 sm:h-10 text-sm min-h-[44px] sm:min-h-0"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>

      {/* LinkedIn Integration */}
      <LinkedInConnection
        linkedinId={profile?.linkedin_id || null}
        onUpdate={refetch}
      />

      {/* Notification Settings */}
      <Card className="max-w-full overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-light">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start sm:items-center justify-between gap-3 min-w-0">
            <div className="flex-1 min-w-0">
              <Label className="text-sm sm:text-base font-light">Email Notifications</Label>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 break-words">
                Receive email notifications for important updates
              </p>
            </div>
            <Switch
              checked={formData.notifications}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, notifications: checked })
              }
              className="flex-shrink-0"
            />
          </div>
        </CardContent>
      </Card>

      {/* System Settings (Admin Only) */}
      <AdminSystemSettings />
    </div>
  );
}

function AdminSystemSettings() {
  const { profile } = useProfile();
  const { 
    isJobCreationPaused, 
    isAutomaticDialPaused, 
    updateSetting, 
    loading 
  } = useAdminSettings();

  // Only show for admins
  if (!profile?.is_admin) {
    return null;
  }

  return (
    <Card className="max-w-full overflow-hidden border-amber-500/30">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-light">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          Admin Controls
          <Badge variant="outline" className="ml-2 text-xs border-amber-500/50 text-amber-500">
            Admin Only
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Pause Job Creation */}
        <div className="flex items-start sm:items-center justify-between gap-3 min-w-0 p-3 rounded-lg bg-muted/50">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <Label className="text-sm sm:text-base font-light">Pause Job Creation</Label>
              {isJobCreationPaused && (
                <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 break-words">
              When enabled, non-admin users cannot create new jobs
            </p>
          </div>
          <Switch
            checked={isJobCreationPaused}
            onCheckedChange={(checked) => updateSetting('pause_job_creation', checked)}
            disabled={loading}
            className="flex-shrink-0"
          />
        </div>

        {/* Pause Automatic Dialing */}
        <div className="flex items-start sm:items-center justify-between gap-3 min-w-0 p-3 rounded-lg bg-muted/50">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <Label className="text-sm sm:text-base font-light">Pause Automatic Dialing</Label>
              {isAutomaticDialPaused && (
                <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 break-words">
              When enabled, non-admin users cannot enable automatic dial on jobs
            </p>
          </div>
          <Switch
            checked={isAutomaticDialPaused}
            onCheckedChange={(checked) => updateSetting('pause_automatic_dial', checked)}
            disabled={loading}
            className="flex-shrink-0"
          />
        </div>

        {/* Warning when locks are active */}
        {(isJobCreationPaused || isAutomaticDialPaused) && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-amber-500">
              {isJobCreationPaused && isAutomaticDialPaused
                ? 'Both job creation and automatic dialing are currently locked for all non-admin users.'
                : isJobCreationPaused
                ? 'Job creation is currently locked for all non-admin users.'
                : 'Automatic dialing is currently locked for all non-admin users.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}