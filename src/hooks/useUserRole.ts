import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'recruiter';

interface UserRoleData {
  roles: UserRole[];
  hasRole: (role: UserRole) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isManager: boolean;
  isRecruiter: boolean;
  canManageUsers: boolean;
  canDeleteUsers: boolean;
  canAccessAnalytics: boolean;
  canAccessUsersPanel: boolean;
  loading: boolean;
}

export function useUserRole(): UserRoleData {
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
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user roles:', error);
          setRoles([]);
        } else {
          setRoles(data?.map(r => r.role as UserRole) || []);
        }
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
  
  // Role checks
  const isSuperAdmin = hasRole('super_admin');
  const isAdmin = hasRole('admin');
  const isManager = hasRole('manager');
  const isRecruiter = hasRole('recruiter');

  // Permission checks based on RBAC rules
  const canManageUsers = isSuperAdmin || isAdmin || isManager;
  const canDeleteUsers = isSuperAdmin || isAdmin; // Only super admin and admin can delete
  const canAccessAnalytics = isSuperAdmin || isAdmin || isManager; // Recruiters cannot access
  const canAccessUsersPanel = isSuperAdmin || isAdmin || isManager; // Recruiters cannot access

  return {
    roles,
    hasRole,
    isAdmin,
    isSuperAdmin,
    isManager,
    isRecruiter,
    canManageUsers,
    canDeleteUsers,
    canAccessAnalytics,
    canAccessUsersPanel,
    loading
  };
}