"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Users, ChartNoAxesCombined, Calendar, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LucideStar } from "lucide-react";
import { getRidesDashboard } from "@/api/ridesService";
import { getTotalUsers, getUserSavings } from "@/api/userService";
import { ActiveNowCard } from "@/components/active-now-card";
import { getCurrentUser } from "@/api/authService";

type Ride = {
    id: number;
    origin: string;
    destination: string;
    dateTime: string;
    seatCount: number;
    availableSeats: number;
    status: string;
    driverId: number;
    pricePerRide?: number;
    driver: {
        id: number;
        name: string;
        ratingsGot: Array<{ rating: number }>;
    };
};

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
    });
const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
const averageRating = (ratings: Array<{ rating: number }>) =>
    ratings.length
        ? (
              ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          ).toFixed(1)
        : 0;

export default function Page() {
    const [rides, setRides] = React.useState<Ride[]>([]);
    const [totalUsers, setTotalUsers] = React.useState(0);
    const [savings, setSavings] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        let isMounted = true;

        const loadDashboard = async () => {
            try {
                const meRes = await getCurrentUser();
                const meId = meRes.data?.id ?? meRes.data?.userId ?? meRes.data;

                const [ridesResponse, usersResponse, savingsResponse] =
                    await Promise.all([
                        getRidesDashboard(),
                        getTotalUsers(),
                        meId
                            ? getUserSavings(meId)
                            : Promise.resolve({ data: null }),
                    ]);

                if (!isMounted) return;

                setRides(ridesResponse.data || []);
                setTotalUsers(usersResponse.data?.totalUsers ?? 0);
                setSavings(
                    savingsResponse?.data?.savings !== undefined
                        ? Number(savingsResponse.data.savings)
                        : null
                );
            } catch {
                if (!isMounted) return;
                setRides([]);
                setTotalUsers(0);
                setSavings(null);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadDashboard();

        return () => {
            isMounted = false;
        };
    }, []);

    const activeRidesCount = isLoading ? "..." : rides.length;

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="p-6">
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
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Active Rides
                                    </CardTitle>
                                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                                        <Car className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <div className="text-3xl font-bold">
                                        {activeRidesCount}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Available now
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Students
                                    </CardTitle>
                                    <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                                        <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <div className="text-3xl font-bold">
                                        {isLoading ? "..." : totalUsers}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Registered users
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Savings
                                    </CardTitle>
                                    <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                                        <ChartNoAxesCombined className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <div className="text-3xl font-bold">
                                        {savings === null
                                            ? "..."
                                            : savings + "€"}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Your total savings
                                    </p>
                                </CardContent>
                            </Card>
                            <ActiveNowCard />
                        </div>
                    </div>

                    <div className="w-full max-w-5xl mx-auto bg-white min-h-screen flex-1 rounded-xl md:min-h-min p-3">
                        <div className="flex flex-col items-center">
                            {!isLoading && rides.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <Car className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold text-muted-foreground">
                                        No Active Rides
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        There are currently no active rides
                                        available.
                                    </p>
                                </div>
                            ) : (
                                rides.map((ride) => {
                                    const pricePerRide = Number(
                                        ride.pricePerRide ?? 0
                                    );
                                    const occupiedSeats = Math.max(
                                        0,
                                        ride.seatCount - ride.availableSeats
                                    );
                                    const priceIfYouJoin =
                                        pricePerRide / (occupiedSeats + 1);
                                    return (
                                        <Card
                                            key={ride.id}
                                            className="w-full mt-3"
                                        >
                                            <CardHeader className="flex flex-column items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="flex w-full justify-between text-sm font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 rounded-full">
                                                            <AvatarImage
                                                                src="/avatars/shadcn.jpg"
                                                                alt={
                                                                    ride.driver
                                                                        .name
                                                                }
                                                            />
                                                            <AvatarFallback className="rounded-full">
                                                                {ride.driver.name
                                                                    .slice(0, 1)
                                                                    .toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <span className="font-semibold">
                                                                {
                                                                    ride.driver
                                                                        .name
                                                                }
                                                            </span>
                                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                <LucideStar className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                                                <span>
                                                                    {averageRating(
                                                                        ride
                                                                            .driver
                                                                            .ratingsGot
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-muted-foreground">
                                                            Ride total: €
                                                            {pricePerRide.toFixed(
                                                                2
                                                            )}
                                                        </p>
                                                        <div className="text-2xl font-bold text-primary">
                                                            €
                                                            {priceIfYouJoin.toFixed(
                                                                2
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                                                            <Users className="h-3 w-3" />{" "}
                                                            {occupiedSeats + 1}{" "}
                                                            splitting
                                                        </p>
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
                                                            <p className="text-muted-foreground text-sm">
                                                                Pick-up
                                                            </p>
                                                            <h2 className="font-medium text-lg">
                                                                {ride.origin}
                                                            </h2>
                                                        </div>
                                                    </div>

                                                    <div className="w-full h-16 border-l-2 border-black ml-[5px] -mt-5" />
                                                    <div className="flex -mt-3">
                                                        <div>
                                                            <div className="w-3 h-3 rounded-full bg-black mr-2.5 mt-3.5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground text-sm">
                                                                Drop-off
                                                            </p>
                                                            <h2 className="font-medium text-lg">
                                                                {
                                                                    ride.destination
                                                                }
                                                            </h2>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="w-full flex flex-row justify-between mt-3">
                                                    <div className="flex flex-row gap-3">
                                                        <div className="flex flex-row">
                                                            <Calendar className="h-4 w-4 text-muted-foreground mt-1 mr-0.5" />
                                                            <p className="text-muted-foreground">
                                                                {formatDate(
                                                                    ride.dateTime
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-row">
                                                            <Clock className="h-4 w-4 text-muted-foreground mt-1 mr-0.5" />
                                                            <p className="text-muted-foreground">
                                                                {formatTime(
                                                                    ride.dateTime
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Badge variant="outline">
                                                            <Users />{" "}
                                                            {
                                                                ride.availableSeats
                                                            }{" "}
                                                            Left
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
