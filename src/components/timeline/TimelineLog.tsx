import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface TimelineLogProps {
  candidateId: string;
  jobId: string;
}

interface TimelineEvent {
  timestamp: string;
  event: string;
  description: string;
  type: 'status' | 'note' | 'score' | 'call';
}

export function TimelineLog({ candidateId, jobId }: TimelineLogProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);

        // Fetch candidate data from Jobs_CVs
        const { data: candidateData, error } = await supabase
          .from('Jobs_CVs')
          .select('*')
          .eq('job_id', jobId)
          .eq('user_id', candidateId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching timeline:', error);
          return;
        }

        if (!candidateData) {
          setEvents([]);
          return;
        }

        const timelineEvents: TimelineEvent[] = [];

        // Add longlisted event
        if (candidateData.longlisted_at) {
          timelineEvents.push({
            timestamp: candidateData.longlisted_at,
            event: 'Longlisted',
            description: `Added to longlist (Source: ${candidateData.source || 'Unknown'})`,
            type: 'status'
          });
        }

        // Add shortlisted event
        if (candidateData.shortlisted_at) {
          timelineEvents.push({
            timestamp: candidateData.shortlisted_at,
            event: 'Shortlisted',
            description: 'Candidate moved to shortlist',
            type: 'status'
          });
        }

        // Add submitted event
        if (candidateData.submitted_at) {
          timelineEvents.push({
            timestamp: candidateData.submitted_at,
            event: 'Submitted',
            description: 'Candidate submitted to client',
            type: 'status'
          });
        }

        // Add call event
        if (candidateData.lastcalltime) {
          timelineEvents.push({
            timestamp: candidateData.lastcalltime,
            event: 'Call Made',
            description: `Call ${candidateData.callcount || 1} - Duration: ${candidateData.duration || 'Unknown'}`,
            type: 'call'
          });
        }

        // Add after-call score event
        if (candidateData.after_call_score && candidateData.lastcalltime) {
          timelineEvents.push({
            timestamp: candidateData.lastcalltime,
            event: 'Call Scored',
            description: `Call score: ${candidateData.after_call_score}/100`,
            type: 'score'
          });
        }

        // Add notes update event
        if (candidateData.notes_updated_at) {
          timelineEvents.push({
            timestamp: candidateData.notes_updated_at,
            event: 'Notes Updated',
            description: candidateData.notes_updated_by ? `Updated by user` : 'Notes updated',
            type: 'note'
          });
        }

        // Add CV score event (using longlisted_at as timestamp since CV score doesn't have its own timestamp)
        if (candidateData.cv_score && candidateData.longlisted_at) {
          timelineEvents.push({
            timestamp: candidateData.longlisted_at,
            event: 'CV Scored',
            description: `CV score: ${candidateData.cv_score}/100`,
            type: 'score'
          });
        }

        // Add contact status changes
        if (candidateData.contacted) {
          // We don't have exact timestamps for status changes, so we'll use longlisted_at as fallback
          const statusTimestamp = candidateData.lastcalltime || candidateData.longlisted_at;
          if (statusTimestamp) {
            timelineEvents.push({
              timestamp: statusTimestamp,
              event: 'Status Changed',
              description: `Status: ${candidateData.contacted}`,
              type: 'status'
            });
          }
        }

        // Sort events by timestamp (newest first)
        timelineEvents.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setEvents(timelineEvents);
      } catch (error) {
        console.error('Error building timeline:', error);
      } finally {
        setLoading(false);
      }
    };

    if (candidateId && jobId) {
      fetchTimeline();
    }
  }, [candidateId, jobId]);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'status': return 'bg-blue-500';
      case 'note': return 'bg-purple-500';
      case 'score': return 'bg-green-500';
      case 'call': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading timeline...
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activity recorded yet
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${getEventColor(event.type)}`} />
                  {index < events.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{event.event}</p>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}