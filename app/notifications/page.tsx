import {AppSidebar} from "@/components/app-sidebar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Calendar, CheckCircle, Clock, MessageSquare, UserPlus, XCircle} from "lucide-react";

export default function NotificationsPage() {
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
          <div className="space-y-2">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
              Notifications
            </h1>
            <p className="text-muted-foreground">
              Acompanha atualizações das tuas boleias, pedidos e mensagens.
            </p>
          </div>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Recent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border bg-muted/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <p className="font-medium">Pedido aprovado</p>
                  </div>
                  <Badge variant="outline">Now</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  O condutor aceitou o teu pedido para a viagem Braga → Porto.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Hoje, 14:12</span>
                </div>
              </div>

              <div className="rounded-xl border bg-muted/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <p className="font-medium">Novo passageiro a aguardar</p>
                  </div>
                  <Badge variant="outline">Action needed</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  João quer juntar-se à tua viagem Viana do Castelo → Portela. Decide se aceitas.
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="h-8 px-3">Decline</Button>
                  <Button className="h-8 px-3">Accept</Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Hoje, 13:48</span>
                </div>
              </div>

              <div className="rounded-xl border bg-muted/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <p className="font-medium">Nova mensagem</p>
                  </div>
                  <Badge variant="outline">Unread</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  “Podes enviar o local exato do pick-up?” na viagem de Nov 9.
                </p>
                <Button variant="outline" className="h-8 px-3">Abrir chat</Button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Hoje, 12:03</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Ride status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl border bg-muted/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Confirmado</p>
                    <Badge variant="outline">Nov 9, 2:30 PM</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Viana do Castelo → Porto</p>
                </div>
                <div className="rounded-xl border bg-muted/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Postado</p>
                    <Badge variant="outline">Nov 12, 5:00 PM</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Braga → Guimarães</p>
                </div>
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl border bg-muted/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Atualização de segurança</p>
                    <Badge variant="outline">Info</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Garante que confirmas pedidos apenas de utilizadores verificados.
                  </p>
                </div>
                <div className="rounded-xl border bg-muted/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      <p className="font-medium">Pedido recusado</p>
                    </div>
                    <Badge variant="outline">Nov 8</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Um condutor recusou a tua solicitação. Tenta outras boleias disponíveis.
                  </p>
                </div>
                <div className="rounded-xl border bg-muted/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <p className="font-medium">Lembra-te da hora</p>
                    </div>
                    <Badge variant="outline">Reminder</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Chega ao ponto de encontro 10 minutos antes da partida para evitar atrasos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
