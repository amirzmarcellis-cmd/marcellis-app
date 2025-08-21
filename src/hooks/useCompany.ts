import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Company {
  id: string;
  name: string;
  subdomain: string;
  plan_type: string;
  logo_url?: string;
  settings: any;
  created_at: string;
  updated_at: string;
}

export interface CompanySubscription {
  id: string;
  company_id: string;
  plan_type: string;
  status: string;
  trial_ends_at?: string;
  subscription_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyUser {
  id: string;
  company_id: string;
  user_id: string;
  role: 'platform_admin' | 'company_admin' | 'manager' | 'recruiter';
  invited_at?: string;
  joined_at?: string;
  created_at: string;
}

export function useCompany() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});
  const [isPlatformAdminUser, setIsPlatformAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    if (!user) return;

    try {
      // Check if user is platform admin from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_platform_admin')
        .eq('user_id', user.id)
        .single();

      const isPlatformAdminFromProfile = profileData?.is_platform_admin || false;
      setIsPlatformAdminUser(isPlatformAdminFromProfile);

      // Get user's companies
      const { data: companyUsers, error: companyUsersError } = await supabase
        .from('company_users')
        .select(`
          company_id,
          role,
          companies (
            id,
            name,
            subdomain,
            plan_type,
            logo_url,
            settings,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (companyUsersError && !companyUsersError.message.includes('No rows found')) {
        throw companyUsersError;
      }

      const companiesData = companyUsers?.map((cu: any) => cu.companies).filter(Boolean) || [];
      const rolesData = companyUsers?.reduce((acc: any, cu: any) => {
        if (!acc[cu.company_id]) acc[cu.company_id] = [];
        acc[cu.company_id].push(cu.role);
        return acc;
      }, {}) || {};

      console.log('useCompany: User companies data:', {
        userEmail: user.email,
        companiesCount: companiesData.length,
        companies: companiesData.map(c => c.name),
        isPlatformAdmin: isPlatformAdminFromProfile
      });

      // Always prioritize user's specific company assignments
      setCompanies(companiesData);
      setUserRoles(rolesData);

      // Set current company - use the first company the user belongs to
      if (companiesData.length > 0) {
        console.log('useCompany: Setting current company to:', companiesData[0].name);
        setCurrentCompany(companiesData[0]);
      }

      // If platform admin and no specific companies, then get all companies
      if (isPlatformAdminFromProfile && companiesData.length === 0) {
        // Only fetch all companies if user has no specific company assignments
        const { data: allCompanies } = await supabase
          .from('companies')
          .select('id, name, subdomain, plan_type, logo_url, settings, created_at, updated_at');

        if (allCompanies) {
          setCompanies(allCompanies);
          
          // Add platform_admin role for all companies
          const platformAdminRoles: Record<string, string[]> = {};
          allCompanies.forEach(company => {
            platformAdminRoles[company.id] = ['platform_admin'];
          });
          setUserRoles(platformAdminRoles);
          
          // Set first company as current
          if (allCompanies.length > 0) {
            setCurrentCompany(allCompanies[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('useCompany: Fetching companies for user:', user.email);
      fetchCompanies();
    } else {
      // Reset state when user logs out
      setCompanies([]);
      setCurrentCompany(null);
      setUserRoles({});
      setIsPlatformAdminUser(false);
      setLoading(false);
    }
  }, [user?.id]); // Only depend on user ID to prevent unnecessary refetches

  const hasRole = (role: string, companyId?: string): boolean => {
    const targetCompanyId = companyId || currentCompany?.id;
    if (!targetCompanyId) return false;
    return userRoles[targetCompanyId]?.includes(role) || false;
  };

  const isPlatformAdmin = (): boolean => {
    return isPlatformAdminUser;
  };

  const isCompanyAdmin = (companyId?: string): boolean => {
    return hasRole('company_admin', companyId);
  };

  const canManageUsers = (companyId?: string): boolean => {
    return isPlatformAdmin() || isCompanyAdmin(companyId);
  };

  const switchCompany = (company: Company) => {
    setCurrentCompany(company);
  };

  return {
    companies,
    currentCompany,
    userRoles,
    loading,
    hasRole,
    isPlatformAdmin,
    isCompanyAdmin,
    canManageUsers,
    switchCompany,
    refetch: fetchCompanies,
  };
}