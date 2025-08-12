import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, MessageSquare, UserCheck, UserPlus, FileText, Phone } from "lucide-react"
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

  const fetchTimelineEvents = async () => {
    try {
      const timelineEvents: TimelineEvent[] = []

      // Fetch activity logs related to this candidate-job combination
      const { data: activityLogs } = await supabase
        .from('activity_logs')
        .select('*')
        .or(`entity_id.eq.${candidateId},entity_id.eq.${jobId}`)
        .order('created_at', { ascending: false })

      // Fetch comments related to this candidate-job combination
      const { data: comments } = await supabase
        .from('comments')
        .select('*')
        .in('entity_type', ['candidate', 'job', 'call_log'])
        .or(`entity_id.eq.${candidateId},entity_id.eq.${jobId}`)
        .order('created_at', { ascending: false })

      // Process activity logs
      if (activityLogs) {
        for (const log of activityLogs) {
          let icon = <FileText className="w-4 h-4" />
          
          if (log.action_type === 'longlist') {
            icon = <UserPlus className="w-4 h-4" />
          } else if (log.action_type === 'status_change') {
            icon = <UserCheck className="w-4 h-4" />
          } else if (log.action_type === 'call') {
            icon = <Phone className="w-4 h-4" />
          }

          timelineEvents.push({
            id: log.id,
            type: 'activity',
            timestamp: log.created_at,
            description: log.description,
            user_id: log.user_id,
            details: log.metadata,
            icon
          })
        }
      }

      // Process comments
      if (comments) {
        for (const comment of comments) {
          timelineEvents.push({
            id: comment.id,
            type: 'comment',
            timestamp: comment.created_at,
            description: `Comment: ${comment.content}`,
            user_id: comment.user_id,
            icon: <MessageSquare className="w-4 h-4" />
          })
        }
      }

      // Add longlisting event from Jobs_CVs table if it exists
      const { data: jobsCvs } = await supabase
        .from('Jobs_CVs')
        .select('*')
        .eq('Candidate_ID', candidateId)
        .eq('Job ID', jobId)
        .single()

      if (jobsCvs) {
        // We can approximate when they were longlisted based on the record existence
        // In a real system, you'd have a timestamp for when they were added to longlist
        timelineEvents.push({
          id: 'longlist-' + candidateId + jobId,
          type: 'status_change',
          timestamp: new Date().toISOString(), // This should ideally be from a timestamp field
          description: 'Candidate was longlisted for this position',
          icon: <UserPlus className="w-4 h-4" />
        })
      }

      // Sort all events by timestamp (most recent first)
      timelineEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setEvents(timelineEvents)
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
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')}
                    </p>
                    {event.user_id && (
                      <div className="flex items-center space-x-1">
                        <Avatar className="w-4 h-4">
                          <AvatarFallback className="text-xs">
                            {event.user_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {event.user_name || 'Unknown User'}
                        </span>
                      </div>
                    )}
                  </div>
                  {event.details && Object.keys(event.details).length > 0 && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    </div>
                  )}
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