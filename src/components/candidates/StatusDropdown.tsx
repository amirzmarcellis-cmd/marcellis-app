
// @ts-nocheck
import { useEffect, useMemo, useState } from "react"
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

const getStatusVariant = (status: string | null) => {
  switch (status) {
    case "Hired": return "default"
    case "Interview": return "default"
    case "Shortlisted": return "default"
    case "Offer": return "default"
    case "Longlisted": return "secondary"
    case "Tasked": return "secondary"
    case "Call Done": return "secondary"
    case "Contacted": return "secondary"
    case "Ready to Call": return "outline"
    case "Applied": return "outline"
    case "On Hold": return "outline"
    case "Rejected": return "destructive"
    case "Not Contacted": return "destructive"
    default: return "outline"
  }
}

const getStatusColor = (status: string | null) => {
  switch (status) {
    case "Hired": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
    case "Interview": return "text-cyan-400 bg-cyan-400/10 border-cyan-400/30"
    case "Shortlisted": return "text-blue-400 bg-blue-400/10 border-blue-400/30"
    case "Offer": return "text-lime-400 bg-lime-400/10 border-lime-400/30"
    case "Longlisted": return "text-indigo-400 bg-indigo-400/10 border-indigo-400/30"
    case "Tasked": return "text-purple-400 bg-purple-400/10 border-purple-400/30"
    case "Call Done": return "text-green-400 bg-green-400/10 border-green-400/30"
    case "Contacted": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
    case "Ready to Call": return "text-orange-400 bg-orange-400/10 border-orange-400/30"
    case "Applied": return "text-sky-400 bg-sky-400/10 border-sky-400/30"
    case "On Hold": return "text-amber-400 bg-amber-400/10 border-amber-400/30"
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
  const [options, setOptions] = useState<string[]>([])
  const [loadingOptions, setLoadingOptions] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let active = true
    const loadOptions = async () => {
      setLoadingOptions(true)
      try {
        if (statusType === "contacted") {
          const allowed = [
            "Not Contacted",
            "Ready to Call",
            "Contacted",
            "Call Done",
            "1st No Answer",
            "2nd No Answer",
            "3rd No Answer",
            "Low Scored",
            "Tasked",
            "Rejected"
          ]
          if (!active) return
          setOptions(allowed)
        } else {
          const allowed = ["Shortlisted", "Interview", "Hired"]
          if (!active) return
          setOptions(allowed)
        }
      } catch (e) {
        console.error("Failed to load status options:", e)
        if (!active) return
        // Fallback to a sensible default list if lookup fetch fails
        setOptions(
          statusType === "contacted"
            ? ["Not Contacted", "Ready to Call", "Contacted", "Call Done", "1st No Answer", "2nd No Answer", "3rd No Answer", "Low Scored", "Tasked", "Rejected"]
            : ["Applied", "Longlisted", "Shortlisted", "Interview", "Offer", "Hired", "On Hold"]
        )
      } finally {
        if (active) setLoadingOptions(false)
      }
    }
    loadOptions()
    return () => { active = false }
  }, [statusType])

  const defaultStatus = useMemo(() => {
    if (statusType === "contacted") {
      return options.includes("Not Contacted") ? "Not Contacted" : (options[0] || "Not Contacted")
    }
    // candidate: default to first allowed or Shortlisted
    return options[0] || "Shortlisted"
  }, [options, statusType])

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return
    setIsUpdating(true)
    try {
      if (statusType === "contacted" && jobId) {
        const { error } = await supabase
          .from('Jobs_CVs')
          .update({ 'contacted': newStatus })
          .eq('Candidate_ID', candidateId)
          .eq('job_id', jobId)
        if (error) throw error
      } else if (statusType === "candidate") {
        const { error } = await supabase
          .from('CVs')
          .update({ CandidateStatus: newStatus } as any)
          .eq('candidate_id', candidateId)
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

  if (variant === "badge") {
    return (
      <Badge 
        variant={getStatusVariant(currentStatus)} 
        className={`${getStatusColor(currentStatus)} capitalize font-light font-inter`}
      >
        {currentStatus || defaultStatus}
      </Badge>
    )
  }

  return (
    <Select 
      value={(currentStatus || defaultStatus) || undefined} 
      onValueChange={handleStatusChange}
      disabled={isUpdating || loadingOptions}
    >
      <SelectTrigger className="w-[200px] bg-background border-glass-border hover:bg-background/80 transition-colors">
        <SelectValue>
          <Badge 
            variant={getStatusVariant(currentStatus || defaultStatus)} 
            className={`${getStatusColor(currentStatus || defaultStatus)} capitalize font-light font-inter text-xs`}
          >
            {currentStatus || defaultStatus || 'Select status'}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-background border-glass-border backdrop-blur-sm z-50">
        {options.map((status) => (
          <SelectItem 
            key={status} 
            value={status}
            className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50"
          >
            <Badge 
              variant={getStatusVariant(status)} 
              className={`${getStatusColor(status)} capitalize font-light font-inter text-xs`}
            >
              {status}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
