import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'manager' | 'recruiter';

export function useUserRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTeamLeader, setIsTeamLeader] = useState(false);

  useEffect(() => {
    async function fetchUserRoles() {
      if (!user) {
        setRoles([]);
        setLoading(false);
        setIsTeamLeader(false);
        return;
      }

      try {
        // Optimize: Fetch both profile and memberships in parallel
        const [profileResult, membershipResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('is_admin')
            .eq('user_id', user.id)
            .single(),
          supabase
            .from('memberships')
            .select('role')
            .eq('user_id', user.id)
        ]);

        const isAdmin = profileResult.data?.is_admin || false;
        const isLeader = Array.isArray(membershipResult.data) && 
          membershipResult.data.some((m: any) => m.role === 'MANAGER');
        
        setIsTeamLeader(isLeader);

        if (isAdmin) {
          setRoles(['admin']);
        } else if (isLeader) {
          setRoles(['manager']);
        } else {
          setRoles(['recruiter']);
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
        setIsTeamLeader(false);
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
  const canManageTeamMembers = isAdmin || isTeamLeader;

  return {
    roles,
    hasRole,
    isAdmin,
    isSuperAdmin: isAdmin,
    isManager: hasRole('manager'),
    isRecruiter: hasRole('recruiter'),
    isTeamLeader,
    canManageUsers,
    canDeleteUsers: isAdmin,
    canAccessAnalytics,
    canAccessUsersPanel,
    canManageTeamMembers,
    loading
  };
}