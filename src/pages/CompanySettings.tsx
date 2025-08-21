import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CompanyManagement } from "@/components/company/CompanyManagement";
import { useCompanyContext } from "@/contexts/CompanyContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Users, Settings } from "lucide-react";

export default function CompanySettings() {
  const { isPlatformAdmin, canManageUsers } = useCompanyContext();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Company Settings</h1>
            <p className="text-muted-foreground">
              Manage your company information and settings
            </p>
          </div>
          {isPlatformAdmin() && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Company
            </Button>
          )}
        </div>

        <CompanyManagement />

        {canManageUsers() && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage users within your company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  User management functionality will be available here for company administrators.
                </p>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}