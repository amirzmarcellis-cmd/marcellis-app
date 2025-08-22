import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CompanyManagement } from "@/components/company/CompanyManagement";
import { useCompanyContext } from "@/contexts/CompanyContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Users, Settings } from "lucide-react";

export default function CompanySettings() {
  const { isPlatformAdmin, canManageUsers } = useCompanyContext();

  // Only allow platform admins to access company settings
  if (!isPlatformAdmin()) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to access Company Settings.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Platform Administration</h1>
            <p className="text-muted-foreground">
              Manage all companies and platform-wide settings
            </p>
          </div>
        </div>

        <CompanyManagement />
      </div>
    </DashboardLayout>
  );
}