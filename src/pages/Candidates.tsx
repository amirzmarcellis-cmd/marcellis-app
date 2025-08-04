import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, MapPin, Briefcase, Mail, Phone } from "lucide-react"

const candidates = [
  {
    id: "1",
    name: "Sarah Chen",
    position: "Senior Developer",
    location: "San Francisco, CA", 
    status: "interviewed",
    experience: "5+ years",
    email: "sarah.chen@email.com",
    phone: "+1 (555) 123-4567"
  },
  {
    id: "2",
    name: "Mike Johnson", 
    position: "Product Manager",
    location: "New York, NY",
    status: "contacted",
    experience: "3+ years", 
    email: "mike.johnson@email.com",
    phone: "+1 (555) 987-6543"
  },
  {
    id: "3",
    name: "Emily Davis",
    position: "UI/UX Designer",
    location: "Austin, TX",
    status: "screening",
    experience: "4+ years",
    email: "emily.davis@email.com", 
    phone: "+1 (555) 456-7890"
  }
]

export default function Candidates() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Candidates</h1>
          <p className="text-muted-foreground">Manage your recruitment pipeline</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Candidates</TabsTrigger>
            <TabsTrigger value="contacted">Contacted</TabsTrigger>
            <TabsTrigger value="screening">Screening</TabsTrigger>
            <TabsTrigger value="interviewed">Interviewed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {candidates.map((candidate) => (
                <Card key={candidate.id} className="hover:shadow-medium transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{candidate.name}</CardTitle>
                        <CardDescription className="flex items-center space-x-2">
                          <Briefcase className="w-4 h-4" />
                          <span>{candidate.position}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={candidate.status === "interviewed" ? "default" : "secondary"}>
                      {candidate.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{candidate.location}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{candidate.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{candidate.phone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">View Profile</Button>
                        <Button size="sm">Schedule Call</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contacted">
            <div className="text-center py-8 text-muted-foreground">
              Filter implementation coming soon
            </div>
          </TabsContent>

          <TabsContent value="screening">
            <div className="text-center py-8 text-muted-foreground">
              Filter implementation coming soon
            </div>
          </TabsContent>

          <TabsContent value="interviewed">
            <div className="text-center py-8 text-muted-foreground">
              Filter implementation coming soon
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}