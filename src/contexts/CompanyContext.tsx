import React, { createContext, useContext, ReactNode } from 'react';
import { useCompany, Company } from '@/hooks/useCompany';

interface CompanyContextType {
  companies: Company[];
  currentCompany: Company | null;
  userRoles: Record<string, string[]>;
  loading: boolean;
  hasRole: (role: string, companyId?: string) => boolean;
  isPlatformAdmin: () => boolean;
  isCompanyAdmin: (companyId?: string) => boolean;
  canManageUsers: (companyId?: string) => boolean;
  switchCompany: (company: Company) => void;
  refetch: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const companyData = useCompany();

  return (
    <CompanyContext.Provider value={companyData}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompanyContext() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompanyContext must be used within a CompanyProvider');
  }
  return context;
}