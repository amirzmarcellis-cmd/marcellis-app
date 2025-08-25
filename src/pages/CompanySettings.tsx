import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Users, Settings } from "lucide-react";

export default function CompanySettings() {
  const { isAdmin } = useProfile();

  // Only allow admins to access company settings
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to access Admin Settings.</p>
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
            <h1 className="text-3xl font-bold">Administration</h1>
            <p className="text-muted-foreground">
              Manage system settings and user accounts
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Admin Panel
            </CardTitle>
            <CardDescription>
              Access administrative functions and system management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              As an administrator, you have access to all system functions and can manage user accounts.
            </p>
            <Button 
              onClick={() => window.location.href = '/users-panel'} 
              className="bg-gradient-primary hover:bg-gradient-primary/90"
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}