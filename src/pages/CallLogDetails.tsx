// @ts-nocheck
import { useEffect, useState, useMemo, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { ArrowLeft, Phone, Clock, User, DollarSign, Calendar, Link2, Save, Search } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { StatusDropdown } from "@/components/candidates/StatusDropdown"
import { TimelineLog } from "@/components/timeline/TimelineLog"
import WaveformPlayer from "@/components/calls/WaveformPlayer"
import RulerScore from "@/components/ui/ruler-score"
import { useProfile } from "@/hooks/useProfile"

interface CallLogDetail {
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
  "current_salary": string | null
  "Agency Experience": string | null
  "Job Title": string | null
  "Notes": string | null
  "lastcalltime": string | null
  "callcount": number | null
  "duration": string | null
  "recording": string | null
  "cv_link": string | null
  "notes_updated_by": string | null
  "notes_updated_at": string | null
}

export default function CallLogDetails() {
  const [searchParams] = useSearchParams()
  const candidateId = searchParams.get('candidate')
  const jobId = searchParams.get('job')
  const callid = searchParams.get('callid')
  const navigate = useNavigate()
  const [callLog, setCallLog] = useState<CallLogDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [notesUpdatedByName, setNotesUpdatedByName] = useState<string | null>(null)
  const firstMatchRef = useRef<HTMLElement | null>(null)
  const { profile } = useProfile()

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const highlightedTranscript = useMemo(() => {
    const t = callLog?.["Transcript"] || ""
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
    try {
      let data: any = null
      let error: any = null

      if (callid) {
        const resp = await supabase
          .from('Jobs_CVs')
          .select('*')
          .eq('callid', callid)
          .maybeSingle()
        data = resp.data
        error = resp.error
      } else {
        const resp = await supabase
          .from('Jobs_CVs')
          .select('*')
          .or(`and(Candidate_ID.eq.${candidateId},job_id.eq.${jobId}),and("Candidate_ID".eq.${candidateId},"Job ID".eq.${jobId})`)
          .maybeSingle()
        data = resp.data
        error = resp.error
      }

      if (error) throw error
      
      if (!data) {
        setCallLog(null)
        setLoading(false)
        return
      }

      const jobIdForLookup = (data as any)?.job_id ?? (data as any)?.["Job ID"] ?? jobId
      const { data: jobData } = await supabase
        .from('Jobs')
        .select('*')
        .or(`job_id.eq.${jobIdForLookup},"Job ID".eq.${jobIdForLookup}`)
        .maybeSingle()

      const enrichedData: CallLogDetail = {
        "Job ID": (data as any).job_id ?? (data as any)["Job ID"],
        "Candidate_ID": (data as any).candidate_id ?? (data as any)["Candidate_ID"],
        "Contacted": (data as any).contacted ?? (data as any)["Contacted"],
        "Transcript": (data as any).transcript ?? (data as any)["Transcript"],
        "Summary": (data as any).summary ?? (data as any)["Summary"],
        "Success Score": (data as any).success_score ?? (data as any)["Success Score"],
        "Score and Reason": (data as any).score_and_reason ?? (data as any)["Score and Reason"],
        "Candidate Name": (data as any).candidate_name ?? (data as any)["Candidate Name"],
        "Candidate Email": (data as any).candidate_email ?? (data as any)["Candidate Email"],
        "Candidate Phone Number": (data as any).candidate_phone_number ?? (data as any)["Candidate Phone Number"],
        "pros": (data as any).pros ?? (data as any)["pros"],
        "cons": (data as any).cons ?? (data as any)["cons"],
        "Notice Period": (data as any).notice_period ?? (data as any)["Notice Period"],
        "Salary Expectations": (data as any).salary_expectations ?? (data as any)["Salary Expectations"],
        "current_salary": (data as any).current_salary ?? (data as any)["current_salary"],
        "Agency Experience": (data as any).agency_experience ?? (data as any)["Agency Experience"],
        "Job Title": (jobData as any)?.job_title ?? (jobData as any)?.["Job Title"] ?? null,
        "Notes": (data as any).notes ?? (data as any)["Notes"],
        "lastcalltime": (data as any).lastcalltime ?? (data as any)["lastcalltime"],
        "callcount": (data as any).callcount ?? (data as any)["callcount"],
        "duration": (data as any).duration ?? (data as any)["duration"],
        "recording": (data as any).recording ?? (data as any)["recording"],
        "cv_link": (data as any).cv_link ?? (data as any)["cv_link"],
        "notes_updated_by": (data as any).notes_updated_by ?? (data as any)["notes_updated_by"],
        "notes_updated_at": (data as any).notes_updated_at ?? (data as any)["notes_updated_at"]
      }

      // If there's a notes_updated_by user ID, fetch their profile
      if (enrichedData["notes_updated_by"]) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', enrichedData["notes_updated_by"])
          .maybeSingle()
        
        if (profileData?.name) {
          setNotesUpdatedByName(profileData.name)
        }
      }

      setCallLog(enrichedData)
      setNotes(enrichedData?.["Notes"] || "")
    } catch (error) {
      console.error('Error fetching call log detail:', error)
    } finally {
      setLoading(false)
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
        updateQuery = updateQuery.eq('callid', callid)
      } else {
        updateQuery = updateQuery.or(`and(candidate_id.eq.${candidateId},job_id.eq.${jobId}),and("Candidate_ID".eq.${candidateId},"Job ID".eq.${jobId}),and("Candidate_ID".eq.${candidateId},job_id.eq.${jobId}),and(candidate_id.eq.${candidateId},"Job ID".eq.${jobId})`)
      }

      const { error } = await updateQuery

      if (error) throw error
      
      setCallLog(prev => prev ? { ...prev, Notes: notes } : null)
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

  const score = parseInt(callLog["Success Score"] || "0")
  const scoreColorClass = score >= 80 ? "text-primary" : score >= 50 ? "text-foreground" : "text-destructive"

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 overflow-x-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Call Details</h1>
      </div>

      {/* Candidate Header */}
      <Card className="bg-gradient-card">
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-gradient-primary text-white text-xl">
                {callLog["Candidate Name"]?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{callLog["Candidate Name"]}</h2>
              <p className="text-muted-foreground">{callLog["Candidate Email"]}</p>
              <p className="text-sm">{callLog["Job Title"]}</p>
              <Badge variant="outline" className="mt-2">
                Score: {callLog["Success Score"]}/100
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const cvLink = callLog["cv_link"];
                  if (cvLink) {
                    window.open(cvLink, '_blank');
                  }
                }}
                disabled={!callLog["cv_link"]}
                className="mt-2"
              >
                <Link2 className="w-4 h-4 mr-2" />
                View CV
              </Button>
            </div>
            <StatusDropdown
              currentStatus={callLog["Contacted"]}
              candidateId={candidateId!}
              jobId={jobId!}
              statusType="contacted"
              onStatusChange={(newStatus) => {
                setCallLog(prev => prev ? { ...prev, Contacted: newStatus } : null)
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
                <p className="text-lg">{callLog["duration"] || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Call Time</label>
                <p className="text-lg">{callLog["lastcalltime"] ? new Date(callLog["lastcalltime"]).toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Call Count</label>
                <p className="text-lg">{callLog["callcount"] || 0}</p>
              </div>
            </div>
            {callLog["recording"] && (
              <div className="pt-2">
                <label className="text-sm font-medium text-muted-foreground">Playback</label>
                <div className="mt-2">
                  <WaveformPlayer url={callLog["recording"]!} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Salary Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Salary & Notice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Notice Period</label>
              <p className="text-lg">{callLog["Notice Period"] || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Current Salary</label>
              <p className="text-lg">{callLog["current_salary"] || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Expected Salary</label>
              <p className="text-lg">{callLog["Salary Expectations"] || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Success Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Success Score</span>
              <span className={`text-xl font-semibold ${scoreColorClass}`}>{score}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <RulerScore value={score} />
            <p className="text-sm text-muted-foreground">{callLog["Score and Reason"]}</p>
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
            {notesUpdatedByName && callLog?.["Notes"] && (
              <p className="text-xs text-muted-foreground">
                Added by <span className="text-primary font-medium">{notesUpdatedByName}</span>
                {callLog?.["notes_updated_at"] && (
                  <span> on {new Date(callLog["notes_updated_at"]).toLocaleDateString()}</span>
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
            <p className="whitespace-pre-wrap break-words">{callLog["pros"] || 'No pros available'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Cons</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap break-words">{callLog["cons"] || 'No cons available'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Summary & Transcript */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap break-words">{callLog["Summary"] || 'No summary available'}</p>
          </CardContent>
        </Card>

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
                {callLog?.["Transcript"] ? (
                  <div className="whitespace-pre-wrap break-words">{highlightedTranscript}</div>
                ) : (
                  <p className="text-muted-foreground">No transcript available</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Log */}
      {candidateId && jobId && (
        <TimelineLog candidateId={candidateId} jobId={jobId} />
      )}
    </div>
  )
}