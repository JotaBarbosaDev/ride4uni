import {AppSidebar} from "@/components/app-sidebar";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Calendar, Clock, MapPin, Users, DollarSign} from "lucide-react";

export default function PostRidesPage() {
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
              Post a Ride
            </h1>
            <p className="text-muted-foreground">
              Adiciona uma nova boleia num layout monocromático, alinhado com as outras páginas.
            </p>
          </div>

          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">Post a New Ride</CardTitle>
              <CardDescription>
                Preenche os detalhes da tua viagem e publica.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Pick-up Location
                  </p>
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-3">
                    <Input
                      placeholder="e.g., Location"
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Drop-off Location
                  </p>
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-3">
                    <Input
                      placeholder="e.g., Location"
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Date
                  </p>
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-3">
                    <Input
                      placeholder="dd/mm/aaaa"
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Time
                  </p>
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-3">
                    <Input
                      placeholder="--:--"
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Available Seats
                  </p>
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-3">
                    <Input
                      placeholder="1-8"
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    Price per Seat (€)
                  </p>
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-3">
                    <Input
                      placeholder="0.00"
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>

              <Button className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Post Ride
              </Button>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
