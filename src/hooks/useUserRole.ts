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
        // Check admin status
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', user.id)
          .single();

        const isAdmin = profileData?.is_admin || false;
        
        // Check if user is a team leader (MANAGER in any team)
        const { data: membershipData } = await supabase
          .from('memberships')
          .select('role')
          .eq('user_id', user.id);

        const isLeader = Array.isArray(membershipData) && membershipData.some((m: any) => m.role === 'MANAGER');
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