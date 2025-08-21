import { useCompanyContext } from '@/contexts/CompanyContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Custom hook for company-scoped database operations
 * Ensures all data queries are filtered by the current company
 */
export function useCompanyData() {
  const { currentCompany } = useCompanyContext();

  const queryBuilder = {
    /**
     * Get a Supabase query builder with company filtering applied
     */
    from: (table: string) => {
      const query = supabase.from(table);
      
      // Apply company filter for tables that have company_id
      const tablesWithCompanyId = [
        'CVs', 'Jobs', 'Jobs_CVs', 'call_logs', 'activity_logs', 
        'comments', 'interview', 'tasks', 'task_candidates', 
        'status_history', 'file_uploads'
      ];
      
      if (tablesWithCompanyId.includes(table) && currentCompany?.id) {
        return query.eq('company_id', currentCompany.id);
      }
      
      return query;
    },

    /**
     * Insert data with company_id automatically set
     */
    insert: (table: string, data: any | any[]) => {
      const tablesWithCompanyId = [
        'CVs', 'Jobs', 'Jobs_CVs', 'call_logs', 'activity_logs', 
        'comments', 'interview', 'tasks', 'task_candidates', 
        'status_history', 'file_uploads'
      ];

      if (tablesWithCompanyId.includes(table) && currentCompany?.id) {
        const dataWithCompany = Array.isArray(data) 
          ? data.map(item => ({ ...item, company_id: currentCompany.id }))
          : { ...data, company_id: currentCompany.id };
        
        return supabase.from(table).insert(dataWithCompany);
      }
      
      return supabase.from(table).insert(data);
    },

    /**
     * Update data with company filtering
     */
    update: (table: string, data: any) => {
      const query = supabase.from(table).update(data);
      
      const tablesWithCompanyId = [
        'CVs', 'Jobs', 'Jobs_CVs', 'call_logs', 'activity_logs', 
        'comments', 'interview', 'tasks', 'task_candidates', 
        'status_history', 'file_uploads'
      ];
      
      if (tablesWithCompanyId.includes(table) && currentCompany?.id) {
        return query.eq('company_id', currentCompany.id);
      }
      
      return query;
    }
  };

  return {
    currentCompany,
    isReady: !!currentCompany?.id,
    queryBuilder
  };
}