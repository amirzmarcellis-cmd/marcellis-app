import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Phone, Search, Eye, Calendar, Clock, User, FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

interface CallLog {
  "Job ID": string | null
  "Candidate_ID": string | null
  "Contacted": string | null
  "Transcript": string | null
  "Summary": string | null
  "Success Score": string | null
  "Score and Reason": string | null
  "Candidate Name": string | null
  "Candidate Email": string | null
  "Candidate Phone Number": string | null
  "pros": string | null
  "cons": string | null
  "Notice Period": string | null
  "Salary Expectations": string | null
  "Agency Experience": string | null
  "Job Title": string | null
}

const formatPhoneNumber = (phone: string | null) => {
  if (!phone) return "N/A"
  // Handle scientific notation and convert to proper phone format
  const numericString = parseFloat(phone).toString()
  return numericString.length > 10 ? numericString : phone
}

const getScoreBadgeVariant = (score: string | null) => {
  if (!score) return "secondary"
  const numScore = parseInt(score)
  if (numScore >= 80) return "default"
  if (numScore >= 60) return "secondary"
  return "destructive"
}

const getContactedBadgeVariant = (contacted: string | null) => {
  switch (contacted?.toLowerCase()) {
    case "yes": return "default"
    case "no": return "destructive"
    case "pending": return "secondary"
    default: return "outline"
  }
}

export default function CallLog() {
  const [searchTerm, setSearchTerm] = useState("")
  const [contactedFilter, setContactedFilter] = useState("all")
  const [scoreFilter, setScoreFilter] = useState("all")
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCallLogs()
  }, [])

  const fetchCallLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('Jobs_CVs')
        .select(`
          *,
          Jobs!inner("Job Title")
        `)
        .order('"Candidate Name"', { ascending: true })

      if (error) throw error
      
      // Transform data to include job title
      const transformedData = (data || []).map(item => ({
        ...item,
        "Job Title": item.Jobs?.["Job Title"] || null
      }))
      
      setCallLogs(transformedData)
    } catch (error) {
      console.error('Error fetching call logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCallLogs = callLogs.filter(log => {
    const matchesSearch = (log["Candidate Name"] || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log["Candidate Email"] || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log["Job ID"] || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log["Job Title"] || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesContacted = contactedFilter === "all" || (log.Contacted || "").toLowerCase() === contactedFilter
    const matchesScore = scoreFilter === "all" || 
                        (scoreFilter === "high" && parseInt(log["Success Score"] || "0") >= 80) ||
                        (scoreFilter === "medium" && parseInt(log["Success Score"] || "0") >= 60 && parseInt(log["Success Score"] || "0") < 80) ||
                        (scoreFilter === "low" && parseInt(log["Success Score"] || "0") < 60)
    
    return matchesSearch && matchesContacted && matchesScore
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Call Log</h1>
          <p className="text-muted-foreground">Track all recruitment calls and outcomes</p>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-gradient-card backdrop-blur-glass border-glass-border">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search calls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-glass-border"
              />
            </div>
            <Select value={contactedFilter} onValueChange={setContactedFilter}>
              <SelectTrigger className="w-[150px] bg-background/50 border-glass-border">
                <SelectValue placeholder="Contacted" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="yes">Contacted</SelectItem>
                <SelectItem value="no">Not Contacted</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="w-[150px] bg-background/50 border-glass-border">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="high">High (80-100)</SelectItem>
                <SelectItem value="medium">Medium (60-79)</SelectItem>
                <SelectItem value="low">Low (0-59)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Call Log Table */}
        <Card className="bg-gradient-card backdrop-blur-glass border-glass-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Call History ({filteredCallLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-glass-border">
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Contacted</TableHead>
                  <TableHead>Success Score</TableHead>
                  <TableHead>Notice Period</TableHead>
                  <TableHead>Salary Expectations</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading call logs...
                    </TableCell>
                  </TableRow>
                ) : filteredCallLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No call logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCallLogs.map((log, index) => {
                    const initials = (log["Candidate Name"] || "")
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                    
                    return (
                      <TableRow key={index} className="border-glass-border hover:bg-glass-primary transition-colors">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-gradient-primary text-white">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{log["Candidate Name"] || "N/A"}</div>
                              <div className="text-sm text-muted-foreground">{log["Candidate Email"] || "N/A"}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log["Job Title"] || "N/A"}</div>
                            <Badge variant="outline" className="font-mono text-xs">
                              {log["Job ID"] || "N/A"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getContactedBadgeVariant(log.Contacted)} className="capitalize">
                            {log.Contacted || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getScoreBadgeVariant(log["Success Score"])}>
                            {log["Success Score"] ? `${log["Success Score"]}/100` : "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{log["Notice Period"] || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span>{log["Salary Expectations"] || "N/A"}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-card backdrop-blur-glass border-glass-border">
                              <DialogHeader>
                                <DialogTitle className="flex items-center space-x-3">
                                  <Avatar className="w-12 h-12">
                                    <AvatarFallback className="bg-gradient-primary text-white">
                                      {initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h2 className="text-xl font-bold">{log["Candidate Name"]}</h2>
                                    <p className="text-muted-foreground">Call Details - {log["Job Title"]} ({log["Job ID"]})</p>
                                  </div>
                                </DialogTitle>
                              </DialogHeader>
                              
                              <ScrollArea className="max-h-[70vh] pr-4">
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <h3 className="font-semibold flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Contact Information
                                      </h3>
                                      <div className="space-y-2">
                                        <p><strong>Email:</strong> {log["Candidate Email"] || "N/A"}</p>
                                        <p><strong>Phone:</strong> {formatPhoneNumber(log["Candidate Phone Number"])}</p>
                                        <p><strong>Job ID:</strong> {log["Job ID"] || "N/A"}</p>
                                        <p><strong>Job Title:</strong> {log["Job Title"] || "N/A"}</p>
                                        <p><strong>Contacted:</strong> 
                                          <Badge variant={getContactedBadgeVariant(log.Contacted)} className="ml-2 capitalize">
                                            {log.Contacted || "Unknown"}
                                          </Badge>
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                      <h3 className="font-semibold flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Performance Metrics
                                      </h3>
                                      <div className="space-y-2">
                                        <p><strong>Success Score:</strong> 
                                          <Badge variant={getScoreBadgeVariant(log["Success Score"])} className="ml-2">
                                            {log["Success Score"] ? `${log["Success Score"]}/100` : "N/A"}
                                          </Badge>
                                        </p>
                                        <p><strong>Notice Period:</strong> {log["Notice Period"] || "N/A"}</p>
                                        <p><strong>Salary Expectations:</strong> {log["Salary Expectations"] || "N/A"}</p>
                                        <p><strong>Agency Experience:</strong> {log["Agency Experience"] || "N/A"}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {log["Score and Reason"] && (
                                    <div className="space-y-2">
                                      <h3 className="font-semibold">Score Reasoning</h3>
                                      <div className="max-h-32 overflow-y-auto">
                                        <p className="text-sm text-muted-foreground p-3 bg-background/50 rounded-lg border border-glass-border">
                                          {log["Score and Reason"]}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-2 gap-6">
                                    {log.pros && (
                                      <div className="space-y-2">
                                        <h3 className="font-semibold text-green-600">Pros</h3>
                                        <div className="max-h-32 overflow-y-auto">
                                          <p className="text-sm text-muted-foreground p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                            {log.pros}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {log.cons && (
                                      <div className="space-y-2">
                                        <h3 className="font-semibold text-red-600">Cons</h3>
                                        <div className="max-h-32 overflow-y-auto">
                                          <p className="text-sm text-muted-foreground p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                            {log.cons}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {log.Summary && (
                                    <div className="space-y-2">
                                      <h3 className="font-semibold flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Call Summary
                                      </h3>
                                      <div className="max-h-40 overflow-y-auto">
                                        <p className="text-sm text-muted-foreground p-3 bg-background/50 rounded-lg border border-glass-border">
                                          {log.Summary}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {log.Transcript && (
                                    <div className="space-y-2">
                                      <h3 className="font-semibold flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        Call Transcript
                                      </h3>
                                      <ScrollArea className="max-h-60 p-3 bg-background/50 rounded-lg border border-glass-border">
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                          {log.Transcript}
                                        </p>
                                      </ScrollArea>
                                    </div>
                                  )}
                                </div>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}