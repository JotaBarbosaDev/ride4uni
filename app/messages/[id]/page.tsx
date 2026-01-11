"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, ArrowLeft, Send } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getMessagesByChatId, createMessage } from "@/api/messageService";
import { getUserChats } from "@/api/chatService";
import { getUserByID } from "@/api/userService";
import { getCurrentUser } from "@/api/authService";
import { socket } from "@/Service/socket.js";

type ChatMessage = {
  id: string;
  senderId: string;
  receiverId?: string;
  content: string;
  timestamp: string;
};

type ChatDetail = {
  id: string;
  participants: Array<{ id: string; name: string }>;
  messages: ChatMessage[];
};

type ChatApi = {
  id?: string;
  _id?: string;
  participants?: string[];
};

type MessageApi = {
  id?: string;
  _id?: string;
  senderId?: string;
  sender?: string;
  from?: string;
  receiverId?: string;
  content?: string;
  message?: string;
  text?: string;
  userId?: string;
  user?: { id?: string };
  to?: string;
  targetId?: string;
  recipientId?: string;
  chatId?: string;
  chat?: { id?: string };
  timestamp?: string;
  createdAt?: string;
  created_at?: string;
};

const extractMessages = (payload: unknown): MessageApi[] => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const data = payload as { messages?: MessageApi[]; data?: unknown };
  if (Array.isArray(data.messages)) return data.messages;
  if (Array.isArray(data.data)) return data.data as MessageApi[];
  if (data.data && typeof data.data === "object") {
    const nested = data.data as { messages?: MessageApi[] };
    if (Array.isArray(nested.messages)) return nested.messages;
  }
  return [];
};

const normalizeMessage = (
  raw: MessageApi,
  fallback: { me?: string | null; receiverId?: string | null }
): ChatMessage | null => {
  if (!raw) return null;
  const content = raw.content ?? raw.message ?? raw.text ?? "";
  if (content === undefined || content === null) return null;
  const sender = raw.senderId ?? raw.sender ?? raw.from ?? raw.userId ?? raw.user?.id ?? "";
  const receiver = raw.receiverId ?? raw.to ?? raw.targetId ?? raw.recipientId;
  let senderId = sender ? String(sender) : "";
  let receiverId = receiver ? String(receiver) : undefined;

  if (!senderId && fallback.receiverId) {
    senderId = String(fallback.receiverId);
  }
  if (!receiverId && fallback.me && senderId && senderId !== fallback.me) {
    receiverId = String(fallback.me);
  }
  if (!receiverId && fallback.me && senderId === fallback.me && fallback.receiverId) {
    receiverId = String(fallback.receiverId);
  }

  const id = raw.id ?? raw._id ?? crypto.randomUUID();
  const timestamp = raw.timestamp ?? raw.createdAt ?? raw.created_at ?? new Date().toISOString();
  return {
    id: String(id),
    senderId,
    receiverId,
    content: String(content),
    timestamp: String(timestamp),
  };
};

export default function MessageThreadPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [chat, setChat] = useState<ChatDetail | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [me, setMe] = useState<string | null>(null);
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      if (!chatId) return;
      try {
        const meRes = await getCurrentUser();
        const meId = String(meRes.data?.id ?? meRes.data);
        setMe(meId);

        const chatsRes = await getUserChats(meId);
        const target = (chatsRes.data as ChatApi[] ?? []).find((c) => String(c.id ?? c._id) === String(chatId));
        const participantsIds: string[] = target?.participants ?? [];
        const participants = await Promise.all(
          participantsIds.map(async (pid) => {
            try {
              const u = await getUserByID(pid);
              return { id: String(pid), name: u.data?.name ?? String(pid) };
            } catch (_err) {
              return { id: String(pid), name: String(pid), _err };
            }
          })
        );

        const messagesRes = await getMessagesByChatId(chatId);
        const messages = extractMessages(messagesRes.data)
          .map((m) => normalizeMessage(m, { me: meId, receiverId: null }))
          .filter(Boolean) as ChatMessage[];

        setChat({
          id: String(chatId),
          participants,
          messages,
        });
      } catch (error) {
        console.error("Failed to load chat", error);
      }
    };

    load();
  }, [chatId]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [chat?.messages.length]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const otherParticipant = useMemo(() => {
    if (!chat || !me) return null;
    return chat.participants.find((p) => p.id !== me) ?? null;
  }, [chat, me]);

  const persistReceiverId = (value: string) => {
    if (typeof window === "undefined" || !chatId) return;
    try {
      window.sessionStorage.setItem(`chat-receiver:${chatId}`, value);
    } catch (_err) {
      // Ignore storage failures.
    }
  };

  useEffect(() => {
    if (!chat || !me) return;
    const fromParticipants = otherParticipant?.id ?? chat.participants.find((p) => p.id !== me)?.id ?? null;
    const fromMessages =
      chat.messages.find((m) => m.senderId && m.senderId !== me)?.senderId ??
      chat.messages.find((m) => m.receiverId && m.receiverId !== me)?.receiverId ??
      chat.messages.find((m) => m.senderId === me && m.receiverId)?.receiverId ??
      null;
    const resolved = fromParticipants ?? fromMessages;
    if (resolved) {
      setReceiverId(resolved);
      persistReceiverId(resolved);
      return;
    }
    if (typeof window === "undefined" || !chat?.id) return;
    try {
      const stored = window.sessionStorage.getItem(`chat-receiver:${chat.id}`);
      if (stored) setReceiverId(stored);
    } catch (_err) {
      // Ignore storage failures.
    }
  }, [chat, me, otherParticipant]);

  useEffect(() => {
    if (!chatId) return;
    const handleIncoming = (payload: MessageApi | MessageApi[]) => {
      const extracted = extractMessages(payload);
      const incoming = extracted.length ? extracted : (Array.isArray(payload) ? [] : [payload]);
      incoming.forEach((raw) => {
        const incomingChatId = raw?.chatId ?? raw?.chat?.id;
        const activeChatId = chat?.id ?? chatId;
        if (incomingChatId && String(incomingChatId) !== String(activeChatId)) return;
        const normalized = normalizeMessage(raw, { me, receiverId });
        if (!normalized) return;
        setChat((prev) => {
          if (!prev) return prev;
          if (prev.messages.some((m) => m.id === normalized.id)) return prev;
          return {
            ...prev,
            messages: [...prev.messages, normalized],
          };
        });
        if (normalized.senderId && normalized.senderId !== me) {
          setReceiverId(normalized.senderId);
          persistReceiverId(normalized.senderId);
        }
      });
    };

    socket.on("message", handleIncoming);
    socket.on("receive-message", handleIncoming);
    return () => {
      socket.off("message", handleIncoming);
      socket.off("receive-message", handleIncoming);
    };
  }, [chatId, me, receiverId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !chat || !me) return;
    if (!receiverId) {
      alert("Unable to identify the receiver for this chat.");
      return;
    }
    setSending(true);
    try {
      const now = new Date().toISOString();
      await createMessage({
        chatId: chat.id,
        senderId: me,
        receiverId,
        content: newMessage.trim(),
        timestamp: now,
      });

      setChat((prev) => prev ? {
        ...prev,
        messages: [...prev.messages, {
          id: crypto.randomUUID(),
          senderId: me,
          receiverId,
          content: newMessage.trim(),
          timestamp: now,
        }],
      } : prev);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message", error);
      alert("Unable to send the message.");
    } finally {
      setSending(false);
    }
  };

  const participantName = otherParticipant?.name ?? "Chat";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-28">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
        </header>

        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.push("/messages")} aria-label="Back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage src="/avatars/shadcn.jpg" alt={participantName} />
                  <AvatarFallback className="rounded-lg">{participantName.slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <p className="font-semibold">{participantName}</p>
                </div>
              </div>
            </div>
            <Badge variant="outline">Chat #{chatId}</Badge>
          </div>

          <Card className="w-full max-w-5xl mx-auto bg-muted/50 rounded-xl">
            <CardContent className="p-4 space-y-4">
              <div ref={listRef} className="space-y-3 max-h-[60vh] overflow-auto pr-1">
                {(chat?.messages ?? []).map((message) => {
                  const isMine = me && message.senderId === me;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex max-w-xl gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarFallback className="rounded-lg">
                            {(isMine ? "You" : otherParticipant?.name ?? "?").slice(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`rounded-2xl px-3 py-2 text-sm shadow-sm ${isMine ? "bg-primary text-primary-foreground" : "bg-white"
                            }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                            <Clock className="h-3 w-3 inline mr-1" />
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Write your message..."
                  className="flex-1"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={!me || sending}
                />
                <Button onClick={handleSend} disabled={!newMessage.trim() || sending || !me}>
                  <Send className="h-4 w-4 mr-1" /> Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
