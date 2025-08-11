import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface StatusDropdownProps {
  currentStatus: string | null
  candidateId: string
  jobId?: string | null
  onStatusChange?: (newStatus: string) => void
  variant?: "dropdown" | "badge"
  statusType?: "contacted" | "candidate"
}

const contactedStatusOptions = [
  "Not Contacted",
  "Ready to Call",
  "Contacted",
  "Call Done",
  "1st No Answer",
  "2nd No Answer", 
  "3rd No Answer",
  "Low Scored"
]

const candidateStatusOptions = [
  "Shortlisted",
  "Tasked",
  "Interview",
  "Hired",
  "Rejected"
]

const getStatusVariant = (status: string | null) => {
  switch (status) {
    case "Hired": return "default" // Green
    case "Interview": return "default" // Green  
    case "Shortlisted": return "default" // Green
    case "Tasked": return "secondary" // Blue
    case "Call Done": return "secondary" // Blue
    case "Contacted": return "secondary" // Blue
    case "Ready to Call": return "outline" // Neutral
    case "Rejected": return "destructive" // Red
    case "Not Contacted": return "destructive" // Red
    default: return "outline"
  }
}

const getStatusColor = (status: string | null) => {
  switch (status) {
    case "Hired": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
    case "Interview": return "text-cyan-400 bg-cyan-400/10 border-cyan-400/30"
    case "Shortlisted": return "text-blue-400 bg-blue-400/10 border-blue-400/30"
    case "Tasked": return "text-purple-400 bg-purple-400/10 border-purple-400/30"
    case "Call Done": return "text-green-400 bg-green-400/10 border-green-400/30"
    case "Contacted": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
    case "Ready to Call": return "text-orange-400 bg-orange-400/10 border-orange-400/30"
    case "Rejected": return "text-red-400 bg-red-400/10 border-red-400/30"
    case "Not Contacted": return "text-gray-400 bg-gray-400/10 border-gray-400/30"
    default: return "text-gray-400 bg-gray-400/10 border-gray-400/30"
  }
}

export function StatusDropdown({ 
  currentStatus, 
  candidateId, 
  jobId, 
  onStatusChange,
  variant = "dropdown",
  statusType = "contacted"
}: StatusDropdownProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return
    
    setIsUpdating(true)
    try {
      if (statusType === "contacted" && jobId) {
        // Update in Jobs_CVs table (Contacted status)
        const { error } = await supabase
          .from('Jobs_CVs')
          .update({ 'Contacted': newStatus })
          .eq('Candidate_ID', candidateId)
          .eq('Job ID', jobId)

        if (error) throw error
      } else if (statusType === "candidate") {
        // Update in CVs table (CandidateStatus)
        const { error } = await supabase
          .from('CVs')
          .update({ CandidateStatus: newStatus } as any)
          .eq('Cadndidate_ID', candidateId)

        if (error) throw error
      }

      onStatusChange?.(newStatus)
      
      toast({
        title: "Status Updated",
        description: `${statusType === 'contacted' ? 'Contact' : 'Candidate'} status changed to ${newStatus}`,
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: `Failed to update ${statusType === 'contacted' ? 'contact' : 'candidate'} status`,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const statusOptions = statusType === "contacted" ? contactedStatusOptions : candidateStatusOptions
  const defaultStatus = statusType === "contacted" ? "Not Contacted" : null

  if (variant === "badge") {
    return (
      <Badge 
        variant={getStatusVariant(currentStatus)} 
        className={`${getStatusColor(currentStatus)} capitalize font-medium`}
      >
        {currentStatus || defaultStatus}
      </Badge>
    )
  }

  return (
    <Select 
      value={currentStatus || defaultStatus} 
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-[160px] bg-background/50 border-glass-border hover:bg-background/70 transition-colors">
        <SelectValue>
          <Badge 
            variant={getStatusVariant(currentStatus)} 
            className={`${getStatusColor(currentStatus)} capitalize font-medium text-xs`}
          >
            {currentStatus || defaultStatus}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-background border-glass-border backdrop-blur-sm z-50">
        {statusOptions.map((status) => (
          <SelectItem 
            key={status} 
            value={status}
            className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50"
          >
            <Badge 
              variant={getStatusVariant(status)} 
              className={`${getStatusColor(status)} capitalize font-medium text-xs`}
            >
              {status}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}