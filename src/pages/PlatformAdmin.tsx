import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Building2 } from 'lucide-react';

export default function PlatformAdmin() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Platform Administration</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Admin panel for the simplified MARC Ellis system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}