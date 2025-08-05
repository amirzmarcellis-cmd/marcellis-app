import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Phone, Search, Eye, Calendar, Clock, User, FileText } from "lucide-react"
import { Link } from "react-router-dom"
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
  "2 Questions of Interview": string | null
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
  if (numScore >= 75) return "default"  // Green
  if (numScore >= 50) return "secondary"  // Blue
  if (numScore >= 1) return "destructive"  // Red
  return "secondary"
}

const getContactedBadgeVariant = (contacted: string | null) => {
  switch (contacted) {
    case "Call Done": return "default"  // Green
    case "Ready to Contact": return "secondary"  // Blue
    case "Not contacted": return "destructive"  // Red
    case "Unknown": return "outline"
    case "": return "outline"
    case null: return "outline"
    default: return "default"  // Any other contacted status gets green
  }
}

export default function CallLog() {
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [contactedFilter, setContactedFilter] = useState("all")
  const [scoreFilter, setScoreFilter] = useState("all")
  const [jobFilter, setJobFilter] = useState("all")
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const candidateParam = searchParams.get('candidate')
  const jobParam = searchParams.get('job')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch Jobs_CVs data
      const { data: callLogsData, error: callLogsError } = await supabase
        .from('Jobs_CVs')
        .select('*')
        .order('"Candidate Name"', { ascending: true })

      if (callLogsError) throw callLogsError

      // Fetch Jobs data
      const { data: jobsData, error: jobsError } = await supabase
        .from('Jobs')
        .select('*')

      if (jobsError) throw jobsError

      // Match job titles with call logs
      const enrichedCallLogs = (callLogsData || []).map(log => {
        const job = (jobsData || []).find(j => j["Job ID"] === log["Job ID"])
        return {
          ...log,
          "Job Title": job?.["Job Title"] || null
        }
      })

      setCallLogs(enrichedCallLogs)
      setJobs(jobsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCallLogs = callLogs.filter(log => {
    const matchesSearch = (log["Candidate Name"] || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log["Candidate Email"] || "").toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesContacted = true
    if (contactedFilter !== "all") {
      const contacted = log.Contacted || ""
      switch (contactedFilter) {
        case "contacted":
          matchesContacted = contacted && contacted !== "Not contacted" && contacted !== "Ready to Contact"
          break
        case "ready-to-contact":
          matchesContacted = contacted === "Ready to Contact"
          break
        case "not-contacted":
          matchesContacted = !contacted || contacted === "Not contacted"
          break
        case "call-done":
          matchesContacted = contacted === "Call Done"
          break
        case "unknown":
          matchesContacted = !contacted || contacted === "Unknown" || contacted === ""
          break
        default:
          matchesContacted = contacted === contactedFilter
      }
    }
    const matchesScore = scoreFilter === "all" || 
                        (scoreFilter === "high" && parseInt(log["Success Score"] || "0") > 75) ||
                        (scoreFilter === "medium" && parseInt(log["Success Score"] || "0") >= 50 && parseInt(log["Success Score"] || "0") <= 75) ||
                        (scoreFilter === "low" && parseInt(log["Success Score"] || "0") >= 1 && parseInt(log["Success Score"] || "0") <= 49)
    const matchesJob = jobFilter === "all" || log["Job ID"] === jobFilter
    
    // URL parameter filtering
    const matchesCandidate = !candidateParam || log["Candidate_ID"] === candidateParam
    const matchesJobParam = !jobParam || log["Job ID"] === jobParam
    
    return matchesSearch && matchesContacted && matchesScore && matchesJob && matchesCandidate && matchesJobParam
  })

  return (
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
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-[200px] bg-background/50 border-glass-border">
                <SelectValue placeholder="Job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job["Job ID"]} value={job["Job ID"]}>
                    {job["Job Title"] || job["Job ID"]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={contactedFilter} onValueChange={setContactedFilter}>
              <SelectTrigger className="w-[150px] bg-background/50 border-glass-border">
                <SelectValue placeholder="Contacted" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contacted</SelectItem>
                <SelectItem value="ready-to-contact">Ready to Contact</SelectItem>
                <SelectItem value="call-done">Call Done</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="not-contacted">Not Contacted</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="w-[150px] bg-background/50 border-glass-border">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="high">+75</SelectItem>
                <SelectItem value="medium">50-75</SelectItem>
                <SelectItem value="low">1-49</SelectItem>
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
                          <div className="flex justify-end space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <FileText className="w-4 h-4 mr-1" />
                                  See Call Log
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Call Log Details - {log["Candidate Name"]}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6">
                                  {/* Success Score Progress Bar */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h3 className="text-lg font-semibold">Success Score</h3>
                                      <span className="text-sm font-medium">{log["Success Score"] || "0"}/100</span>
                                    </div>
                                    <Progress 
                                      value={parseInt(log["Success Score"] || "0")} 
                                      className="h-3"
                                    />
                                    {log["Score and Reason"] && (
                                      <div className="mt-2">
                                        <h4 className="font-medium text-sm mb-1">Score Reason:</h4>
                                        <p className="text-sm text-muted-foreground">{log["Score and Reason"]}</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Interview Questions */}
                                  {log["2 Questions of Interview"] && (
                                    <div className="space-y-2">
                                      <h3 className="text-lg font-semibold">Interview Questions</h3>
                                      <div className="bg-muted/30 p-4 rounded-lg">
                                        <p className="text-sm whitespace-pre-wrap">{log["2 Questions of Interview"]}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Summary */}
                                  {log["Summary"] && (
                                    <div className="space-y-2">
                                      <h3 className="text-lg font-semibold">Call Summary</h3>
                                      <div className="bg-muted/30 p-4 rounded-lg">
                                        <p className="text-sm whitespace-pre-wrap">{log["Summary"]}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Transcript */}
                                  {log["Transcript"] && (
                                    <div className="space-y-2">
                                      <h3 className="text-lg font-semibold">Call Transcript</h3>
                                      <div className="bg-muted/30 p-4 rounded-lg max-h-60 overflow-y-auto">
                                        <p className="text-sm whitespace-pre-wrap">{log["Transcript"]}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Additional Details */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <h4 className="font-medium">Pros</h4>
                                      <p className="text-sm text-muted-foreground">{log["pros"] || "N/A"}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <h4 className="font-medium">Cons</h4>
                                      <p className="text-sm text-muted-foreground">{log["cons"] || "N/A"}</p>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/candidate/${log["Candidate_ID"]}`}>
                                <Eye className="w-4 h-4 mr-1" />
                                View Candidate
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/job/${log["Job ID"]}`}>
                                View Job
                              </Link>
                            </Button>
                          </div>
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
  )
}