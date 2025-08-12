import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { Briefcase, Plus, Users, Activity, Phone, FileText } from "lucide-react"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const go = (path: string) => () => { setOpen(false); navigate(path) }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={go('/jobs')}>
            <Briefcase className="mr-2 h-4 w-4" /> Jobs
          </CommandItem>
          <CommandItem onSelect={go('/jobs/add')}>
            <Plus className="mr-2 h-4 w-4" /> Add Job
          </CommandItem>
          <CommandItem onSelect={go('/candidates')}>
            <Users className="mr-2 h-4 w-4" /> Candidates
          </CommandItem>
          <CommandItem onSelect={go('/live-feed')}>
            <Activity className="mr-2 h-4 w-4" /> Live Feed
          </CommandItem>
          <CommandItem onSelect={go('/calls')}>
            <Phone className="mr-2 h-4 w-4" /> Calls
          </CommandItem>
          <CommandItem onSelect={go('/reports')}>
            <FileText className="mr-2 h-4 w-4" /> Reports
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

export default CommandPalette
