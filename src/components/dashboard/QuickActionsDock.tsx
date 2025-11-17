import React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Upload, Activity, Users } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function QuickActionsDock() {
  const navigate = useNavigate()
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-gradient-card backdrop-blur-xl border border-border/40 rounded-full px-2 sm:px-3 py-2 shadow-elevated max-w-[95vw]">
      <div className="flex items-center gap-1 sm:gap-2">
        <Button size="sm" variant="secondary" onClick={() => navigate('/jobs/add')} aria-label="Add Job" className="px-2 sm:px-3">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Add Job</span>
        </Button>
        <Button size="sm" variant="secondary" onClick={() => navigate('/apply')} aria-label="Upload CV" className="px-2 sm:px-3">
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Upload CV</span>
        </Button>
        <Button size="sm" onClick={() => navigate('/live-feed')} aria-label="Open Live Feed" className="px-2 sm:px-3">
          <Activity className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Live Feed</span>
        </Button>
        <Button size="sm" variant="outline" onClick={() => navigate('/candidates')} aria-label="Go to Candidates" className="px-2 sm:px-3">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Candidates</span>
        </Button>
      </div>
    </div>
  )
}

export default QuickActionsDock
