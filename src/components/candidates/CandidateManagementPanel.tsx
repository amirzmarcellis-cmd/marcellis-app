// @ts-nocheck
import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Filter, Phone, Mail, MapPin, Building2, Users, Eye, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CandidateDialog } from "./CandidateDialog";


interface Candidate {
  Cadndidate_ID: string;
  "First Name": string | null;
  "Last Name": string | null;
  Email: string | null;
  "Phone Number": string | null;
  Title: string | null;
  Location: string | null;
  "Current Company": string | null;
  Skills: string | null;
  "Applied for": string[] | null;
  "CV Summary": string | null;
  Experience: string | null;
  Education: string | null;
  Certifications: string | null;
  Language: string | null;
  Linkedin: string | null;
  CV_Link: string | null;
  Timestamp: string | null;
}

export function CandidateManagementPanel() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [salaryFilter, setSalaryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const { toast } = useToast();
  

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    // Mock data for single-company structure
    try {
      setCandidates([]);
      setJobs([]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load candidates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const searchString = `${candidate["First Name"] || ""} ${candidate["Last Name"] || ""} ${candidate.Email || ""} ${candidate.Title || ""}`.toLowerCase();
      const matchesSearch = searchString.includes(searchTerm.toLowerCase());
      
      // Add more filtering logic here for status, salary, source when those fields are available
      return matchesSearch;
    });
  }, [candidates, searchTerm]);

  const getStatusBadge = (status: string) => {
    const statusColors = {
      "Not Reached": "bg-gray-500",
      "Called": "bg-blue-500",
      "Rejected": "bg-red-500",
      "Shortlisted": "bg-yellow-500",
      "Interviewed": "bg-purple-500",
      "Hired": "bg-green-500",
    };
    
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors] || "bg-gray-500"} text-white`}>
        {status}
      </Badge>
    );
  };

  const getJobTitle = (jobId: string | null) => {
    if (!jobId) return "No Job Applied";
    const job = jobs.find(j => j["Job ID"] === jobId);
    return job?.["Job Title"] || jobId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-glow">Candidate Management</h2>
          <p className="text-muted-foreground">Track and manage candidate pipeline</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedCandidate(null);
            setIsDialogOpen(true);
          }}
          className="action-button bg-gradient-primary hover:shadow-glow"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      {/* Filters */}
      <Card className="mission-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-background/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not-reached">Not Reached</SelectItem>
                <SelectItem value="called">Called</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[150px] bg-background/50">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="job-board">Job Board</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="direct">Direct Apply</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.Cadndidate_ID} className="mission-card group">
            <CardHeader className="pb-3">
              <div className="flex items-start space-x-3">
                <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    {candidate["First Name"]?.[0]}{candidate["Last Name"]?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold line-clamp-1">
                    {candidate["First Name"]} {candidate["Last Name"]}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {candidate.Title || "No title specified"}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    {getStatusBadge("Not Reached")} {/* Default status for now */}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                {candidate.Email && (
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2 text-cyan" />
                    <span className="line-clamp-1">{candidate.Email}</span>
                  </div>
                )}
                
                {candidate["Phone Number"] && (
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2 text-blue" />
                    {candidate["Phone Number"]}
                  </div>
                )}
                
                {candidate.Location && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 text-purple" />
                    {candidate.Location}
                  </div>
                )}

                {candidate["Current Company"] && (
                  <div className="flex items-center text-muted-foreground">
                    <Building2 className="h-4 w-4 mr-2 text-orange" />
                    <span className="line-clamp-1">{candidate["Current Company"]}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Applied for:</div>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(candidate["Applied for"]) && candidate["Applied for"].length > 0 
                    ? candidate["Applied for"].map((jobId) => (
                        <Badge key={jobId} variant="outline" className="text-xs">
                          {getJobTitle(jobId)}
                        </Badge>
                      ))
                    : <Badge variant="outline" className="text-xs">None</Badge>
                  }
                </div>
              </div>

              {candidate.Skills && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Skills:</div>
                  <div className="flex flex-wrap gap-1">
                    {candidate.Skills.split(',').slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill.trim()}
                      </Badge>
                    ))}
                    {candidate.Skills.split(',').length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{candidate.Skills.split(',').length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCandidate(candidate);
                      setIsDialogOpen(true);
                    }}
                    className="h-8 px-2"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2"
                  >
                    <Calendar className="h-3 w-3" />
                  </Button>
                </div>
                
                <Button size="sm" className="h-8">
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <Card className="mission-card">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search criteria" : "Add your first candidate to get started"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <CandidateDialog
        candidate={selectedCandidate}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={() => {
          fetchData();
          setIsDialogOpen(false);
        }}
        jobs={jobs}
      />
    </div>
  );
}