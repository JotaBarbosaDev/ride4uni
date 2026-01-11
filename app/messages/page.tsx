"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {Clock, Plus} from "lucide-react";
import {AppSidebar} from "@/components/app-sidebar";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {createChat, getUserChats} from "@/api/chatService";
import {getUserByID, getUsers} from "@/api/userService";
import {getCurrentUser} from "@/api/authService";

type ChatPreview = {
  id: string;
  participants: Array<{ id: string; name: string; avatar?: string }>;
  lastMessage?: { content?: string; createdAt?: string };
};

type ChatApi = {
  id?: string;
  _id?: string;
  participants?: string[];
  lastMessage?: { content?: string; createdAt?: string };
};

type UserSummary = {
  id: string;
  name: string;
};

export default function MessagesPage() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newChatTarget, setNewChatTarget] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const userRes = await getCurrentUser();
        console.log("getCurrentUser response:", userRes);
        const me = userRes.data?.id ?? userRes.data?.userId ?? userRes.data;
        console.log("Current user ID extracted:", me);
        setCurrentUserId(String(me))
        const usersRes = await getUsers();
        const rawUsers = usersRes.data ?? [];
        setUsers(
          rawUsers
            .map((user: { id?: string; _id?: string; name?: string; email?: string }) => {
              const id = user.id ?? user._id;
              if (!id) return null;
              return {
                id: String(id),
                name: user.name ?? user.email ?? String(id),
              } satisfies UserSummary;
            })
            .filter(Boolean) as UserSummary[]
        );

        const chatsRes = await getUserChats(me);
        console.log("getUserChats response:", chatsRes);
        const rawChats: ChatApi[] = chatsRes.data ?? [];

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
              id: String(chat.id ?? chat._id ?? participantIds.join("-")),
              participants: participantUsers,
              lastMessage: chat.lastMessage,
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

  const findExistingChatId = (targetId: string) => {
    return chats.find((c) => {
      if (!currentUserId) return false;
      const ids = c.participants.map((p) => p.id);
      return ids.includes(currentUserId) && ids.includes(targetId);
    })?.id;
  };

  const storeReceiverId = (chatId: string, receiverId: string) => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(`chat-receiver:${chatId}`, receiverId);
    } catch (_err) {
      // Ignore storage failures (private mode, quota).
    }
  };

  const onCreateChat = async () => {
    if (!newChatTarget.trim() || !currentUserId) return;
    const targetId = newChatTarget.trim();
    const existing = findExistingChatId(targetId);
    if (existing) {
      storeReceiverId(existing, targetId);
      router.push(`/messages/${existing}`);
      return;
    }

    setCreating(true);
    try {
      const participants = [currentUserId, targetId];
      const targetName = users.find((user) => user.id === targetId)?.name ?? targetId;
      const res = await createChat({participants});
      const chatId = String(res.data?.id ?? res.data?._id ?? participants.join("-"));
      storeReceiverId(chatId, targetId);
      setChats((prev) => [
        {
          id: chatId,
          participants: [
            {id: currentUserId, name: "You"},
            {id: targetId, name: targetName},
          ],
          lastMessage: undefined,
        },
        ...prev,
      ]);
      setNewChatTarget("");
      router.push(`/messages/${chatId}`);
    } catch (error) {
      console.error("Failed to create chat", error);
      alert("Unable to create the chat.");
    } finally {
      setCreating(false);
    }
  };

  const filteredUserSuggestions = useMemo(() => {
    const term = newChatTarget.trim().toLowerCase();
    if (!term) return [];
    const candidates = users.filter((user) => user.id !== currentUserId);
    const scored = candidates
      .map((user) => {
        const name = user.name.toLowerCase();
        const id = user.id.toLowerCase();
        const nameIndex = name.indexOf(term);
        const idIndex = id.indexOf(term);
        const score =
          nameIndex === 0 ? 0 : nameIndex > 0 ? 1 : idIndex === 0 ? 2 : idIndex > 0 ? 3 : 9;
        return {user, score};
      })
      .filter((item) => item.score < 9)
      .sort((a, b) => a.score - b.score || a.user.name.localeCompare(b.user.name));

    return scored.slice(0, 3).map((item) => item.user);
  }, [newChatTarget, users, currentUserId]);

  const renderCard = (chat: ChatPreview) => {
    const displayName = highlightName(chat.participants);
    const initials = displayName?.slice(0, 1)?.toUpperCase() || "?";
    const lastMessage = chat.lastMessage?.content ?? "No messages";
    const lastMessageTime = chat.lastMessage?.createdAt;
    const receiverId = currentUserId
      ? chat.participants.find((p) => p.id !== currentUserId)?.id
      : undefined;

    return (
      <div key={chat.id} className="flex items-start gap-3 rounded-xl bg-gray-100/65 p-3">
        <Avatar className="h-10 w-10 rounded-lg">
          <AvatarImage src={chat.participants?.[0]?.avatar ?? "/avatars/shadcn.jpg"} alt={displayName} />
          <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold">{displayName}</p>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{formatTime(lastMessageTime)}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{lastMessage}</p>
          <div className="mt-2 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              disabled={!chat.id}
              onClick={() => {
                if (receiverId) {
                  storeReceiverId(chat.id, receiverId);
                }
                router.push(`/messages/${chat.id}`);
              }}
            >
              Open
            </Button>
          </div>
        </div>
      </div>
    );
  };

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
          <div className="space-y-2 text-center">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
              Messages
            </h1>
            <p className="text-muted-foreground">
              Chats with drivers and passengers, grouped by thread.
            </p>
          </div>

          <div className="w-full max-w-5xl mx-auto bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min p-3 space-y-4">
            <div className="flex items-center justify-between px-2 gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-semibold">Inbox</h2>
                <p className="text-sm text-muted-foreground">See all your conversations</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative max-w-xs w-full">
                  <Input
                    placeholder="Type a name or ID"
                    value={newChatTarget}
                    onChange={(e) => {
                      setNewChatTarget(e.target.value);
                      setSuggestionsOpen(true);
                    }}
                    onFocus={() => setSuggestionsOpen(true)}
                    onBlur={() => {
                      setTimeout(() => setSuggestionsOpen(false), 120);
                    }}
                  />
                  {suggestionsOpen && filteredUserSuggestions.length > 0 ? (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow">
                      {filteredUserSuggestions.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-muted"
                          onClick={() => {
                            setNewChatTarget(user.id);
                            setSuggestionsOpen(false);
                          }}
                        >
                          <span className="font-medium">{user.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <Button onClick={onCreateChat} disabled={creating || !newChatTarget.trim()}>
                  <Plus className="h-4 w-4 mr-1" /> New chat
                </Button>
                <Input
                  placeholder="Search conversations..."
                  className="max-w-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <Card className="w-full">
              <CardContent className="space-y-3 pt-4">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading chats...</p>
                ) : filteredChats.length === 0 ? (
                  <p className="text-sm text-muted-foreground">You don&apos;t have any conversations yet.</p>
                ) : (
                  filteredChats.map(renderCard)
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
