"use client";

import {useEffect, useMemo, useState} from "react";
import {AppSidebar} from "@/components/app-sidebar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Calendar, Clock, LucideStar, MapPin, Users} from "lucide-react";
import {getAllRides} from "@/api/ridesService";
import {createBooking, getBookingStatus} from "@/api/bookingService";
import {getCurrentUser} from "@/api/authService";

type Ride = {
  id: number;
  origin: string;
  destination: string;
  dateTime: string;
  seatCount: number;
  availableSeats: number;
  driverId: number;
  pricePerRide?: number;
  driver?: { name?: string; ratingsGot?: Array<{ rating: number }> };
};

export default function SearchRidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterPassengers, setFilterPassengers] = useState("1");
  const [bookingRideId, setBookingRideId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [bookingStatus, setBookingStatus] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const [ridesRes, userRes] = await Promise.all([getAllRides(), getCurrentUser().catch(() => null)]);
        setRides(ridesRes.data ?? []);
        const me = userRes?.data?.id ?? userRes?.data;
        setCurrentUserId(me ? Number(me) : null);
      } catch (error) {
        console.error("Failed to load rides", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!currentUserId || rides.length === 0) {
      setBookingStatus({});
      return;
    }

    let cancelled = false;
    const loadStatuses = async () => {
      const statuses = await Promise.all(
        rides.map(async (ride) => {
          try {
            const res = await getBookingStatus(ride.id, currentUserId);
            return {id: ride.id, booked: Boolean(res.data)};
          } catch (error) {
            return {id: ride.id, booked: false};
          }
        })
      );

      if (!cancelled) {
        const next: Record<number, boolean> = {};
        statuses.forEach(({id, booked}) => {
          next[id] = booked;
        });
        setBookingStatus(next);
      }
    };

    loadStatuses();
    return () => {
      cancelled = true;
    };
  }, [rides, currentUserId]);

  const filtered = useMemo(() => {
    const from = filterFrom.trim().toLowerCase();
    const to = filterTo.trim().toLowerCase();
    const passengers = Number(filterPassengers) || 1;
    return rides.filter((ride) => {
      const matchesFrom = from ? ride.origin.toLowerCase().includes(from) : true;
      const matchesTo = to ? ride.destination.toLowerCase().includes(to) : true;
      const matchesSeats = ride.availableSeats >= passengers;
      return matchesFrom && matchesTo && matchesSeats;
    });
  }, [rides, filterFrom, filterTo, filterPassengers]);

  const averageRating = (ratings?: Array<{ rating: number }>) =>
    ratings?.length ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1) : "0";

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", {day: "numeric", month: "short"});
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});

  const getErrorMessage = (err: unknown) => {
    if (err && typeof err === "object") {
      const response = (err as {response?: {data?: {message?: string}}}).response;
      if (response?.data?.message) return response.data.message;
    }
    if (err instanceof Error) return err.message;
    return "Unable to book";
  };

  const handleBook = async (rideId: number) => {
    if (!currentUserId) {
      alert("Please sign in to book.");
      return;
    }
    const ride = rides.find((r) => r.id === rideId);
    if (ride?.driverId === currentUserId) {
      alert("You can't book your own ride.");
      return;
    }
    setBookingRideId(rideId);
    try {
      await createBooking({rideId, passengerId: currentUserId});
      alert("Booking created successfully");
      setBookingStatus((prev) => ({...prev, [rideId]: true}));
      setRides((prev) => prev.map((r) => r.id === rideId ? {...r, availableSeats: Math.max(0, r.availableSeats - 1)} : r));
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setBookingRideId(null);
    }
  };

  const renderRide = (ride: Ride) => {
    const driverName = ride.driver?.name ?? `Driver #${ride.driverId}`;
    const rating = averageRating(ride.driver?.ratingsGot);
    const isOwnRide = currentUserId !== null && ride.driverId === currentUserId;
    const isAlreadyIn = bookingStatus[ride.id];
    const pricePerRide = Number(ride.pricePerRide ?? 0);
    const occupiedSeats = Math.max(0, ride.seatCount - ride.availableSeats);
    
    const isParticipant = isOwnRide || isAlreadyIn;
    const splittingCount = isParticipant ? occupiedSeats : occupiedSeats + 1;
    const pricePerPerson = splittingCount > 0 ? pricePerRide / splittingCount : pricePerRide;
    
    return (
      <Card key={ride.id} className="w-full mt-3">
        <CardHeader className="flex flex-column items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex w-full justify-between text-sm font-medium">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 rounded-full">
                <AvatarImage src="/avatars/shadcn.jpg" alt={driverName} />
                <AvatarFallback className="rounded-full">{driverName.slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <span className="font-semibold">{driverName}</span>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <LucideStar className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span>{rating}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Ride total: €{pricePerRide.toFixed(2)}</p>
              <div className="text-2xl font-bold text-primary">€{pricePerPerson.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                <Users className="h-3 w-3" /> {splittingCount} splitting
              </p>
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
                <h2 className="font-medium text-lg">{ride.origin}</h2>
              </div>
            </div>

            <div className="w-full h-16 border-l-2 border-black ml-[5px] -mt-5"></div>
            <div className="flex -mt-3">
              <div>
                <div className="w-3 h-3 rounded-full bg-black mr-2.5 mt-3.5"></div>
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
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <Users /> {ride.availableSeats} Left
              </Badge>
              {isOwnRide ? (
                <Button size="sm" variant="secondary" disabled>
                  Your Ride
                </Button>
              ) : bookingStatus[ride.id] ? (
                <Button size="sm" variant="secondary" disabled>
                  Already In
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleBook(ride.id)}
                  disabled={bookingRideId === ride.id || ride.availableSeats <= 0}
                >
                  {bookingRideId === ride.id ? "Booking..." : "Book"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-6">
        

        <div className="flex flex-col gap-8">
          <div className="space-y-2 text-center">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
              Search Rides
            </h1>

          </div>

          <Card className="w-full max-w-5xl mx-auto">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">Find Your Ride</CardTitle>
              <CardDescription>
                Filter by origin, destination, and seats.
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
                      value={filterFrom}
                      onChange={(e) => setFilterFrom(e.target.value)}
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
                      value={filterTo}
                      onChange={(e) => setFilterTo(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Passengers</p>
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min={1}
                      placeholder="1"
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
                      value={filterPassengers}
                      onChange={(e) => setFilterPassengers(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {filtered.length} rides found
              </p>
            </CardContent>
          </Card>

          <div className="w-full max-w-5xl mx-auto bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min p-3">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-semibold">Available Rides</h2>
            </div>
            <div className="flex flex-col items-center">
              {loading ? (
                <p className="text-sm text-muted-foreground mt-4">Loading...</p>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground mt-4">No results for these filters.</p>
              ) : (
                filtered.map(renderRide)
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


