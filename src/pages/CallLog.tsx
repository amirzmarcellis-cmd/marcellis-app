// @ts-nocheck
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
import { Phone, Search, Eye, FileText, Clock } from "lucide-react"
import { Link } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { StatusDropdown } from "@/components/candidates/StatusDropdown"
import { formatDate } from "@/lib/utils"

interface CallLog {
  job_id: string | null
  Candidate_ID: string | null
  contacted: string | null
  transcript: string | null
  summary: string | null
  success_score: string | null
  score_and_reason: string | null
  candidate_name: string | null
  candidate_email: string | null
  candidate_phone_number: string | null
  pros: string | null
  cons: string | null
  notice_period: string | null
  salary_expectations: string | null
  agency_experience: string | null
  job_title: string | null
  two_questions_of_interview: string | null
  notes: string | null
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
    case "Contacted": return "default"  // Green
    case "Ready to Contact": return "secondary"  // Blue
    case "Not contacted": return "destructive"  // Red
    case "": return "outline"
    case null: return "outline"
    default: return "outline"  // Any unknown status gets outline
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
  const [editingNotes, setEditingNotes] = useState<{[key: string]: string}>({})
  const [savingNotes, setSavingNotes] = useState<{[key: string]: boolean}>({})

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
        .order('candidate_name', { ascending: true })

      if (callLogsError) throw callLogsError

      // Fetch Jobs data
      const { data: jobsData, error: jobsError } = await supabase
        .from('Jobs')
        .select('*')

      if (jobsError) throw jobsError

      // Match job titles with call logs
      const enrichedCallLogs = (callLogsData || []).map(log => {
        const job = (jobsData || []).find(j => j.job_id === log.job_id)
        return {
          ...log,
          job_title: job?.job_title || null
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

  const handleNotesChange = (logKey: string, notes: string) => {
    setEditingNotes(prev => ({ ...prev, [logKey]: notes }))
  }

  const saveNotes = async (log: CallLog) => {
    const logKey = `${log.Candidate_ID}-${log.job_id}`
    const notes = editingNotes[logKey] || log.notes || ""
    
    setSavingNotes(prev => ({ ...prev, [logKey]: true }))
    
    try {
      const { error } = await supabase
        .from('Jobs_CVs')
        .update({ notes: notes })
        .eq('Candidate_ID', log.Candidate_ID)
        .eq('job_id', log.job_id)

      if (error) throw error

      // Update local state
      setCallLogs(prev => prev.map(l => 
        l.Candidate_ID === log.Candidate_ID && l.job_id === log.job_id
          ? { ...l, notes: notes }
          : l
      ))

      // Clear editing state
      setEditingNotes(prev => {
        const { [logKey]: _, ...rest } = prev
        return rest
      })
    } catch (error) {
      console.error('Error saving notes:', error)
    } finally {
      setSavingNotes(prev => ({ ...prev, [logKey]: false }))
    }
  }

  const filteredCallLogs = callLogs.filter(log => {
    const matchesSearch = (log.candidate_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.candidate_email || "").toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesContacted = true
    if (contactedFilter !== "all") {
      const contacted = log.contacted || ""
      switch (contactedFilter) {
        case "not-contacted":
          matchesContacted = contacted === "Not Contacted" || !contacted
          break
        case "ready-to-call":
          matchesContacted = contacted === "Ready to Call"
          break
        case "contacted":
          matchesContacted = contacted === "Contacted"
          break
        case "call-done":
          matchesContacted = contacted === "Call Done"
          break
        case "rejected":
          matchesContacted = contacted === "Rejected"
          break
        case "shortlisted":
          matchesContacted = contacted === "Shortlisted"
          break
        case "tasked":
          matchesContacted = contacted === "Tasked"
          break
        case "interview":
          matchesContacted = contacted === "Interview"
          break
        case "hired":
          matchesContacted = contacted === "Hired"
          break
      }
    }
    const matchesScore = scoreFilter === "all" || 
                        (scoreFilter === "high" && parseInt(log.success_score || "0") >= 75) ||
                        (scoreFilter === "medium" && parseInt(log.success_score || "0") >= 50 && parseInt(log.success_score || "0") <= 74) ||
                        (scoreFilter === "low" && parseInt(log.success_score || "0") >= 1 && parseInt(log.success_score || "0") <= 49)
    const matchesJob = jobFilter === "all" || log.job_id === jobFilter
    
    // URL parameter filtering
    const matchesCandidate = !candidateParam || log.Candidate_ID === candidateParam
    const matchesJobParam = !jobParam || log.job_id === jobParam
    
    return matchesSearch && matchesContacted && matchesScore && matchesJob && matchesCandidate && matchesJobParam
  })

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Call Log</h1>
          <p className="text-muted-foreground">Track all recruitment calls and outcomes</p>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-card border-border dark:bg-gradient-card dark:backdrop-blur-glass">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search calls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-border"
              />
            </div>
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-[200px] bg-background/50 border-border">
                <SelectValue placeholder="Job" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job.job_id} value={job.job_id}>
                    {job.job_title || job.job_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={contactedFilter} onValueChange={setContactedFilter}>
              <SelectTrigger className="w-[150px] bg-background/50 border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not-contacted">Not Contacted</SelectItem>
                <SelectItem value="ready-to-call">Ready to Call</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="call-done">Call Done</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="tasked">Tasked</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="w-[150px] bg-background/50 border-border">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="high">+75</SelectItem>
                <SelectItem value="medium">50-74</SelectItem>
                <SelectItem value="low">1-49</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Call Log Table */}
        <Card className="bg-card border-border dark:bg-gradient-card dark:backdrop-blur-glass shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Call History ({filteredCallLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="w-[200px]">Candidate</TableHead>
                    <TableHead className="w-[150px]">Job</TableHead>
                    <TableHead className="w-[120px]">Contacted</TableHead>
                    <TableHead className="w-[100px]">Score</TableHead>
                    <TableHead className="w-[120px]">Notice Period</TableHead>
                    <TableHead className="w-[140px]">Salary Expectations</TableHead>
                    <TableHead className="w-[200px] text-right">Actions</TableHead>
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
                    const initials = (log.candidate_name || "")
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                    
                      return (
                        <TableRow key={index} className="border-border hover:bg-glass-primary transition-colors">
                          <TableCell className="max-w-[200px]">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarFallback className="bg-gradient-primary text-white text-sm">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate">{log.candidate_name || "N/A"}</div>
                                <div className="text-sm text-muted-foreground truncate">{log.candidate_email || "N/A"}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[150px]">
                            <div className="min-w-0">
                              <div className="font-medium truncate">{log.job_title || "N/A"}</div>
                              <Badge variant="outline" className="font-mono text-xs mt-1">
                                {(log.job_id || "N/A").substring(0, 8)}...
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[120px]">
                            <StatusDropdown
                              currentStatus={log.contacted}
                              candidateId={log.Candidate_ID || ""}
                              jobId={log.job_id}
                              statusType="contacted"
                              onStatusChange={(newStatus) => {
                                setCallLogs(prev => prev.map(l => 
                                  l.Candidate_ID === log.Candidate_ID && l.job_id === log.job_id
                                    ? { ...l, contacted: newStatus }
                                    : l
                                ))
                              }}
                            />
                          </TableCell>
                          <TableCell className="max-w-[100px]">
                            <Badge variant={getScoreBadgeVariant(log.success_score)} className="whitespace-nowrap">
                              {log.success_score ? `${log.success_score}/100` : "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[120px]">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{log.notice_period || "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[140px]">
                            <span className="truncate">{log.salary_expectations || "N/A"}</span>
                          </TableCell>
                          <TableCell className="text-right max-w-[200px]">
                            <div className="flex justify-end space-x-1">
                              <Button variant="outline" size="sm" asChild className="h-8 px-2">
                                <Link to={`/call-log-details?candidate=${log.Candidate_ID || (log as any)["candidate_id"]}&job=${log.job_id || (log as any)["job_id"]}&callid=${(log as any).callid}`}> 
                                  <FileText className="w-3 h-3" />
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild className="h-8 px-2">
                                <Link to={`/candidate/${log.Candidate_ID}`}>
                                  <Eye className="w-3 h-3" />
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
            </div>
          </CardContent>
        </Card>
      </div>
  )
}