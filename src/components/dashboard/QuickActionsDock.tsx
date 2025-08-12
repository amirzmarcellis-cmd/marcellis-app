import React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Upload, Activity, Users } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function QuickActionsDock() {
  const navigate = useNavigate()
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-gradient-card backdrop-blur-xl border border-border/40 rounded-full px-3 py-2 shadow-elevated">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => navigate('/jobs/add')} aria-label="Add Job">
          <Plus className="h-4 w-4 mr-2" /> Add Job
        </Button>
        <Button size="sm" variant="secondary" onClick={() => navigate('/apply')} aria-label="Upload CV">
          <Upload className="h-4 w-4 mr-2" /> Upload CV
        </Button>
        <Button size="sm" onClick={() => navigate('/live-feed')} aria-label="Open Live Feed">
          <Activity className="h-4 w-4 mr-2" /> Live Feed
        </Button>
        <Button size="sm" variant="outline" onClick={() => navigate('/candidates')} aria-label="Go to Candidates">
          <Users className="h-4 w-4 mr-2" /> Candidates
        </Button>
      </div>
    </div>
  )
}

export default QuickActionsDock
