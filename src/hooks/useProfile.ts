import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      // Check if this is the admin user
      const isAdminUser = user.email === 'amir.z@marc-ellis.com';
      
      // Create mock profile
      const mockProfile: Profile = {
        id: 'mock-id',
        user_id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email,
        is_admin: isAdminUser,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setProfile(mockProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const updateProfile = async (updates: Partial<Pick<Profile, 'name'>>) => {
    if (!user || !profile) return;

    try {
      // Update local state only (no database in simplified structure)
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const isAdmin = profile?.is_admin || false;

  return {
    profile,
    loading,
    updateProfile,
    isAdmin,
    refetch: fetchProfile,
  };
}