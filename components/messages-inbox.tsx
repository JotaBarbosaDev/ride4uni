"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {cn} from "@/lib/utils";
import {getUserChats} from "@/api/chatService";
import {getUserByID} from "@/api/userService";
import {getCurrentUser} from "@/api/authService";

type ChatPreview = {
  id: string;
  participants: Array<{ id: string; name: string; avatar?: string }>;
  lastMessage?: { content?: string; timestamp?: string };
};

type ChatApi = {
  id?: string;
  participants?: string[];
  messages?: Array<{ content?: string; timestamp?: string }>;
};

export function MessagesInbox({className}: {className?: string}) {
  const router = useRouter();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const userRes = await getCurrentUser();
        const me = userRes.data?.id ?? userRes.data?.userId ?? userRes.data;
        setCurrentUserId(String(me));

        const chatsRes = await getUserChats(me);
        const rawChats: ChatApi[] = chatsRes.data ?? [];

        const getMessageTime = (message?: {
          timestamp?: string;
        }) => {
          const value = message?.timestamp ?? "";
          const parsed = Date.parse(value);
          return Number.isNaN(parsed) ? 0 : parsed;
        };

        const resolveLastMessage = (chat: ChatApi) => {
          const messages = chat.messages ?? [];
          if (!messages.length) return undefined;
          let latest = messages[0];
          messages.forEach((message) => {
            if (getMessageTime(message) > getMessageTime(latest)) {
              latest = message;
            }
          });
          return {
            content: latest.content,
            timestamp: latest.timestamp,
          };
        };

        const resolved = await Promise.all(
          rawChats.map(async (chat) => {
            const participantIds: string[] = chat.participants ?? [];
            const participantUsers = await Promise.all(
              participantIds.map(async (pid) => {
                try {
                  const user = await getUserByID(pid);
                  return {id: String(pid), name: user.data?.name ?? String(pid)};
                } catch (_err) {
                  return {id: String(pid), name: String(pid), _err};
                }
              })
            );

            return {
              id: String(chat.id ?? participantIds.join("-")),
              participants: participantUsers,
              lastMessage: resolveLastMessage(chat),
            } satisfies ChatPreview;
          })
        );

        setChats(resolved);
      } catch (error) {
        console.error("Failed to load chats", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "--";
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });
  };

  const highlightName = useCallback((participants: ChatPreview["participants"]) => {
    if (!participants || participants.length === 0) return "Chat";
    if (!currentUserId) return participants[0]?.name ?? "Chat";
    const other = participants.find((p) => p.id !== currentUserId);
    return other?.name ?? participants[0]?.name ?? "Chat";
  }, [currentUserId]);

  const filteredChats = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return chats;

    return chats.filter((chat) => {
      const name = highlightName(chat.participants).toLowerCase();
      const lastContent = chat.lastMessage?.content?.toLowerCase() ?? "";
      return name.includes(term) || lastContent.includes(term);
    });
  }, [chats, search, highlightName]);

  const storeReceiverId = (chatId: string, receiverId: string) => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(`chat-receiver:${chatId}`, receiverId);
    } catch (_err) {
      // Ignore storage failures (private mode, quota).
    }
  };

  const renderCard = (chat: ChatPreview) => {
    const displayName = highlightName(chat.participants);
    const initials = displayName?.slice(0, 1)?.toUpperCase() || "?";
    const lastMessage = chat.lastMessage?.content ?? "No messages yet";
    const lastMessageTime = chat.lastMessage?.timestamp;
    const receiverId = currentUserId
      ? chat.participants.find((p) => p.id !== currentUserId)?.id
      : undefined;

    return (
      <div
        key={chat.id}
        className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border"
        onClick={() => {
          if (receiverId) {
            storeReceiverId(chat.id, receiverId);
          }
          router.push(`/messages/${chat.id}`);
        }}
      >
        <Avatar className="h-12 w-12 rounded-full">
          <AvatarImage src={chat.participants?.[0]?.avatar ?? "/avatars/shadcn.jpg"} alt={displayName} />
          <AvatarFallback className="rounded-full bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground whitespace-nowrap">{formatTime(lastMessageTime)}</p>
          </div>
          <p className="text-sm text-muted-foreground truncate mt-0.5">{lastMessage}</p>
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "w-full flex min-h-0 flex-1 flex-col rounded-xl bg-muted/50 p-4 space-y-4 overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Inbox</h2>
          <p className="text-sm text-muted-foreground">See all your conversations</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            placeholder="Search conversations..."
            className="max-w-[200px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="w-full flex flex-1 min-h-0 flex-col overflow-hidden">
        <CardContent className="divide-y p-2 overflow-auto flex-1">
          {loading ? (
            <p className="text-sm text-muted-foreground p-4">Loading chats...</p>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No conversations yet</p>
              <p className="text-sm text-muted-foreground mt-1">Start a new chat to get going!</p>
            </div>
          ) : (
            filteredChats.map(renderCard)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
