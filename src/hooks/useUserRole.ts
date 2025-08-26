import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'manager' | 'recruiter';

export function useUserRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRoles() {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', user.id)
          .single();

        const isAdmin = profileData?.is_admin || false;
        setRoles(isAdmin ? ['admin'] : ['recruiter']);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRoles();
  }, [user]);

  const hasRole = (role: UserRole) => roles.includes(role);
  const isAdmin = hasRole('admin');
  const canManageUsers = isAdmin;
  const canAccessAnalytics = isAdmin;
  const canAccessUsersPanel = isAdmin;

  return {
    roles,
    hasRole,
    isAdmin,
    isSuperAdmin: isAdmin,
    isManager: false,
    isRecruiter: !isAdmin,
    canManageUsers,
    canDeleteUsers: isAdmin,
    canAccessAnalytics,
    canAccessUsersPanel,
    loading
  };
}