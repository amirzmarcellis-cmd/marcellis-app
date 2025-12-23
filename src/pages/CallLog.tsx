// @ts-nocheck
import { useEffect, useState } from "react"
import { useSearchParams, useNavigate, useLocation } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Phone, Search, Eye, FileText, Clock, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { StatusDropdown } from "@/components/candidates/StatusDropdown"
import { formatDate } from "@/lib/utils"


interface CallLog {
  recordid: number
  job_id: string | null
  user_id: number | null
  recruiter_id: number | null
  contacted: string | null
  transcript: string | null
  cv_score: number | null
  cv_score_reason: string | null
  after_call_score: number | null
  linkedin_score: number | null
  source: string | null
  after_call_reason: string | null
  candidate_name: string | null
  candidate_email: string | null
  candidate_phone_number: string | null
  after_call_pros: string | null
  after_call_cons: string | null
  notice_period: string | null
  salary_expectations: string | null
  current_salary: number | null
  two_questions_of_interview: string | null
  notes: string | null
  callcount: number | null
  lastcalltime: string | null
  duration: string | null
  recording: string | null
  longlisted_at: string | null
  shortlisted_at: string | null
  notes_updated_by: string | null
  notes_updated_at: string | null
  nationality: string | null
}

// Normalize nationality to handle variations
const normalizeNationality = (nationality: string | null): string => {
  if (!nationality) return "";
  const normalized = nationality.toLowerCase().trim();
  
  // Map common variations to standard forms
  const mappings: { [key: string]: string } = {
    "egyptian": "egypt",
    "egyptians": "egypt",
    "british": "uk",
    "english": "uk",
    "scottish": "uk",
    "welsh": "uk",
    "american": "usa",
    "americans": "usa",
    "emirati": "uae",
    "emiratis": "uae",
    "saudi": "saudi arabia",
    "saudis": "saudi arabia",
    "lebanese": "lebanon",
    "jordanian": "jordan",
    "jordanians": "jordan",
    "syrian": "syria",
    "syrians": "syria",
    "iraqi": "iraq",
    "iraqis": "iraq",
    "yemeni": "yemen",
    "yemenis": "yemen",
    "kuwaiti": "kuwait",
    "kuwaitis": "kuwait",
    "qatari": "qatar",
    "qataris": "qatar",
    "bahraini": "bahrain",
    "bahrainis": "bahrain",
    "omani": "oman",
    "omanis": "oman",
    "moroccan": "morocco",
    "moroccans": "morocco",
    "tunisian": "tunisia",
    "tunisians": "tunisia",
    "algerian": "algeria",
    "algerians": "algeria",
    "libyan": "libya",
    "libyans": "libya",
    "sudanese": "sudan",
    "palestinian": "palestine",
    "palestinians": "palestine",
    "indian": "india",
    "indians": "india",
    "pakistani": "pakistan",
    "pakistanis": "pakistan",
    "bangladeshi": "bangladesh",
    "bangladeshis": "bangladesh",
    "filipino": "philippines",
    "filipinos": "philippines",
    "chinese": "china",
    "japanese": "japan",
    "korean": "korea",
    "koreans": "korea",
    "french": "france",
    "german": "germany",
    "germans": "germany",
    "italian": "italy",
    "italians": "italy",
    "spanish": "spain",
    "dutch": "netherlands",
    "turkish": "turkey",
    "turks": "turkey",
    "iranian": "iran",
    "iranians": "iran",
    "afghan": "afghanistan",
    "afghans": "afghanistan",
  };
  
  return mappings[normalized] || normalized;
};

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
  const navigate = useNavigate();
  const location = useLocation();
  const fromCandidate = location.state?.fromCandidate;
  const candidateName = location.state?.candidateName;
  const fromJob = location.state?.fromJob;
  const fromTab = location.state?.fromTab;
  const longListSourceFilter = location.state?.longListSourceFilter;
  
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [contactedFilter, setContactedFilter] = useState("all")
  const [scoreFilter, setScoreFilter] = useState("all")
  const [jobFilter, setJobFilter] = useState("all")
  const [nationalityFilter, setNationalityFilter] = useState("all")
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [nationalities, setNationalities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [editingNotes, setEditingNotes] = useState<{[key: string]: string}>({})
  const [savingNotes, setSavingNotes] = useState<{[key: string]: boolean}>({})

  const candidateParam = searchParams.get('candidate')
  const jobParam = searchParams.get('job')

  useEffect(() => {
    fetchData();
  }, [candidateParam, jobParam]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Build the call logs query
      let callLogsQuery = supabase
        .from('Jobs_CVs')
        .select('recordid, job_id, user_id, recruiter_id, contacted, transcript, cv_score, after_call_score, linkedin_score, source, candidate_name, candidate_email, candidate_phone_number, notice_period, salary_expectations, current_salary, notes, callcount, lastcalltime, duration, recording, longlisted_at, shortlisted_at, nationality')
        .not('callcount', 'is', null)
        .gt('callcount', 0);
      
      // Apply filters at database level when URL params are present
      if (candidateParam) {
        callLogsQuery = callLogsQuery.eq('user_id', candidateParam);
      }
      if (jobParam) {
        callLogsQuery = callLogsQuery.eq('job_id', jobParam);
      }
      
      callLogsQuery = callLogsQuery.order('recordid', { ascending: false });
      
      // Only apply limit when not filtering by specific candidate or job
      if (!candidateParam && !jobParam) {
        callLogsQuery = callLogsQuery.limit(200);
      }
      
      // Parallel fetch for faster loading
      const [callLogsResult, jobsResult] = await Promise.all([
        callLogsQuery,
        supabase
          .from('Jobs')
          .select('job_id, job_title')
          .order('job_title')
      ]);

      const { data: callLogsData, error: callLogsError } = callLogsResult;
      const { data: jobsData, error: jobsError } = jobsResult;

      if (callLogsError) throw callLogsError;
      if (jobsError) console.error('Error fetching jobs:', jobsError);

      // Extract unique nationalities
      const uniqueNationalities = Array.from(
        new Set(
          (callLogsData || [])
            .map(log => log.nationality)
            .filter(Boolean)
        )
      ).sort();

      setCallLogs(callLogsData || []);
      setJobs(jobsData || []);
      setNationalities(uniqueNationalities);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleNotesChange = (logKey: string, notes: string) => {
    setEditingNotes(prev => ({ ...prev, [logKey]: notes }))
  }

  const saveNotes = async (log: CallLog) => {
    const logKey = `${log.recordid}`
    const notes = editingNotes[logKey] || log.notes || ""
    
    setSavingNotes(prev => ({ ...prev, [logKey]: true }))
    
    try {
      const { error } = await supabase
        .from('Jobs_CVs')
        .update({ notes: notes })
        .eq('recordid', log.recordid)

      if (error) throw error

      // Update local state
      setCallLogs(prev => prev.map(l => 
        l.recordid === log.recordid
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
    // Use LinkedIn score for LinkedIn sources, CV score for others
    const source = (log.source || "").toLowerCase();
    const isLinkedInSource = source.includes('linkedin');
    const secondScore = isLinkedInSource ? (log.linkedin_score || 0) : (log.cv_score || 0);
    const score = log.after_call_score ? Math.round((log.after_call_score + secondScore) / 2) : secondScore;
    const matchesScore = scoreFilter === "all" || 
                        (scoreFilter === "high" && score >= 75) ||
                        (scoreFilter === "medium" && score >= 50 && score <= 74) ||
                        (scoreFilter === "low" && score >= 1 && score <= 49)
    const matchesJob = jobFilter === "all" || log.job_id === jobFilter
    
    // Nationality filter with normalization
    const matchesNationality = nationalityFilter === "all" || 
                               normalizeNationality(log.nationality) === normalizeNationality(nationalityFilter)
    
    // URL parameter filtering - ensure string comparison works correctly
    const matchesCandidate = !candidateParam || String(log.user_id || '') === String(candidateParam)
    const matchesJobParam = !jobParam || log.job_id === jobParam
    
    return matchesSearch && matchesContacted && matchesScore && matchesJob && matchesNationality && matchesCandidate && matchesJobParam
  })

  return (
      <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
        {fromCandidate && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/candidate/${fromCandidate}`, {
              state: {
                fromJob: fromJob,
                tab: fromTab,
                longListSourceFilter: longListSourceFilter
              }
            })}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {candidateName ? `${candidateName}'s Profile` : 'Candidate Profile'}
          </Button>
        )}
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light font-work tracking-tight text-foreground">Call Log</h1>
          <p className="text-sm sm:text-base font-light font-inter text-muted-foreground mt-1 sm:mt-2">Track all recruitment calls and outcomes</p>
        </div>

        {/* Filters */}
        <Card className="p-3 sm:p-4 lg:p-6 bg-card border-border dark:bg-gradient-card dark:backdrop-blur-glass">
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4">
            <div className="relative flex-1 min-w-full sm:min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3 sm:w-4 sm:h-4" />
              <Input
                placeholder="Search calls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 bg-background/50 border-border text-sm"
              />
            </div>
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-background/50 border-border text-sm">
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
              <SelectTrigger className="w-full sm:w-[150px] bg-background/50 border-border text-sm">
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
              <SelectTrigger className="w-full sm:w-[150px] bg-background/50 border-border text-sm">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="high">+75</SelectItem>
                <SelectItem value="medium">50-74</SelectItem>
                <SelectItem value="low">1-49</SelectItem>
              </SelectContent>
            </Select>
            <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
              <SelectTrigger className="w-full sm:w-[150px] bg-background/50 border-border text-sm">
                <SelectValue placeholder="Nationality" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                <SelectItem value="all">All Nationalities</SelectItem>
                {nationalities.map((nationality) => (
                  <SelectItem key={nationality} value={nationality}>
                    {nationality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Call Log Table */}
        <Card className="bg-card border-border dark:bg-gradient-card dark:backdrop-blur-glass shadow-card">
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl lg:text-3xl font-light font-work tracking-tight">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              Call History ({filteredCallLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="w-[200px]">Candidate</TableHead>
                    <TableHead className="w-[150px] hidden lg:table-cell">Job</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[100px]">Score</TableHead>
                    <TableHead className="w-[120px] hidden xl:table-cell">Nationality</TableHead>
                    <TableHead className="w-[120px] hidden xl:table-cell">Notice Period</TableHead>
                    <TableHead className="w-[140px] hidden xl:table-cell">Salary Expectations</TableHead>
                    <TableHead className="w-[200px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading call logs...
                    </TableCell>
                  </TableRow>
                ) : filteredCallLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
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
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                                <AvatarFallback className="bg-gradient-primary text-white text-xs sm:text-sm font-light font-work">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="font-light font-work truncate text-xs sm:text-sm">{log.candidate_name || "N/A"}</div>
                                <div className="text-[10px] sm:text-sm font-light font-inter text-muted-foreground truncate hidden sm:block">{log.candidate_email || "N/A"}</div>
                                {/* Mobile details to show all values */}
                                <div className="lg:hidden mt-1 space-y-1">
                                  <div className="text-[10px] font-light font-inter text-muted-foreground truncate">
                                    {log.job_title || "N/A"}
                                    <Badge variant="outline" className="ml-1 text-[10px] align-middle">{(log.job_id || "N/A").substring(0, 8)}...</Badge>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <span className="font-medium text-foreground/80">Nationality:</span>
                                    <Badge variant="outline" className="text-[10px]">{log.nationality || "N/A"}</Badge>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <Clock className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{log.notice_period || "N/A"}</span>
                                  </div>
                                  <div className="text-[10px] text-muted-foreground">
                                    <span className="font-medium text-foreground/80">Salary:</span> <span className="truncate">{log.salary_expectations || "N/A"}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[150px] hidden lg:table-cell">
                            <div className="min-w-0">
                              <div className="font-light font-work truncate">{log.job_title || "N/A"}</div>
                              <Badge variant="outline" className="font-mono text-xs font-light font-inter mt-1">
                                {(log.job_id || "N/A").substring(0, 8)}...
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[120px]">
                            <StatusDropdown
                              currentStatus={log.contacted}
                              candidateId={log.user_id?.toString() || ""}
                              jobId={log.job_id}
                              statusType="contacted"
                              onStatusChange={(newStatus) => {
                                setCallLogs(prev => prev.map(l => 
                                  l.recordid === log.recordid
                                    ? { ...l, contacted: newStatus }
                                    : l
                                ))
                              }}
                            />
                          </TableCell>
                          <TableCell className="max-w-[100px]">
                            {(() => {
                              // Use LinkedIn score for LinkedIn sources, CV score for others
                              const source = (log.source || "").toLowerCase();
                              const isLinkedInSource = source.includes('linkedin');
                              const secondScore = isLinkedInSource ? (log.linkedin_score || 0) : (log.cv_score || 0);
                              const score = log.after_call_score ? Math.round((log.after_call_score + secondScore) / 2) : secondScore;
                              return (
                                <Badge variant={getScoreBadgeVariant(score?.toString())} className="whitespace-nowrap text-xs">
                                  {score ? `${score}/100` : "N/A"}
                                </Badge>
                              );
                            })()}
                          </TableCell>
                          <TableCell className="max-w-[120px] hidden xl:table-cell">
                            <Badge variant="outline" className="whitespace-nowrap">
                              {log.nationality || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[120px] hidden xl:table-cell">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{log.notice_period || "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[140px] hidden xl:table-cell">
                            <span className="truncate">{log.salary_expectations || "N/A"}</span>
                          </TableCell>
                          <TableCell className="text-right max-w-[200px]">
                            <div className="flex justify-end gap-1">
                              <Button variant="outline" size="sm" asChild className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                                <Link to={`/call-log-details/${log.recordid}`}> 
                                  <FileText className="w-3 h-3" />
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                                <Link to={`/candidate/${log.user_id}`}>
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
            <div className="md:hidden p-3 space-y-2">
              {loading ? (
                <div className="py-6 text-center text-muted-foreground text-sm">Loading call logs...</div>
              ) : filteredCallLogs.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground text-sm">No call logs found</div>
              ) : (
                filteredCallLogs.map((log, index) => {
                  const initials = (log.candidate_name || "")
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase();
                  // Determine score as in table
                  const source = (log.source || "").toLowerCase();
                  const isLinkedInSource = source.includes('linkedin');
                  const secondScore = isLinkedInSource ? (log.linkedin_score || 0) : (log.cv_score || 0);
                  const score = log.after_call_score ? Math.round((log.after_call_score + secondScore) / 2) : secondScore;

                  return (
                    <div key={index} className="border border-border rounded-lg p-3 bg-card/50">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gradient-primary text-white text-sm font-light font-work">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="text-sm font-light font-work truncate">{log.candidate_name || "N/A"}</div>
                            <div className="text-xs text-muted-foreground truncate">{log.candidate_email || "N/A"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm" asChild className="h-7 w-7 p-0">
                            <Link to={`/call-log-details/${log.recordid}`}>
                              <FileText className="w-3 h-3" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild className="h-7 w-7 p-0">
                            <Link to={`/candidate/${log.user_id}`}>
                              <Eye className="w-3 h-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2">
                        <div className="grid grid-cols-[auto,1fr] items-center gap-2">
                          <span className="text-xs text-muted-foreground">Status</span>
                          <div className="min-w-0">
                            <StatusDropdown
                              currentStatus={log.contacted}
                              candidateId={log.user_id?.toString() || ""}
                              jobId={log.job_id}
                              statusType="contacted"
                              onStatusChange={(newStatus) => {
                                setCallLogs(prev => prev.map(l => 
                                  l.recordid === log.recordid
                                    ? { ...l, contacted: newStatus }
                                    : l
                                ))
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Score</span>
                          <Badge variant={getScoreBadgeVariant(score?.toString())} className="text-xs">
                            {score ? `${score}/100` : "N/A"}
                          </Badge>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          <span className="text-foreground/80">Job:</span> <span className="text-foreground">{log.job_title || "N/A"}</span>
                          <Badge variant="outline" className="ml-1 text-[10px] align-middle">{(log.job_id || "N/A").substring(0, 8)}...</Badge>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Nationality</span>
                          <Badge variant="outline" className="text-[10px]">{log.nationality || "N/A"}</Badge>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3" /> Notice</div>
                          <span className="truncate">{log.notice_period || "N/A"}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Salary</span>
                          <span className="truncate">{log.salary_expectations || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
  )
}