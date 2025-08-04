import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Briefcase, MapPin, DollarSign, Search, Plus, Eye, Edit } from "lucide-react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface Job {
  "Job ID": string
  "Job Title": string | null
  "Job Description": string | null
  "Client Description": string | null
  "Job Location": string | null
  "Job Salary Range (ex: 15000 AED)": string | null
  "Processed": string | null
  "Things to look for": string | null
  "JD Summary": string | null
  "Criteria to evaluate by": string | null
  "Timestamp": string | null
}

interface JobFormData {
  title: string
  description: string
  clientDescription: string
  location: string
  salaryRange: string
  thingsToLookFor: string
  criteriaToEvaluate: string
}

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<JobFormData>({
    defaultValues: {
      title: "",
      description: "",
      clientDescription: "",
      location: "",
      salaryRange: "",
      thingsToLookFor: "",
      criteriaToEvaluate: ""
    }
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('Jobs')
        .select('*')
        .order('Timestamp', { ascending: false })

      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: JobFormData) => {
    try {
      const jobData = {
        "Job ID": `JOB_${Date.now()}`,
        "Job Title": data.title,
        "Job Description": data.description,
        "Client Description": data.clientDescription,
        "Job Location": data.location,
        "Job Salary Range (ex: 15000 AED)": data.salaryRange,
        "Things to look for": data.thingsToLookFor,
        "Criteria to evaluate by": data.criteriaToEvaluate,
        "Processed": "No",
        "Timestamp": new Date().toISOString()
      }

      const { error } = await supabase
        .from('Jobs')
        .insert([jobData])

      if (error) throw error

      toast({
        title: "Success",
        description: "Job created successfully"
      })

      form.reset()
      setIsDialogOpen(false)
      fetchJobs()
    } catch (error) {
      console.error('Error creating job:', error)
      toast({
        title: "Error",
        description: "Failed to create job",
        variant: "destructive"
      })
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (job["Job Title"] || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (job["Job Description"] || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (job["Client Description"] || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = locationFilter === "all" || (job["Job Location"] || "").includes(locationFilter)
    
    return matchesSearch && matchesLocation
  })

  const uniqueLocations = [...new Set(jobs.map(j => j["Job Location"]).filter(Boolean))]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Jobs</h1>
            <p className="text-muted-foreground">Manage job postings and requirements</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:bg-gradient-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-gradient-card backdrop-blur-glass border-glass-border">
              <DialogHeader>
                <DialogTitle>Create New Job</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter job title" {...field} className="bg-background/50 border-glass-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter job location" {...field} className="bg-background/50 border-glass-border" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="salaryRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary Range</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 15000 AED" {...field} className="bg-background/50 border-glass-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter job description" rows={4} {...field} className="bg-background/50 border-glass-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clientDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter client description" rows={3} {...field} className="bg-background/50 border-glass-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="thingsToLookFor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Things to Look For</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Key requirements and qualifications" rows={3} {...field} className="bg-background/50 border-glass-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="criteriaToEvaluate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Criteria to Evaluate By</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Evaluation criteria for candidates" rows={3} {...field} className="bg-background/50 border-glass-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-primary hover:bg-gradient-primary/90">
                      Create Job
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-gradient-card backdrop-blur-glass border-glass-border">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-glass-border"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[180px] bg-background/50 border-glass-border">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Jobs Table */}
        <Card className="bg-gradient-card backdrop-blur-glass border-glass-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Jobs ({filteredJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-glass-border">
                  <TableHead>Job Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Salary Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading jobs...
                    </TableCell>
                  </TableRow>
                ) : filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No jobs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job) => (
                    <TableRow key={job["Job ID"]} className="border-glass-border hover:bg-glass-primary transition-colors">
                      <TableCell>
                        <div>
                          <div className="font-medium">{job["Job Title"] || "N/A"}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {job["JD Summary"] || job["Job Description"]?.substring(0, 100) + "..." || "No description"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{job["Job Location"] || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>{job["Job Salary Range (ex: 15000 AED)"] || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={job.Processed === "Yes" ? "default" : "secondary"}>
                          {job.Processed === "Yes" ? "Processed" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {job.Timestamp ? new Date(job.Timestamp).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl bg-gradient-card backdrop-blur-glass border-glass-border">
                              <DialogHeader>
                                <DialogTitle>{job["Job Title"]}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-semibold mb-2">Job Details</h3>
                                    <p><strong>Location:</strong> {job["Job Location"] || "N/A"}</p>
                                    <p><strong>Salary:</strong> {job["Job Salary Range (ex: 15000 AED)"] || "N/A"}</p>
                                    <p><strong>Status:</strong> {job.Processed || "Pending"}</p>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold mb-2">Client Information</h3>
                                    <p className="text-sm text-muted-foreground">
                                      {job["Client Description"] || "No client description available"}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-semibold mb-2">Job Description</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {job["Job Description"] || "No job description available"}
                                  </p>
                                </div>
                                {job["Things to look for"] && (
                                  <div>
                                    <h3 className="font-semibold mb-2">Requirements</h3>
                                    <p className="text-sm text-muted-foreground">{job["Things to look for"]}</p>
                                  </div>
                                )}
                                {job["Criteria to evaluate by"] && (
                                  <div>
                                    <h3 className="font-semibold mb-2">Evaluation Criteria</h3>
                                    <p className="text-sm text-muted-foreground">{job["Criteria to evaluate by"]}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}