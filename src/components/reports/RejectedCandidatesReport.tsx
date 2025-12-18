import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Ban, Briefcase, Users, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useProfile } from "@/hooks/useProfile";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { format } from "date-fns";

interface RejectedCandidate {
  candidate_name: string | null;
  job_id: string;
  job_title: string | null;
  recruiter_id: string | null;
  recruiter_name: string | null;
  rejection_reason: string | null;
  rejected_at: string | null;
}

const REASON_CATEGORIES = [
  { key: "overbudget", label: "Overbudget", color: "hsl(0, 84%, 60%)", keywords: ["overbudget", "budget", "salary", "expensive", "cost"] },
  { key: "notice_period", label: "Notice Period", color: "hsl(25, 95%, 53%)", keywords: ["notice", "period", "availability", "available"] },
  { key: "lack_skills", label: "Lack Mandatory Skills", color: "hsl(48, 96%, 53%)", keywords: ["skill", "experience", "qualification", "technical", "mandatory", "lack"] },
  { key: "not_cultural_fit", label: "Not Cultural Fit", color: "hsl(142, 71%, 45%)", keywords: ["cultural", "fit", "culture", "team"] },
  { key: "communication", label: "Communication Skills", color: "hsl(217, 91%, 60%)", keywords: ["communication", "english", "language", "speaking"] },
  { key: "nationality", label: "Nationality Restrictions", color: "hsl(263, 70%, 50%)", keywords: ["nationality", "visa", "work permit", "location"] },
  { key: "other", label: "Other", color: "hsl(220, 9%, 46%)", keywords: [] },
];

function categorizeReason(reason: string | null): string {
  if (!reason) return "other";
  const lowerReason = reason.toLowerCase();
  
  for (const category of REASON_CATEGORIES) {
    if (category.key === "other") continue;
    if (category.keywords.some(keyword => lowerReason.includes(keyword))) {
      return category.key;
    }
  }
  return "other";
}

export function RejectedCandidatesReport() {
  const [candidates, setCandidates] = useState<RejectedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [recruiterFilter, setRecruiterFilter] = useState<string>("all");
  
  const { isAdmin, isManagement } = useUserRole();
  const { profile } = useProfile();

  useEffect(() => {
    fetchRejectedCandidates();
  }, []);

  const fetchRejectedCandidates = async () => {
    setLoading(true);
    try {
      // Fetch rejected candidates from Jobs_CVs
      const { data: jobsCvs, error: jobsCvsError } = await supabase
        .from("Jobs_CVs")
        .select("candidate_name, job_id, recruiter_id, Reason_to_reject, shortlisted_at")
        .eq("contacted", "Rejected")
        .order("shortlisted_at", { ascending: false });

      if (jobsCvsError) throw jobsCvsError;

      // Fetch all jobs
      const { data: jobs, error: jobsError } = await supabase
        .from("Jobs")
        .select("job_id, job_title");

      if (jobsError) throw jobsError;

      // Fetch all profiles for recruiter names
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, linkedin_id, name");

      if (profilesError) throw profilesError;

      // Create lookup maps
      const jobsMap = new Map(jobs?.map(j => [j.job_id, j.job_title]) || []);
      const profilesMap = new Map<string, string>();
      profiles?.forEach(p => {
        if (p.user_id) profilesMap.set(p.user_id, p.name || "Unknown");
        if (p.linkedin_id) profilesMap.set(p.linkedin_id, p.name || "Unknown");
      });

      // Map the data
      const mappedCandidates: RejectedCandidate[] = (jobsCvs || []).map(jc => ({
        candidate_name: jc.candidate_name,
        job_id: jc.job_id,
        job_title: jobsMap.get(jc.job_id) || "Unknown Job",
        recruiter_id: jc.recruiter_id,
        recruiter_name: jc.recruiter_id ? (profilesMap.get(jc.recruiter_id) || "Unknown") : "Unknown",
        rejection_reason: jc.Reason_to_reject,
        rejected_at: jc.shortlisted_at,
      }));

      setCandidates(mappedCandidates);
    } catch (error) {
      console.error("Error fetching rejected candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter candidates based on role
  const roleFilteredCandidates = useMemo(() => {
    if (isAdmin || isManagement) return candidates;
    if (!profile) return [];
    
    return candidates.filter(c => 
      c.recruiter_id === profile.user_id || 
      c.recruiter_id === profile.linkedin_id
    );
  }, [candidates, isAdmin, isManagement, profile]);

  // Apply search and filters
  const filteredCandidates = useMemo(() => {
    return roleFilteredCandidates.filter(c => {
      const matchesSearch = !searchTerm || 
        c.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.recruiter_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesJob = jobFilter === "all" || c.job_id === jobFilter;
      const matchesRecruiter = recruiterFilter === "all" || c.recruiter_id === recruiterFilter;
      
      return matchesSearch && matchesJob && matchesRecruiter;
    });
  }, [roleFilteredCandidates, searchTerm, jobFilter, recruiterFilter]);

  // Get unique jobs and recruiters for filters
  const uniqueJobs = useMemo(() => {
    const jobsMap = new Map<string, string>();
    roleFilteredCandidates.forEach(c => {
      if (c.job_id && c.job_title) {
        jobsMap.set(c.job_id, c.job_title);
      }
    });
    return Array.from(jobsMap.entries());
  }, [roleFilteredCandidates]);

  const uniqueRecruiters = useMemo(() => {
    const recruitersMap = new Map<string, string>();
    roleFilteredCandidates.forEach(c => {
      if (c.recruiter_id && c.recruiter_name) {
        recruitersMap.set(c.recruiter_id, c.recruiter_name);
      }
    });
    return Array.from(recruitersMap.entries());
  }, [roleFilteredCandidates]);

  // Calculate pie chart data
  const pieChartData = useMemo(() => {
    const reasonCounts = new Map<string, number>();
    
    filteredCandidates.forEach(c => {
      const category = categorizeReason(c.rejection_reason);
      reasonCounts.set(category, (reasonCounts.get(category) || 0) + 1);
    });

    return REASON_CATEGORIES
      .filter(cat => reasonCounts.has(cat.key))
      .map(cat => ({
        name: cat.label,
        value: reasonCounts.get(cat.key) || 0,
        color: cat.color,
      }));
  }, [filteredCandidates]);

  // Get top rejection reason
  const topReason = useMemo(() => {
    if (pieChartData.length === 0) return "N/A";
    return pieChartData.reduce((a, b) => a.value > b.value ? a : b).name;
  }, [pieChartData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-light font-work tracking-tight text-foreground flex items-center gap-2">
          <Ban className="w-6 h-6 text-destructive" />
          Rejected Candidates Report
        </h2>
        <p className="text-sm text-muted-foreground font-light font-inter">
          Track all rejected candidates with reasons and analytics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Ban className="w-4 h-4" />
              Total Rejected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-destructive">{filteredCandidates.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Unique Jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{uniqueJobs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Recruiters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{uniqueRecruiters.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Top Reason
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold truncate">{topReason}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-light font-work">Rejection Reason Breakdown</CardTitle>
          <CardDescription className="font-light font-inter">
            Distribution of rejection reasons by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pieChartData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                    formatter={(value: number) => [`${value} candidates`, "Count"]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No rejection data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates, jobs, or recruiters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={jobFilter} onValueChange={setJobFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by Job" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            {uniqueJobs.map(([id, title]) => (
              <SelectItem key={id} value={id}>{title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={recruiterFilter} onValueChange={setRecruiterFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by Recruiter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Recruiters</SelectItem>
            {uniqueRecruiters.map(([id, name]) => (
              <SelectItem key={id} value={id}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-light font-work">Rejected Candidates</CardTitle>
          <CardDescription className="font-light font-inter">
            Showing {filteredCandidates.length} rejected candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead className="hidden md:table-cell">Recruiter</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No rejected candidates found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCandidates.slice(0, 50).map((candidate, index) => (
                    <TableRow key={`${candidate.job_id}-${index}`}>
                      <TableCell className="font-medium">
                        {candidate.candidate_name || "Unknown"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {candidate.job_title}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {candidate.recruiter_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="text-xs truncate max-w-[150px]">
                          {candidate.rejection_reason || "Not specified"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {candidate.rejected_at 
                          ? format(new Date(candidate.rejected_at), "MMM d, yyyy")
                          : "N/A"
                        }
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {filteredCandidates.length > 50 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Showing first 50 of {filteredCandidates.length} candidates
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
