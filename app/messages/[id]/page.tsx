"use client";

import {useMemo} from "react";
import {useParams, useRouter} from "next/navigation";
import {AppSidebar} from "@/components/app-sidebar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Clock, ArrowLeft} from "lucide-react";

type ChatMessage = {
  id: number | string;
  sender: string;
  isMine: boolean;
  content: string;
  createdAt: string;
};

type ChatDetail = {
  id: number | string;
  participant: string;
  participantAvatar?: string;
  rideLabel?: string;
  messages: ChatMessage[];
};

const mockChats: Record<string, ChatDetail> = {
  "1": {
    id: 1,
    participant: "Joana",
    participantAvatar: "/avatars/shadcn.jpg",
    rideLabel: "Porto -> Aveiro",
    messages: [
      {id: 1, sender: "Joana", isMine: false, content: "Confirmamos às 14:20?", createdAt: new Date().toISOString()},
      {id: 2, sender: "Tu", isMine: true, content: "Sim, encontro no ponto habitual.", createdAt: new Date().toISOString()},
    ],
  },
  "2": {
    id: 2,
    participant: "Carlos",
    participantAvatar: undefined,
    rideLabel: "Braga -> Guimaraes",
    messages: [
      {id: 1, sender: "Carlos", isMine: false, content: "Enviei o ponto de encontro atualizado.", createdAt: new Date().toISOString()},
      {id: 2, sender: "Tu", isMine: true, content: "Visto, até já!", createdAt: new Date().toISOString()},
    ],
  },
  "3": {
    id: 3,
    participant: "Sofia",
    participantAvatar: undefined,
    rideLabel: "Viana -> Porto",
    messages: [
      {id: 1, sender: "Sofia", isMine: false, content: "Podes confirmar a minha solicitação?", createdAt: new Date().toISOString()},
      {id: 2, sender: "Tu", isMine: true, content: "Confirmado!", createdAt: new Date().toISOString()},
    ],
  },
};

export default function MessageThreadPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const chat = useMemo(() => mockChats[chatId ?? ""] ?? mockChats["1"], [chatId]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-PT", {hour: "2-digit", minute: "2-digit"});
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.push("/messages")}> <ArrowLeft className="h-4 w-4" /> </Button>
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage src={chat.participantAvatar ?? "/avatars/shadcn.jpg"} alt={chat.participant} />
                  <AvatarFallback className="rounded-lg">{chat.participant.slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <p className="font-semibold">{chat.participant}</p>
                  {chat.rideLabel ? (
                    <p className="text-xs text-muted-foreground">{chat.rideLabel}</p>
                  ) : null}
                </div>
              </div>
            </div>
            <Badge variant="outline">Chat #{chat.id}</Badge>
          </div>

          <Card className="w-full max-w-5xl mx-auto bg-muted/50 rounded-xl">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
                {chat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex max-w-xl gap-2 ${message.isMine ? "flex-row-reverse" : "flex-row"}`}>
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback className="rounded-lg">{message.sender.slice(0, 1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-2xl px-3 py-2 text-sm shadow-sm ${
                          message.isMine ? "bg-primary text-primary-foreground" : "bg-white"
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-[10px] mt-1 ${message.isMine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          <Clock className="h-3 w-3 inline mr-1" />
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Input placeholder="Escreve a tua mensagem..." disabled className="flex-1" />
                <Button disabled>Enviar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
