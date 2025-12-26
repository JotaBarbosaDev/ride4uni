"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {LucideStar, Trash2, MessageCircle} from "lucide-react";
import {AppSidebar} from "@/components/app-sidebar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {getCurrentUser} from "@/api/authService";
import {getBookingsByPassengerID, deleteBooking} from "@/api/bookingService";
import {getRideByRideID, getRidesByDriver, deleteRide} from "@/api/ridesService";
import {getUserByID} from "@/api/userService";

type Ride = {
  id: number;
  origin: string;
  destination: string;
  dateTime: string;
  seatCount: number;
  availableSeats: number;
  driverId: number;
};

type BookingWithRide = {
  bookingId: number | string;
  ride: Ride;
  driverName?: string;
};

export default function HistoryRidesPage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [bookings, setBookings] = useState<BookingWithRide[]>([]);
  const [postedRides, setPostedRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingBooking, setWorkingBooking] = useState<string | number | null>(null);
  const [workingRide, setWorkingRide] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await getCurrentUser();
        const meId = meRes.data?.id ?? meRes.data;
        if (!meId) return;
        setCurrentUserId(Number(meId));

        const [bookingsRes, driverRidesRes] = await Promise.all([
          getBookingsByPassengerID(meId),
          getRidesByDriver(meId).catch(() => ({data: []})),
        ]);

        const passengerBookings = bookingsRes.data ?? [];
        const ridesForBookings = await Promise.all(
          passengerBookings.map(async (b: any) => {
            const rideRes = await getRideByRideID(b.rideId);
            const ride = rideRes.data as Ride;
            let driverName: string | undefined;
            try {
              const driver = await getUserByID(ride.driverId);
              driverName = driver.data?.name;
            } catch (e) {
              driverName = undefined;
            }
            return {bookingId: b.id ?? `${b.rideId}-${b.passengerId}`, ride, driverName};
          })
        );
        setBookings(ridesForBookings);
        setPostedRides(driverRidesRes.data ?? []);
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("pt-PT", {day: "numeric", month: "short"});
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});

  const handleCancelBooking = async (bookingId: string | number) => {
    setWorkingBooking(bookingId);
    try {
      await deleteBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.bookingId !== bookingId));
    } catch (error) {
      console.error("Failed to cancel booking", error);
      alert("Não foi possível cancelar");
    } finally {
      setWorkingBooking(null);
    }
  };

  const handleDeleteRide = async (rideId: number) => {
    setWorkingRide(rideId);
    try {
      await deleteRide(rideId);
      setPostedRides((prev) => prev.filter((r) => r.id !== rideId));
    } catch (error) {
      console.error("Failed to delete ride", error);
      alert("Não foi possível apagar a boleia");
    } finally {
      setWorkingRide(null);
    }
  };

  const upcoming = useMemo(() => bookings.filter((b) => new Date(b.ride.dateTime) >= new Date()), [bookings]);
  const past = useMemo(() => bookings.filter((b) => new Date(b.ride.dateTime) < new Date()), [bookings]);

  const renderRideCard = (item: BookingWithRide, isPast = false) => (
    <Card key={item.bookingId} className="w-full">
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <Badge className="rounded-full px-3 py-1 text-xs">{isPast ? "Completed" : "Confirmed"}</Badge>
          <p className="text-sm text-muted-foreground">{formatDate(item.ride.dateTime)}, {formatTime(item.ride.dateTime)}</p>
        </div>
        <div className="space-y-2 rounded-xl bg-gray-100/65 p-4">
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-black mt-2" />
            <div>
              <p className="text-muted-foreground text-sm">Pick-up</p>
              <p className="font-medium">{item.ride.origin}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-black mt-2" />
            <div>
              <p className="text-muted-foreground text-sm">Drop-off</p>
              <p className="font-medium">{item.ride.destination}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9 rounded-lg">
                <AvatarImage src="/avatars/shadcn.jpg" alt="driver" />
                <AvatarFallback className="rounded-lg">{(item.driverName ?? "?").slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="leading-tight">
                <p className="font-medium">{item.driverName ?? `Driver #${item.ride.driverId}`}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <LucideStar className="h-3 w-3" /> Driver
                </p>
              </div>
            </div>
            {!isPast && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="h-9 px-3"
                  onClick={() => router.push(`/messages`)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" /> Chat
                </Button>
                <Button
                  variant="outline"
                  className="h-9 px-3"
                  onClick={() => handleCancelBooking(item.bookingId)}
                  disabled={workingBooking === item.bookingId}
                >
                  {workingBooking === item.bookingId ? "A cancelar..." : "Cancelar"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPostedRide = (ride: Ride) => (
    <Card key={ride.id} className="w-full">
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <Badge className="rounded-full px-3 py-1 text-xs">Posted</Badge>
          <p className="text-sm text-muted-foreground">{formatDate(ride.dateTime)}, {formatTime(ride.dateTime)}</p>
        </div>
        <div className="space-y-2 rounded-xl bg-gray-100/65 p-4">
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-black mt-2" />
            <div>
              <p className="text-muted-foreground text-sm">Pick-up</p>
              <p className="font-medium">{ride.origin}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-black mt-2" />
            <div>
              <p className="text-muted-foreground text-sm">Drop-off</p>
              <p className="font-medium">{ride.destination}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">You&apos;re driving</p>
            <div className="flex gap-2">
              <Badge variant="outline">{ride.availableSeats} seats left</Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteRide(ride.id)}
                disabled={workingRide === ride.id}
                aria-label="Apagar boleia"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
              Consulta as tuas boleias reservadas e as que publicaste.
            </p>
          </div>

          <div className="w-full max-w-5xl mx-auto bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min p-3">
            {loading ? (
              <p className="text-sm text-muted-foreground px-2">A carregar...</p>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <div className="w-full">
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-lg font-semibold">Upcoming Rides</h2>
                    <p className="text-sm text-muted-foreground">Confirmadas</p>
                  </div>
                  <div className="mt-3 space-y-3">
                    {upcoming.length === 0 ? (
                      <p className="text-sm text-muted-foreground px-2">Sem próximas boleias.</p>
                    ) : (
                      upcoming.map((b) => renderRideCard(b))
                    )}
                  </div>
                </div>

                <Separator className="w-full max-w-xl" />

                <div className="w-full">
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-lg font-semibold">Posted by you</h2>
                    <p className="text-sm text-muted-foreground">Editar ou apagar</p>
                  </div>
                  <div className="mt-3 space-y-3">
                    {postedRides.length === 0 ? (
                      <p className="text-sm text-muted-foreground px-2">Ainda não publicaste boleias.</p>
                    ) : (
                      postedRides.map((r) => renderPostedRide(r))
                    )}
                  </div>
                </div>

                <Separator className="w-full max-w-xl" />

                <div className="w-full">
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-lg font-semibold">Past Rides</h2>
                    <p className="text-sm text-muted-foreground">Viagens concluídas</p>
                  </div>
                  <div className="mt-3 space-y-3">
                    {past.length === 0 ? (
                      <p className="text-sm text-muted-foreground px-2">Sem histórico ainda.</p>
                    ) : (
                      past.map((b) => renderRideCard(b, true))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
