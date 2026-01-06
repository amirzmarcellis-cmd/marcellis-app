import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'management' | 'team_leader' | 'employee' | 'viewer';

export function useUserRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTeamLeader, setIsTeamLeader] = useState(false);
  const [isManagement, setIsManagement] = useState(false);
  const [isViewer, setIsViewer] = useState(false);

  useEffect(() => {
    async function fetchUserRoles() {
      if (!user) {
        setRoles([]);
        setLoading(false);
        setIsTeamLeader(false);
        setIsManagement(false);
        setIsViewer(false);
        return;
      }

      try {
        // Fetch organization role first, then team memberships
        const [userRoleResult, membershipResult] = await Promise.all([
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('memberships')
            .select('role')
            .eq('user_id', user.id)
        ]);

        // Get organization role (ADMIN, MANAGEMENT, VIEWER, or EMPLOYEE)
        const orgRole = userRoleResult.data?.role || 'EMPLOYEE';
        
        // Check if user is team leader in any team
        const isLeader = Array.isArray(membershipResult.data) && 
          membershipResult.data.some((m: any) => m.role === 'TEAM_LEADER');
        
        setIsTeamLeader(isLeader);
        setIsManagement(orgRole === 'MANAGEMENT');
        setIsViewer(orgRole === 'VIEWER');

        // Set roles based on hierarchy: Admin > Management > Viewer > Team Leader > Employee
        if (orgRole === 'ADMIN') {
          setRoles(['admin']);
        } else if (orgRole === 'MANAGEMENT') {
          setRoles(['management']);
        } else if (orgRole === 'VIEWER') {
          setRoles(['viewer']);
        } else if (isLeader) {
          setRoles(['team_leader']);
        } else {
          setRoles(['employee']);
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
        setIsTeamLeader(false);
        setIsManagement(false);
        setIsViewer(false);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRoles();
  }, [user]);

  const hasRole = (role: UserRole) => roles.includes(role);
  const isAdmin = hasRole('admin');
  const canManageUsers = isAdmin || isManagement;
  const canAccessAnalytics = isAdmin || isManagement;
  const canAccessJobsAnalytics = isAdmin || isManagement || isTeamLeader;
  const canAccessUsersPanel = isAdmin || isManagement;
  const canManageTeamMembers = isAdmin || isManagement || isTeamLeader;
  const canCreateJobs = true; // All users can create jobs

  return {
    roles,
    hasRole,
    isAdmin,
    isSuperAdmin: isAdmin,
    isManagement,
    isManager: hasRole('management'), // For backwards compatibility
    isTeamLeader,
    isRecruiter: hasRole('employee'),
    isViewer,
    canManageUsers,
    canDeleteUsers: isAdmin || isManagement,
    canAccessAnalytics,
    canAccessJobsAnalytics,
    canAccessUsersPanel,
    canManageTeamMembers,
    canCreateJobs,
    loading
  };
}