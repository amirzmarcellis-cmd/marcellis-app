import { useEffect, useState, useMemo } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { RulerScore } from "@/components/ui/ruler-score"
import { ArrowLeft, Phone, Clock, User, DollarSign, Calendar, Link2, Save, Search } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { StatusDropdown } from "@/components/candidates/StatusDropdown"
import { TimelineLog } from "@/components/timeline/TimelineLog"
import WaveformPlayer from "@/components/calls/WaveformPlayer"

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
}

export default function CallLogDetails() {
  const [searchParams] = useSearchParams()
  const candidateId = searchParams.get('candidate')
  const jobId = searchParams.get('job')
  const navigate = useNavigate()
  const [callLog, setCallLog] = useState<CallLogDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const highlightedTranscript = useMemo(() => {
    const t = callLog?.["Transcript"] || ""
    if (!search) return t
    const regex = new RegExp(`(${escapeRegExp(search)})`, "gi")
    const parts = t.split(regex)
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <mark key={i} className="bg-primary/20 text-primary px-0.5 rounded">{part}</mark>
      ) : (
        <span key={i}>{part}</span>
      )
    )
  }, [callLog, search])

  useEffect(() => {
    fetchCallLogDetail()
  }, [candidateId, jobId])

  const fetchCallLogDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('Jobs_CVs')
        .select('*')
        .eq('Candidate_ID', candidateId)
        .eq('Job ID', jobId)
        .maybeSingle()

      if (error) throw error
      
      if (!data) {
        setCallLog(null)
        setLoading(false)
        return
      }

      // Fetch job title
      const { data: jobData } = await supabase
        .from('Jobs')
        .select('*')
        .eq('Job ID', jobId)
        .single()

      const enrichedData: CallLogDetail = {
        "Job ID": data["Job ID"],
        "Candidate_ID": data["Candidate_ID"],
        "Contacted": data["Contacted"],
        "Transcript": data["Transcript"],
        "Summary": data["Summary"],
        "Success Score": data["Success Score"],
        "Score and Reason": data["Score and Reason"],
        "Candidate Name": data["Candidate Name"],
        "Candidate Email": data["Candidate Email"],
        "Candidate Phone Number": data["Candidate Phone Number"],
        "pros": data["pros"],
        "cons": data["cons"],
        "Notice Period": data["Notice Period"],
        "Salary Expectations": data["Salary Expectations"],
        "current_salary": data["current_salary"],
        "Agency Experience": data["Agency Experience"],
        "Job Title": jobData?.["Job Title"] || null,
        "Notes": data["Notes"],
        "lastcalltime": data["lastcalltime"],
        "callcount": data["callcount"],
        "duration": data["duration"],
        "recording": data["recording"]
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
      const { error } = await supabase
        .from('Jobs_CVs')
        .update({ 'Notes': notes })
        .eq('Candidate_ID', candidateId)
        .eq('Job ID', jobId)

      if (error) throw error
      
      setCallLog(prev => prev ? { ...prev, Notes: notes } : null)
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/jobs')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
        <h1 className="text-3xl font-bold">Call Details</h1>
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
              <p className="text-sm text-muted-foreground mt-1 truncate">
                Latest Note: {callLog["Notes"] || '—'}
              </p>
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
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="text-sm font-medium text-muted-foreground">Call Recording Link</label>
                <p className="text-lg">
                  {callLog["recording"] ? (
                    <a href={callLog["recording"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      View Recording
                    </a>
                  ) : 'N/A'}
                </p>
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
            <CardTitle>Success Score</CardTitle>
          </CardHeader>
          <CardContent>
            <RulerScore value={score} className="mb-3" />
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
            <p className="whitespace-pre-wrap">{callLog["pros"] || 'No pros available'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Cons</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{callLog["cons"] || 'No cons available'}</p>
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
            <p className="whitespace-pre-wrap">{callLog["Summary"] || 'No summary available'}</p>
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
                {callLog["Transcript"] ? (
                  <div className="whitespace-pre-wrap">{highlightedTranscript}</div>
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