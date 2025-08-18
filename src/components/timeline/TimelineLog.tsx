
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { Clock, UserCheck, UserPlus, FileText, Phone } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { format } from "date-fns"

interface TimelineEvent {
  id: string
  type: 'activity' | 'comment' | 'status_change'
  timestamp: string
  description: string
  user_id?: string
  user_name?: string
  details?: any
  icon: React.ReactNode
}

interface TimelineLogProps {
  candidateId: string
  jobId: string
}

export function TimelineLog({ candidateId, jobId }: TimelineLogProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTimelineEvents()
  }, [candidateId, jobId])

  const buildHistoryDescription = (row: any) => {
    const ct: string = row.change_type
    const from = row.from_status
    const to = row.to_status
    const meta = row.metadata || {}
    switch (ct) {
      case 'longlisted':
        return 'Candidate was longlisted for this position'
      case 'shortlisted':
        return 'Candidate shortlisted for this position'
      case 'contacted_status_change':
        return `Contacted status changed: ${from || '—'} → ${to || '—'}`
      case 'candidate_status_change':
        return `Candidate status changed: ${from || '—'} → ${to || '—'}`
      case 'note_saved':
        return meta.note ? `Note updated: "${meta.note}"` : 'Notes updated'
      case 'call_logged':
        return `Call logged (${meta.call_status || 'unknown'})`
      default:
        return row.description || 'Status updated'
    }
  }

  const iconForHistory = (row: any) => {
    const ct: string = row.change_type
    if (ct === 'longlisted') return <UserPlus className="w-4 h-4" />
    if (ct === 'shortlisted') return <UserCheck className="w-4 h-4" />
    if (ct === 'contacted_status_change') return <Phone className="w-4 h-4" />
    if (ct === 'candidate_status_change') return <UserCheck className="w-4 h-4" />
    if (ct === 'note_saved') return <FileText className="w-4 h-4" />
    if (ct === 'call_logged') return <Phone className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const fetchTimelineEvents = async () => {
    try {
      const allowedTypes = new Set([
        'longlisted',
        'shortlisted',
        'contacted_status_change',
        'candidate_status_change',
        'note_saved',
        'call_logged',
        'hired'
      ])

      const { data: history, error } = await supabase
        .from('status_history')
        .select('*')
        .or(`candidate_id.eq.${candidateId},job_id.eq.${jobId}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      const filtered: TimelineEvent[] = []

      if (history && Array.isArray(history)) {
        // Get unique user IDs
        const userIds = Array.from(new Set(history.map(row => row.user_id).filter(Boolean)))
        
        // Fetch user names for all user IDs
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name')
          .in('user_id', userIds)

        // Create a map for quick lookup
        const userNameMap = new Map()
        if (profiles) {
          profiles.forEach(profile => {
            userNameMap.set(profile.user_id, profile.name)
          })
        }

        for (const row of history) {
          if (!allowedTypes.has(row.change_type)) continue

          const isCandidateStatus = row.change_type === 'candidate_status_change'
          const candidateMatches = row.candidate_id === candidateId
          const jobMatches = row.job_id === jobId

          if (isCandidateStatus ? candidateMatches : (candidateMatches && jobMatches)) {
            filtered.push({
              id: row.id,
              type: 'status_change',
              timestamp: row.created_at,
              description: buildHistoryDescription(row),
              user_id: row.user_id,
              user_name: userNameMap.get(row.user_id) || undefined,
              icon: iconForHistory(row)
            })
          }
        }
      }

      filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setEvents(filtered)
    } catch (error) {
      console.error('Error fetching timeline events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'activity':
        return 'bg-blue-500'
      case 'comment':
        return 'bg-green-500'
      case 'status_change':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading timeline...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center text-muted-foreground">No timeline events found</div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={event.id} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getEventTypeColor(event.type)} flex items-center justify-center text-white`}>
                  {event.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {event.description}
                    </p>
                    <Badge variant="outline" className="text-xs capitalize">
                      {event.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')}
                    </p>
                    {event.user_name && (
                      <span className="text-xs text-muted-foreground">
                        By <span className="text-primary font-medium">{event.user_name}</span>
                      </span>
                    )}
                  </div>
                </div>
                {index < events.length - 1 && (
                  <div className="absolute left-4 mt-8 h-4 w-px bg-border" style={{ marginLeft: '15px' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
