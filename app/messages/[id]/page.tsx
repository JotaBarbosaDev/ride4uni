"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {MessagesInbox} from "@/components/messages-inbox";
import { getMessagesByChatId, createMessage } from "@/api/messageService";
import { getUserChats } from "@/api/chatService";
import { getUserByID } from "@/api/userService";
import { getCurrentUser } from "@/api/authService";
import { socket } from "@/Service/socket.js";
import { showAlert } from "@/components/alert-toaster";

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
  participants?: string[];
};

type MessageApi = {
  id?: string;
  chatId?: string;
  senderId?: string;
  receiverId?: string;
  content?: string;
  timestamp?: string;
};

const toTimestamp = (value: string) => {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const sortMessagesByTimestamp = (messages: ChatMessage[]) =>
  [...messages].sort((a, b) => toTimestamp(a.timestamp) - toTimestamp(b.timestamp));

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
  const content = raw.content ?? "";
  if (content === undefined || content === null) return null;
  const sender = raw.senderId ?? "";
  const receiver = raw.receiverId;
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

  const id = raw.id ?? crypto.randomUUID();
  const timestamp = raw.timestamp ?? new Date().toISOString();
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
        const target = (chatsRes.data as ChatApi[] ?? []).find((c) => String(c.id) === String(chatId));
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
          messages: sortMessagesByTimestamp(messages),
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
        const incomingChatId = raw?.chatId;
        const activeChatId = chat?.id ?? chatId;
        if (incomingChatId && String(incomingChatId) !== String(activeChatId)) return;
        const normalized = normalizeMessage(raw, { me, receiverId });
        if (!normalized) return;
        setChat((prev) => {
          if (!prev) return prev;
          if (prev.messages.some((m) => m.id === normalized.id)) return prev;
          return {
            ...prev,
            messages: sortMessagesByTimestamp([...prev.messages, normalized]),
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
      showAlert("Danger", "Unable to identify the receiver for this chat.");
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
        messages: sortMessagesByTimestamp([...prev.messages, {
          id: crypto.randomUUID(),
          senderId: me,
          receiverId,
          content: newMessage.trim(),
          timestamp: now,
        }]),
      } : prev);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message", error);
      showAlert("Danger", "Unable to send the message.");
    } finally {
      setSending(false);
    }
  };

  const participantName = otherParticipant?.name ?? "Chat";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-6 h-svh overflow-hidden">
        <div className="flex h-full min-h-0 flex-col gap-4 md:flex-row">
          <div className="flex min-h-0 w-full md:w-[360px] md:shrink-0">
            <MessagesInbox className="max-w-none h-full min-h-0 p-3" />
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-background">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-background">
              <Button variant="ghost" size="icon" onClick={() => router.push("/messages")} aria-label="Back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10 rounded-full">
                <AvatarImage src="/avatars/shadcn.jpg" alt={participantName} />
                <AvatarFallback className="rounded-full bg-primary/10 text-primary font-semibold">
                  {participantName.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{participantName}</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 min-h-0 overflow-auto p-4 space-y-3">
              {(chat?.messages ?? []).map((message) => {
                const isMine = me && message.senderId === me;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex max-w-[75%] gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                      {!isMine && (
                        <Avatar className="h-8 w-8 rounded-full shrink-0">
                          <AvatarImage src="/avatars/shadcn.jpg" alt={otherParticipant?.name ?? "User"} />
                          <AvatarFallback className="rounded-full bg-muted text-xs">
                            {(otherParticipant?.name ?? "?").slice(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2.5 ${
                          isMine
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-background">
              <div className="flex items-center gap-3 max-w-4xl mx-auto">
                <Input
                  placeholder="Type a message..."
                  className="flex-1 rounded-full px-4"
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
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending || !me}
                  size="icon"
                  className="rounded-full h-10 w-10"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}



