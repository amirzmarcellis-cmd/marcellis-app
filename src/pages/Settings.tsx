import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings2, Bell, Phone, Shield, Database } from "lucide-react"

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure your AI caller system preferences</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="calling">Calling</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic configuration for your AI caller system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" placeholder="Your Company Name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" placeholder="UTC-08:00 (PST)" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-script">Default Call Script</Label>
                  <Textarea id="default-script" placeholder="Enter your default AI caller script..." rows={4} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calling" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Calling Configuration</CardTitle>
                <CardDescription>Configure AI caller behavior and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-retry failed calls</Label>
                    <p className="text-sm text-muted-foreground">Automatically retry calls that fail to connect</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Voice modulation</Label>
                    <p className="text-sm text-muted-foreground">Enable natural voice variations</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="call-hours">Calling Hours</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="9:00 AM" />
                    <Input placeholder="6:00 PM" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose when and how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Call completion alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when calls are completed</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily performance summary</Label>
                    <p className="text-sm text-muted-foreground">Receive daily performance reports</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified of system issues</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage security and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-factor authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Call recording encryption</Label>
                    <p className="text-sm text-muted-foreground">Encrypt all call recordings</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data-retention">Data Retention Period</Label>
                  <Input id="data-retention" placeholder="90 days" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Integrations</CardTitle>
                <CardDescription>Connect with external systems and services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Database className="w-8 h-8 text-primary" />
                    <div>
                      <h4 className="font-medium">CRM Integration</h4>
                      <p className="text-sm text-muted-foreground">Connect to your CRM system</p>
                    </div>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-8 h-8 text-primary" />
                    <div>
                      <h4 className="font-medium">VoIP Provider</h4>
                      <p className="text-sm text-muted-foreground">Configure calling infrastructure</p>
                    </div>
                  </div>
                  <Button variant="outline">Setup</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-8 h-8 text-primary" />
                    <div>
                      <h4 className="font-medium">Slack Notifications</h4>
                      <p className="text-sm text-muted-foreground">Get updates in Slack</p>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}