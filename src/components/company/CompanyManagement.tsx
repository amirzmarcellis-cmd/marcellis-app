import { useState, useEffect } from 'react';
import { useCompanyContext } from '@/contexts/CompanyContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Building2, Users, CreditCard, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CompanyList } from './CompanyList';

export function CompanyManagement() {
  const { currentCompany, isPlatformAdmin, isCompanyAdmin, refetch } = useCompanyContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: '',
    subdomain: '',
    settings: '{}',
  });

  useEffect(() => {
    if (currentCompany) {
      setCompanyData({
        name: currentCompany.name,
        subdomain: currentCompany.subdomain,
        settings: JSON.stringify(currentCompany.settings || {}, null, 2),
      });
    }
  }, [currentCompany]);

  const canEdit = isPlatformAdmin() || isCompanyAdmin();

  const handleSave = async () => {
    if (!currentCompany || !canEdit) return;

    setLoading(true);
    try {
      let settings;
      try {
        settings = JSON.parse(companyData.settings);
      } catch {
        throw new Error('Invalid JSON in settings');
      }

      const { error } = await supabase
        .from('companies')
        .update({
          name: companyData.name,
          subdomain: companyData.subdomain,
          settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentCompany.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Company settings updated successfully',
      });

      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update company settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // If platform admin, show company list instead
  if (isPlatformAdmin()) {
    return <CompanyList />;
  }

  if (!currentCompany) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No company selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={companyData.name}
                onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                disabled={!canEdit}
              />
            </div>
            <div>
              <Label htmlFor="subdomain">Subdomain</Label>
              <Input
                id="subdomain"
                value={companyData.subdomain}
                onChange={(e) => setCompanyData({ ...companyData, subdomain: e.target.value })}
                disabled={!canEdit}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div>
              <Label>Plan Type</Label>
              <Badge variant="secondary" className="ml-2">
                {currentCompany.plan_type}
              </Badge>
            </div>
            <div>
              <Label>Created</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(currentCompany.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="settings">Company Settings (JSON)</Label>
            <Textarea
              id="settings"
              value={companyData.settings}
              onChange={(e) => setCompanyData({ ...companyData, settings: e.target.value })}
              disabled={!canEdit}
              rows={6}
              className="font-mono text-sm"
            />
          </div>

          {canEdit && (
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Users</span>
            </div>
            <p className="text-2xl font-bold">-</p>
            <p className="text-xs text-muted-foreground">Total company users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Jobs</span>
            </div>
            <p className="text-2xl font-bold">-</p>
            <p className="text-xs text-muted-foreground">Active job postings</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Plan</span>
            </div>
            <p className="text-2xl font-bold capitalize">{currentCompany.plan_type}</p>
            <p className="text-xs text-muted-foreground">Current subscription</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}