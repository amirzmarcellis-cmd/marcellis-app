// @ts-nocheck
import { useEffect, useState, useMemo, useRef } from "react"
import { useSearchParams, useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { ArrowLeft, Phone, Clock, User, Banknote, Calendar, Link2, Save, Search, CheckCircle, ClipboardList, FileText, XCircle, ThumbsUp } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { StatusDropdown } from "@/components/candidates/StatusDropdown"
import { TimelineLog } from "@/components/timeline/TimelineLog"
import WaveformPlayer from "@/components/calls/WaveformPlayer"
import RulerScore from "@/components/ui/ruler-score"
import { useProfile } from "@/hooks/useProfile"
import { useUserRole } from "@/hooks/useUserRole"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CallLogDetail {
  job_id: string | null
  user_id: string | null
  candidate_name: string | null
  candidate_email: string | null
  candidate_phone_number: string | null
  transcript: string | null
  contacted: string | null
  after_call_score: string | null
  after_call_reason: string | null
  after_call_pros: string | null
  after_call_cons: string | null
  Reason_to_reject: string | null
  Reason_to_Hire: string | null
  notice_period: string | null
  salary_expectations: string | null
  current_salary: string | null
  notes: string | null
  lastcalltime: string | null
  callcount: number | null
  duration: string | null
  recording: string | null
  notes_updated_by: string | null
  notes_updated_at: string | null
  job_title?: string | null
  cv_score: string | null
  cv_score_reason: string | null
  linkedin_score: string | null
  linkedin_score_reason: string | null
  source: string | null
  qualifications: string | null
  comm_summary: string | null
  comm_score: string | null
  nationality: string | null
}

export default function CallLogDetails() {
  const [searchParams] = useSearchParams()
  const { recordid: urlRecordId } = useParams()
  const candidateId = searchParams.get('candidate') || searchParams.get('candidateId') || searchParams.get('user_id')
  const jobId = searchParams.get('job') || searchParams.get('jobId')
  const callid = searchParams.get('callid') || urlRecordId || searchParams.get('recordId') || searchParams.get('recordid')
  const navigate = useNavigate()
  const [callLog, setCallLog] = useState<CallLogDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [notesUpdatedByName, setNotesUpdatedByName] = useState<string | null>(null)
  const [taskStatus, setTaskStatus] = useState<string | null>(null)
  const [taskLinks, setTaskLinks] = useState<string[]>([])
  const [jobAssignmentLink, setJobAssignmentLink] = useState<string | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)
  const firstMatchRef = useRef<HTMLElement | null>(null)
  const { profile } = useProfile()
  const { isManager, isCompanyAdmin } = useUserRole()

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const highlightedTranscript = useMemo(() => {
    const t = callLog?.transcript || ""
    if (!search.trim()) return t
    const regex = new RegExp(`(${escapeRegExp(search.trim())})`, "gi")
    const parts = t.split(regex)
    let isFirstMatch = true
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark 
          key={i} 
          ref={isFirstMatch ? (el) => {
            firstMatchRef.current = el
            isFirstMatch = false
          } : undefined}
          className="bg-yellow-200 dark:bg-yellow-900 text-black dark:text-yellow-100 px-0.5 rounded"
        >
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    )
  }, [callLog, search])

  // Auto-scroll to first match when search changes
  useEffect(() => {
    if (search.trim() && firstMatchRef.current) {
      setTimeout(() => {
        firstMatchRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }, 100)
    }
  }, [search, highlightedTranscript])

  useEffect(() => {
    fetchCallLogDetail()
  }, [candidateId, jobId, callid])

  const fetchCallLogDetail = async () => {
    console.log('Fetching call log detail with params:', { candidateId, jobId, callid });
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Query timeout - setting loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout

    try {
      let data: any = null
      let error: any = null

      if (callid) {
        console.log('Fetching by recordid:', callid);
        const resp = await supabase
          .from('Jobs_CVs')
          .select('*')
          .eq('recordid', callid)
          .maybeSingle()
        data = resp.data
        error = resp.error
        console.log('Response for recordid query:', { data, error });
      } else if (candidateId && jobId) {
        console.log('Fetching by candidateId and jobId:', { candidateId, jobId });
        const resp = await supabase
          .from('Jobs_CVs')
          .select('*')
          .eq('user_id', candidateId)
          .eq('job_id', jobId)
          .maybeSingle()
        data = resp.data
        error = resp.error
        console.log('Response for candidateId/jobId query:', { data, error });
      } else {
        console.log('No valid parameters provided');
        setLoading(false);
        return;
      }

      clearTimeout(timeoutId); // Clear timeout if query completes

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      if (!data) {
        console.log('No call log data found');
        setCallLog(null)
        setLoading(false)
        return
      }

      console.log('Raw data from database:', data);

      // Fetch job data
      const jobIdForLookup = data.job_id || jobId
      const { data: jobData } = await supabase
        .from('Jobs')
        .select('job_title')
        .eq('job_id', jobIdForLookup)
        .maybeSingle()

      // Direct mapping using snake_case field names from database
      const enrichedData: CallLogDetail = {
        job_id: data.job_id,
        user_id: data.user_id,
        candidate_name: data.candidate_name,
        candidate_email: data.candidate_email,
        candidate_phone_number: data.candidate_phone_number,
        transcript: data.transcript,
        contacted: data.contacted,
        after_call_score: data.after_call_score?.toString(),
        after_call_reason: data.after_call_reason,
        after_call_pros: data.after_call_pros,
        after_call_cons: data.after_call_cons,
        notice_period: data.notice_period,
        salary_expectations: data.salary_expectations,
        current_salary: data.current_salary,
        notes: data.notes,
        lastcalltime: data.lastcalltime,
        callcount: data.callcount,
        duration: data.duration,
        recording: data.recording,
        notes_updated_by: data.notes_updated_by,
        notes_updated_at: data.notes_updated_at,
        job_title: jobData?.job_title,
        cv_score: data.cv_score?.toString(),
        cv_score_reason: data.cv_score_reason,
        linkedin_score: data.linkedin_score?.toString(),
        linkedin_score_reason: data.linkedin_score_reason,
        source: data.source,
        qualifications: data.qualifications,
        Reason_to_reject: data.Reason_to_reject,
        Reason_to_Hire: data.Reason_to_Hire,
        comm_summary: data.comm_summary,
        comm_score: data.comm_score?.toString(),
        nationality: data.nationality
      }

      console.log('Enriched data:', enrichedData);

      // If there's a notes_updated_by user ID, fetch their profile
      if (enrichedData.notes_updated_by) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', enrichedData.notes_updated_by)
          .maybeSingle()
        
        if (profileData?.name) {
          setNotesUpdatedByName(profileData.name)
        }
      }

      setCallLog(enrichedData)
      setNotes(enrichedData?.notes || "")
      
      // Fetch task status and assignment links
      await fetchTaskData(data.user_id?.toString() || candidateId, enrichedData.job_id)
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error fetching call log detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTaskData = async (candidateId: string | null, jobId: string | null) => {
    if (!candidateId || !jobId) return
    
    try {
      // Fetch task status from task_candidates table
      const { data: taskData } = await supabase
        .from('task_candidates')
        .select('taskid, status, tasklink')
        .eq('candidate_id', candidateId)
        .eq('job_id', jobId)
        .maybeSingle()
      
      if (taskData) {
        setTaskStatus(taskData.status)
        setTaskId(taskData.taskid.toString())
        if (taskData.tasklink) {
          setTaskLinks(taskData.tasklink.split(',').map((link: string) => link.trim()))
        }
      }
      
      // Fetch job assignment link
      const { data: jobData } = await supabase
        .from('Jobs')
        .select('assignment')
        .eq('job_id', jobId)
        .maybeSingle()
      
      if (jobData?.assignment) {
        setJobAssignmentLink(jobData.assignment)
      }
    } catch (error) {
      console.error('Error fetching task data:', error)
    }
  }

  const updateTaskStatus = async (newStatus: string) => {
    if (!taskId || !candidateId || !jobId) return
    
    try {
      const { error } = await supabase
        .from('task_candidates')
        .update({ status: newStatus })
        .eq('taskid', parseInt(taskId))
      
      if (error) throw error
      
      setTaskStatus(newStatus)
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const saveNotes = async () => {
    if (!callLog) return
    
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      let updateQuery: any = supabase
        .from('Jobs_CVs')
        .update({ 
          'notes': notes,
          'notes_updated_by': user?.id,
          'notes_updated_at': new Date().toISOString()
        })
        
      if (callid) {
        updateQuery = updateQuery.eq('recordid', callid)
      } else if (candidateId && jobId) {
        updateQuery = updateQuery.eq('user_id', candidateId).eq('job_id', jobId)
      } else {
        throw new Error('No valid identifiers for update')
      }

      const { error } = await updateQuery

      if (error) throw error
      
      setCallLog(prev => prev ? { ...prev, notes: notes } : null)
      setNotesUpdatedByName(profile?.name || null)
      // Refresh the page after successful save to reflect timeline updates
      window.location.reload()
    } catch (error) {
      console.error('Error saving notes:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading call details...</div>
      </div>
    )
  }

  if (!callLog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Call log not found</div>
      </div>
    )
  }

  const score = parseInt(callLog.after_call_score || "0")
  const scoreColorClass = score >= 80 ? "text-primary" : score >= 50 ? "text-foreground" : "text-destructive"

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 overflow-x-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6">
        <Button variant="outline" onClick={() => {
          if (jobId && candidateId) {
            const fromTabParam = searchParams.get('fromTab');
            const fromTab = fromTabParam === 'shortlist' ? 'shortlist' : 'boolean-search';
            const filter = searchParams.get('longListSourceFilter');
            navigate(`/job/${jobId}`, {
              state: {
                tab: fromTab,
                focusCandidateId: candidateId,
                ...(filter ? { longListSourceFilter: filter } : {})
              }
            });
          } else if (jobId) {
            navigate(`/job/${jobId}`);
          } else {
            navigate(-1);
          }
        }}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-5xl sm:text-6xl font-light font-work tracking-tight">Call Details</h1>
      </div>

      {/* Candidate Header */}
      <Card className="bg-gradient-card">
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-gradient-primary text-white text-xl font-light font-work">
                {callLog.candidate_name?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-4xl font-light font-work tracking-tight">{callLog.candidate_name}</h2>
              <p className="text-base font-light font-inter text-muted-foreground">{callLog.candidate_email}</p>
              <p className="text-sm font-light font-inter">{callLog.job_title}</p>
              {callLog.nationality && (
                <p className="text-sm font-light font-inter text-muted-foreground">Nationality: {callLog.nationality}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  User ID: {callLog.user_id}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Job ID: {callLog.job_id}
                </Badge>
                <Badge variant="outline">
                  Score: {callLog.after_call_score}/100
                </Badge>
              </div>
              
              {/* Task Status and Assignments Section */}
              <div className="mt-4 space-y-3">
                {/* Task Status */}
                {taskStatus && (
                  <div className="flex items-center justify-between p-3 bg-gradient-subtle rounded-lg border border-border/50">
                    <div className="flex items-center space-x-2">
                      <ClipboardList className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Task Status:</span>
                    </div>
                    <Select value={taskStatus} onValueChange={updateTaskStatus}>
                      <SelectTrigger className="w-32 bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground">
                        <SelectValue className="text-foreground" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border shadow-elevated z-50">
                        <SelectItem value="Pending" className="text-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3 text-warning" />
                            <span className="text-foreground">Pending</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Completed" className="text-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-3 h-3 text-success" />
                            <span className="text-foreground">Completed</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="In Progress" className="text-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3 text-primary" />
                            <span className="text-foreground">In Progress</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Not Started" className="text-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-foreground">Not Started</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Assignment Links */}
                {(jobAssignmentLink || taskLinks.length > 0) && (
                  <div className="p-3 bg-gradient-subtle rounded-lg border border-border/50">
                    <div className="flex items-center space-x-2 mb-2">
                      <Link2 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Assignments:</span>
                    </div>
                    <div className="space-y-2">
                      {jobAssignmentLink && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(jobAssignmentLink, '_blank')}
                          className="w-full justify-start text-left"
                        >
                          <Link2 className="w-3 h-3 mr-2" />
                          Job Assignment
                        </Button>
                      )}
                      {taskLinks.map((link, index) => (
                        <Button 
                          key={index}
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(link, '_blank')}
                          className="w-full justify-start text-left"
                        >
                          <Link2 className="w-3 h-3 mr-2" />
                          Task Link {index + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <StatusDropdown
              currentStatus={callLog.contacted}
              candidateId={candidateId!}
              jobId={jobId!}
              statusType="contacted"
              onStatusChange={(newStatus) => {
                setCallLog(prev => prev ? { ...prev, contacted: newStatus } : null)
              }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Call Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Duration</label>
                <p className="text-lg">{callLog.duration || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Call Time</label>
                <p className="text-lg">{callLog.lastcalltime ? new Date(callLog.lastcalltime).toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Call Count</label>
                <p className="text-lg">{callLog.callcount || 0}</p>
              </div>
            </div>
            {callLog.recording && (
              <div className="pt-2">
                <label className="text-sm font-medium text-muted-foreground">Playback</label>
                <div className="mt-2">
                  <WaveformPlayer url={callLog.recording!} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Salary Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Banknote className="w-5 h-5 mr-2" />
              Salary & Notice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Notice Period</label>
              <p className="text-lg">{callLog.notice_period || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Current Salary</label>
              <p className="text-lg">{callLog.current_salary || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Expected Salary</label>
              <p className="text-lg">{callLog.salary_expectations || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Scores Section */}
        <Card>
          <CardHeader>
            <CardTitle>Candidate Scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Score - Only show when status is Call Done */}
            {callLog.contacted?.toLowerCase() === "call done" && (
              <div className="p-3 bg-gradient-subtle rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Score</span>
                  <span className={`text-xl font-semibold ${scoreColorClass}`}>
                    {(() => {
                      // Calculate overall score based on source
                      const afterCallScore = parseInt(callLog.after_call_score || "0")
                      const cvScore = parseInt(callLog.cv_score || "0")
                      const linkedInScore = parseInt(callLog.linkedin_score || "0")
                      
                      // Use LinkedIn score for LinkedIn sources, CV score for others
                      const source = callLog.source?.toLowerCase() || ""
                      const isLinkedInSource = source.includes('linkedin')
                      const secondScore = isLinkedInSource ? linkedInScore : cvScore
                      
                      // Calculate average of after call and second score
                      const overallScore = Math.round((afterCallScore + secondScore) / 2)
                      
                      // Determine source type for display
                      let sourceType = ""
                      if (callLog.source && typeof callLog.source === 'string') {
                        if (callLog.source.toLowerCase().includes('linkedin')) {
                          sourceType = " (linkedin)"
                        } else if (callLog.source.toLowerCase().includes('itris')) {
                          sourceType = " (cv)"
                        }
                      }
                      
                      return `${overallScore}/100${sourceType}`
                    })()}
                  </span>
                </div>
                <RulerScore value={(() => {
                  const afterCallScore = parseInt(callLog.after_call_score || "0")
                  const cvScore = parseInt(callLog.cv_score || "0")
                  const linkedInScore = parseInt(callLog.linkedin_score || "0")
                  const source = callLog.source?.toLowerCase() || ""
                  const isLinkedInSource = source.includes('linkedin')
                  const secondScore = isLinkedInSource ? linkedInScore : cvScore
                  return Math.round((afterCallScore + secondScore) / 2)
                })()} />
              </div>
            )}

            {/* After Call Score */}
            <div className="p-3 bg-gradient-subtle rounded-lg border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">After Call Score</span>
                <span className={`text-xl font-semibold ${scoreColorClass}`}>{score}/100</span>
              </div>
              <RulerScore value={score} />
              {callLog.after_call_reason && (
                <p className="text-sm text-muted-foreground mt-2">{callLog.after_call_reason}</p>
              )}
            </div>

            {/* CV Score */}
            {callLog.cv_score && (
              <div className="p-3 bg-gradient-subtle rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">CV Score</span>
                  <span className="text-xl font-semibold text-primary">{callLog.cv_score}/100</span>
                </div>
                <RulerScore value={parseInt(callLog.cv_score)} />
                {callLog.cv_score_reason && (
                  <p className="text-sm text-muted-foreground mt-2">{callLog.cv_score_reason}</p>
                )}
              </div>
            )}

            {/* LinkedIn Score */}
            {callLog.linkedin_score && (
              <div className="p-3 bg-gradient-subtle rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">LinkedIn Score</span>
                  <span className="text-xl font-semibold text-primary">{callLog.linkedin_score}/100</span>
                </div>
                <RulerScore value={parseInt(callLog.linkedin_score)} />
                {callLog.linkedin_score_reason && (
                  <p className="text-sm text-muted-foreground mt-2">{callLog.linkedin_score_reason}</p>
                )}
              </div>
            )}

            {/* Source */}
            {callLog.source && (
              <div className="p-3 bg-gradient-subtle rounded-lg border border-border/50">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Source:</span>
                  <Badge variant="outline">{callLog.source}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Add your notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
            {notesUpdatedByName && callLog?.notes && (
              <p className="text-xs text-muted-foreground">
                Added by <span className="text-primary font-medium">{notesUpdatedByName}</span>
                {callLog?.notes_updated_at && (
                  <span> on {new Date(callLog.notes_updated_at).toLocaleDateString()}</span>
                )}
              </p>
            )}
            <Button onClick={saveNotes} disabled={saving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Notes"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Pros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap break-words">{callLog.after_call_pros || 'No pros available'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Cons</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap break-words">{callLog.after_call_cons || 'No cons available'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Communication Skills */}
      {(callLog?.comm_summary || callLog?.comm_score) && (
        <Card className="overflow-hidden animate-fade-in">
          <CardHeader className="bg-gradient-primary/10">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Communication Skills Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Communication Skill Summary
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground w-48">
                      Communication Skill Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50 hover:bg-accent/50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {callLog.comm_summary || 'No summary available'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className={`text-3xl font-bold ${
                          callLog.comm_score && parseInt(callLog.comm_score) >= 8 
                            ? 'text-green-600 dark:text-green-400' 
                            : callLog.comm_score && parseInt(callLog.comm_score) >= 5 
                            ? 'text-yellow-600 dark:text-yellow-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {callLog.comm_score || 'N/A'}
                          {callLog.comm_score && '/10'}
                        </div>
                        {callLog.comm_score && (
                          <div className="w-full max-w-[120px]">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ease-out ${
                                  parseInt(callLog.comm_score) >= 8 
                                    ? 'bg-green-600' 
                                    : parseInt(callLog.comm_score) >= 5 
                                    ? 'bg-yellow-600' 
                                    : 'bg-red-600'
                                }`}
                                style={{ width: `${parseInt(callLog.comm_score) * 10}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejection & Hiring Reasons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Rejection Reason
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {callLog.Reason_to_reject || 'No rejection reason recorded'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <ThumbsUp className="h-5 w-5" />
              Hired Reason
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {callLog.Reason_to_Hire || 'No hiring reason recorded'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Qualifications */}
      {callLog?.qualifications && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Qualifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-secondary/50 rounded-lg border">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{callLog.qualifications}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcript */}
      <Card>
        <CardHeader>
          <CardTitle>Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search transcript keywords..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="max-h-60 overflow-y-auto text-sm leading-relaxed">
              {callLog?.transcript ? (
                <div className="whitespace-pre-wrap break-words">{highlightedTranscript}</div>
              ) : (
                <p className="text-muted-foreground">No transcript available</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Log */}
      {callLog?.user_id && callLog?.job_id && (
        <TimelineLog candidateId={callLog.user_id} jobId={callLog.job_id} />
      )}
    </div>
  )
}