import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CompanyList } from "@/components/company/CompanyList";
import { useCompanyContext } from "@/contexts/CompanyContext";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Shield } from "lucide-react";

export default function PlatformAdmin() {
  const { isPlatformAdmin } = useCompanyContext();

  if (!isPlatformAdmin()) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You need platform admin privileges to access this page.
            </p>
          </CardContent>
        </Card>
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

        <CompanyList />
      </div>
    </DashboardLayout>
  );
}