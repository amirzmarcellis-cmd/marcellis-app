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
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    if (!user) return;

    try {
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

      if (companyUsersError) throw companyUsersError;

      const companiesData = companyUsers?.map((cu: any) => cu.companies).filter(Boolean) || [];
      const rolesData = companyUsers?.reduce((acc: any, cu: any) => {
        if (!acc[cu.company_id]) acc[cu.company_id] = [];
        acc[cu.company_id].push(cu.role);
        return acc;
      }, {}) || {};

      setCompanies(companiesData);
      setUserRoles(rolesData);

      // Set current company (first one for now)
      if (companiesData.length > 0 && !currentCompany) {
        setCurrentCompany(companiesData[0]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [user]);

  const hasRole = (role: string, companyId?: string): boolean => {
    const targetCompanyId = companyId || currentCompany?.id;
    if (!targetCompanyId) return false;
    return userRoles[targetCompanyId]?.includes(role) || false;
  };

  const isPlatformAdmin = (): boolean => {
    return Object.values(userRoles).some(roles => roles.includes('platform_admin'));
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