import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'platform_admin' | 'company_admin' | 'manager' | 'recruiter';

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
        // Check if user is platform admin from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_platform_admin')
          .eq('user_id', user.id)
          .single();

        const isPlatformAdmin = profileData?.is_platform_admin || false;

        // Get company-specific roles
        const { data, error } = await supabase
          .from('company_users')
          .select('role')
          .eq('user_id', user.id);

        if (error && !error.message.includes('No rows found')) {
          console.error('Error fetching user roles:', error);
          setRoles(isPlatformAdmin ? ['platform_admin'] : []);
        } else {
          const companyRoles = data?.map(r => r.role as UserRole) || [];
          const allRoles = isPlatformAdmin ? ['platform_admin' as UserRole, ...companyRoles] : companyRoles;
          setRoles(allRoles);
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
  const isPlatformAdmin = hasRole('platform_admin');
  const isCompanyAdmin = hasRole('company_admin');
  const isManager = hasRole('manager');
  const isRecruiter = hasRole('recruiter');

  // Legacy compatibility
  const isSuperAdmin = isPlatformAdmin;
  const isAdmin = isCompanyAdmin;

  // Permission checks based on RBAC rules
  const canManageUsers = isPlatformAdmin || isCompanyAdmin || isManager;
  const canDeleteUsers = isPlatformAdmin || isCompanyAdmin; // Only platform admin and company admin can delete
  const canAccessAnalytics = isPlatformAdmin || isCompanyAdmin || isManager; // Recruiters cannot access
  const canAccessUsersPanel = isPlatformAdmin || isCompanyAdmin || isManager; // Recruiters cannot access

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