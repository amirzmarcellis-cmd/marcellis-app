// @ts-nocheck
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, MapPin, Briefcase, Mail, Phone, Search, Filter, Eye, Download, Calendar, Clock, ExternalLink, Edit, UserPlus, Upload, Trash2 } from "lucide-react"
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

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCVs(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchCVs = async (searchQuery?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('CVs')
        .select('user_id, name, email, phone_number, Firstname, Lastname, cv_link, cv_text');

      // If there's a search query, apply enhanced filters
      if (searchQuery && searchQuery.trim()) {
        const term = searchQuery.trim();
        query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,phone_number.ilike.%${term}%,user_id.ilike.%${term}%,Firstname.ilike.%${term}%,Lastname.ilike.%${term}%`);
      }

      const { data, error } = await query
        .order('user_id', { ascending: true })
        .limit(100); // Limit to 100 CVs for faster loading

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      setCvs(data || []);
    } catch (error) {
      console.error('Error fetching CVs:', error);
      toast.error('Failed to fetch CVs');
    } finally {
      setLoading(false);
    }
  }

  // Since we're now searching in the database, just return all CVs
  const filteredCVs = cvs;

  const handleCallCandidate = async (userId: string) => {
    toast.info("Call functionality not available for CV table")
  }

  const handleAddCandidate = () => {
    setSelectedCandidate(null)
    setDialogOpen(true)
  }

  const handleEditCandidate = (candidate: CV) => {
    setSelectedCandidate(candidate)
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
      <div className="space-y-4 sm:space-y-6 overflow-x-hidden pb-20 md:pb-0">
        <HeroHeader
          title="CVs Database"
          subtitle="View and manage all uploaded CVs"
          actions={
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:flex-row mt-1 sm:mt-0">
              <Button onClick={() => setBulkUploadOpen(true)} variant="outline" size="sm" className="gap-1.5 font-light font-inter text-xs w-full">
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Multiple CVs</span>
                <span className="sm:hidden">Bulk Upload</span>
              </Button>
              <Button onClick={handleAddCandidate} size="sm" className="gap-1.5 font-light font-inter text-xs w-full">
                <UserPlus className="w-3.5 h-3.5" />
                Add CV
              </Button>
            </div>
          }
        />

        {/* Filters */}
        <Card className="p-3 sm:p-4 lg:p-6 bg-card border-border dark:bg-gradient-card dark:backdrop-blur-glass">
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3 sm:w-4 sm:h-4" />
              <Input
                placeholder="Search CVs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 bg-background/50 border-border text-sm"
              />
            </div>
          </div>
        </Card>

        {/* CVs Table */}
        <Card className="bg-card border-border dark:bg-gradient-card dark:backdrop-blur-glass shadow-card">
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl lg:text-3xl font-light font-work tracking-tight">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              CVs ({filteredCVs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="w-[100px]">User ID</TableHead>
                    <TableHead className="w-[200px]">Name</TableHead>
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
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading CVs...
                      </TableCell>
                    </TableRow>
                  ) : filteredCVs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
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
                                <AvatarFallback className="bg-gradient-primary text-white text-sm font-light font-work">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="font-light font-work truncate">{fullName || "N/A"}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <div className="flex items-center space-x-2 font-light font-inter">
                              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{cv.email || "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[150px]">
                            <div className="flex items-center space-x-2 font-light font-inter">
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
                                className="text-primary hover:underline text-sm font-light font-inter"
                              >
                                View CV
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-sm font-light font-inter">No CV</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <div className="text-sm font-light font-inter text-muted-foreground truncate max-w-[200px]">
                              {cv.cv_text ? cv.cv_text.substring(0, 100) + "..." : "No CV text"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right max-w-[100px]">
                            <div className="flex justify-end space-x-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                title="Edit CV" 
                                className="h-8 px-2"
                                onClick={() => handleEditCandidate(cv)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
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

            {/* Mobile Card View */}
            <div className="md:hidden px-2 space-y-2">
              {loading ? (
                <div className="py-6 text-center text-muted-foreground text-sm">Loading CVs...</div>
              ) : filteredCVs.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground text-sm">No CVs found</div>
              ) : (
                filteredCVs.map((cv) => {
                  const fullName = cv.name || `${cv.Firstname || ""} ${cv.Lastname || ""}`.trim()
                  const initials = `${cv.Firstname?.[0] || cv.name?.[0] || ""}${cv.Lastname?.[0] || ""}`
                  const shortId = cv.user_id && cv.user_id.length > 10
                    ? `${cv.user_id.slice(0,4)}…${cv.user_id.slice(-4)}`
                    : cv.user_id;
                  
                  return (
                    <div key={cv.user_id} className="border border-border rounded-lg p-2 bg-card/50 max-w-full overflow-x-hidden">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-primary text-white text-xs font-light font-work">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-light font-work truncate">{fullName || "N/A"}</div>
                            <Badge variant="outline" className="text-[10px] font-mono mt-0.5 px-1 py-0 max-w-[120px] truncate inline-block align-middle">
                              {shortId}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditCandidate(cv)}
                            aria-label="Edit CV"
                            title="Edit CV"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleDeleteCV(cv.user_id)}
                            aria-label="Delete CV"
                            title="Delete CV"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] min-w-0">
                          <span className="text-muted-foreground">Email</span>
                          <span className="text-foreground/80 truncate">{cv.email || "—"}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] min-w-0">
                          <span className="text-muted-foreground">Phone</span>
                          <span className="text-foreground/80 truncate">{cv.phone_number || "—"}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] min-w-0">
                          <span className="text-muted-foreground">CV Link</span>
                          {cv.cv_link ? (
                            <a 
                              href={cv.cv_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate max-w-[60%] text-right"
                            >
                              View CV
                            </a>
                          ) : (
                            <span className="text-foreground/60">—</span>
                          )}
                        </div>

                        <div className="text-[11px] min-w-0">
                          <div className="text-muted-foreground mb-1">CV Preview</div>
                          <div className="text-foreground/80 line-clamp-2 break-words border-t border-border/50 pt-1">
                            {cv.cv_text || "No CV text"}
                          </div>
                        </div>

                        <div className="text-[11px]">
                          <div className="text-muted-foreground mb-1">Actions</div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 py-1 text-xs" 
                              onClick={() => handleEditCandidate(cv)}
                              aria-label="Edit CV"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="h-7 py-1 text-xs" 
                              onClick={() => handleDeleteCV(cv.user_id)}
                              aria-label="Delete CV"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sticky mobile actions */}
        <div className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => setBulkUploadOpen(true)} variant="outline" size="sm" className="gap-1.5 text-xs">
              <Upload className="w-3.5 h-3.5" />
              Bulk Upload
            </Button>
            <Button onClick={handleAddCandidate} size="sm" className="gap-1.5 text-xs">
              <UserPlus className="w-3.5 h-3.5" />
              Add CV
            </Button>
          </div>
        </div>

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