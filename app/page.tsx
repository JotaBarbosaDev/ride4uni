import {AppSidebar} from "@/components/app-sidebar";
import {Separator} from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Car, Users, ChartNoAxesCombined, ActivityIcon, Calendar, Clock} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {LucideStar} from "lucide-react";
import {getRidesDashboard} from "@/api/ridesService";


type Ride = {
  id: number;
  origin: string;
  destination: string;
  dateTime: string;
  seatCount: number;
  availableSeats: number;
  status: string;
  driverId: number;
  driver: {
    id: number;
    name: string;
    ratingsGot: Array<{ rating: number }>;
  };
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const averageRating = (ratings: Array<{ rating: number }>) =>
  ratings.length
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : 0;

export const revalidate = 0;

export default async function Page() {
  const rides: Ride[] = (await getRidesDashboard()).data;

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
        <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
          Available Rides
        </h1>
        <p className="text-center text-muted-foreground">
          Find your perfect ride match.
        </p>
        <h2></h2>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="w-full p-6 flex justify-center">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full max-w-6xl">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Rides
                  </CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">234</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Students
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1.2k</div>
                  <p className="text-xs text-muted-foreground">
                    +180.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Savings</CardTitle>
                  <ChartNoAxesCombined className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12k€</div>
                  <p className="text-xs text-muted-foreground">
                    +19% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Now
                  </CardTitle>
                  <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+573</div>
                  <p className="text-xs text-muted-foreground">
                    +201 since last hour
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="w-full max-w-5xl mx-auto bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min p-3">
            <div className="flex flex-col items-center">
              {rides.map((ride) => (
                <Card key={ride.id} className="w-full mt-3">
                  <CardHeader className="flex flex-column items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex w-full justify-between text-sm font-medium">
                      <div className="flex flex-row gap-2">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage src="/" alt={ride.driver.name} />
                          <AvatarFallback className="rounded-lg">
                            {ride.driver.name.slice(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-medium">{ride.driver.name}</span>
                          <span className="truncate text-xs flex flex-row items-center">
                            <LucideStar className="h-3 w-3 mr-1" />
                            <p className="text-muted-foreground">
                              {averageRating(ride.driver.ratingsGot)} Rating  
                            </p>
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <h2 className="text-xl font-semibold -mt-2.5">{"Definir Logica"}</h2> 
                        <p className="text-muted-foreground text-xs">per seat</p>
                      </div>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="bg-gray-100/65 p-3 rounded-2xl">
                      <div className="flex">
                        <div>
                          <div className="w-3 h-3 rounded-full bg-black mr-2.5 mt-3.5" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">Pick-up</p>
                          <h2 className="font-medium text-lg">{ride.origin}</h2>
                        </div>
                      </div>

                      <div className="w-full h-16 border-l-2 border-black ml-[5px] -mt-5" />
                      <div className="flex -mt-3">
                        <div>
                          <div className="w-3 h-3 rounded-full bg-black mr-2.5 mt-3.5" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">Drop-off</p>
                          <h2 className="font-medium text-lg">{ride.destination}</h2>
                        </div>
                      </div>
                    </div>

                    <div className="w-full flex flex-row justify-between mt-3">
                      <div className="flex flex-row gap-3">
                        <div className="flex flex-row">
                          <Calendar className="h-4 w-4 text-muted-foreground mt-1 mr-0.5" />
                          <p className="text-muted-foreground">{formatDate(ride.dateTime)}</p>
                        </div>
                        <div className="flex flex-row">
                          <Clock className="h-4 w-4 text-muted-foreground mt-1 mr-0.5" />
                          <p className="text-muted-foreground">{formatTime(ride.dateTime)}</p>
                        </div>
                      </div>
                      <div>
                        <Badge variant="outline">
                          <Users /> {ride.availableSeats} Left
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
