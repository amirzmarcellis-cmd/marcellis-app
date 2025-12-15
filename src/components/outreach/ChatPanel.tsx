import { useState, useRef, useEffect } from 'react';
import { useUnipileMessages, UnipileMessage } from '@/hooks/outreach/useUnipileMessages';
import { useSendUnipileMessage } from '@/hooks/outreach/useSendUnipileMessage';
import { LinkedInLead } from '@/hooks/outreach/useLinkedInCampaignLeads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, RefreshCw, Paperclip, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  lead: LinkedInLead | null;
}

export function ChatPanel({ lead }: ChatPanelProps) {
  const chatId = lead?.chat_id || null;
  const { messages, isLoading, refetch } = useUnipileMessages(chatId);
  const { sendMessage, isSending } = useSendUnipileMessage();
  
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !chatId) return;
    
    try {
      await sendMessage({
        chatId,
        text: newMessage,
      });
      setNewMessage('');
      refetch();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!lead) {
    return (
      <Card className="h-full flex items-center justify-center bg-card/50 backdrop-blur-sm">
        <p className="text-muted-foreground">Select a lead to view messages</p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-transparent border-0 shadow-none">
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className={cn('flex gap-2', i % 2 === 0 ? 'justify-end' : '')}>
                  <Skeleton className="h-16 w-48 rounded-lg" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground text-sm">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble 
                  key={message.id} 
                  message={message}
                  leadName={lead.full_name}
                  getInitials={getInitials}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t border-border opacity-50">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="shrink-0" disabled>
              <Paperclip className="h-4 w-4" />
            </Button>
            <Textarea
              disabled
              placeholder="Messaging coming soon..."
              rows={1}
              className="min-h-[40px] resize-none cursor-not-allowed"
            />
            <Button 
              disabled
              size="icon"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            This feature is currently disabled.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface MessageBubbleProps {
  message: UnipileMessage;
  leadName: string | null;
  getInitials: (name: string | null) => string;
}

function MessageBubble({ message, leadName, getInitials }: MessageBubbleProps) {
  const isSender = message.is_sender === 1 || message.is_sender === true;
  
  return (
    <div className={cn('flex gap-2', isSender ? 'flex-row-reverse' : '')}>
      {!isSender && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {getInitials(leadName)}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn(
        'max-w-[70%] rounded-lg px-3 py-2',
        isSender ? 'bg-primary text-primary-foreground' : 'bg-muted'
      )}>
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <p className={cn(
          'text-[10px] mt-1',
          isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'
        )}>
          {message.created_at ? format(new Date(message.created_at), 'MMM d, h:mm a') : ''}
        </p>
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((att) => (
              <a
                key={att.id}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline flex items-center gap-1"
              >
                <Paperclip className="h-3 w-3" />
                {att.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
