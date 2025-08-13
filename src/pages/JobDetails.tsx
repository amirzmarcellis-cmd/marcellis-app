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

  const handleButtonClick = () => {
    if (job?.longlist && job.longlist > 0) {
      setShowConfirmDialog(true);
    } else {
      handleGenerateLongList();
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
      <div className="space-y-6 overflow-x-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/jobs')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <h1 className="text-2xl sm:text-3xl font-bold">Job Details</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              onClick={handleButtonClick}
              disabled={job?.longlist === 3}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4 mr-2" />
              {job?.longlist && job.longlist > 0 ? "Re-generate Long List" : "Generate Long List"}
            </Button>
            <Button onClick={() => navigate(`/jobs/edit/${job["Job ID"]}`)}>
              <FileText className="w-4 h-4 mr-2" />
              Edit Job
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/job/${job["Job ID"]}/apply`}>
                Apply Link
              </Link>
            </Button>
          </div>
        </div>

        {/* Job Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{job["Job Title"]}</h2>
                <p className="text-lg text-muted-foreground">{job["Client Description"] || "Client Description"}</p>
              </div>
              <Badge 
                variant={job.Processed === true || job.Processed === "true" || job.Processed === "Yes" ? "default" : "destructive"}
                className={`text-sm px-3 py-1 ${job.Processed === true || job.Processed === "true" || job.Processed === "Yes" ? "bg-green-600 text-white border-0" : "bg-red-600 text-white border-0"}`}
              >
                {job.Processed === true || job.Processed === "true" || job.Processed === "Yes" ? "Active" : "Not Active"}
              </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{job["Job Location"]}</span>
                </div>
<div className="flex items-center space-x-2 text-sm">
                  <Banknote className="w-4 h-4 text-muted-foreground" />
                  <span>{formatCurrency(job["Job Salary Range (ex: 15000 AED)"], job["Currency"])}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Posted: {formatDate(job.Timestamp)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information Tabs */}
         <Tabs defaultValue="overview" className="space-y-4">
           <div className="overflow-x-auto">
             <TabsList className="min-w-[560px] inline-flex">
               <TabsTrigger value="overview">Overview</TabsTrigger>
               <TabsTrigger value="description">Job Description</TabsTrigger>
               <TabsTrigger value="requirements">AI Requirements</TabsTrigger>
               <TabsTrigger value="candidates">AI Long List</TabsTrigger>
               <TabsTrigger value="shortlist">AI Short List</TabsTrigger>
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
                      className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                     <Card className="p-4 mb-4 bg-muted/50">
                       <div className="flex items-center gap-2 mb-3">
                         <Filter className="w-4 h-4" />
                         <h4 className="font-medium">Filters</h4>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                         <div className="relative">
                           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                           <Input
                             placeholder="Filter by name..."
                             value={nameFilter}
                             onChange={(e) => setNameFilter(e.target.value)}
                             className="pl-10 h-8"
                           />
                         </div>
                         <Input
                           placeholder="Filter by email..."
                           value={emailFilter}
                           onChange={(e) => setEmailFilter(e.target.value)}
                           className="h-8"
                         />
                         <Input
                           placeholder="Filter by phone..."
                           value={phoneFilter}
                           onChange={(e) => setPhoneFilter(e.target.value)}
                           className="h-8"
                         />
                         <Select value={scoreFilter} onValueChange={setScoreFilter}>
                           <SelectTrigger className="h-8">
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
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="all">All Status</SelectItem>
                               <SelectItem value="Not Contacted">Not Contacted</SelectItem>
                               <SelectItem value="Ready to Call">Ready to Call</SelectItem>
                               <SelectItem value="Contacted">Contacted</SelectItem>
                               <SelectItem value="Call Done">Call Done</SelectItem>
                               <SelectItem value="1st No Answer">1st No Answer</SelectItem>
                               <SelectItem value="2nd No Answer">2nd No Answer</SelectItem>
                               <SelectItem value="3rd No Answer">3rd No Answer</SelectItem>
                               <SelectItem value="Low Scored">Low Scored</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                     </Card>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                <CardContent className="p-4">
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="font-semibold">{mainCandidate["Candidate Name"] || "Unknown"}</h4>
                                        <p className="text-sm text-muted-foreground">{candidateId}</p>
                                      </div>
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
                                        <Button
                                          variant="default"
                                          size="sm"
                                          onClick={() => handleCallCandidate(mainCandidate["Candidate_ID"], id!, mainCandidate["callid"])}
                                          disabled={callingCandidateId === candidateId}
                                          className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                                        >
                                          <Phone className="w-3 h-3 mr-1" />
                                          {callingCandidateId === candidateId ? 'Calling...' : 'Call Candidate'}
                                        </Button>
                                        {candidateContacts.map((contact, contactIndex) => (
                                          <Button
                                            key={contactIndex}
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="flex-1 min-w-[100px]"
                                          >
                                           <Link to={`/call-log-details?candidate=${candidateId}&job=${id}`}>
                                             <Phone className="w-3 h-3 mr-1" />
                                             {candidateContacts.length > 1 ? (contactIndex === 0 ? 'Log' : `Log ${contactIndex + 1}`) : 'Log'}
                                           </Link>
                                          </Button>
                                        ))}
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
                    Short List ({shortListCandidates.length} candidates with 74+ score)
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                    <div>
                                      <h4 className="font-semibold">{mainCandidate["Candidate Name"] || "Unknown"}</h4>
                                      <p className="text-sm text-muted-foreground">{candidateId}</p>
                                    </div>
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
                                      {candidateContacts.map((contact, contactIndex) => (
                                        <Button
                                          key={contactIndex}
                                          variant="outline"
                                          size="sm"
                                          asChild
                                          className="flex-1 min-w-[100px]"
                                        >
                                           <Link to={`/call-log-details?candidate=${candidateId}&job=${id}`}>
                                             <Phone className="w-3 h-3 mr-1" />
                                             {candidateContacts.length > 1 ? (contactIndex === 0 ? 'Log' : `Log ${contactIndex + 1}`) : 'Log'}
                                           </Link>
                                        </Button>
                                      ))}
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