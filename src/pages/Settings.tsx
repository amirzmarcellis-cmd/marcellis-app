import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, User, Bell, Shield } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { LinkedInConnection } from '@/components/settings/LinkedInConnection';

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
    <div className="space-y-4 px-4 sm:px-0">
      <div className="flex items-center gap-2 sm:gap-3">
        <SettingsIcon className="h-5 w-5 text-primary flex-shrink-0" />
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light font-work tracking-tight">Settings</h1>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-2xl font-light font-work tracking-tight">
            <User className="h-4 w-4 flex-shrink-0" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="font-light text-sm">Display Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-light text-sm">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug" className="text-sm">Company Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              placeholder="Enter company slug (e.g., 'me', 'acme')"
              pattern="[a-z0-9-]+"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This slug will be used for job IDs. Example: if slug is "me", job IDs will be "me-j-0001"
            </p>
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
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
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-2xl font-light">
            <Bell className="h-4 w-4 flex-shrink-0" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Label className="text-sm sm:text-base">Email Notifications</Label>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
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
      {profile?.is_admin && (
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-2xl font-light">
              <Shield className="h-4 w-4 flex-shrink-0" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <Label className="text-sm sm:text-base">Automatic Dialing</Label>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Enable automatic dialing for candidates
                </p>
              </div>
              <Switch
                checked={formData.automaticDial}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, automaticDial: checked })
                }
                className="flex-shrink-0"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}