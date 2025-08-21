import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Building2, Users, CreditCard, ArrowLeft, Trash2, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Company } from '@/hooks/useCompany';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface CompanyManagementPanelProps {
  company: Company;
  onBack: () => void;
  onCompanyUpdated: () => void;
}

interface CompanyUser {
  id: string;
  user_id: string;
  role: string;
  profiles: {
    name: string;
  } | null;
  email?: string; // Add email field
}

export function CompanyManagementPanel({ company, onBack, onCompanyUpdated }: CompanyManagementPanelProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [companyData, setCompanyData] = useState({
    name: company.name,
    subdomain: company.subdomain,
    plan_type: company.plan_type,
    settings: JSON.stringify(company.settings || {}, null, 2),
  });

  useEffect(() => {
    fetchCompanyUsers();
  }, [company.id]);

  const fetchCompanyUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('company_users')
        .select(`
          id,
          user_id,
          role
        `)
        .eq('company_id', company.id);

      if (error) throw error;

      // Fetch profiles separately
      const userIds = data?.map(u => u.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', userIds);

      // For each user, try to get their email - we'll store it in profiles table for better access
      const usersWithProfiles = (data || []).map((user) => {
        const profile = profiles?.find(p => p.user_id === user.user_id);
        
        return {
          ...user,
          profiles: profile || null,
          email: 'Email not available' // We'll need to store emails in profiles for full access
        };
      });

      setUsers(usersWithProfiles);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch company users',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
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
          plan_type: companyData.plan_type,
          settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', company.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Company settings updated successfully',
      });

      onCompanyUpdated();
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

  const handleDeleteCompany = async () => {
    setDeleteLoading(true);
    try {
      // First delete all company users
      await supabase
        .from('company_users')
        .delete()
        .eq('company_id', company.id);

      // Then delete the company
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', company.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Company deleted successfully',
      });

      onCompanyUpdated();
      onBack();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete company',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Companies
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Manage {company.name}</h2>
          <p className="text-muted-foreground">Platform admin company management</p>
        </div>
      </div>

      {/* Company Information */}
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
              />
            </div>
            <div>
              <Label htmlFor="subdomain">Subdomain</Label>
              <Input
                id="subdomain"
                value={companyData.subdomain}
                onChange={(e) => setCompanyData({ ...companyData, subdomain: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plan_type">Plan Type</Label>
              <Input
                id="plan_type"
                value={companyData.plan_type}
                onChange={(e) => setCompanyData({ ...companyData, plan_type: e.target.value })}
              />
            </div>
            <div>
              <Label>Created</Label>
              <p className="text-sm text-muted-foreground py-2">
                {new Date(company.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="settings">Company Settings (JSON)</Label>
            <Textarea
              id="settings"
              value={companyData.settings}
              onChange={(e) => setCompanyData({ ...companyData, settings: e.target.value })}
              rows={6}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleteLoading}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Company
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the company
                    "{company.name}" and remove all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteCompany} className="bg-destructive text-destructive-foreground">
                    {deleteLoading ? 'Deleting...' : 'Delete Company'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Company Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Company Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {users.length > 0 ? (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.profiles?.name || 'Unknown User'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant="secondary">{user.role}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No users found for this company</p>
          )}
          
          <Button variant="outline" className="w-full">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User to Company
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <p className="text-2xl font-bold">{users.length}</p>
            <p className="text-xs text-muted-foreground">Active company users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Plan</span>
            </div>
            <p className="text-2xl font-bold capitalize">{company.plan_type}</p>
            <p className="text-xs text-muted-foreground">Current subscription</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Admins</span>
            </div>
            <p className="text-2xl font-bold">
              {users.filter(u => u.role === 'company_admin').length}
            </p>
            <p className="text-xs text-muted-foreground">Company administrators</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}