import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  role: 'admin' | 'manager' | 'recruiter' | 'user';
  department: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // For now, create a mock profile since the profiles table doesn't exist yet
      setProfile({
        id: user.id,
        user_id: user.id,
        first_name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'User',
        last_name: user.user_metadata?.last_name || '',
        email: user.email || null,
        phone: user.user_metadata?.phone || null,
        role: 'recruiter',
        department: 'Recruitment',
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setLoading(false);
    }
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      // For now, just update the local state since the profiles table doesn't exist
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const fetchProfile = async () => {
    // Mock function for now
    setLoading(false);
  };

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  };
}