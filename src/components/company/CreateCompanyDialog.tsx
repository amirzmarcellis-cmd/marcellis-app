import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building2, User, Mail, Lock } from 'lucide-react';

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyCreated: () => void;
}

export function CreateCompanyDialog({ open, onOpenChange, onCompanyCreated }: CreateCompanyDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    subdomain: '',
    planType: 'trial',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create the company first
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: formData.companyName,
          subdomain: formData.subdomain,
          plan_type: formData.planType,
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Create the admin user using the edge function
      const { data: adminResult, error: adminError } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'create_user',
          userData: {
            email: formData.adminEmail,
            password: formData.adminPassword,
            name: formData.adminName,
          },
        },
      });

      if (adminError) {
        // If user already exists, that's okay - we can still assign them to the company
        if (adminError.message?.includes('email address has already been registered')) {
          // Get existing user by querying profiles with the email domain pattern
          // Since we can't directly query auth.users, we'll need to handle this differently
          toast({
            title: 'User Already Exists',
            description: 'A user with this email already exists. Please use a different email or contact support to assign an existing user to this company.',
            variant: 'destructive',
          });
          return;
        }
        throw adminError;
      }

      if (!adminResult.user?.user) {
        throw new Error('Failed to create admin user');
      }

      // Assign company admin role to the new user
      const { error: roleError } = await supabase
        .from('company_users')
        .insert({
          user_id: adminResult.user.user.id,
          company_id: company.id,
          role: 'company_admin',
          joined_at: new Date().toISOString(),
        });

      if (roleError) throw roleError;

      toast({
        title: 'Success',
        description: `Company "${formData.companyName}" created successfully with admin user`,
      });

      // Reset form
      setFormData({
        companyName: '',
        subdomain: '',
        planType: 'trial',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
      });

      onCompanyCreated();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create company',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create New Company
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Information */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Company Details
            </h4>
            
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Enter company name"
                required
              />
            </div>

            <div>
              <Label htmlFor="subdomain">Subdomain</Label>
              <Input
                id="subdomain"
                value={formData.subdomain}
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                placeholder="company-subdomain"
                required
              />
            </div>

            <div>
              <Label htmlFor="planType">Plan Type</Label>
              <Select value={formData.planType} onValueChange={(value) => setFormData({ ...formData, planType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Admin User Information */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Company Administrator
            </h4>

            <div>
              <Label htmlFor="adminName">Admin Name</Label>
              <Input
                id="adminName"
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                placeholder="Enter admin name"
                required
              />
            </div>

            <div>
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={formData.adminEmail}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                placeholder="admin@company.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="adminPassword">Admin Password</Label>
              <Input
                id="adminPassword"
                type="password"
                value={formData.adminPassword}
                onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                placeholder="Enter password"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Company'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}