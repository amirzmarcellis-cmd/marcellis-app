import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { User, Bell, Shield, AlertTriangle, Lock, Linkedin, CheckCircle2, XCircle, Loader2, ExternalLink, Users, CreditCard, Key } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { LinkedInConnectionModal } from '@/components/settings/LinkedInConnectionModal';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { profile, updateProfile, refetch } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    slug: '',
    notifications: true,
    automaticDial: false,
  });
  const [loading, setLoading] = useState(false);

  // LinkedIn connection states
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [connectionUrl, setConnectionUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

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

  // LinkedIn handlers
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const origin = window.location.origin;
      const { data, error } = await supabase.functions.invoke('linkedin-connect', {
        body: { origin },
      });

      if (error) throw error;
      if (data?.url) {
        setConnectionUrl(data.url);
        setShowModal(true);
        setIsConnecting(false);
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Connection failed',
        description: error.message || 'Failed to connect LinkedIn account.',
        variant: 'destructive',
      });
      setIsConnecting(false);
    }
  };

  const pollForLinkedInId = async () => {
    setIsPolling(true);
    const maxAttempts = 10;
    let attempts = 0;

    const poll = setInterval(async () => {
      attempts++;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        clearInterval(poll);
        setIsPolling(false);
        return;
      }

      try {
        const { data: fetchResult, error: fetchError } = await supabase.functions.invoke('fetch-linkedin-account');
        if (fetchError || fetchResult?.wrongAccountType) {
          clearInterval(poll);
          setIsPolling(false);
          toast({
            title: 'Connection Failed',
            description: fetchResult?.detectedType === 'FACEBOOK' 
              ? 'A Facebook page was connected instead of LinkedIn.'
              : 'Unable to connect LinkedIn account.',
            variant: 'destructive',
          });
          return;
        }
      } catch (fetchErr) {
        console.error('Error checking account type:', fetchErr);
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('linkedin_id')
        .eq('user_id', user.id)
        .single();

      if (profileData?.linkedin_id) {
        clearInterval(poll);
        setIsPolling(false);
        toast({
          title: 'LinkedIn Connected',
          description: `Account ID: ${profileData.linkedin_id}`,
        });
        refetch();
      } else if (attempts >= maxAttempts) {
        clearInterval(poll);
        setIsPolling(false);
        toast({
          title: 'Connection in progress',
          description: 'Please refresh the page in a moment.',
        });
      }
    }, 1000);
  };

  const handleConnectionSuccess = () => {
    pollForLinkedInId();
    setShowModal(false);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setConnectionUrl(null);
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data: profileData } = await supabase
        .from('profiles')
        .select('linkedin_id, name')
        .eq('user_id', user.id)
        .single();

      if (profileData?.linkedin_id) {
        try {
          await fetch('https://hook.eu2.make.com/j3c6idm38oapvf8xrba2jdlzua6y7d9b', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([{
              linkedin_id: profileData.linkedin_id,
              name: profileData.name || user.email || 'Unknown'
            }])
          });
        } catch (webhookError) {
          console.error('Webhook notification error:', webhookError);
        }
      }

      const { error } = await supabase.functions.invoke('linkedin-connect', {
        body: { action: 'disconnect' },
      });
      if (error) throw error;

      toast({
        title: 'Disconnected',
        description: 'LinkedIn account has been disconnected.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Disconnect failed',
        description: 'Failed to disconnect LinkedIn account.',
        variant: 'destructive',
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const isLinkedInConnected = !!profile?.linkedin_id;

  return (
    <>
      <LinkedInConnectionModal
        url={connectionUrl || ''}
        open={showModal}
        onClose={handleModalClose}
        onSuccess={handleConnectionSuccess}
      />

      <div className="min-h-screen px-3 sm:px-4 md:px-6 pb-20 sm:pb-24 max-w-4xl mx-auto">
        {/* Main glassmorphism container */}
        <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/70 to-gray-950/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-5 sm:p-8 shadow-2xl shadow-cyan-500/5">
          
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Customize your system and integrations
            </p>
          </div>

          <div className="space-y-8">
            {/* Profile Section */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </h2>
              <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-5 space-y-5">
                {/* Your Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-gray-300">Your Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="bg-gray-900/50 border-gray-700/50 focus:border-cyan-500/50 h-11 rounded-lg text-white placeholder:text-gray-500"
                  />
                  <p className="text-xs text-muted-foreground">This is your display name across the platform</p>
                </div>

                {/* Company Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm text-gray-300">Company Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="e.g., acme"
                    className="bg-gray-900/50 border-gray-700/50 focus:border-cyan-500/50 h-11 rounded-lg text-white placeholder:text-gray-500"
                  />
                  <p className="text-xs text-muted-foreground">Used for job IDs (e.g., "me-j-0001")</p>
                </div>

                {/* Password Row */}
                <div className="flex items-center justify-between py-3 border-t border-gray-700/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Password</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Update your account password</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-gray-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-gray-300"
                    onClick={() => toast({ title: 'Coming soon', description: 'Password change will be available soon.' })}
                  >
                    Change Password
                  </Button>
                </div>

                {/* Save Button */}
                <Button 
                  onClick={handleSave} 
                  disabled={loading} 
                  className="bg-cyan-500 hover:bg-cyan-600 text-black font-medium rounded-lg"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </h2>
              <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-300">Email Notifications</span>
                    <p className="text-xs text-muted-foreground mt-0.5">Receive email notifications for important updates</p>
                  </div>
                  <Switch
                    checked={formData.notifications}
                    onCheckedChange={(checked) => setFormData({ ...formData, notifications: checked })}
                  />
                </div>
              </div>
            </div>

            {/* User Management Section (Admin Only) */}
            {profile?.is_admin && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  User Management
                </h2>
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-300">Manage Users</span>
                      <p className="text-xs text-muted-foreground mt-0.5">Add, edit, or remove team members</p>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="border-gray-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-gray-300 gap-2"
                      onClick={() => navigate('/users')}
                    >
                      Open Users Panel
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription & Billing Section */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Subscription & Billing
              </h2>
              <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-300">Manage your subscription</span>
                    <p className="text-xs text-muted-foreground mt-0.5">View plans, upgrade, or manage billing details</p>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-gray-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-gray-300 gap-1"
                    onClick={() => toast({ title: 'Coming soon', description: 'Subscription management will be available soon.' })}
                  >
                    View Subscription
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Integrations Section */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                Integrations
              </h2>
              <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#0A66C2]/20 flex items-center justify-center">
                      <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-300">LinkedIn</span>
                        {isLinkedInConnected ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1 text-xs">
                            <CheckCircle2 className="h-3 w-3" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 text-xs bg-gray-700/50 text-gray-400">
                            <XCircle className="h-3 w-3" />
                            Not connected
                          </Badge>
                        )}
                      </div>
                      {isLinkedInConnected && (
                        <p className="text-xs text-muted-foreground mt-0.5">ID: {profile?.linkedin_id}</p>
                      )}
                      {!isLinkedInConnected && (
                        <p className="text-xs text-muted-foreground mt-0.5">Connect to search candidates</p>
                      )}
                    </div>
                  </div>
                  {isLinkedInConnected ? (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleDisconnect}
                      disabled={isDisconnecting}
                      className="border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 text-red-400"
                    >
                      {isDisconnecting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Disconnect
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className="bg-[#0A66C2] hover:bg-[#0A66C2]/80 text-white"
                    >
                      {isConnecting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Controls Section */}
            <AdminSystemSettings />
          </div>
        </div>
      </div>
    </>
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

  if (!profile?.is_admin) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
        <Shield className="h-4 w-4" />
        Admin Controls
        <Badge variant="outline" className="ml-2 text-xs border-amber-500/50 text-amber-400">
          Admin Only
        </Badge>
      </h2>
      <div className="bg-gray-900/50 border border-amber-500/30 rounded-xl p-5 space-y-4">
        {/* Pause Job Creation */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
          <div className="flex items-center gap-3">
            <Lock className="h-4 w-4 text-amber-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Pause Job Creation</span>
                {isJobCreationPaused && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Non-admin users cannot create new jobs</p>
            </div>
          </div>
          <Switch
            checked={isJobCreationPaused}
            onCheckedChange={(checked) => updateSetting('pause_job_creation', checked)}
            disabled={loading}
          />
        </div>

        {/* Pause Automatic Dialing */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
          <div className="flex items-center gap-3">
            <Lock className="h-4 w-4 text-amber-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Pause Automatic Dialing</span>
                {isAutomaticDialPaused && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Non-admin users cannot enable automatic dial</p>
            </div>
          </div>
          <Switch
            checked={isAutomaticDialPaused}
            onCheckedChange={(checked) => updateSetting('pause_automatic_dial', checked)}
            disabled={loading}
          />
        </div>

        {/* Warning when locks are active */}
        {(isJobCreationPaused || isAutomaticDialPaused) && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-400">
              {isJobCreationPaused && isAutomaticDialPaused
                ? 'Both job creation and automatic dialing are locked for non-admin users.'
                : isJobCreationPaused
                ? 'Job creation is locked for non-admin users.'
                : 'Automatic dialing is locked for non-admin users.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
