import { useProfile } from '@/hooks/useProfile';

export type UserRole = 'admin' | 'user';

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
  const { profile, loading } = useProfile();

  const isAdmin = profile?.is_admin || false;
  const roles: UserRole[] = isAdmin ? ['admin'] : ['user'];

  const hasRole = (role: UserRole) => roles.includes(role);

  // All admin capabilities for the single admin user
  const canManageUsers = isAdmin;
  const canDeleteUsers = isAdmin;
  const canAccessAnalytics = isAdmin;
  const canAccessUsersPanel = isAdmin;

  // Legacy compatibility
  const isSuperAdmin = isAdmin;
  const isManager = isAdmin;
  const isRecruiter = !isAdmin;

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