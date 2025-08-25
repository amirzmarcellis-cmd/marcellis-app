import { useState } from 'react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings, Shield, UserCheck } from "lucide-react";
import { useProfile } from '@/hooks/useProfile';

export default function UsersPanel() {
  const { isAdmin } = useProfile();
  const [loading, setLoading] = useState(false);

  // Mock user data
  const mockUsers = [
    {
      id: 1,
      name: "Amir Z",
      email: "amir.z@marc-ellis.com",
      role: "Admin",
      status: "Active",
      joinedAt: "2024-01-01"
    },
    {
      id: 2,
      name: "John Doe",
      email: "john.doe@marc-ellis.com", 
      role: "Recruiter",
      status: "Active",
      joinedAt: "2024-01-10"
    },
    {
      id: 3,
      name: "Jane Smith",
      email: "jane.smith@marc-ellis.com",
      role: "Manager",
      status: "Active", 
      joinedAt: "2024-01-15"
    }
  ];

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to access User Management.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage user accounts and permissions</p>
          </div>
          <Button>
            <Users className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border bg-secondary/30">
                  <div className="space-y-1">
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Joined: {user.joinedAt}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                      {user.role}
                    </span>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}