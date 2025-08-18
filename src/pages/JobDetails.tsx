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
import { ArrowLeft, MapPin, Calendar, Banknote, Users, FileText, Clock, Target, Phone, Mail, Star, Search, Filter, Upload, Zap, X, UserCheck } from "lucide-react"
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
  const [activeTab, setActiveTab] = useState("overview")
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState<any[]>([])
  const [candidatesLoading, setCandidatesLoading] = useState(true)
  const [cvData, setCvData] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [nameFilter, setNameFilter] = useState("")
  const [emailFilter, setEmailFilter] = useState("")
  const [phoneFilter, setPhoneFilter] = useState("")
  const [scoreFilter, setScoreFilter] = useState("all")
  const [contactedFilter, setContactedFilter] = useState("all")
  // Application filters
  const [appNameFilter, setAppNameFilter] = useState("")
  const [appEmailFilter, setAppEmailFilter] = useState("")
  const [appPhoneFilter, setAppPhoneFilter] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isGeneratingShortList, setIsGeneratingShortList] = useState(false)
  const [shortListButtonDisabled, setShortListButtonDisabled] = useState(false)
  const [shortListTimeRemaining, setShortListTimeRemaining] = useState(0)
  const { toast } = useToast()
  const [callingCandidateId, setCallingCandidateId] = useState<string | null>(null)
  const [newApplicationsCount, setNewApplicationsCount] = useState(0)
  const [lastViewedApplications, setLastViewedApplications] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchJob(id)
      fetchCandidates(id)
      fetchCvData()
      fetchApplications(id)
      checkShortListButtonStatus()
      // Load last viewed timestamp for applications
      const lastViewed = localStorage.getItem(`lastViewedApplications_${id}`)
      setLastViewedApplications(lastViewed)
    }
    
    // Check for tab in URL hash
    const hash = window.location.hash
    if (hash.startsWith('#tab=')) {
      const tab = hash.substring(5)
      setActiveTab(tab)
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

  // Calculate new applications count
  useEffect(() => {
    if (applications.length > 0 && lastViewedApplications) {
      const lastViewedTimestamp = new Date(lastViewedApplications)
      const newApps = applications.filter(app => {
        const appTimestamp = new Date(app.Timestamp)
        return appTimestamp > lastViewedTimestamp
      })
      setNewApplicationsCount(newApps.length)
    } else if (applications.length > 0 && !lastViewedApplications) {
      // If never viewed, all applications are new
      setNewApplicationsCount(applications.length)
    } else {
      setNewApplicationsCount(0)
    }
  }, [applications, lastViewedApplications])

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
    setApplicationsLoading(true)
    try {
      const { data, error } = await supabase
        .from('CVs')
        .select('*')
        .filter('applied_for', 'cs', `{${jobId}}`)

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

  const handleRejectCandidate = async (jobId: string, candidateId: string, callid: number) => {
    try {
      const response = await fetch('https://hook.eu2.make.com/castzb5q0mllr7eq9zzyqll4ffcpet7j', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: jobId,
          candidate_id: candidateId,
          callid: callid
        })
      })

      if (response.ok) {
        toast({
          title: "Candidate Rejected",
          description: "The candidate has been successfully rejected.",
        })
      } else {
        throw new Error('Failed to reject candidate')
      }
    } catch (error) {
      console.error('Error rejecting candidate:', error)
      toast({
        title: "Error",
        description: "Failed to reject candidate. Please try again.",
        variant: "destructive"
      })
    }
  }

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

  const handleArrangeInterview = async (candidateId: string) => {
    try {
      await supabase.from('CVs').update({
        CandidateStatus: 'Interview'
      }).eq('candidate_id', candidateId);

      // Update local state
      setCvData(prev => prev.map(cv => 
        cv.candidate_id === candidateId 
          ? { ...cv, CandidateStatus: 'Interview' }
          : cv
      ));

      toast({
        title: "Interview Arranged",
        description: "The candidate has been scheduled for an interview.",
      });
    } catch (error) {
      console.error('Error arranging interview:', error);
      toast({
        title: "Error",
        description: "Failed to arrange interview. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleApplicationsTabClick = () => {
    // Reset notification count and update last viewed timestamp
    if (id) {
      const now = new Date().toISOString()
      localStorage.setItem(`lastViewedApplications_${id}`, now)
      setLastViewedApplications(now)
      setNewApplicationsCount(0)
    }
  }

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
      return <Badge className="bg-green-600 text-foreground border-0">{score} - High</Badge>
    } else if (numScore >= 50) {
      return <Badge className="bg-blue-600 text-foreground border-0">{score} - Moderate</Badge>
    } else if (numScore >= 1) {
      return <Badge className="bg-red-600 text-foreground border-0">{score} - Low</Badge>
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
      } else if (contactedFilter === "Ready to Call") {
        // For "Ready to Contact", match both "Ready to Contact" and "Ready to Contact contacted"
        contactedMatch = norm.includes("ready to contact") || norm.includes("ready to call")
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
            <div className="flex flex-col sm:flex-row gap-2">
              {job?.longlist && job.longlist > 0 ? (
                <Button 
                  onClick={handleSearchMoreCandidates}
                  className="bg-foreground text-background hover:bg-foreground/90 text-sm w-full sm:w-auto"
                  size="sm"
                >
                  <Search className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Search for more candidates</span>
                  <span className="sm:hidden">Search More</span>
                </Button>
              ) : (
                <Button 
                  onClick={handleButtonClick}
                  disabled={job?.longlist === 3}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full sm:w-auto"
                  size="sm"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Generate Long List</span>
                  <span className="sm:hidden">Generate List</span>
                </Button>
              )}
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
                <Badge 
                  variant={job.Processed === true || job.Processed === "true" || job.Processed === "Yes" ? "default" : "destructive"}
                  className={`text-xs md:text-sm px-2 md:px-3 py-1 whitespace-nowrap ${job.Processed === true || job.Processed === "true" || job.Processed === "Yes" ? "bg-green-600 text-white border-0" : "bg-red-600 text-white border-0"}`}
                >
                  {job.Processed === true || job.Processed === "true" || job.Processed === "Yes" ? "Active" : "Not Active"}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pt-4 border-t">
                <div className="flex items-center space-x-2 text-xs md:text-sm min-w-0">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{job["Job Location"]}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs md:text-sm min-w-0">
                  <Banknote className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{formatCurrency(job["Job Salary Range (ex: 15000 AED)"], job["Currency"])}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs md:text-sm min-w-0 sm:col-span-2 lg:col-span-1">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">Posted: {formatDate(job.Timestamp)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

          {/* Job Funnel */}
          <JobFunnel candidates={candidates} jobAssignment={job?.assignment} />

          {/* Detailed Information Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
             <div className="w-full overflow-x-auto">
               <TabsList className="w-full min-w-[400px] grid grid-cols-6 h-auto p-1">
                 <TabsTrigger value="overview" className="text-xs md:text-sm px-2 py-2">Overview</TabsTrigger>
                 <TabsTrigger value="description" className="text-xs md:text-sm px-2 py-2">Description</TabsTrigger>
                 <TabsTrigger value="requirements" className="text-xs md:text-sm px-2 py-2">AI Requirements</TabsTrigger>
                  <TabsTrigger value="applications" className="text-xs md:text-sm px-2 py-2 relative" onClick={handleApplicationsTabClick}>
                    Applications
                    {newApplicationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] z-10">
                        {newApplicationsCount > 99 ? '99+' : newApplicationsCount}
                      </span>
                    )}
                  </TabsTrigger>
                 <TabsTrigger value="candidates" className="text-xs md:text-sm px-2 py-2">AI Long List</TabsTrigger>
                 <TabsTrigger value="shortlist" className="text-xs md:text-sm px-2 py-2">AI Short List</TabsTrigger>
               </TabsList>
             </div>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Salary Range:</span>
                    <span className="font-medium">
                      {formatCurrency(job["Job Salary Range (ex: 15000 AED)"], job["Currency"])}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Notice Period:</span>
                    <span>{job["Notice Period"] || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Requirements & Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nationality to Include:</span>
                    <span>{job["Nationality to include"] || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nationality to Exclude:</span>
                    <span>{job["Nationality to Exclude"] || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Job Type:</span>
                    <span>
                      {job["Type"] || "N/A"}
                      {job["Contract Length"] && job["Type"] === "Contract" && ` (${job["Contract Length"]})`}
                    </span>
                  </div>
                  {job["assignment"] && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assignment Link:</span>
                      <a 
                        href={job["assignment"]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all"
                      >
                        View Assignment
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posted Date:</span>
                    <span>{job.Timestamp ? formatDate(job.Timestamp) : "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">JD Summary:</span>
                    <span>{job["JD Summary"] || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

           <TabsContent value="description" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Job Description
                    </CardTitle>
                    <CardDescription>
                      Detailed overview of the role and responsibilities
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/jobs/edit/${job["Job ID"]}`)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Edit Job
                    </Button>
                  </div>
                </div>
              </CardHeader>
               <CardContent>
                 <div className="prose prose-sm max-w-none">
                   <p className="leading-relaxed whitespace-pre-wrap">
                     {job["Job Description"] || "No description available for this position."}
                   </p>
                 </div>
               </CardContent>
             </Card>

             {/* Job Documents Section */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center">
                   <FileText className="w-5 h-5 mr-2" />
                   Job Documents
                 </CardTitle>
                 <CardDescription>
                   Uploaded job description files and related documents
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="text-center py-8">
                   <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                   <h3 className="text-lg font-semibold mb-2">No documents uploaded</h3>
                   <p className="text-muted-foreground">Upload job description files when creating or editing this job</p>
                   <Button variant="outline" className="mt-4" onClick={() => setIsEditDialogOpen(true)}>
                     <Upload className="w-4 h-4 mr-2" />
                     Upload Documents
                   </Button>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>

           <TabsContent value="requirements" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      AI Requirements
                    </CardTitle>
                    <CardDescription>
                      Skills, experience, and qualifications needed for this role
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/jobs/edit/${job["Job ID"]}`)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Amend
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Things to look for:</h4>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {job["Things to look for"] || "No specific criteria listed."}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Must have:</h4>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {job.musttohave || "No must-have requirements specified."}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Nice to Have:</h4>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {job.nicetohave || "No nice-to-have requirements specified."}
                    </p>
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
                       <FileText className="w-5 h-5 mr-2" />
                       Applications ({applications.length})
                     </CardTitle>
                     <CardDescription>
                       Candidates who have applied for this position
                     </CardDescription>
                   </div>
                 </div>
                </CardHeader>
                <CardContent>
                  {/* Application Filters */}
                  <Card className="mb-4">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Name</label>
                          <Input
                            placeholder="Filter by name..."
                            value={appNameFilter}
                            onChange={(e) => setAppNameFilter(e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email</label>
                          <Input
                            placeholder="Filter by email..."
                            value={appEmailFilter}
                            onChange={(e) => setAppEmailFilter(e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Phone</label>
                          <Input
                            placeholder="Filter by phone..."
                            value={appPhoneFilter}
                            onChange={(e) => setAppPhoneFilter(e.target.value)}
                            className="h-9"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {applicationsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No applications found for this job.
                    </div>
                  ) : (
                    (() => {
                      // Filter applications based on name, email, and phone
                      const filteredApplications = applications.filter(application => {
                        const fullName = application.first_name && application.last_name 
                          ? `${application.first_name} ${application.last_name}` 
                          : application.first_name || application.last_name || "";
                        const email = application.Email || "";
                        const phone = application.phone_number || "";

                        const nameMatch = !appNameFilter || fullName.toLowerCase().includes(appNameFilter.toLowerCase());
                        const emailMatch = !appEmailFilter || email.toLowerCase().includes(appEmailFilter.toLowerCase());
                        const phoneMatch = !appPhoneFilter || phone.includes(appPhoneFilter);

                        return nameMatch && emailMatch && phoneMatch;
                      });

                      return (
                        <div>
                          <div className="mb-4 text-sm text-muted-foreground">
                            Showing {filteredApplications.length} of {applications.length} applications
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredApplications.map((application) => (
                       <Card key={application.candidate_id} className="border border-border/50 hover:border-primary/50 transition-colors hover:shadow-lg">
                         <CardContent className="p-3 md:p-4">
                           <div className="space-y-3">
                             <div className="flex items-start justify-between">
                               <div className="min-w-0 flex-1">
                                 <h4 className="font-semibold text-sm md:text-base truncate">
                                   {application.first_name && application.last_name 
                                     ? `${application.first_name} ${application.last_name}` 
                                     : application.first_name || application.last_name || "Unknown"}
                                 </h4>
                                 <p className="text-xs md:text-sm text-muted-foreground truncate">{application.candidate_id}</p>
                               </div>
                             </div>
                             
                             <div className="space-y-2 text-xs md:text-sm">
                               {application.Email && (
                                 <div className="flex items-center text-muted-foreground min-w-0">
                                   <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                                   <span className="truncate">{application.Email}</span>
                                 </div>
                               )}
                               
                               {application.phone_number && (
                                 <div className="flex items-center text-muted-foreground min-w-0">
                                   <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                                   <span className="truncate">{application.phone_number}</span>
                                 </div>
                               )}
                             </div>

                             {application.cv_summary && (
                               <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                                 {application.cv_summary}
                               </p>
                             )}

                             <div className="flex items-center justify-between pt-2 border-t gap-2">
                               <div className="flex items-center gap-2">
                                 {application.CV_Link && (
                                   <Button variant="outline" size="sm" asChild>
                                     <a href={application.CV_Link} target="_blank" rel="noopener noreferrer">
                                       <FileText className="w-4 h-4 mr-1" />
                                       CV
                                     </a>
                                   </Button>
                                 )}
                                 <Button variant="outline" size="sm" asChild>
                                   <Link to={`/candidate/${application.candidate_id}`}>
                                     View Profile
                                   </Link>
                                 </Button>
                               </div>
                             </div>
                           </div>
                         </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                    );
                  })()
                  )}
                </CardContent>
              </Card>
           </TabsContent>

           <TabsContent value="candidates" className="space-y-4">
             <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Contacted Candidates ({filteredCandidates.length} of {candidates.length})
                      </CardTitle>
                       <CardDescription>
                         Candidates who have been contacted for this position
                       </CardDescription>
                     </div>
                     <Button
                       variant="default" 
                       className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-green-500 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                       onClick={handleGenerateShortList}
                       disabled={isGeneratingShortList || shortListButtonDisabled}
                     >
                       <Phone className="w-4 h-4 mr-2" />
                       {isGeneratingShortList 
                         ? "Generating..." 
                         : shortListButtonDisabled 
                           ? `Short List is being processed (${Math.floor(shortListTimeRemaining / 60)}:${(shortListTimeRemaining % 60).toString().padStart(2, '0')})`
                           : "Call & Generate Short List"
                       }
                     </Button>
                   </div>
                 </CardHeader>
                <CardContent>
                  {(() => {
                    const readyToContactCount = candidates.filter(
                      candidate => candidate["Contacted"] === "Ready to Contact"
                    ).length;
                    
                    if (readyToContactCount > 0) {
                      return (
                        <div className="mb-4 p-3 bg-yellow-100/80 dark:bg-yellow-950/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                          <div className="flex items-center">
                            <Target className="w-4 h-4 mr-2 text-yellow-700 dark:text-yellow-400" />
                            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                              You have {readyToContactCount} Candidate{readyToContactCount > 1 ? 's' : ''} Ready to Contact
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                 {candidatesLoading ? (
                   <div className="flex items-center justify-center py-8">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                   </div>
                 ) : candidates.length === 0 ? (
                   <div className="text-center py-8">
                     <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                     <h3 className="text-lg font-semibold mb-2">No candidates contacted yet</h3>
                     <p className="text-muted-foreground">Start reaching out to potential candidates for this position</p>
                   </div>
                 ) : (
                   <>
                      {/* Filters */}
                      <Card className="p-3 md:p-4 mb-4 bg-muted/50">
                        <div className="flex items-center gap-2 mb-3">
                          <Filter className="w-4 h-4" />
                          <h4 className="font-medium text-sm md:text-base">Filters</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                              placeholder="Name..."
                              value={nameFilter}
                              onChange={(e) => setNameFilter(e.target.value)}
                              className="pl-10 h-9 text-sm"
                            />
                          </div>
                          <Input
                            placeholder="Email..."
                            value={emailFilter}
                            onChange={(e) => setEmailFilter(e.target.value)}
                            className="h-9 text-sm"
                          />
                          <Input
                            placeholder="Phone..."
                            value={phoneFilter}
                            onChange={(e) => setPhoneFilter(e.target.value)}
                            className="h-9 text-sm"
                          />
                          <Select value={scoreFilter} onValueChange={setScoreFilter}>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Score" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Scores</SelectItem>
                              <SelectItem value="high">High (75+)</SelectItem>
                              <SelectItem value="moderate">Moderate (50-74)</SelectItem>
                              <SelectItem value="poor">Poor (1-49)</SelectItem>
                              <SelectItem value="none">No Score</SelectItem>
                            </SelectContent>
                          </Select>
                           <Select value={contactedFilter} onValueChange={setContactedFilter}>
                             <SelectTrigger className="h-9 text-sm">
                               <SelectValue placeholder="Status" />
                             </SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="all">All Status</SelectItem>
                                 <SelectItem value="Not Contacted">Not Contacted</SelectItem>
                                 <SelectItem value="Ready to Call">Ready to Contact</SelectItem>
                                 <SelectItem value="Contacted">Contacted</SelectItem>
                                 <SelectItem value="Call Done">Call Done</SelectItem>
                                 <SelectItem value="1st No Answer">1st No Answer</SelectItem>
                                 <SelectItem value="2nd No Answer">2nd No Answer</SelectItem>
                                 <SelectItem value="3rd No Answer">3rd No Answer</SelectItem>
                                 <SelectItem value="Low Scored">Low Scored</SelectItem>
                                 <SelectItem value="Tasked">Tasked</SelectItem>
                                 <SelectItem value="Rejected">Rejected</SelectItem>
                               </SelectContent>
                           </Select>
                        </div>
                      </Card>

                       <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {(() => {
                          // Group candidates by Candidate_ID to handle multiple contacts
                          const groupedCandidates = filteredCandidates.reduce((acc, candidate) => {
                            const candidateId = candidate["Candidate_ID"]
                            if (!acc[candidateId]) {
                              acc[candidateId] = []
                            }
                            acc[candidateId].push(candidate)
                            return acc
                          }, {} as Record<string, any[]>)

                          return Object.entries(groupedCandidates).map(([candidateId, candidateContacts]: [string, any[]]) => {
                            // Use the first contact for display info
                            const mainCandidate = candidateContacts[0]
                            
                            return (
                                <Card key={candidateId} className="border border-border/50 hover:border-primary/50 transition-colors hover:shadow-lg">
                                  <CardContent className="p-3 md:p-4">
                                    <div className="space-y-3">
                                      <div className="flex items-start justify-between">
                                        <div className="min-w-0 flex-1">
                                          <h4 className="font-semibold text-sm md:text-base truncate">{mainCandidate["Candidate Name"] || "Unknown"}</h4>
                                          <p className="text-xs md:text-sm text-muted-foreground truncate">{candidateId}</p>
                                        </div>
                                        {(mainCandidate["Contacted"]?.toLowerCase() === "call done" || 
                                          mainCandidate["Contacted"]?.toLowerCase() === "contacted" || 
                                          mainCandidate["Contacted"]?.toLowerCase() === "low scored" ||
                                          mainCandidate["Contacted"]?.toLowerCase() === "tasked") && 
                                          mainCandidate["lastcalltime"] && (
                                          <div className="text-xs text-muted-foreground text-right">
                                            <div className="flex items-center">
                                              <Clock className="w-3 h-3 mr-1" />
                                              {new Date(mainCandidate["lastcalltime"]).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs">
                                              {new Date(mainCandidate["lastcalltime"]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                     
                                     <div className="space-y-2 text-xs md:text-sm">
                                       {mainCandidate["Candidate Email"] && (
                                         <div className="flex items-center text-muted-foreground min-w-0">
                                           <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                                           <span className="truncate">{mainCandidate["Candidate Email"]}</span>
                                         </div>
                                       )}
                                       
                                       {mainCandidate["Candidate Phone Number"] && (
                                         <div className="flex items-center text-muted-foreground min-w-0">
                                           <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                                           <span className="truncate">{mainCandidate["Candidate Phone Number"]}</span>
                                         </div>
                                       )}
                                     </div>

                                     {mainCandidate["Summary"] && (
                                       <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                                         {mainCandidate["Summary"]}
                                       </p>
                                     )}

                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t gap-2">
                                        <div className="flex flex-wrap items-center gap-1">
                                          <StatusDropdown
                                            currentStatus={mainCandidate["Contacted"]}
                                            candidateId={mainCandidate["Candidate_ID"]}
                                            jobId={id!}
                                            onStatusChange={(newStatus) => {
                                              setCandidates(prev => prev.map(c => 
                                                c["Candidate_ID"] === mainCandidate["Candidate_ID"] 
                                                  ? { ...c, Contacted: newStatus }
                                                  : c
                                              ))
                                            }}
                                            variant="badge"
                                          />
                                          {getCandidateStatus(mainCandidate["Candidate_ID"]) && (
                                            <StatusDropdown
                                              currentStatus={getCandidateStatus(mainCandidate["Candidate_ID"])}
                                              candidateId={mainCandidate["Candidate_ID"]}
                                              jobId={null}
                                              onStatusChange={(newStatus) => {
                                                setCvData(prev => prev.map(cv => 
                                                  cv['Cadndidate_ID'] === mainCandidate["Candidate_ID"] 
                                                    ? { ...cv, CandidateStatus: newStatus }
                                                    : cv
                                                ))
                                              }}
                                              variant="badge"
                                            />
                                          )}
                                        </div>
                                        {getScoreBadge(mainCandidate["Success Score"])}
                                      </div>

                                     {/* Call Log Buttons */}
                                     <div className="space-y-2 pt-2 border-t">
                                       <div className="flex flex-col sm:flex-row gap-2">
                                          <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => handleCallCandidate(mainCandidate["Candidate_ID"], id!, mainCandidate["callid"])}
                                            disabled={callingCandidateId === candidateId}
                                            className="w-full sm:flex-1 bg-foreground hover:bg-foreground/90 text-background disabled:opacity-50 text-xs md:text-sm"
                                          >
                                           <Phone className="w-3 h-3 mr-1" />
                                           {callingCandidateId === candidateId ? 'Calling...' : 'Call Candidate'}
                                         </Button>
                           {(() => {
                             const contactsWithCalls = candidateContacts.filter(contact => contact.callcount > 0);
                             if (contactsWithCalls.length === 0) return null;
                             
                             // Get the latest call log (highest callid)
                             const latestContact = contactsWithCalls.reduce((latest, current) => 
                               current.callid > latest.callid ? current : latest
                             );
                             
                             return (
                              <Button
                                key={latestContact.callid}
                                variant="outline"
                                size="sm"
                                asChild
                                className="flex-1 min-w-0 text-xs md:text-sm"
                              >
                               <Link 
                                 to={`/call-log-details?candidate=${candidateId}&job=${id}&callid=${latestContact.callid}`} 
                                 className="truncate"
                                 onClick={() => {
                                   // Store current tab in URL hash for back navigation
                                   window.location.hash = 'tab=candidates';
                                 }}
                               >
                                  <FileText className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">Call Log</span>
                                </Link>
                              </Button>
                             );
                           })()}
                                       </div>
                                       <Button
                                         variant="ghost"
                                         size="sm"
                                         asChild
                                         className="w-full text-xs md:text-sm"
                                       >
                                         <Link to={`/candidate/${candidateId}`}>
                                           <Users className="w-3 h-3 mr-1" />
                                           View Profile
                                         </Link>
                                       </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })
                        })()}
                      </div>
                   </>
                 )}
               </CardContent>
             </Card>
            </TabsContent>

           <TabsContent value="shortlist" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    AI Short List ({shortListCandidates.length} candidates with 74+ score)
                  </CardTitle>
                  <CardDescription>
                    High-scoring candidates (74+) who have passed the initial screening
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {shortListCandidates.length === 0 ? (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No high-scoring candidates yet</h3>
                      <p className="text-muted-foreground">Candidates with scores of 74+ will appear here automatically</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {(() => {
                        // Group short list candidates by Candidate_ID
                        const groupedShortList = shortListCandidates.reduce((acc, candidate) => {
                          const candidateId = candidate["Candidate_ID"]
                          if (!acc[candidateId]) {
                            acc[candidateId] = []
                          }
                          acc[candidateId].push(candidate)
                          return acc
                        }, {} as Record<string, any[]>)

                        return Object.entries(groupedShortList).map(([candidateId, candidateContacts]: [string, any[]]) => {
                          const mainCandidate = candidateContacts[0]
                          
                          return (
                            <Card key={candidateId} className="border border-border/50 hover:border-primary/50 transition-colors hover:shadow-lg bg-green-50/50 dark:bg-green-950/20">
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-semibold">{mainCandidate["Candidate Name"] || "Unknown"}</h4>
                                      <p className="text-sm text-muted-foreground">{candidateId}</p>
                                    </div>
                                    {(mainCandidate["Contacted"]?.toLowerCase() === "call done" || 
                                      mainCandidate["Contacted"]?.toLowerCase() === "contacted" || 
                                      mainCandidate["Contacted"]?.toLowerCase() === "low scored" ||
                                      mainCandidate["Contacted"]?.toLowerCase() === "tasked") && 
                                      mainCandidate["lastcalltime"] && (
                                      <div className="text-xs text-muted-foreground text-right">
                                        <div className="flex items-center">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {new Date(mainCandidate["lastcalltime"]).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs">
                                          {new Date(mainCandidate["lastcalltime"]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-2 text-sm">
                                    {mainCandidate["Candidate Email"] && (
                                      <div className="flex items-center text-muted-foreground">
                                        <Mail className="w-4 h-4 mr-2" />
                                        <span className="truncate">{mainCandidate["Candidate Email"]}</span>
                                      </div>
                                    )}
                                    
                                    {mainCandidate["Candidate Phone Number"] && (
                                      <div className="flex items-center text-muted-foreground">
                                        <Phone className="w-4 h-4 mr-2" />
                                        <span>{mainCandidate["Candidate Phone Number"]}</span>
                                      </div>
                                    )}
                                  </div>

                                  {mainCandidate["Summary"] && (
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                      {mainCandidate["Summary"]}
                                    </p>
                                  )}

                                   <div className="flex items-center justify-between pt-2 border-t">
                                     <div className="flex items-center space-x-2">
                                       <StatusDropdown
                                         currentStatus={mainCandidate["Contacted"]}
                                         candidateId={mainCandidate["Candidate_ID"]}
                                         jobId={id!}
                                         onStatusChange={(newStatus) => {
                                           setCandidates(prev => prev.map(c => 
                                             c["Candidate_ID"] === mainCandidate["Candidate_ID"] 
                                               ? { ...c, Contacted: newStatus }
                                               : c
                                           ))
                                         }}
                                         variant="badge"
                                       />
                                       {getCandidateStatus(mainCandidate["Candidate_ID"]) && (
                                         <StatusDropdown
                                           currentStatus={getCandidateStatus(mainCandidate["Candidate_ID"])}
                                           candidateId={mainCandidate["Candidate_ID"]}
                                           jobId={null}
                                           onStatusChange={(newStatus) => {
                                             setCvData(prev => prev.map(cv => 
                                               cv['Cadndidate_ID'] === mainCandidate["Candidate_ID"] 
                                                 ? { ...cv, CandidateStatus: newStatus }
                                                 : cv
                                             ))
                                           }}
                                           variant="badge"
                                         />
                                       )}
                                     </div>
                                     {getScoreBadge(mainCandidate["Success Score"])}
                                   </div>

                                     {/* Call Log Buttons */}
                                     <div className="space-y-2 pt-2 border-t">
                                       <div className="flex flex-wrap gap-2">
                                          {(() => {
                                            const contactsWithCalls = candidateContacts.filter(contact => contact.callcount > 0);
                                            if (contactsWithCalls.length === 0) return null;
                                            
                                            // Get the latest call log (highest callid)
                                            const latestContact = contactsWithCalls.reduce((latest, current) => 
                                              current.callid > latest.callid ? current : latest
                                            );
                                            
                                            return (
                                             <Button
                                               key={latestContact.callid}
                                               variant="outline"
                                               size="sm"
                                               asChild
                                               className="flex-1 min-w-[100px]"
                                             >
                                <Link 
                                  to={`/call-log-details?candidate=${candidateId}&job=${id}&callid=${latestContact.callid}`}
                                  onClick={() => {
                                    // Store current tab in URL hash for back navigation
                                    window.location.hash = 'tab=shortlist';
                                  }}
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  Call Log
                                </Link>
                                             </Button>
                                            );
                                          })()}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          asChild
                                          className="flex-1 min-w-[100px]"
                                        >
                                          <Link to={`/candidate/${candidateId}`}>
                                            <Users className="w-3 h-3 mr-1" />
                                            View Profile
                                          </Link>
                                        </Button>
                                      </div>
                                       {/* Action Buttons - Arrange Interview and Reject */}
                                       <div className="flex gap-2">
                                         <Button
                                           variant="outline"
                                           size="sm"
                                           onClick={() => handleArrangeInterview(candidateId)}
                                           className="flex-1 min-w-[100px] bg-transparent border-2 border-green-500 text-green-600 hover:bg-green-100 hover:border-green-600 hover:text-green-700 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/30 dark:hover:border-green-300 dark:hover:text-green-300 transition-all duration-200"
                                         >
                                           <Calendar className="w-3 h-3 mr-1" />
                                           Arrange Interview
                                         </Button>
                                         {mainCandidate["Contacted"] === "Rejected" ? (
                                           <Button
                                             variant="outline"
                                             size="sm"
                                             className="flex-1 min-w-[100px] bg-transparent border-2 border-gray-400 text-gray-500 cursor-not-allowed"
                                             disabled
                                           >
                                             <X className="w-3 h-3 mr-1" />
                                             Rejected
                                           </Button>
                                         ) : (
                                           <Button
                                             variant="outline"
                                             size="sm"
                                             className="flex-1 min-w-[100px] bg-transparent border-2 border-red-500 text-red-600 hover:bg-red-100 hover:border-red-600 hover:text-red-700 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:border-red-300 dark:hover:text-red-300 transition-all duration-200"
                                             onClick={() => handleRejectCandidate(id!, candidateId, candidateContacts[0].callid)}
                                           >
                                             <X className="w-3 h-3 mr-1" />
                                             Reject Candidate
                                           </Button>
                                         )}
                                       </div>
                                    </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
         
         <JobDialog
           job={job}
           open={isEditDialogOpen}
           onOpenChange={setIsEditDialogOpen}
           onSave={() => {
             fetchJob(id!)
             setIsEditDialogOpen(false)
           }}
         />

         <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
           <AlertDialogContent>
             <AlertDialogHeader>
               <AlertDialogTitle>Regenerate Long List</AlertDialogTitle>
               <AlertDialogDescription>
                 Are you sure you want to regenerate Long List?
               </AlertDialogDescription>
             </AlertDialogHeader>
             <AlertDialogFooter>
               <AlertDialogCancel>Cancel</AlertDialogCancel>
               <AlertDialogAction 
                 onClick={() => {
                   setShowConfirmDialog(false);
                   handleGenerateLongList();
                 }}
               >
                 Yes, Regenerate
               </AlertDialogAction>
             </AlertDialogFooter>
           </AlertDialogContent>
         </AlertDialog>
       </div>
   )
 }