"use client";

import {useRouter} from "next/navigation";
import {AppSidebar} from "@/components/app-sidebar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import {Separator} from "@/components/ui/separator";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {LucideStar} from "lucide-react";

export default function HistoryRidesPage() {
  const router = useRouter();

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
              My Rides
            </h1>
            <p className="text-muted-foreground">
              Consulta as boleias em que participaste, sejam confirmadas, postadas ou a aguardar aprovação.
            </p>
          </div>

          <div className="w-full max-w-5xl mx-auto bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min p-3">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-semibold">Upcoming Rides</h2>
              <p className="text-sm text-muted-foreground">Confirmadas ou postadas</p>
            </div>
            <div className="flex flex-col items-center gap-6">
              <Card className="w-full">
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <Badge className="rounded-full px-3 py-1 text-xs">Confirmed</Badge>
                    <p className="text-sm text-muted-foreground">Nov 9, 2:30 PM</p>
                  </div>
                  <div className="space-y-2 rounded-xl bg-gray-100/65 p-4">
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-black mt-2" />
                      <div>
                        <p className="text-muted-foreground text-sm">Pick-up</p>
                        <p className="font-medium">Viana do Castelo</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-black mt-2" />
                      <div>
                        <p className="text-muted-foreground text-sm">Drop-off</p>
                        <p className="font-medium">Porto</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-9 w-9 rounded-lg">
                          <AvatarImage src="/" alt="user" />
                          <AvatarFallback className="rounded-lg">U</AvatarFallback>
                        </Avatar>
                        <div className="leading-tight">
                          <p className="font-medium">User</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <LucideStar className="h-3 w-3" /> 4.9 • Driver
                          </p>
                        </div>
                      </div>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-9"
                            onClick={() => router.push("/messages/1")}
                          >
                            Message
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="sm:max-w-md">
                          <SheetHeader>
                            <SheetTitle>Chat with User</SheetTitle>
                            <p className="text-sm text-muted-foreground">
                              Viana do Castelo → Porto · Nov 9, 2:30 PM
                            </p>
                          </SheetHeader>
                          <div className="space-y-3 px-4">
                            <div className="flex gap-3">
                              <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src="/" alt="user" />
                                <AvatarFallback className="rounded-lg">U</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 rounded-lg bg-muted px-3 py-2">
                                <p className="text-sm text-muted-foreground">Olá! Posso levar uma mala grande?</p>
                                <p className="text-[10px] text-muted-foreground mt-1">14:02</p>
                              </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                              <div className="flex-1 rounded-lg bg-primary text-primary-foreground px-3 py-2">
                                <p className="text-sm">Sim, sem problema. Vemo-nos no ponto às 14:20.</p>
                                <p className="text-[10px] text-primary-foreground/80 mt-1">14:05</p>
                              </div>
                            </div>
                          </div>
                          <SheetFooter className="px-4 pb-4">
                            <div className="flex w-full items-center gap-2">
                              <Input placeholder="Escreve a tua mensagem..." />
                              <Button className="px-4">Send</Button>
                            </div>
                          </SheetFooter>
                        </SheetContent>
                      </Sheet>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="w-full">
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <Badge className="rounded-full px-3 py-1 text-xs">Posted</Badge>
                    <p className="text-sm text-muted-foreground">Nov 12, 5:00 PM</p>
                  </div>
                  <div className="space-y-2 rounded-xl bg-gray-100/65 p-4">
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-black mt-2" />
                      <div>
                        <p className="text-muted-foreground text-sm">Pick-up</p>
                        <p className="font-medium">Braga</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-black mt-2" />
                      <div>
                        <p className="text-muted-foreground text-sm">Drop-off</p>
                        <p className="font-medium">Guimarães</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">You&apos;re driving</p>
                      <p className="text-sm font-medium">2 seats available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Separator className="w-full max-w-xl" />

              <div className="w-full">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-lg font-semibold">Pending Actions</h2>
                  <p className="text-sm text-muted-foreground">Aceita ou aguarda aprovação</p>
                </div>

                <Card className="w-full mt-3">
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                        Awaiting your approval
                      </Badge>
                      <p className="text-sm text-muted-foreground">Nov 14, 8:00 AM</p>
                    </div>
                    <div className="space-y-2 rounded-xl bg-gray-100/65 p-4">
                      <div className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-black mt-2" />
                        <div>
                          <p className="text-muted-foreground text-sm">Pick-up</p>
                          <p className="font-medium">Barcelos</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-black mt-2" />
                        <div>
                          <p className="text-muted-foreground text-sm">Drop-off</p>
                          <p className="font-medium">Porto</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-9 w-9 rounded-lg">
                            <AvatarImage src="/" alt="user" />
                            <AvatarFallback className="rounded-lg">P</AvatarFallback>
                          </Avatar>
                          <div className="leading-tight">
                            <p className="font-medium">Passenger request</p>
                            <p className="text-xs text-muted-foreground">Aguardando tua aprovação</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="h-9 px-4">Decline</Button>
                          <Button className="h-9 px-4">Accept</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="w-full mt-3">
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                        Awaiting driver approval
                      </Badge>
                      <p className="text-sm text-muted-foreground">Nov 15, 6:00 PM</p>
                    </div>
                    <div className="space-y-2 rounded-xl bg-gray-100/65 p-4">
                      <div className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-black mt-2" />
                        <div>
                          <p className="text-muted-foreground text-sm">Pick-up</p>
                          <p className="font-medium">Viana do Castelo</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-black mt-2" />
                        <div>
                          <p className="text-muted-foreground text-sm">Drop-off</p>
                          <p className="font-medium">Portela</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="leading-tight">
                          <p className="font-medium">Request sent</p>
                          <p className="text-xs text-muted-foreground">Aguardando confirmação do condutor</p>
                        </div>
                        <Button variant="outline" className="h-9 px-4">
                          Cancel request
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="w-full">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-lg font-semibold">Past Rides</h2>
                  <p className="text-sm text-muted-foreground">Viagens concluídas</p>
                </div>
                <div className="mt-3 space-y-3">
                  <Card className="w-full">
                    <CardContent className="rounded-2xl bg-gray-100/65 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Nov 5, 2024</p>
                          <p className="text-lg font-semibold">Viana do Castelo → Porto</p>
                          <p className="text-sm text-muted-foreground">with User</p>
                        </div>
                        <Badge className="rounded-full bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="w-full">
                    <CardContent className="rounded-2xl bg-gray-100/65 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Nov 2, 2024</p>
                          <p className="text-lg font-semibold">Braga → Guimarães</p>
                          <p className="text-sm text-muted-foreground">with User</p>
                        </div>
                        <Badge className="rounded-full bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="w-full">
                    <CardContent className="rounded-2xl bg-gray-100/65 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Oct 28, 2024</p>
                          <p className="text-lg font-semibold">Porto → Barcelos</p>
                          <p className="text-sm text-muted-foreground">with User</p>
                        </div>
                        <Badge className="rounded-full bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="w-full">
                    <CardContent className="rounded-2xl bg-gray-100/65 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Oct 25, 2024</p>
                          <p className="text-lg font-semibold">Viana do Castelo → Portela</p>
                          <p className="text-sm text-muted-foreground">with User</p>
                        </div>
                        <Badge className="rounded-full bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
