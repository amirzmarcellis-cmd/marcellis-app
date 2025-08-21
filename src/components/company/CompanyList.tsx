import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Building2, Users, Settings, Plus, Edit } from 'lucide-react';
import { CreateCompanyDialog } from './CreateCompanyDialog';
import { CompanyManagementPanel } from './CompanyManagementPanel';
import { Company } from '@/hooks/useCompany';
import { useCompanyContext } from '@/contexts/CompanyContext';

interface CompanyWithStats extends Company {
  user_count?: number;
  admin_count?: number;
}

export function CompanyList() {
  const [companies, setCompanies] = useState<CompanyWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const { toast } = useToast();
  const { switchCompany } = useCompanyContext();

  const fetchCompanies = async () => {
    try {
      // Fetch all companies first
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*');

      if (companiesError) throw companiesError;

      // Then fetch company users separately to get stats
      const { data: companyUsersData } = await supabase
        .from('company_users')
        .select('company_id, role');

      // Process the data to include stats
      const companiesWithStats = companiesData?.map(company => {
        const users = companyUsersData?.filter(u => u.company_id === company.id) || [];
        return {
          ...company,
          user_count: users.length,
          admin_count: users.filter(u => u.role === 'company_admin').length
        };
      }) || [];

      setCompanies(companiesWithStats);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch companies',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCompanyCreated = () => {
    fetchCompanies();
    setShowCreateDialog(false);
  };

  const handleManageCompany = (company: Company) => {
    setSelectedCompany(company);
  };

  const handleBackToList = () => {
    setSelectedCompany(null);
  };

  const handleCompanyUpdated = () => {
    fetchCompanies();
    setSelectedCompany(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Loading companies...</p>
        </CardContent>
      </Card>
    );
  }

  // Show company management panel if a company is selected
  if (selectedCompany) {
    return (
      <CompanyManagementPanel
        company={selectedCompany}
        onBack={handleBackToList}
        onCompanyUpdated={handleCompanyUpdated}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">All Companies</h2>
          <p className="text-muted-foreground">
            Manage all companies in the platform
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Company
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Card key={company.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {company.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{company.plan_type}</Badge>
                <Badge variant="outline">{company.subdomain}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span className="font-medium">Users</span>
                  </div>
                  <p className="text-lg font-bold">{company.user_count || 0}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <Settings className="h-3 w-3" />
                    <span className="font-medium">Admins</span>
                  </div>
                  <p className="text-lg font-bold">{company.admin_count || 0}</p>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Created: {new Date(company.created_at).toLocaleDateString()}
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleManageCompany(company)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Manage Company
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {companies.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No companies found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first company.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Company
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateCompanyDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onCompanyCreated={handleCompanyCreated}
      />
    </div>
  );
}