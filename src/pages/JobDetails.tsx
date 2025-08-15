// @ts-nocheck
import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, MapPin, Calendar, Banknote, Users, FileText, Clock, Target, Phone, Mail, Star, Search, Filter, Upload, Zap } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { JobFunnel } from "@/components/jobs/JobFunnel"
import { JobDialog } from "@/components/jobs/JobDialog"
import { StatusDropdown } from "@/components/candidates/StatusDropdown"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Using any type to avoid TypeScript complexity with quoted property names

export default function JobDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState<any[]>([])
  const [candidatesLoading, setCandidatesLoading] = useState(true)
  const [cvData, setCvData] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [nameFilter, setNameFilter] = useState("")
  const [emailFilter, setEmailFilter] = useState("")
  const [phoneFilter, setPhoneFilter] = useState("")
  const [scoreFilter, setScoreFilter] = useState("all")
  const [contactedFilter, setContactedFilter] = useState("all")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isGeneratingShortList, setIsGeneratingShortList] = useState(false)
  const [shortListButtonDisabled, setShortListButtonDisabled] = useState(false)
  const [shortListTimeRemaining, setShortListTimeRemaining] = useState(0)
  const { toast } = useToast()
  const [callingCandidateId, setCallingCandidateId] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchJob(id)
      fetchCandidates(id)
      fetchCvData()
      fetchApplications(id)
      checkShortListButtonStatus()
    }
  }, [id])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (shortListButtonDisabled && shortListTimeRemaining > 0) {
      interval = setInterval(() => {
        setShortListTimeRemaining(prev => {
          if (prev <= 1) {
            setShortListButtonDisabled(false)
            const storageKey = `shortlist_${id}_disabled`
            localStorage.removeItem(storageKey)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [shortListButtonDisabled, shortListTimeRemaining, id])

  const checkShortListButtonStatus = () => {
    if (!id) return
    
    const storageKey = `shortlist_${id}_disabled`
    const disabledUntil = localStorage.getItem(storageKey)
    
    if (disabledUntil) {
      const now = Date.now()
      const disabledTime = parseInt(disabledUntil)
      
      if (now < disabledTime) {
        setShortListButtonDisabled(true)
        setShortListTimeRemaining(Math.ceil((disabledTime - now) / 1000))
      } else {
        localStorage.removeItem(storageKey)
      }
    }
  }

  const fetchJob = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('Jobs')
        .select('*')
        .eq('job_id', jobId)
        .maybeSingle()

      if (error) throw error
      
      if (data) {
        const legacy = {
          "Job ID": (data as any).job_id ?? (data as any)["Job ID"],
          "Job Title": (data as any).job_title ?? (data as any)["Job Title"],
          "Client Description": (data as any).client_description ?? (data as any)["Client Description"],
          "Job Location": (data as any).job_location ?? (data as any)["Job Location"],
          "Job Salary Range (ex: 15000 AED)": (data as any).job_salary_range ?? (data as any)["Job Salary Range (ex: 15000 AED)"],
          "Job Description": (data as any).job_description ?? (data as any)["Job Description"],
          "JD Summary": (data as any).jd_summary ?? (data as any)["JD Summary"],
          "Things to look for": (data as any).things_to_look_for ?? (data as any)["Things to look for"],
          "Type": (data as any).Type ?? (data as any)["Type"],
          "Contract Length": (data as any).contract_length ?? (data as any)["Contract Length"],
          "Notice Period": (data as any).notice_period ?? (data as any)["Notice Period"],
          "Nationality to include": (data as any).nationality_to_include ?? (data as any)["Nationality to include"],
          "Nationality to Exclude": (data as any).nationality_to_exclude ?? (data as any)["Nationality to Exclude"],
          Processed: (data as any).Processed ?? (data as any).processed ?? (data as any).Processed,
          Currency: (data as any).Currency ?? (data as any).currency ?? null,
          Timestamp: (data as any).Timestamp ?? (data as any).timestamp ?? null,
          longlist: (data as any).longlist ?? 0,
          assignment: (data as any).assignment ?? (data as any)["assignment"] ?? null,
          musttohave: (data as any).musttohave ?? (data as any)["musttohave"] ?? null,
          nicetohave: (data as any).nicetohave ?? (data as any)["nicetohave"] ?? null,
        } as any;
        setJob(legacy)
      } else {
        setJob(null)
      }
    } catch (error) {
      console.error('Error fetching job:', error)
      setJob(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchCandidates = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('Jobs_CVs')
        .select('*')
        .eq('job_id', jobId)
        .order('callid', { ascending: false })

      if (error) throw error

      const mapped = (data || []).map((row: any) => ({
        ...row,
        "Job ID": row.job_id ?? row["Job ID"],
        "Candidate_ID": row.Candidate_ID ?? row.candidate_id ?? row["Candidate_ID"],
        "Contacted": row.contacted ?? row.Contacted ?? '',
        "Transcript": row.transcript ?? row.Transcript ?? '',
        "Summary": row.summary ?? row.Summary ?? '',
        "Success Score": row.success_score ?? row["Success Score"] ?? '',
        "Score and Reason": row.score_and_reason ?? row["Score and Reason"] ?? '',
        "Candidate Name": row.candidate_name ?? row["Candidate Name"] ?? '',
        "Candidate Email": row.candidate_email ?? row["Candidate Email"] ?? '',
        "Candidate Phone Number": row.candidate_phone_number ?? row["Candidate Phone Number"] ?? '',
        "pros": row.pros,
        "cons": row.cons,
        "Notice Period": row.notice_period ?? row["Notice Period"] ?? '',
        "Salary Expectations": row.salary_expectations ?? row["Salary Expectations"] ?? '',
        "current_salary": row.current_salary ?? row["current_salary"] ?? '',
        "Notes": row.notes ?? row.Notes ?? '',
        "callid": row.callid,
        "duration": row.duration,
        "recording": row.recording,
      }))

      setCandidates(mapped)
    } catch (error) {
      console.error('Error fetching candidates:', error)
      setCandidates([])
    } finally {
      setCandidatesLoading(false)
    }
  }

  const fetchCvData = async () => {
    try {
      const { data, error } = await supabase
        .from('CVs')
        .select('*')

      if (error) throw error
      setCvData(data || [])
    } catch (error) {
      console.error('Error fetching CV data:', error)
      setCvData([])
    }
  }

  const fetchApplications = async (jobId: string) => {
    try {
      setApplicationsLoading(true)
      const { data, error } = await supabase
        .from('CVs')
        .select('*')
        .contains('applied_for', [jobId])
        .order('Timestamp', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      setApplications([])
    } finally {
      setApplicationsLoading(false)
    }
  }

  const handleButtonClick = () => {
    if (job?.longlist && job.longlist > 0) {
      setShowConfirmDialog(true);
    } else {
      handleGenerateLongList();
    }
  };

  const handleSearchMoreCandidates = async () => {
    try {
      // Prepare the payload with current candidates
      const candidatesData = candidates.map(candidate => ({
        candidateID: candidate["Candidate_ID"],
        callid: candidate["callid"]
      }));

      const payload = {
        jobID: job?.["Job ID"],
        groupid: candidates[0]?.["group_id"], // Get groupid from first candidate
        candidates: candidatesData
      };

      const response = await fetch('https://hook.eu2.make.com/j9objo7b05yubvv25fsvpxl3zrynl7dh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Search for more candidates initiated successfully",
      });
    } catch (error) {
      console.error('Error searching for more candidates:', error);
      toast({
        title: "Error",
        description: "Failed to search for more candidates",
        variant: "destructive",
      });
    }
  };

  const handleGenerateLongList = async () => {
    try {
      // First, increment the longlist count in the database
      const { error: updateError } = await supabase
        .from('Jobs')
        .update({ longlist: (job?.longlist || 0) + 1 })
        .eq('job_id', job?.["Job ID"]);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setJob(prev => ({ ...prev, longlist: (prev?.longlist || 0) + 1 }));

      // Call the automation endpoint
      const response = await fetch('https://hook.eu2.make.com/6so4sjxmr9gh97bzbvq8ggu1d4p49yva', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobID: job?.["Job ID"] || '' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Success",
        description: job?.longlist && job.longlist > 0 ? "Long list regenerated successfully" : "Long list generated successfully",
      });
    } catch (error) {
      console.error('Error generating long list:', error);
      toast({
        title: "Error",
        description: "Failed to generate long list",
        variant: "destructive",
      });
    }
  };

  const handleGenerateShortList = async () => {
    if (!job?.["Job ID"] || candidates.length === 0) {
      toast({
        title: "Error",
        description: "No candidates available to process",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingShortList(true);
    
    // Set button disabled for 30 minutes (1800 seconds)
    const disabledUntil = Date.now() + (30 * 60 * 1000)
    const storageKey = `shortlist_${id}_disabled`
    localStorage.setItem(storageKey, disabledUntil.toString())
    setShortListButtonDisabled(true)
    setShortListTimeRemaining(30 * 60) // 30 minutes in seconds
    
    try {
      // Process each candidate individually with their callid
      for (const candidate of candidates) {
        const payload = {
          candidateID: candidate["Candidate_ID"],
          jobID: job["Job ID"],
          callid: candidate["callid"]
        };

        // Make HTTP request to the webhook for each candidate
        const response = await fetch('https://hook.eu2.make.com/i3owa6dmu1mstug4tsfb0dnhhjfh4arj', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      toast({
        title: "Success",
        description: "Short list generation initiated successfully",
      });
    } catch (error) {
      console.error('Error generating short list:', error);
      toast({
        title: "Error",
        description: "Failed to generate short list",
        variant: "destructive",
      });
      // Remove the disabled state if there was an error
      localStorage.removeItem(storageKey)
      setShortListButtonDisabled(false)
      setShortListTimeRemaining(0)
    } finally {
      setIsGeneratingShortList(false);
    }
  };

  const handleCallCandidate = async (candidateId: string, jobId: string, callid: number | null | undefined) => {
    try {
      setCallingCandidateId(candidateId);
      const payload = { candidateID: candidateId, jobID: jobId, callid };
      const response = await fetch('https://hook.eu2.make.com/i3owa6dmu1mstug4tsfb0dnhhjfh4arj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      toast({ title: 'Success', description: 'Call initiated successfully' });
    } catch (error) {
      console.error('Error calling candidate:', error);
      toast({ title: 'Error', description: 'Failed to initiate call', variant: 'destructive' });
    } finally {
      setCallingCandidateId(null);
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    )
  }

  if (!job) {
    return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <h2 className="text-2xl font-bold text-muted-foreground">Job not found</h2>
          <Button onClick={() => navigate('/jobs')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
    )
  }

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default'
      case 'closed':
        return 'destructive'
      case 'draft':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getScoreBadge = (score: string | null) => {
    if (!score || score === "0" || score === "") return null
    
    const numScore = parseInt(score)
    if (numScore >= 75) {
      return <Badge className="bg-green-600 text-white border-0">{score} - High</Badge>
    } else if (numScore >= 50) {
      return <Badge className="bg-blue-600 text-white border-0">{score} - Moderate</Badge>
    } else if (numScore >= 1) {
      return <Badge className="bg-red-600 text-white border-0">{score} - Low</Badge>
    }
    return null
  }

  const formatCurrency = (amountStr: string | null | undefined, currency?: string | null) => {
    const amount = parseFloat((amountStr || "").toString().replace(/[^0-9.]/g, ""));
    if (!amount || !currency) return amountStr || "N/A";
    try {
      return new Intl.NumberFormat("en", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    } catch {
      return `${currency} ${isNaN(amount) ? amountStr : amount.toLocaleString()}`;
    }
  };

  // Filtered candidates based on all filters
  const filteredCandidates = candidates.filter(candidate => {
    const nameMatch = !nameFilter || (candidate["Candidate Name"] || "").toLowerCase().includes(nameFilter.toLowerCase())
    const emailMatch = !emailFilter || (candidate["Candidate Email"] || "").toLowerCase().includes(emailFilter.toLowerCase())
    const phoneMatch = !phoneFilter || (candidate["Candidate Phone Number"] || "").includes(phoneFilter)
    
    let scoreMatch = true
    if (scoreFilter !== "all") {
      const score = parseInt(candidate["Success Score"] || "0")
      switch (scoreFilter) {
        case "high":
          scoreMatch = score >= 75
          break
        case "moderate":
          scoreMatch = score >= 50 && score < 75
          break
        case "poor":
          scoreMatch = score > 0 && score < 50
          break
        case "none":
          scoreMatch = score === 0 || !candidate["Success Score"]
          break
      }
    }
    
    let contactedMatch = true
    if (contactedFilter !== "all") {
      const raw = (candidate["Contacted"] || "").toString().trim()
      const norm = raw.toLowerCase()
      if (contactedFilter === "Not Contacted") {
        // Treat empty/undefined and case variations as "Not Contacted"
        contactedMatch = raw === "" || norm === "not contacted"
      } else {
        contactedMatch = norm === contactedFilter.toLowerCase()
      }
    }
    
    return nameMatch && emailMatch && phoneMatch && scoreMatch && contactedMatch
  })

  const uniqueContactedStatuses = [...new Set(candidates.map(c => c["Contacted"]).filter(Boolean))]

  // Get CV status for a candidate
  const getCandidateStatus = (candidateId: string) => {
    const cvRecord = cvData.find(cv => cv['candidate_id'] === candidateId)
    return cvRecord?.['CandidateStatus'] || null
  }

  // Short list candidates (score 74+)
  const shortListCandidates = candidates.filter(candidate => {
    const score = parseInt(candidate["Success Score"] || "0")
    return score >= 74
  })

  return (
      <div className="space-y-4 md:space-y-6 p-4 md:p-6 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>
                <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Back to Jobs</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold truncate">Job Details</h1>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button onClick={() => navigate(`/jobs/edit/${job["Job ID"]}`)} size="sm" className="w-full sm:w-auto">
                <FileText className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Edit Job</span>
                <span className="sm:hidden">Edit</span>
              </Button>
              <Button variant="outline" asChild size="sm" className="w-full sm:w-auto">
                <Link to={`/job/${job["Job ID"]}/apply`}>
                  <span className="hidden sm:inline">Apply Link</span>
                  <span className="sm:hidden">Apply</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Job Header Card */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <h2 className="text-xl md:text-2xl font-bold break-words">{job["Job Title"]}</h2>
                  <p className="text-base md:text-lg text-muted-foreground break-words">{job["Client Description"] || "Client Description"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Funnel */}
        <JobFunnel candidates={candidates} jobAssignment={job?.assignment} />

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="w-full overflow-x-auto">
            <TabsList className="w-full min-w-[400px] grid grid-cols-6 h-auto p-1">
              <TabsTrigger value="overview" className="text-xs md:text-sm px-2 py-2">Overview</TabsTrigger>
              <TabsTrigger value="description" className="text-xs md:text-sm px-2 py-2">Description</TabsTrigger>
              <TabsTrigger value="requirements" className="text-xs md:text-sm px-2 py-2">AI Requirements</TabsTrigger>
              <TabsTrigger value="applications" className="text-xs md:text-sm px-2 py-2">Applications</TabsTrigger>
              <TabsTrigger value="candidates" className="text-xs md:text-sm px-2 py-2">AI Long List</TabsTrigger>
              <TabsTrigger value="shortlist" className="text-xs md:text-sm px-2 py-2">AI Short List</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job ID:</span>
                  <span className="font-mono text-sm">{job["Job ID"]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client:</span>
                  <span>{job["Client Description"] || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span>{job["Job Location"] || "N/A"}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="description" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{job["Job Description"] || "No description available"}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Things to look for:</h4>
                    <p>{job["Things to look for"] || "No specific criteria listed."}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Must have:</h4>
                    <p>{job.musttohave || "No must-have requirements specified."}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Nice to Have:</h4>
                    <p>{job.nicetohave || "No nice-to-have requirements specified."}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Applications ({applications.length})
                    </CardTitle>
                    <CardDescription>
                      Candidates who applied for this position
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                    <p className="text-muted-foreground">No candidates have applied for this position yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <Card key={application.candidate_id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                                {(application.first_name?.[0] || "") + (application.last_name?.[0] || "")}
                              </div>
                              <div>
                                <h4 className="font-semibold text-lg">
                                  {`${application.first_name || ""} ${application.last_name || ""}`.trim() || "N/A"}
                                </h4>
                                <p className="text-sm text-muted-foreground">{application.Title || "No title specified"}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span>{application.Email || "No email"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span>{application.phone_number || "No phone"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{application.Location || "No location"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>Applied: {formatDate(application.Timestamp)}</span>
                              </div>
                            </div>
                            {application.cv_summary && (
                              <div className="text-sm text-muted-foreground">
                                <strong>Summary:</strong> {application.cv_summary}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            {application.CV_Link && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={application.CV_Link} target="_blank" rel="noopener noreferrer">
                                  <FileText className="w-4 h-4 mr-2" />
                                  View CV
                                </a>
                              </Button>
                            )}
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/candidate/${application.candidate_id}`}>
                                <Users className="w-4 h-4 mr-2" />
                                View Profile
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Long List</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Long list candidates content here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shortlist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Short List</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Short list candidates content here...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}
