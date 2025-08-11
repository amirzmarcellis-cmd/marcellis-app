import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Phone, Clock, User, DollarSign, Calendar, Link2, Save } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { StatusDropdown } from "@/components/candidates/StatusDropdown"

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
}

export default function CallLogDetails() {
  const { candidateId, jobId } = useParams()
  const navigate = useNavigate()
  const [callLog, setCallLog] = useState<CallLogDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

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
        .single()

      if (error) throw error

      // Fetch job title
      const { data: jobData } = await supabase
        .from('Jobs')
        .select('*')
        .eq('Job ID', jobId)
        .single()

      const enrichedData = {
        ...data,
        "Job Title": jobData?.["Job Title"] || null
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
        <Button variant="outline" onClick={() => navigate('/call-log')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Call Log
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
                <p className="text-lg">-</p>
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
                <p className="text-lg">N/A</p>
              </div>
            </div>
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
            <Progress value={score} className="h-4 mb-4" />
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
            <div className="max-h-60 overflow-y-auto">
              <p className="whitespace-pre-wrap text-sm">{callLog["Transcript"] || 'No transcript available'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}