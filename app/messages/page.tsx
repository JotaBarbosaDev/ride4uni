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
import {getUserByID} from "@/api/userService";
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

export default function MessagesPage() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newChatTarget, setNewChatTarget] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const userRes = await getCurrentUser();
        const me = userRes.data?.id ?? userRes.data;
        setCurrentUserId(String(me));

        const chatsRes = await getUserChats();
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
    return date.toLocaleString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });
  };

  const highlightName = useCallback((participants: ChatPreview["participants"]) => {
    if (!participants || participants.length === 0) return "Conversa";
    if (!currentUserId) return participants[0]?.name ?? "Conversa";
    const other = participants.find((p) => p.id !== currentUserId);
    return other?.name ?? participants[0]?.name ?? "Conversa";
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

  const onCreateChat = async () => {
    if (!newChatTarget.trim() || !currentUserId) return;
    const targetId = newChatTarget.trim();
    const existing = findExistingChatId(targetId);
    if (existing) {
      router.push(`/messages/${existing}`);
      return;
    }

    setCreating(true);
    try {
      const participants = [currentUserId, targetId];
      const res = await createChat({participants});
      const chatId = String(res.data?.id ?? res.data?._id ?? participants.join("-"));
      setChats((prev) => [
        {
          id: chatId,
          participants: [
            {id: currentUserId, name: "Tu"},
            {id: targetId, name: targetId},
          ],
          lastMessage: undefined,
        },
        ...prev,
      ]);
      setNewChatTarget("");
      router.push(`/messages/${chatId}`);
    } catch (error) {
      console.error("Failed to create chat", error);
      alert("Não foi possível criar o chat");
    } finally {
      setCreating(false);
    }
  };

  const renderCard = (chat: ChatPreview) => {
    const displayName = highlightName(chat.participants);
    const initials = displayName?.slice(0, 1)?.toUpperCase() || "?";
    const lastMessage = chat.lastMessage?.content ?? "Sem mensagens";
    const lastMessageTime = chat.lastMessage?.createdAt;

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
              onClick={() => router.push(`/messages/${chat.id}`)}
            >
              Abrir
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
              Conversas com condutores e passageiros, agrupadas por chat.
            </p>
          </div>

          <div className="w-full max-w-5xl mx-auto bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min p-3 space-y-4">
            <div className="flex items-center justify-between px-2 gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-semibold">Inbox</h2>
                <p className="text-sm text-muted-foreground">Vê todas as tuas conversas</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="ID do utilizador para novo chat"
                  className="max-w-xs"
                  value={newChatTarget}
                  onChange={(e) => setNewChatTarget(e.target.value)}
                />
                <Button onClick={onCreateChat} disabled={creating || !newChatTarget.trim()}>
                  <Plus className="h-4 w-4 mr-1" /> Novo chat
                </Button>
                <Input
                  placeholder="Pesquisar conversas..."
                  className="max-w-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <Card className="w-full">
              <CardContent className="space-y-3 pt-4">
                {loading ? (
                  <p className="text-sm text-muted-foreground">A carregar chats...</p>
                ) : filteredChats.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Ainda não tens conversas.</p>
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
