import { Clock, Phone, FileText, CheckCircle, UserCheck, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface TimelineLogProps {
  candidateId?: string;
  jobId?: string;
}

interface TimelineEvent {
  timestamp: string;
  type: 'longlist' | 'shortlist' | 'submit' | 'call' | 'note' | 'status';
  description: string;
}

export function TimelineLog({ candidateId, jobId }: TimelineLogProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidateId || !jobId) {
      setLoading(false);
      return;
    }

    const fetchTimeline = async () => {
      try {
        const { data, error } = await supabase
          .from('Jobs_CVs')
          .select('*')
          .eq('user_id', candidateId)
          .eq('job_id', jobId)
          .single();

        if (error) throw error;

        const timeline: TimelineEvent[] = [];

        if (data.longlisted_at) {
          timeline.push({
            timestamp: data.longlisted_at,
            type: 'longlist',
            description: 'Added to longlist'
          });
        }

        if (data.shortlisted_at) {
          timeline.push({
            timestamp: data.shortlisted_at,
            type: 'shortlist',
            description: 'Added to shortlist'
          });
        }

        if (data.submitted_at) {
          timeline.push({
            timestamp: data.submitted_at,
            type: 'submit',
            description: 'Submitted to client'
          });
        }

        if (data.lastcalltime) {
          timeline.push({
            timestamp: data.lastcalltime,
            type: 'call',
            description: `Call completed (${data.duration || 'N/A'})`
          });
        }

        if (data.notes_updated_at) {
          timeline.push({
            timestamp: data.notes_updated_at,
            type: 'note',
            description: 'Notes updated'
          });
        }

        if (data.contacted) {
          timeline.push({
            timestamp: data.notes_updated_at || new Date().toISOString(),
            type: 'status',
            description: `Status: ${data.contacted}`
          });
        }

        timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setEvents(timeline);
      } catch (error) {
        console.error('Error fetching timeline:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [candidateId, jobId]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'longlist': return <FileText className="h-4 w-4" />;
      case 'shortlist': return <UserCheck className="h-4 w-4" />;
      case 'submit': return <Send className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'note': return <FileText className="h-4 w-4" />;
      case 'status': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'longlist': return 'text-blue-500';
      case 'shortlist': return 'text-green-500';
      case 'submit': return 'text-purple-500';
      case 'call': return 'text-orange-500';
      case 'note': return 'text-gray-500';
      case 'status': return 'text-cyan-500';
      default: return 'text-muted-foreground';
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
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activity recorded yet
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={index} className="flex gap-3">
                <div className={`mt-1 ${getEventColor(event.type)}`}>
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.timestamp), 'PPp')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}