import {AppSidebar} from "@/components/app-sidebar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Calendar, Clock, LucideStar, MapPin, Users} from "lucide-react";

export default function SearchRidesPage() {
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
              Search Rides
            </h1>
            <p className="text-muted-foreground">
              Explora boleias com um visual monocromático, consistente com a página principal.
            </p>
          </div>

          <Card className="w-full max-w-5xl mx-auto">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">Find Your Ride</CardTitle>
              <CardDescription>
                Preenche os detalhes e vê os resultados logo abaixo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">From</p>
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pick-up location"
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">To</p>
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Drop-off location"
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="dd/mm/aaaa"
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Time</p>
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="--:--"
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Passengers</p>
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min={1}
                      placeholder="1"
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>

              <Button className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Search Rides
              </Button>
            </CardContent>
          </Card>

          <div className="w-full max-w-5xl mx-auto bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min p-3">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-semibold">Available Rides</h2>
              <p className="text-sm text-muted-foreground">Resultados de exemplo</p>
            </div>
            <div className="flex flex-col items-center">
              <Card className="w-full mt-3">
                <CardHeader className="flex flex-column items-center justify-between space-y-0 pb-2">
                  <CardTitle className="flex w-full justify-between text-sm font-medium">
                    <div className="flex flex-row gap-2">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src="/" alt="user" />
                        <AvatarFallback className="rounded-lg">U</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">User</span>
                        <span className="truncate text-xs flex flex-row items-center">
                          <LucideStar className="h-3 w-3 mr-1" />
                          <p className="text-muted-foreground">
                            4.9 Rating • 47 Rides
                          </p>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-xl font-semibold -mt-2.5">5€</h2>
                      <p className="text-muted-foreground text-xs">per seat</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100/65 p-3 rounded-2xl">
                    <div className="flex">
                      <div>
                        <div className="w-3 h-3 rounded-full bg-black mr-2.5 mt-3.5"></div>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Pick-up</p>
                        <h2 className="font-medium text-lg">Viana do Castelo</h2>
                      </div>
                    </div>

                    <div className="w-full h-16 border-l-2 border-black ml-[5px] -mt-5"></div>
                    <div className="flex -mt-3">
                      <div>
                        <div className="w-3 h-3 rounded-full bg-black mr-2.5 mt-3.5"></div>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Drop-of</p>
                        <h2 className="font-medium text-lg">Portela</h2>
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex flex-row justify-between mt-3">
                    <div className="flex flex-row gap-3">
                      <div className="flex flex-row">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-1 mr-0.5" />
                        <p className="text-muted-foreground">9 Nov</p>
                      </div>
                      <div className="flex flex-row">
                        <Clock className="h-4 w-4 text-muted-foreground mt-1 mr-0.5" />
                        <p className="text-muted-foreground">14:30</p>
                      </div>
                    </div>
                    <div>
                      <Badge variant="outline">
                        <Users />3 Left
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="w-full mt-3">
                <CardHeader className="flex flex-column items-center justify-between space-y-0 pb-2">
                  <CardTitle className="flex w-full justify-between text-sm font-medium">
                    <div className="flex flex-row gap-2">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src="/" alt="user" />
                        <AvatarFallback className="rounded-lg">U</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">User</span>
                        <span className="truncate text-xs flex flex-row items-center">
                          <LucideStar className="h-3 w-3 mr-1" />
                          <p className="text-muted-foreground">
                            5.0 Rating • 89 Rides
                          </p>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-xl font-semibold -mt-2.5">15€</h2>
                      <p className="text-muted-foreground text-xs">per seat</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100/65 p-3 rounded-2xl">
                    <div className="flex">
                      <div>
                        <div className="w-3 h-3 rounded-full bg-black mr-2.5 mt-3.5"></div>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Pick-up</p>
                        <h2 className="font-medium text-lg">Braga</h2>
                      </div>
                    </div>

                    <div className="w-full h-16 border-l-2 border-black ml-[5px] -mt-5"></div>
                    <div className="flex -mt-3">
                      <div>
                        <div className="w-3 h-3 rounded-full bg-black mr-2.5 mt-3.5"></div>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Drop-of</p>
                        <h2 className="font-medium text-lg">Porto</h2>
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex flex-row justify-between mt-3">
                    <div className="flex flex-row gap-3">
                      <div className="flex flex-row">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-1 mr-0.5" />
                        <p className="text-muted-foreground">10 Nov</p>
                      </div>
                      <div className="flex flex-row">
                        <Clock className="h-4 w-4 text-muted-foreground mt-1 mr-0.5" />
                        <p className="text-muted-foreground">06:00</p>
                      </div>
                    </div>
                    <div>
                      <Badge variant="outline">
                        <Users />2 Left
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
