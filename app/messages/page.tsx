import {AppSidebar} from "@/components/app-sidebar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Clock} from "lucide-react";

export default function MessagesPage() {
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
              Conversas com condutores e passageiros, em modo monocromático.
            </p>
          </div>

          <div className="w-full max-w-5xl mx-auto bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min p-3 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div>
                <h2 className="text-lg font-semibold">Inbox</h2>
                <p className="text-sm text-muted-foreground">Vê as tuas conversas</p>
              </div>
              <Input placeholder="Search messages..." className="max-w-xs" />
            </div>

            <Card className="w-full">
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-start gap-3 rounded-xl bg-gray-100/65 p-3">
                  <Avatar className="h-10 w-10 rounded-lg">
                    <AvatarImage src="/" alt="user" />
                    <AvatarFallback className="rounded-lg">U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">User</p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">2:45 PM</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">“Confirmado para amanhã às 14:20?”</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs">Confirmed ride</Badge>
                      <Button variant="outline" size="sm" className="h-8 px-3">Open</Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-gray-100/65 p-3">
                  <Avatar className="h-10 w-10 rounded-lg">
                    <AvatarImage src="/" alt="driver" />
                    <AvatarFallback className="rounded-lg">D</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">Driver</p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">11:10 AM</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">“Enviei o ponto de encontro atualizado.”</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs">Awaiting driver</Badge>
                      <Button variant="outline" size="sm" className="h-8 px-3">Open</Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-gray-100/65 p-3">
                  <Avatar className="h-10 w-10 rounded-lg">
                    <AvatarImage src="/" alt="passenger" />
                    <AvatarFallback className="rounded-lg">P</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">Passenger</p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Yesterday</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">“Podes confirmar a minha solicitação?”</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs">Pending approval</Badge>
                      <Button variant="outline" size="sm" className="h-8 px-3">Open</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
