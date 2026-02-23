import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, Search, Bot, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";

interface RawMessage {
  id: number;
  phone: string | null;
  message: string | null;
  created_at: string;
}

interface ParsedBubble {
  sender: "user" | "ai";
  text: string;
}

interface ContactSummary {
  phone: string;
  lastMessage: string;
  lastTimestamp: string;
  messageCount: number;
}

function parseMessageBubbles(raw: string): ParsedBubble[] {
  const bubbles: ParsedBubble[] = [];
  // Split on "USER - " or "AI - " keeping the delimiter
  const parts = raw.split(/(?=USER - |AI - )/);
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("USER - ")) {
      bubbles.push({ sender: "user", text: trimmed.slice(7).trim() });
    } else if (trimmed.startsWith("AI - ")) {
      bubbles.push({ sender: "ai", text: trimmed.slice(5).trim() });
    } else {
      // Fallback — treat as user message
      bubbles.push({ sender: "user", text: trimmed });
    }
  }
  return bubbles;
}

export default function WhatsAppHistory() {
  const [messages, setMessages] = useState<RawMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("message history WA")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && data) {
        setMessages(data as RawMessage[]);
      }
      setLoading(false);
    };
    fetchMessages();
  }, []);

  // Group by phone
  const grouped = useMemo(() => {
    const map = new Map<string, RawMessage[]>();
    for (const m of messages) {
      if (!m.phone) continue;
      if (!map.has(m.phone)) map.set(m.phone, []);
      map.get(m.phone)!.push(m);
    }
    return map;
  }, [messages]);

  // Contact list sorted by most recent
  const contacts: ContactSummary[] = useMemo(() => {
    const list: ContactSummary[] = [];
    grouped.forEach((msgs, phone) => {
      const last = msgs[msgs.length - 1];
      list.push({
        phone,
        lastMessage: last.message?.slice(0, 80) || "",
        lastTimestamp: last.created_at,
        messageCount: msgs.length,
      });
    });
    list.sort((a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime());
    return list;
  }, [grouped]);

  const filteredContacts = useMemo(
    () => contacts.filter((c) => c.phone.includes(search)),
    [contacts, search]
  );

  const selectedMessages = selectedPhone ? grouped.get(selectedPhone) || [] : [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedPhone, selectedMessages.length]);

  const showList = !isMobile || !selectedPhone;
  const showChat = !isMobile || !!selectedPhone;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">WhatsApp History</h1>
        <Badge variant="secondary" className="ml-auto">{contacts.length} contacts</Badge>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Contact List */}
        {showList && (
          <div className={`${isMobile ? "w-full" : "w-80 border-r border-border/50"} flex flex-col`}>
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-1 p-2">
                {filteredContacts.map((c) => (
                  <button
                    key={c.phone}
                    onClick={() => setSelectedPhone(c.phone)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                      selectedPhone === c.phone
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-card/60 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {c.phone.slice(-2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground truncate">
                            {c.phone}
                          </span>
                          <Badge variant="outline" className="text-xs shrink-0 ml-2">
                            {c.messageCount}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {c.lastMessage.replace(/^(USER - |AI - )/, "")}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          {format(new Date(c.lastTimestamp), "dd MMM yyyy, HH:mm")}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
                {filteredContacts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No contacts found</p>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Chat Thread */}
        {showChat && (
          <div className="flex-1 flex flex-col min-w-0">
            {selectedPhone ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 p-4 border-b border-border/50">
                  {isMobile && (
                    <Button variant="ghost" size="icon" onClick={() => setSelectedPhone(null)}>
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  )}
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {selectedPhone.slice(-2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{selectedPhone}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedMessages.length} messages
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4 max-w-2xl mx-auto">
                    {selectedMessages.map((msg) => {
                      const bubbles = msg.message ? parseMessageBubbles(msg.message) : [];
                      return (
                        <div key={msg.id} className="space-y-2">
                          {bubbles.map((b, i) => (
                            <div
                              key={i}
                              className={`flex items-end gap-2 ${
                                b.sender === "user" ? "justify-end" : "justify-start"
                              }`}
                            >
                              {b.sender === "ai" && (
                                <Avatar className="h-7 w-7 shrink-0">
                                  <AvatarFallback className="bg-accent text-accent-foreground text-[10px]">
                                    <Bot className="w-4 h-4" />
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                                  b.sender === "user"
                                    ? "bg-primary text-primary-foreground rounded-br-sm"
                                    : "bg-card border border-border/50 text-foreground rounded-bl-sm"
                                }`}
                              >
                                {b.text}
                              </div>
                              {b.sender === "user" && (
                                <Avatar className="h-7 w-7 shrink-0">
                                  <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                                    <User className="w-4 h-4" />
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          ))}
                          <p className="text-[10px] text-muted-foreground/50 text-center">
                            {format(new Date(msg.created_at), "dd MMM yyyy, HH:mm")}
                          </p>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                  <p className="text-muted-foreground">Select a contact to view the conversation</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
