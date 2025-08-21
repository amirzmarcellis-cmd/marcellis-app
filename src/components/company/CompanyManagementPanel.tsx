import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Building2, Users, CreditCard, ArrowLeft, Trash2, UserPlus, Edit, Mail, User, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Company } from '@/hooks/useCompany';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CompanyManagementPanelProps {
  company: Company;
  onBack: () => void;
  onCompanyUpdated: () => void;
}

interface CompanyUser {
  id: string;
  user_id: string;
  role: 'company_admin' | 'manager' | 'recruiter'; // Removed platform_admin
  profiles: {
    name: string;
  } | null;
  email?: string;
}

export function CompanyManagementPanel({ company, onBack, onCompanyUpdated }: CompanyManagementPanelProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CompanyUser | null>(null);
  const [userFormData, setUserFormData] = useState<{
    name: string;
    email: string;
    password: string;
    role: 'company_admin' | 'manager' | 'recruiter'; // Removed platform_admin
  }>({
    name: '',
    email: '',
    password: '',
    role: 'recruiter', // Default to recruiter instead of company_admin
  });
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
        .eq('company_id', company.id)
        .neq('role', 'platform_admin'); // Exclude platform admins

      if (error) throw error;

      // Fetch profiles separately
      const userIds = data?.map(u => u.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);

      // Combine user data with profiles including email
      const usersWithProfiles = (data || []).map((user) => {
        const profile = profiles?.find(p => p.user_id === user.user_id);
        
        return {
          ...user,
          profiles: profile || null,
          email: profile?.email || 'Email not available'
        } as CompanyUser; // Type assertion since we filtered out platform_admin
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

  const handleAddUser = async () => {
    if (!userFormData.name || !userFormData.email || !userFormData.password) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Create user using the admin edge function
      const { data: adminResult, error: adminError } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'create_user',
          userData: {
            email: userFormData.email,
            password: userFormData.password,
            name: userFormData.name,
          },
        },
      });

      if (adminError) throw adminError;

      if (!adminResult.user?.user) {
        throw new Error('Failed to create user');
      }

      // Assign user to this company
      const { error: roleError } = await supabase
        .from('company_users')
        .insert({
          user_id: adminResult.user.user.id,
          company_id: company.id,
          role: userFormData.role,
          joined_at: new Date().toISOString(),
        });

      if (roleError) throw roleError;

      toast({
        title: 'Success',
        description: `User "${userFormData.name}" added successfully`,
      });

      setShowAddUserDialog(false);
      setUserFormData({ name: '', email: '', password: '', role: 'recruiter' });
      fetchCompanyUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser || !userFormData.name || !userFormData.email) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Update user using the admin edge function
      const updateData: any = {
        email: userFormData.email,
        name: userFormData.name,
      };

      if (userFormData.password) {
        updateData.password = userFormData.password;
      }

      const { error: adminError } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'update_user',
          userId: selectedUser.user_id,
          userData: updateData,
        },
      });

      if (adminError) throw adminError;

      // Update role if changed
      const { error: roleError } = await supabase
        .from('company_users')
        .update({ role: userFormData.role })
        .eq('id', selectedUser.id);

      if (roleError) throw roleError;

      toast({
        title: 'Success',
        description: `User "${userFormData.name}" updated successfully`,
      });

      setShowEditUserDialog(false);
      setSelectedUser(null);
      setUserFormData({ name: '', email: '', password: '', role: 'recruiter' });
      fetchCompanyUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user: CompanyUser) => {
    setLoading(true);
    try {
      // First remove from company
      const { error: companyError } = await supabase
        .from('company_users')
        .delete()
        .eq('id', user.id);

      if (companyError) throw companyError;

      // Check if user belongs to any other companies
      const { data: otherCompanies } = await supabase
        .from('company_users')
        .select('id')
        .eq('user_id', user.user_id);

      // If user doesn't belong to any other companies, delete the user entirely
      if (!otherCompanies || otherCompanies.length === 0) {
        const { error: deleteError } = await supabase.functions.invoke('admin-user-management', {
          body: {
            action: 'delete_user',
            userId: user.user_id,
          },
        });

        if (deleteError) throw deleteError;
      }

      toast({
        title: 'Success',
        description: `User "${user.profiles?.name}" removed successfully`,
      });

      fetchCompanyUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user: CompanyUser) => {
    setSelectedUser(user);
    setUserFormData({
      name: user.profiles?.name || '',
      email: user.email || '',
      password: '',
      role: user.role,
    });
    setShowEditUserDialog(true);
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
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{user.profiles?.name || 'Unknown User'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{user.role}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove "{user.profiles?.name}" from this company?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteUser(user)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Remove User
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No users found for this company</p>
          )}
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowAddUserDialog(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User to Company
          </Button>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add User to {company.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="add-name">Full Name</Label>
              <Input
                id="add-name"
                value={userFormData.name}
                onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>

            <div>
              <Label htmlFor="add-password">Password</Label>
              <Input
                id="add-password"
                type="password"
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                placeholder="Enter password"
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="add-role">Role</Label>
              <Select 
                value={userFormData.role} 
                onValueChange={(value: 'company_admin' | 'manager' | 'recruiter') => 
                  setUserFormData({ ...userFormData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company_admin">Company Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddUserDialog(false)} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddUser} 
                disabled={loading} 
                className="flex-1"
              >
                {loading ? 'Adding...' : 'Add User'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit User
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={userFormData.name}
                onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>

            <div>
              <Label htmlFor="edit-password">New Password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                placeholder="Leave blank to keep current password"
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select 
                value={userFormData.role} 
                onValueChange={(value: 'company_admin' | 'manager' | 'recruiter') => 
                  setUserFormData({ ...userFormData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company_admin">Company Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowEditUserDialog(false);
                  setSelectedUser(null);
                  setUserFormData({ name: '', email: '', password: '', role: 'recruiter' });
                }} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditUser} 
                disabled={loading} 
                className="flex-1"
              >
                {loading ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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