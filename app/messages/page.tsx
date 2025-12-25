"use client";

import {useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {AppSidebar} from "@/components/app-sidebar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Clock} from "lucide-react";

type UserSummary = {
  id?: number | string;
  name?: string;
  avatar?: string;
  avatarUrl?: string;
};

type RideSummary = {
  origin?: string;
  destination?: string;
  dateTime?: string;
};

type MessageSummary = {
  content?: string;
  createdAt?: string;
  senderId?: number | string;
};

type ChatPreview = {
  id?: number | string;
  participants?: UserSummary[];
  ride?: RideSummary;
  lastMessage?: MessageSummary;
};

const mockChats: ChatPreview[] = [
  {
    id: 1,
    participants: [
      {id: 1, name: "Tu", avatar: "/avatars/shadcn.jpg"},
      {id: 2, name: "Joana"},
    ],
    ride: {origin: "Porto", destination: "Aveiro", dateTime: new Date().toISOString()},
    lastMessage: {content: "Confirmamos às 14:20?", createdAt: new Date().toISOString()},
  },
  {
    id: 2,
    participants: [
      {id: 1, name: "Tu", avatar: "/avatars/shadcn.jpg"},
      {id: 3, name: "Carlos"},
    ],
    ride: {origin: "Braga", destination: "Guimaraes", dateTime: new Date().toISOString()},
    lastMessage: {content: "Enviei o ponto de encontro atualizado.", createdAt: new Date().toISOString()},
  },
  {
    id: 3,
    participants: [
      {id: 1, name: "Tu", avatar: "/avatars/shadcn.jpg"},
      {id: 4, name: "Sofia"},
    ],
    ride: {origin: "Viana", destination: "Porto", dateTime: new Date().toISOString()},
    lastMessage: {content: "Podes confirmar a minha solicitação?", createdAt: new Date().toISOString()},
  },
];

export default function MessagesPage() {
  const router = useRouter();
  const [chats] = useState<ChatPreview[]>(mockChats);
  const [currentUserId] = useState<number | string | null>(1);
  const [search, setSearch] = useState("");

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

  const highlightName = (participants?: UserSummary[]) => {
    if (!participants || participants.length === 0) return "Conversa";
    if (!currentUserId) return participants[0]?.name ?? "Conversa";

    const other = participants.find((p) => p.id?.toString() !== currentUserId.toString());
    return other?.name ?? participants[0]?.name ?? "Conversa";
  };

  const filteredChats = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return chats;

    return chats.filter((chat) => {
      const name = highlightName(chat.participants).toLowerCase();
      const lastContent = chat.lastMessage?.content?.toLowerCase() ?? "";
      const rideSummary = `${chat.ride?.origin ?? ""} ${chat.ride?.destination ?? ""}`.toLowerCase();
      return name.includes(term) || lastContent.includes(term) || rideSummary.includes(term);
    });
  }, [chats, search, currentUserId]);

  const renderCard = (chat: ChatPreview) => {
    const displayName = highlightName(chat.participants);
    const initials = displayName?.slice(0, 1)?.toUpperCase() || "?";
    const lastMessage = chat.lastMessage?.content ?? "Sem mensagens";
    const lastMessageTime = chat.lastMessage?.createdAt ?? chat.ride?.dateTime;
    const rideBadge = chat.ride?.origin && chat.ride?.destination
      ? `${chat.ride.origin} -> ${chat.ride.destination}`
      : undefined;

    return (
      <div key={chat.id ?? displayName} className="flex items-start gap-3 rounded-xl bg-gray-100/65 p-3">
        <Avatar className="h-10 w-10 rounded-lg">
          <AvatarImage src={chat.participants?.[0]?.avatar ?? chat.participants?.[0]?.avatarUrl ?? "/avatars/shadcn.jpg"} alt={displayName} />
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
            {rideBadge ? (
              <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs">{rideBadge}</Badge>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              disabled={!chat.id}
              onClick={() => chat.id && router.push(`/messages/${chat.id}`)}
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
            <div className="flex items-center justify-between px-2">
              <div>
                <h2 className="text-lg font-semibold">Inbox</h2>
                <p className="text-sm text-muted-foreground">Vê todas as tuas conversas</p>
              </div>
              <Input
                placeholder="Pesquisar conversas..."
                className="max-w-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Card className="w-full">
              <CardContent className="space-y-3 pt-4">
                {filteredChats.length === 0 ? (
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
