import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminSettings {
  pause_job_creation: boolean;
  pause_automatic_dial: boolean;
}

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>({
    pause_job_creation: false,
    pause_automatic_dial: false,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      const settingsMap: AdminSettings = {
        pause_job_creation: false,
        pause_automatic_dial: false,
      };

      data?.forEach((row) => {
        if (row.setting_key === 'pause_job_creation') {
          settingsMap.pause_job_creation = row.setting_value;
        } else if (row.setting_key === 'pause_automatic_dial') {
          settingsMap.pause_automatic_dial = row.setting_value;
        }
      });

      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching admin settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('admin-settings-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'admin_settings',
        },
        (payload) => {
          const { setting_key, setting_value } = payload.new as { setting_key: string; setting_value: boolean };
          setSettings((prev) => ({
            ...prev,
            [setting_key]: setting_value,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  const updateSetting = useCallback(async (key: keyof AdminSettings, value: boolean) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('admin_settings')
        .update({ 
          setting_value: value,
          updated_by: userData.user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', key);

      if (error) throw error;

      setSettings((prev) => ({
        ...prev,
        [key]: value,
      }));

      toast({
        title: value ? 'Lock enabled' : 'Lock disabled',
        description: key === 'pause_job_creation' 
          ? (value ? 'Job creation is now paused for all users' : 'Job creation is now allowed')
          : (value ? 'Automatic dialing is now paused for all users' : 'Automatic dialing is now allowed'),
      });
    } catch (error) {
      console.error('Error updating admin setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to update setting. Make sure you have admin permissions.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  return {
    isJobCreationPaused: settings.pause_job_creation,
    isAutomaticDialPaused: settings.pause_automatic_dial,
    updateSetting,
    loading,
    refetch: fetchSettings,
  };
}
