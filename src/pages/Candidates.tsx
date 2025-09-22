// @ts-nocheck
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, MapPin, Briefcase, Mail, Phone, Search, Filter, Eye, Download, Calendar, Clock, ExternalLink, Edit, UserPlus, Upload, Trash2, Star, Award } from "lucide-react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"
import { HeroHeader } from "@/components/dashboard/HeroHeader"
import { CandidateDialog } from "@/components/candidates/CandidateDialog"
import { BulkCandidateUpload } from "@/components/candidates/BulkCandidateUpload"


interface CV {
  user_id: string
  name: string | null
  email: string | null
  phone_number: string | null
  cv_text: string | null
  Lastname: string | null
  Firstname: string | null
  cv_link: string | null
  cv_score?: number | null
  after_call_score?: number | null
  overall_score?: number | null
}

export default function Candidates() {
  const [searchTerm, setSearchTerm] = useState("")
  const [cvs, setCvs] = useState<CV[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      setLoading(true);
      
      // First, get all CVs
      const { data: cvsData, error: cvsError } = await supabase
        .from('CVs')
        .select('*')
        .order('user_id', { ascending: true });

      if (cvsError) throw cvsError;

      // Then, get scores from Jobs_CVs table
      const { data: scoresData, error: scoresError } = await supabase
        .from('Jobs_CVs')
        .select('user_id, cv_score, after_call_score');

      if (scoresError) {
        console.warn('Could not fetch scores:', scoresError);
      }

      // Combine the data
      const cvsWithScores = (cvsData || []).map(cv => {
        // Find matching score data by user_id
        const scoreData = scoresData?.find(score => 
          score.user_id?.toString() === cv.user_id?.toString()
        );
        
        const cvScore = scoreData?.cv_score || 0;
        const afterCallScore = scoreData?.after_call_score || 0;
        
        // Calculate overall score - if only one score is available, use that score
        let overallScore = null;
        if (cvScore > 0 && afterCallScore > 0) {
          overallScore = (cvScore + afterCallScore) / 2;
        } else if (cvScore > 0) {
          overallScore = cvScore; // Use CV score if only CV score is available
        } else if (afterCallScore > 0) {
          overallScore = afterCallScore; // Use after call score if only that's available
        }
        
        console.log('Processing CV:', cv.user_id, 'CV Score:', cvScore, 'After Call Score:', afterCallScore, 'Overall:', overallScore);
        
        return {
          ...cv,
          cv_score: cvScore,
          after_call_score: afterCallScore,
          overall_score: overallScore
        };
      });
      
      setCvs(cvsWithScores);
    } catch (error) {
      console.error('Error fetching CVs:', error);
      toast.error('Failed to fetch CVs');
    } finally {
      setLoading(false);
    }
  }

  const filteredCVs = cvs.filter(cv => {
    const fullName = `${cv.Firstname || ""} ${cv.Lastname || ""}`.trim()
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (cv.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (cv.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (cv.phone_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cv.user_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 8) return "text-green-600 dark:text-green-400";
    if (score >= 6) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadgeVariant = (score: number | null): "default" | "secondary" | "destructive" | "outline" => {
    if (!score) return "outline";
    if (score >= 8) return "default";
    if (score >= 6) return "secondary";
    return "destructive";
  };

  const handleCallCandidate = async (userId: string) => {
    toast.info("Call functionality not available for CV table")
  }

  const handleAddCandidate = () => {
    setSelectedCandidate(null)
    setDialogOpen(true)
  }

  const handleSaveCandidate = () => {
    setDialogOpen(false)
    setBulkUploadOpen(false)
    fetchCVs() // Refresh the CVs list
  }

  const handleDeleteCV = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this CV? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase
        .from('CVs')
        .delete()
        .eq('user_id', userId)

      if (error) throw error

      toast.success("CV deleted successfully")
      fetchCVs() // Refresh the CVs list
    } catch (error) {
      console.error('Error deleting CV:', error)
      toast.error("Failed to delete CV")
    }
  }

  return (
      <div className="space-y-6">
        <HeroHeader
          title="CVs Database"
          subtitle="View and manage all uploaded CVs"
          actions={
            <div className="flex gap-2">
              <Button onClick={() => setBulkUploadOpen(true)} variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Add Multiple CVs
              </Button>
              <Button onClick={handleAddCandidate} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add CV
              </Button>
            </div>
          }
        />

        {/* Filters */}
        <Card className="p-6 bg-card border-border dark:bg-gradient-card dark:backdrop-blur-glass">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, email, phone number, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-border"
              />
            </div>
          </div>
        </Card>

        {/* CVs Table */}
        <Card className="bg-card border-border dark:bg-gradient-card dark:backdrop-blur-glass shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              CVs ({filteredCVs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="w-[100px]">User ID</TableHead>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead className="w-[150px]">Overall Score</TableHead>
                    <TableHead className="w-[200px]">Email</TableHead>
                    <TableHead className="w-[150px]">Phone</TableHead>
                    <TableHead className="w-[150px]">CV Link</TableHead>
                    <TableHead className="w-[200px]">CV Preview</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Loading CVs...
                      </TableCell>
                    </TableRow>
                  ) : filteredCVs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No CVs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCVs.map((cv) => {
                      const fullName = cv.name || `${cv.Firstname || ""} ${cv.Lastname || ""}`.trim()
                      const initials = `${cv.Firstname?.[0] || cv.name?.[0] || ""}${cv.Lastname?.[0] || ""}`
                      
                      return (
                        <TableRow key={cv.user_id} className="border-border hover:bg-glass-primary transition-colors">
                          <TableCell className="max-w-[100px]">
                            <Badge variant="outline" className="text-xs font-mono">
                              {cv.user_id}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarFallback className="bg-gradient-primary text-white text-sm">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate">{fullName || "N/A"}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[150px]">
                            <div className="flex items-center space-x-2">
                              {cv.overall_score ? (
                                <>
                                  <Award className="w-4 h-4 text-primary flex-shrink-0" />
                                  <Badge 
                                    variant={getScoreBadgeVariant(cv.overall_score)} 
                                    className={`font-bold ${getScoreColor(cv.overall_score)}`}
                                  >
                                    <Star className="w-3 h-3 mr-1" />
                                    {cv.overall_score.toFixed(1)}
                                    {cv.cv_score > 0 && cv.after_call_score > 0 ? '' : '*'}
                                  </Badge>
                                  {cv.cv_score > 0 && cv.after_call_score > 0 ? (
                                    <span className="text-xs text-muted-foreground">Avg</span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      {cv.cv_score > 0 ? 'CV' : 'Call'}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">
                                  No Score
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{cv.email || "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[150px]">
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{cv.phone_number || "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[150px]">
                            {cv.cv_link ? (
                              <a 
                                href={cv.cv_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm"
                              >
                                View CV
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-sm">No CV</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {cv.cv_text ? cv.cv_text.substring(0, 100) + "..." : "No CV text"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right max-w-[100px]">
                            <div className="flex justify-end space-x-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                title="Delete CV" 
                                className="h-8 px-2 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteCV(cv.user_id)}
                              >
                                <Trash2 className="w-3 h-3" />
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
          </CardContent>
        </Card>

        <CandidateDialog
          candidate={selectedCandidate}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSaveCandidate}
          jobs={[]}
        />

        <BulkCandidateUpload
          open={bulkUploadOpen}
          onOpenChange={setBulkUploadOpen}
          onSuccess={handleSaveCandidate}
        />
      </div>
  )
}