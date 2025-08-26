import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export default function CompanySettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Company Settings</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>MARC Ellis Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Company settings for the simplified structure.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}